import json
import logging
import hashlib
import asyncio
import aiohttp
from typing import Dict, List, Any, Optional

from backend.app.config import settings

logger = logging.getLogger(__name__)

# Simple in-memory cache for LLM results (hash of input -> recommendations list).
# NOTE: Only successful LLM-generated results are cached here. Static rule-based
# fallbacks are intentionally NOT cached so a previously-cached static result can
# never block a later successful call to the local Ollama LLM.
_llm_cache: Dict[str, List[Dict[str, Any]]] = {}

# Source tags carried on every recommendation so operators can tell where an
# insight originated.
LLMSource = str  # "ollama_local" | "ollama_cloud" | "static_rules"

# Retry configuration for transient Ollama failures (model cold-start, network blip).
_OLLAMA_MAX_RETRIES: int = 2
_OLLAMA_RETRY_BACKOFF_BASE: float = 1.5  # seconds, multiplied per attempt

# Generation timeouts. Local model cold-start can be slow; allow more than 45s.
_OLLAMA_LOCAL_TIMEOUT_TOTAL: int = 90
_OLLAMA_CLOUD_TIMEOUT_TOTAL: int = 90


def _tag_source(recommendations: List[Dict[str, Any]], source: LLMSource) -> List[Dict[str, Any]]:
    """Attach a source tag to every recommendation dict."""
    for rec in recommendations:
        if isinstance(rec, dict):
            rec["source"] = source
    return recommendations


def _parse_llm_response(response_text: str) -> List[Dict[str, Any]]:
    """Parse the LLM's JSON response, stripping markdown wrappers if present."""
    text = response_text.strip()
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        text = text.split("```")[1].strip()

    parsed = json.loads(text)
    recs: List[Dict[str, Any]] = []
    if isinstance(parsed, list):
        recs = parsed
    elif isinstance(parsed, dict) and "recommendations" in parsed and isinstance(parsed["recommendations"], list):
        recs = parsed["recommendations"]
    return recs


async def _ollama_health_check(session: aiohttp.ClientSession, host: str) -> bool:
    """Probe Ollama /api/tags to confirm the server is reachable."""
    try:
        async with session.get(f"{host.rstrip('/')}/api/tags") as response:
            return response.status == 200
    except Exception as e:
        logger.debug(f"Ollama health check failed for {host}: {e}")
        return False


def generate_static_recommendations(analysis_results: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generate high-quality static recommendations as a fallback when LLM is unavailable."""
    recommendations = []
    
    # 1. Check dependencies
    code_breakdown = analysis_results.get("layers", {}).get("code", {}).get("breakdown", {})
    dep_info = code_breakdown.get("dependencies", {})
    num_deps = dep_info.get("num_dependencies", 0)
    size_mb = dep_info.get("size_mb", 0.0)
    
    if num_deps > 40:
        recommendations.append({
            "issue": f"High dependency count ({num_deps} packages)",
            "description": "Evaluate and prune unused packages in package.json or requirements.txt. Use tools like depcheck or pip-audit to identify unused libraries.",
            "savings_percent": 12.0,
            "effort": "LOW",
            "priority": "MEDIUM"
        })
    if size_mb > 150.0:
        recommendations.append({
            "issue": f"Large dependency footprint ({round(size_mb, 1)} MB)",
            "description": "Consider replacing large packages with lightweight alternatives (e.g. use native JS methods instead of lodash, or use alpine/slim base images in python).",
            "savings_percent": 18.0,
            "effort": "MEDIUM",
            "priority": "HIGH"
        })

    # 2. Check AST patterns
    ast_info = code_breakdown.get("ast_patterns", {})
    nested_loops = ast_info.get("nested_loops", 0)
    n_plus_one = ast_info.get("n_plus_one_queries", 0)
    unused_imports = ast_info.get("unused_imports", 0)
    
    if nested_loops > 0:
        recommendations.append({
            "issue": f"Detected {nested_loops} nested loop(s)",
            "description": "Refactor nested loops using lookup maps/dictionaries or set-based intersections to reduce CPU instructions from O(N^2) to O(N).",
            "savings_percent": 15.0,
            "effort": "MEDIUM",
            "priority": "MEDIUM"
        })
    if n_plus_one > 0:
        recommendations.append({
            "issue": f"Detected {n_plus_one} N+1 database queries",
            "description": "Optimize database queries by utilizing eager loading, joins, or batch/bulk queries instead of performing queries inside loop bodies.",
            "savings_percent": 25.0,
            "effort": "HIGH",
            "priority": "HIGH"
        })
    if unused_imports > 0:
        details_list = ast_info.get("unused_imports_details", [])
        if details_list:
            desc = "Remove unused import statements to reduce memory overhead and start-up latency:\n"
            desc += "\n".join(f"- '{d['name']}' in {d['file']} at line {d['line']}" for d in details_list)
        else:
            desc = "Remove unused import statements to reduce memory overhead and compile/start-up latency."
            
        recommendations.append({
            "issue": f"Found {unused_imports} unused imports",
            "description": desc,
            "savings_percent": 3.0,
            "effort": "LOW",
            "priority": "LOW"
        })

    # 3. Check CI
    ci_breakdown = analysis_results.get("layers", {}).get("ci", {}).get("breakdown", {})
    missing_caching = ci_breakdown.get("missing_caching", 0)
    
    if missing_caching == 1:
        recommendations.append({
            "issue": "Missing dependency caching in CI workflow",
            "description": "Enable caching in your GitHub Actions workflows (e.g. actions/setup-node with 'cache: npm' or actions/cache). This saves build time and carbon emissions by skipping registry fetches.",
            "savings_percent": 20.0,
            "effort": "LOW",
            "priority": "HIGH"
        })

    # 4. Check Infra
    infra_breakdown = analysis_results.get("layers", {}).get("infra", {}).get("breakdown", {})
    num_instances = infra_breakdown.get("num_instances", 0)
    
    if num_instances > 0:
        recommendations.append({
            "issue": "Migrate cloud instances to Graviton ARM",
            "description": "Upgrade Intel/AMD based EC2 instances to AWS Graviton (e.g., t3 -> t4g, m5 -> m6g). Graviton instances offer up to 40% better price-performance and significantly lower carbon profiles.",
            "savings_percent": 35.0,
            "effort": "MEDIUM",
            "priority": "HIGH"
        })
        recommendations.append({
            "issue": "Region shift to low-carbon grid",
            "description": "Deploy infrastructure in green/low-carbon AWS regions (e.g., migrate from ap-south-1 or us-east-1 to Oregon us-west-2 or ca-central-1) to reduce operational carbon footprint by up to 80%.",
            "savings_percent": 60.0,
            "effort": "HIGH",
            "priority": "HIGH"
        })
        
    # Ensure we return at least a default recommendation
    if not recommendations:
        recommendations.append({
            "issue": "Optimize codebase build size",
            "description": "Regularly run audits on code quality and remove unreferenced dependencies.",
            "savings_percent": 5.0,
            "effort": "LOW",
            "priority": "LOW"
        })
        
    return recommendations


async def _generate_from_ollama_local(
    session: aiohttp.ClientSession,
    prompt: str,
    input_hash: str,
) -> Optional[List[Dict[str, Any]]]:
    """Attempt to generate recommendations from the local Ollama server with retries.

    Returns the parsed recommendation list on success, or None on failure.
    """
    url = f"{settings.OLLAMA_LOCAL_HOST.rstrip('/')}/api/generate"
    payload = {
        "model": settings.OLLAMA_LOCAL_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.2},
    }
    timeout = aiohttp.ClientTimeout(total=_OLLAMA_LOCAL_TIMEOUT_TOTAL)

    last_error: Optional[str] = None
    for attempt in range(1, _OLLAMA_MAX_RETRIES + 1):
        try:
            logger.info(
                f"Calling local Ollama model {settings.OLLAMA_LOCAL_MODEL} "
                f"(attempt {attempt}/{_OLLAMA_MAX_RETRIES})"
            )
            async with session.post(url, json=payload) as response:
                if response.status != 200:
                    body = await response.text()
                    last_error = f"HTTP {response.status}: {body[:200]}"
                    logger.warning(f"Local Ollama returned {response.status}: {body[:200]}")
                    if attempt < _OLLAMA_MAX_RETRIES:
                        await asyncio.sleep(_OLLAMA_RETRY_BACKOFF_BASE * attempt)
                    continue

                result = await response.json()
                response_text = result.get("response", "").strip()
                recs = _parse_llm_response(response_text)

                if len(recs) > 0:
                    tagged = _tag_source(recs, "ollama_local")
                    _llm_cache[input_hash] = tagged
                    logger.info(
                        f"Successfully generated {len(tagged)} recommendations from local Ollama LLM "
                        f"({settings.OLLAMA_LOCAL_MODEL})."
                    )
                    return tagged

                last_error = "empty response"
                logger.warning("Local Ollama returned an empty recommendation list.")
        except aiohttp.ClientConnectorError as e:
            last_error = f"connection refused: {e}"
            logger.warning(f"Local Ollama connection refused (attempt {attempt}): {e}")
        except asyncio.TimeoutError as e:
            last_error = f"timeout: {e}"
            logger.warning(f"Local Ollama request timed out (attempt {attempt}): {e}")
        except json.JSONDecodeError as e:
            last_error = f"json decode error: {e}"
            logger.warning(f"Local Ollama returned invalid JSON (attempt {attempt}): {e}")
        except Exception as e:
            last_error = f"unexpected: {e}"
            logger.warning(f"Local Ollama generation failed (attempt {attempt}): {e}")

        if attempt < _OLLAMA_MAX_RETRIES:
            backoff = _OLLAMA_RETRY_BACKOFF_BASE * attempt
            logger.info(f"Retrying local Ollama in {backoff}s...")
            await asyncio.sleep(backoff)

    logger.error(
        f"Local Ollama LLM unavailable after {_OLLAMA_MAX_RETRIES} attempts "
        f"(last error: {last_error}). Falling back to static rules."
    )
    return None


async def _generate_from_ollama_cloud(
    session: aiohttp.ClientSession,
    prompt: str,
    input_hash: str,
) -> Optional[List[Dict[str, Any]]]:
    """Attempt to generate recommendations from Ollama Cloud (OpenAI-compatible /v1 API)."""
    if not settings.OLLAMA_API_KEY:
        return None

    cloud_url = f"{settings.OLLAMA_HOST.rstrip('/')}/v1/chat/completions"
    cloud_headers = {"Authorization": f"Bearer {settings.OLLAMA_API_KEY}"}
    cloud_payload = {
        "model": settings.OLLAMA_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2,
    }
    timeout = aiohttp.ClientTimeout(total=_OLLAMA_CLOUD_TIMEOUT_TOTAL)

    try:
        logger.info(f"Calling Ollama Cloud model {settings.OLLAMA_MODEL}...")
        async with session.post(cloud_url, json=cloud_payload, headers=cloud_headers) as response:
            if response.status != 200:
                body = await response.text()
                logger.warning(f"Ollama Cloud returned status {response.status}: {body[:200]}")
                return None

            result = await response.json()
            response_text = result["choices"][0]["message"]["content"].strip()
            recs = _parse_llm_response(response_text)

            if len(recs) > 0:
                tagged = _tag_source(recs, "ollama_cloud")
                _llm_cache[input_hash] = tagged
                logger.info(f"Successfully generated {len(tagged)} recommendations from Ollama Cloud.")
                return tagged

            logger.warning("Ollama Cloud returned an empty recommendation list.")
    except aiohttp.ClientConnectorError as e:
        logger.warning(f"Ollama Cloud connection refused: {e}")
    except asyncio.TimeoutError as e:
        logger.warning(f"Ollama Cloud request timed out: {e}")
    except json.JSONDecodeError as e:
        logger.warning(f"Ollama Cloud returned invalid JSON: {e}")
    except Exception as e:
        logger.warning(f"Ollama Cloud generation failed: {e}")

    return None


async def generate_recommendations(analysis_results: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generate carbon recommendations using local Ollama model (with static fallback).

    Priority: local Ollama -> Ollama Cloud -> static tree-sitter rules.

    Only successful LLM-generated results are cached. Static fallbacks are never
    cached under the LLM cache so a stale static result cannot block a later
    successful call to the local LLM.
    """
    # Create input cache hash
    input_str = json.dumps({
        "total_score": analysis_results.get("total_score"),
        "code_carbon": analysis_results.get("code_carbon"),
        "ci_carbon": analysis_results.get("ci_carbon"),
        "infra_carbon": analysis_results.get("infra_carbon")
    }, sort_keys=True)
    input_hash = hashlib.sha256(input_str.encode("utf-8")).hexdigest()

    # Return cached LLM result if available (static results are never cached here).
    if input_hash in _llm_cache:
        logger.debug(f"Returning cached LLM recommendations for hash {input_hash[:12]}...")
        return _llm_cache[input_hash]

    logger.info(f"Generating LLM recommendations using model {settings.OLLAMA_LOCAL_MODEL}...")

    prompt = f"""
    You are an expert GreenOps AI coding assistant.
    Analyze the following software carbon footprint analysis data and provide EXACTLY 3-4 actionable, high-impact recommendations to reduce carbon footprint.
    Format your response STRICTLY as a JSON array of objects, where each object has these fields:
    - "issue" (string: short description of the issue)
    - "description" (string: detailed fix description)
    - "savings_percent" (float: estimated percent carbon savings, e.g. 15.0)
    - "effort" (string: "LOW", "MEDIUM", or "HIGH")
    - "priority" (string: "LOW", "MEDIUM", or "HIGH")

    Analysis Data:
    {json.dumps(analysis_results, indent=2)}

    Output valid JSON only. Do not wrap in markdown tags or include conversational text.
    """

    timeout = aiohttp.ClientTimeout(total=max(_OLLAMA_LOCAL_TIMEOUT_TOTAL, _OLLAMA_CLOUD_TIMEOUT_TOTAL))
    async with aiohttp.ClientSession(timeout=timeout) as session:
        # Step 0: Pre-flight health check on local Ollama. If the server is not
        # reachable, skip straight to cloud/static rather than wasting time on
        # retries that will fail with connection-refused.
        local_healthy = await _ollama_health_check(session, settings.OLLAMA_LOCAL_HOST)
        if not local_healthy:
            logger.warning(
                f"Local Ollama health check failed at {settings.OLLAMA_LOCAL_HOST}. "
                f"Server may be down or the model {settings.OLLAMA_LOCAL_MODEL} may not be pulled."
            )

        # Step 1: Local Ollama (only attempt if health check passed; retries still
        # handle transient failures such as model cold-start).
        if local_healthy:
            recs = await _generate_from_ollama_local(session, prompt, input_hash)
            if recs is not None:
                return recs

        # Step 2: Ollama Cloud (OpenAI-compatible /v1 API) when an API key is configured.
        recs = await _generate_from_ollama_cloud(session, prompt, input_hash)
        if recs is not None:
            return recs

    # Step 3: Static fallback (tree-sitter AST patterns). Not cached.
    logger.info("Falling back to static tree-sitter rule-based recommendations.")
    recs = generate_static_recommendations(analysis_results)
    return _tag_source(recs, "static_rules")

