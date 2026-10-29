import pytest
from backend.app.services.github_client import parse_github_url, cleanup_cloned_repo


def test_parse_github_url_valid():
    owner, repo = parse_github_url("https://github.com/facebook/react")
    assert owner == "facebook"
    assert repo == "react"

    owner, repo = parse_github_url("https://github.com/dchitale/carbotrace.git")
    assert owner == "dchitale"
    assert repo == "carbotrace"


def test_parse_github_url_invalid():
    with pytest.raises(ValueError):
        parse_github_url("https://gitlab.com/owner/repo")

    with pytest.raises(ValueError):
        parse_github_url("https://github.com/invalid-path")


def test_cleanup_cloned_repo_safety():
    # Should safely return without error when path is None, empty, or non-existent
    cleanup_cloned_repo(None)
    cleanup_cloned_repo("")
    cleanup_cloned_repo("/non/existent/path")
