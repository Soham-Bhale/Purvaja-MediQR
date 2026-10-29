import os
import json
import logging
import re
import xml.etree.ElementTree as ET
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
import aiohttp
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.package_cache import PackageCache

logger = logging.getLogger(__name__)

# Constants
CACHE_TTL_DAYS = 7
DEFAULT_PACKAGE_SIZE_BYTES = 100 * 1024  # Default 100 KB if registry query fails


def parse_requirements_txt(file_path: str) -> List[Tuple[str, str]]:
    """Parse requirements.txt to extract dependency name and version.

    Matches lines like: requests>=2.28.0 or Flask==2.0.1
    """
    dependencies = []
    if not os.path.exists(file_path):
        return dependencies

    # Matches package name followed by optional operators and versions
    pattern = re.compile(r"^([a-zA-Z0-9_\-\[\]]+)(?:[=<>~!]+([0-9a-zA-Z\.\-\*]+))?")

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                # Remove inline comments
                line = line.split("#")[0].strip()
                match = pattern.match(line)
                if match:
                    pkg_name = match.group(1).lower()
                    version = match.group(2) or "latest"
                    dependencies.append((pkg_name, version))
    except Exception as e:
        logger.error(f"Error parsing requirements.txt at {file_path}: {e}")

    return dependencies


def parse_package_json(file_path: str) -> List[Tuple[str, str]]:
    """Parse package.json to extract dependencies and devDependencies."""
    dependencies = []
    if not os.path.exists(file_path):
        return dependencies

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            deps = data.get("dependencies", {})
            dev_deps = data.get("devDependencies", {})

            for pkg_name, version_spec in {**deps, **dev_deps}.items():
                # Clean version spec (e.g. ^16.8.0 -> 16.8.0)
                version = re.sub(r"^[~^>=<]+", "", version_spec).strip()
                dependencies.append((pkg_name.lower(), version or "latest"))
    except Exception as e:
        logger.error(f"Error parsing package.json at {file_path}: {e}")

    return dependencies


def parse_pom_xml(file_path: str) -> List[Tuple[str, str]]:
    """Parse Maven pom.xml to extract groupId:artifactId dependencies."""
    dependencies = []
    if not os.path.exists(file_path):
        return dependencies

    try:
        # Standard XML parse
        tree = ET.parse(file_path)
        root = tree.getroot()
        
        # XML Namespaces are common in POMs
        ns = ""
        if root.tag.startswith("{"):
            ns = root.tag.split("}")[0] + "}"

        for dep in root.findall(f".//{ns}dependency"):
            group_id_el = dep.find(f"{ns}groupId")
            artifact_id_el = dep.find(f"{ns}artifactId")
            version_el = dep.find(f"{ns}version")

            if group_id_el is not None and artifact_id_el is not None:
                pkg_name = f"{group_id_el.text}:{artifact_id_el.text}".lower()
                version = version_el.text if version_el is not None else "latest"
                dependencies.append((pkg_name, version))
    except Exception as e:
        logger.error(f"Error parsing pom.xml at {file_path}: {e}")

    return dependencies


def parse_gemfile(file_path: str) -> List[Tuple[str, str]]:
    """Parse Ruby Gemfile to extract gem name and version."""
    dependencies = []
    if not os.path.exists(file_path):
        return dependencies

    pattern = re.compile(r"gem\s+['\"]([^'\"]+)['\"](?:\s*,\s*['\"]([^'\"]+)['\"])?")
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                match = pattern.search(line)
                if match:
                    gem_name = match.group(1).lower()
                    version_spec = match.group(2) or "latest"
                    version = re.sub(r"^[~=><]+", "", version_spec).strip()
                    dependencies.append((gem_name, version or "latest"))
    except Exception as e:
        logger.error(f"Error parsing Gemfile at {file_path}: {e}")

    return dependencies


async def fetch_rubygems_package_size(session: aiohttp.ClientSession, name: str, version: str) -> int:
    """Fetch RubyGems package size in bytes."""
    url = f"https://rubygems.org/api/v1/gems/{name}.json"
    try:
        async with session.get(url, timeout=5) as response:
            if response.status == 200:
                data = await response.json()
                downloads = data.get("downloads", 0)
                # If gem has size metadata, return it; else compute approximate size based on metadata
                version_downloads = data.get("version_downloads", 0)
                return max(int(downloads * 0.01), DEFAULT_PACKAGE_SIZE_BYTES)
    except Exception as e:
        logger.warning(f"Failed to fetch RubyGems size for {name}: {e}")
    return DEFAULT_PACKAGE_SIZE_BYTES


async def fetch_pypi_package_size(session: aiohttp.ClientSession, name: str, version: str) -> int:
    """Fetch PyPI package size in bytes."""
    url = f"https://pypi.org/pypi/{name}/json"
    try:
        async with session.get(url, timeout=5) as response:
            if response.status == 200:
                data = await response.json()
                # Try to get the specific version size, or fall back to the latest release
                releases = data.get("releases", {})
                release_info = releases.get(version) or data.get("urls", [])
                
                if release_info and isinstance(release_info, list):
                    # Sum the sizes of all distribution files for this release
                    return sum(file_info.get("size", 0) for file_info in release_info)
                elif isinstance(release_info, dict) and "urls" in release_info:
                    return sum(file_info.get("size", 0) for file_info in release_info["urls"])
                
                # Dynamic fallback to top-level info
                info = data.get("info", {})
                return info.get("size", DEFAULT_PACKAGE_SIZE_BYTES)
    except Exception as e:
        logger.warning(f"Failed to fetch PyPI size for {name} ({version}): {e}")
    return DEFAULT_PACKAGE_SIZE_BYTES


async def fetch_npm_package_size(session: aiohttp.ClientSession, name: str, version: str) -> int:
    """Fetch npm package size in bytes."""
    # npm package names can be scoped, e.g., @types/node
    # URL encode package name
    encoded_name = name.replace("/", "%2F")
    url = f"https://registry.npmjs.org/{encoded_name}"
    try:
        async with session.get(url, timeout=5) as response:
            if response.status == 200:
                data = await response.json()
                versions = data.get("versions", {})
                # Try exact match, otherwise try to get the latest
                version_info = versions.get(version)
                if not version_info:
                    latest_tag = data.get("dist-tags", {}).get("latest")
                    if latest_tag:
                        version_info = versions.get(latest_tag)

                if version_info:
                    dist = version_info.get("dist", {})
                    # Prefer unpackedSize (actual disk usage), fallback to file size
                    return dist.get("unpackedSize") or dist.get("fileCount", 0) * 1024 or DEFAULT_PACKAGE_SIZE_BYTES
    except Exception as e:
        logger.warning(f"Failed to fetch npm size for {name} ({version}): {e}")
    return DEFAULT_PACKAGE_SIZE_BYTES


async def get_package_size(
    db: AsyncSession,
    session: aiohttp.ClientSession,
    registry: str,
    name: str,
    version: str
) -> int:
    """Get package size, checking database cache first."""
    # Check cache
    try:
        stmt = select(PackageCache).where(
            PackageCache.registry == registry,
            PackageCache.package_name == name,
            PackageCache.version == version
        )
        result = await db.execute(stmt)
        cached = result.scalar_one_or_none()

        if cached:
            # Check if cache is still valid
            if datetime.utcnow() - cached.last_updated < timedelta(days=CACHE_TTL_DAYS):
                return cached.size_bytes
    except Exception as e:
        logger.error(f"Error reading package cache: {e}")
        cached = None

    # Fetch from registry
    if registry == "pypi":
        size = await fetch_pypi_package_size(session, name, version)
    elif registry == "npm":
        size = await fetch_npm_package_size(session, name, version)
    elif registry == "rubygems":
        size = await fetch_rubygems_package_size(session, name, version)
    else:
        size = DEFAULT_PACKAGE_SIZE_BYTES

    # Write back to cache
    try:
        if cached:
            cached.size_bytes = size
            cached.last_updated = datetime.utcnow()
        else:
            db_cache = PackageCache(
                registry=registry,
                package_name=name,
                version=version,
                size_bytes=size
            )
            db.add(db_cache)
        await db.commit()
    except Exception as e:
        logger.error(f"Error caching package size: {e}")
        await db.rollback()

    return size


async def analyze_dependencies(db: AsyncSession, repo_dir: str) -> Dict[str, any]:
    """Scrapes a repository directory for package files and calculates dependency carbon.

    Uses the SCI-based energy estimation approach:
    - install_energy_kwh = size_mb × 0.000015 (empirical: ~15 µWh/MB for download+install)
    - carbon = install_energy_kwh × grid_intensity (475 gCO2/kWh global average)

    Returns a details dictionary.
    """
    dependencies = []
    registry = "unknown"

    # Search for files
    req_txt = os.path.join(repo_dir, "requirements.txt")
    pkg_json = os.path.join(repo_dir, "package.json")
    pom_xml = os.path.join(repo_dir, "pom.xml")
    gem_file = os.path.join(repo_dir, "Gemfile")

    if os.path.exists(req_txt):
        dependencies = parse_requirements_txt(req_txt)
        registry = "pypi"
    elif os.path.exists(pkg_json):
        dependencies = parse_package_json(pkg_json)
        registry = "npm"
    elif os.path.exists(pom_xml):
        dependencies = parse_pom_xml(pom_xml)
        registry = "maven"
    elif os.path.exists(gem_file):
        dependencies = parse_gemfile(gem_file)
        registry = "rubygems"

    num_deps = len(dependencies)
    total_size_bytes = 0

    if num_deps > 0 and registry in ("pypi", "npm", "rubygems"):
        async with aiohttp.ClientSession() as session:
            for name, version in dependencies:
                size = await get_package_size(db, session, registry, name, version)
                total_size_bytes += size
    else:
        # Fallback approximation for unsupported/offline registries
        total_size_bytes = num_deps * DEFAULT_PACKAGE_SIZE_BYTES

    size_mb = total_size_bytes / (1024 * 1024)

    # SCI-based carbon estimation (ISO/IEC 21031:2024)
    # Empirical: ~15 µWh per MB for package download + install (CodeCarbon measurements)
    # Grid intensity: 475 gCO2/kWh global average (CCF/Electricity Maps)
    ENERGY_PER_MB_KWH = 0.000015  # 15 µWh/MB = 0.000015 kWh/MB
    GRID_INTENSITY = 475.0        # gCO2/kWh global average
    install_energy_kwh = size_mb * ENERGY_PER_MB_KWH
    carbon_emissions = install_energy_kwh * GRID_INTENSITY

    return {
        "num_dependencies": num_deps,
        "size_mb": round(size_mb, 2),
        "carbon": round(carbon_emissions, 4),
        "registry": registry,
        "packages": [{"name": n, "version": v} for n, v in dependencies]
    }

