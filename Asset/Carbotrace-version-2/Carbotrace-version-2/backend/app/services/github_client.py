import os
import shutil
import uuid
import logging
from typing import Tuple, Optional
from urllib.parse import urlparse
import git
from backend.app.config import settings

logger = logging.getLogger(__name__)


def parse_github_url(repo_url: str) -> Tuple[str, str]:
    """Parse GitHub URL to extract owner and repository name.

    Args:
        repo_url: The GitHub repository URL (e.g., https://github.com/owner/repo)

    Returns:
        A tuple of (owner, repo_name)

    Raises:
        ValueError: If the URL is not a valid GitHub URL
    """
    try:
        parsed = urlparse(repo_url)
        if "github.com" not in parsed.netloc:
            raise ValueError("Only GitHub repositories are supported.")
        
        path_parts = [p for p in parsed.path.split("/") if p]
        if len(path_parts) < 2:
            raise ValueError("Invalid GitHub repository URL.")
            
        owner = path_parts[0]
        # Remove .git extension if present
        repo_name = path_parts[1]
        if repo_name.endswith(".git"):
            repo_name = repo_name[:-4]
            
        return owner, repo_name
    except Exception as e:
        logger.error(f"Error parsing GitHub URL {repo_url}: {e}")
        raise ValueError(f"Invalid GitHub URL: {e}")


async def clone_repository(repo_url: str, branch: Optional[str] = None, github_token: Optional[str] = None) -> str:
    """Clone a public or private GitHub repository to a local temporary directory.

    Args:
        repo_url: GitHub repository URL to clone.
        branch: Optional branch, tag, or commit ref to checkout.
        github_token: Optional GitHub access token for cloning private repos.

    Returns:
        Absolute path to the cloned repository.

    Raises:
        ValueError: If repository URL is invalid.
        RuntimeError: If cloning fails.
    """
    owner, repo_name = parse_github_url(repo_url)
    
    # Construct target clone URL with token authentication if provided
    token = github_token or settings.GITHUB_TOKEN
    if token and token.strip():
        token_clean = token.strip()
        clone_url = f"https://x-access-token:{token_clean}@github.com/{owner}/{repo_name}.git"
    else:
        clone_url = repo_url

    # Generate unique folder name
    unique_id = uuid.uuid4().hex
    target_dir = os.path.join(settings.TEMP_CLONE_DIR, f"{owner}_{repo_name}_{unique_id}")
    
    logger.info(f"Cloning {owner}/{repo_name} (branch/ref: {branch or 'default'}) to {target_dir}...")
    try:
        kwargs = {"depth": 1, "config": "core.longpaths=true", "allow_unsafe_options": True}
        
        # Check if branch is a hex commit SHA
        is_commit_sha = branch and len(branch) >= 7 and all(c in '0123456789abcdefABCDEF' for c in branch)

        if branch and not is_commit_sha:
            try:
                kwargs["branch"] = branch
                git.Repo.clone_from(clone_url, target_dir, **kwargs)
                logger.info(f"Successfully cloned {repo_name} (branch: {branch}) to {target_dir}")
                return target_dir
            except Exception as branch_err:
                logger.warning(f"Failed to clone directly with branch={branch}: {branch_err}. Falling back to default clone...")

        # If branch is a commit SHA or branch clone failed, clone default branch and fetch ref
        kwargs.pop("branch", None)
        # Remove depth limit if we need to fetch a specific commit SHA
        if is_commit_sha:
            kwargs.pop("depth", None)

        repo = git.Repo.clone_from(clone_url, target_dir, **kwargs)
        
        if branch:
            try:
                repo.git.fetch("origin", branch)
                repo.git.checkout(branch)
                logger.info(f"Successfully checked out ref {branch} in {target_dir}")
            except Exception as checkout_err:
                logger.warning(f"Fetch/checkout of ref {branch} failed: {checkout_err}. Using default branch HEAD.")

        logger.info(f"Successfully cloned {repo_name} to {target_dir}")
        return target_dir
    except Exception as e:
        logger.error(f"Failed to clone repository {repo_url}: {e}")
        # Clean up in case directory was partially created
        cleanup_cloned_repo(target_dir)
        raise RuntimeError(f"Failed to clone repository: {e}")


def cleanup_cloned_repo(local_path: str) -> None:
    """Safely delete the cloned repository directory.

    Args:
        local_path: Path of the directory to delete.
    """
    if not local_path or not os.path.exists(local_path):
        return
        
    # Ensure we only delete folders inside the temporary clone directory
    abs_local_path = os.path.abspath(local_path)
    abs_temp_dir = os.path.abspath(settings.TEMP_CLONE_DIR)
    
    if not abs_local_path.startswith(abs_temp_dir) or abs_local_path == abs_temp_dir:
        logger.warning(f"Prevented deletion attempt outside temp clone dir: {local_path}")
        return
        
    try:
        # On Windows, git files might be read-only, so use an error handler to force deletion
        def on_rm_error(func, path, exc_info):
            import stat
            os.chmod(path, stat.S_IWRITE)
            func(path)
            
        shutil.rmtree(abs_local_path, onerror=on_rm_error)
        logger.info(f"Successfully cleaned up temporary directory {abs_local_path}")
    except Exception as e:
        logger.error(f"Error cleaning up temporary directory {abs_local_path}: {e}")
