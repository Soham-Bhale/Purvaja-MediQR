import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app


@pytest.mark.asyncio
async def test_github_user_endpoint_missing_token():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/api/github/user", json={"token": "   "})
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_github_repos_endpoint_missing_token():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/api/github/user-repos", json={"token": ""})
    assert response.status_code == 400
