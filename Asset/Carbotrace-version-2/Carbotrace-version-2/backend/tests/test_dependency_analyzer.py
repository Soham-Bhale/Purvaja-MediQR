import pytest
import os
from backend.app.services.dependency_analyzer import (
    parse_requirements_txt,
    parse_package_json,
    parse_pom_xml,
    parse_gemfile
)


def test_parse_requirements_txt(temp_repo_dir):
    req_file = os.path.join(temp_repo_dir, "requirements.txt")
    with open(req_file, "w", encoding="utf-8") as f:
        f.write("# Sample requirements\nfastapi>=0.110.0\nuvicorn==0.28.0\nrequests\n")

    deps = parse_requirements_txt(req_file)
    assert len(deps) == 3
    assert deps[0] == ("fastapi", "0.110.0")
    assert deps[1] == ("uvicorn", "0.28.0")
    assert deps[2] == ("requests", "latest")


def test_parse_package_json(temp_repo_dir):
    pkg_file = os.path.join(temp_repo_dir, "package.json")
    with open(pkg_file, "w", encoding="utf-8") as f:
        f.write('{\n  "dependencies": {"react": "^18.2.0"},\n  "devDependencies": {"vite": "~5.0.0"}\n}')

    deps = parse_package_json(pkg_file)
    assert len(deps) == 2
    assert ("react", "18.2.0") in deps
    assert ("vite", "5.0.0") in deps


def test_parse_pom_xml(temp_repo_dir):
    pom_file = os.path.join(temp_repo_dir, "pom.xml")
    with open(pom_file, "w", encoding="utf-8") as f:
        f.write('''<project>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
      <version>3.2.0</version>
    </dependency>
  </dependencies>
</project>''')

    deps = parse_pom_xml(pom_file)
    assert len(deps) == 1
    assert deps[0] == ("org.springframework.boot:spring-boot-starter-web", "3.2.0")


def test_parse_gemfile(temp_repo_dir):
    gem_file = os.path.join(temp_repo_dir, "Gemfile")
    with open(gem_file, "w", encoding="utf-8") as f:
        f.write("source 'https://rubygems.org'\ngem 'rails', '~> 7.0'\ngem 'pg'\n")

    deps = parse_gemfile(gem_file)
    assert len(deps) == 2
    assert ("rails", "7.0") in deps
    assert ("pg", "latest") in deps
