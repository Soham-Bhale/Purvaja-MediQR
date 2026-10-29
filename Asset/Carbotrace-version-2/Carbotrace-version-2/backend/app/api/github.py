from fastapi import APIRouter, HTTPException, Body
from typing import List, Optional
import aiohttp
import logging

from backend.app.schemas.analysis import GitHubAuthRequest, GitHubUserResponse, GitHubRepoItem

router = APIRouter(prefix="/github", tags=["github"])
logger = logging.getLogger(__name__)


@router.post("/user", response_model=GitHubUserResponse)
async def get_github_user_profile(
    payload: GitHubAuthRequest = Body(...),
):
    """Validate GitHub token and return the authenticated user's profile."""
    token = payload.token.strip()
    if not token:
        raise HTTPException(status_code=400, detail="Token is required.")

    headers = {
        "Accept": "application/vnd.github.v3+json",
        "Authorization": f"Bearer {token}",
        "User-Agent": "Carbotrace-App"
    }

    try:
        timeout = aiohttp.ClientTimeout(total=10.0)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.get("https://api.github.com/user", headers=headers) as resp:
                if resp.status == 401:
                    raise HTTPException(status_code=401, detail="Invalid GitHub token. Please verify your Personal Access Token.")
                elif resp.status != 200:
                    text_err = await resp.text()
                    raise HTTPException(status_code=resp.status, detail=f"GitHub API error: {text_err}")

                data = await resp.json()
                return {
                    "login": data.get("login"),
                    "name": data.get("name") or data.get("login"),
                    "avatar_url": data.get("avatar_url"),
                    "html_url": data.get("html_url"),
                    "public_repos": data.get("public_repos", 0),
                    "total_private_repos": data.get("total_private_repos", 0),
                }
    except HTTPException:
        raise
    except aiohttp.ClientError as exc:
        logger.error(f"GitHub API connection failed: {exc}")
        raise HTTPException(status_code=500, detail=f"Network error connecting to GitHub: {exc}")


@router.post("/user-repos", response_model=List[GitHubRepoItem])
async def list_user_repositories(
    payload: GitHubAuthRequest = Body(...),
):
    """Fetch all public and private repositories for the authenticated GitHub user."""
    token = payload.token.strip()
    if not token:
        raise HTTPException(status_code=400, detail="Token is required.")

    headers = {
        "Accept": "application/vnd.github.v3+json",
        "Authorization": f"Bearer {token}",
        "User-Agent": "Carbotrace-App"
    }

    all_repos = []
    page = 1
    per_page = 100

    try:
        timeout = aiohttp.ClientTimeout(total=15.0)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            while True:
                url = f"https://api.github.com/user/repos?type=all&sort=updated&per_page={per_page}&page={page}"
                async with session.get(url, headers=headers) as resp:
                    if resp.status == 401:
                        raise HTTPException(status_code=401, detail="Invalid GitHub token.")
                    elif resp.status != 200:
                        text_err = await resp.text()
                        raise HTTPException(status_code=resp.status, detail=f"GitHub API error: {text_err}")

                    items = await resp.json()
                    if not items or not isinstance(items, list):
                        break

                    for repo in items:
                        all_repos.append({
                            "id": repo.get("id"),
                            "name": repo.get("name"),
                            "full_name": repo.get("full_name"),
                            "private": repo.get("private", False),
                            "html_url": repo.get("html_url"),
                            "description": repo.get("description"),
                            "language": repo.get("language"),
                            "default_branch": repo.get("default_branch", "main"),
                            "updated_at": repo.get("updated_at"),
                        })

                    if len(items) < per_page:
                        break
                    page += 1

            return all_repos
    except HTTPException:
        raise
    except aiohttp.ClientError as exc:
        logger.error(f"GitHub API request failed: {exc}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch repositories from GitHub: {exc}")
