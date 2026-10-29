import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const STORAGE_KEY = 'carbotrace_github_pat';

export function useGithubAuth() {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(STORAGE_KEY)));
  const [error, setError] = useState(null);

  const verifyAndSaveToken = useCallback(async (newToken) => {
    if (!newToken || !newToken.trim()) {
      setToken('');
      setUser(null);
      localStorage.removeItem(STORAGE_KEY);
      return false;
    }

    setLoading(true);
    setError(null);
    try {
      const profile = await api.validateGithubToken(newToken.trim());
      setToken(newToken.trim());
      setUser(profile);
      localStorage.setItem(STORAGE_KEY, newToken.trim());
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.message || 'Invalid GitHub token');
      setLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setToken('');
    setUser(null);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // On mount, if token exists, verify profile asynchronously
  useEffect(() => {
    if (!token) {
      return;
    }

    let ignore = false;
    api.validateGithubToken(token)
      .then((profile) => {
        if (!ignore) {
          setUser(profile);
          setError(null);
        }
      })
      .catch(() => {
        if (!ignore) {
          setToken('');
          setUser(null);
          localStorage.removeItem(STORAGE_KEY);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [token]);

  return {
    token,
    user,
    loading,
    error,
    saveToken: verifyAndSaveToken,
    logout,
    isAuthenticated: Boolean(token && user),
  };
}
