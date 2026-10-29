/**
 * Carbotrace API Service
 * Interacts with FastAPI backend endpoints under /api
 */

const API_BASE = '/api';

class ApiError extends Error {
  constructor(message, status, detail = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg =
      (typeof data === 'object' && data?.detail)
        ? data.detail
        : `Request failed with status ${response.status}`;
    throw new ApiError(errorMsg, response.status, data);
  }

  return data;
}

export const api = {
  // Analyze a GitHub repo (clones, runs AST/CI/Infra calculators)
  analyzeRepo: async ({ repoUrl, branch = null, includeLlm = true, githubToken = null }) => {
    return request('/analyze-repo', {
      method: 'POST',
      body: JSON.stringify({
        repo_url: repoUrl,
        branch: branch || undefined,
        include_llm: includeLlm,
        github_token: githubToken || undefined,
      }),
    });
  },

  // Get full analysis by analysis ID
  getAnalysis: async (analysisId) => {
    return request(`/analyses/${analysisId}`);
  },

  // List past repos with nested history
  listRepos: async (skip = 0, limit = 50) => {
    return request(`/repos?skip=${skip}&limit=${limit}`);
  },

  // Get single repo by repo ID
  getRepo: async (repoId) => {
    return request(`/repos/${repoId}`);
  },

  // Validate GitHub Personal Access Token
  validateGithubToken: async (token) => {
    return request('/github/user', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  // Fetch repositories belonging to the authenticated GitHub user
  listUserGithubRepos: async (token) => {
    return request('/github/user-repos', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  // Backend & database health check
  checkHealth: async () => {
    return request('/health');
  },
};
