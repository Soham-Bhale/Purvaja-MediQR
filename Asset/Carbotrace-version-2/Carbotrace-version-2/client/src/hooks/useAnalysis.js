import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export function useAnalysis(analysisId) {
  const [analysis, setAnalysis] = useState(null);
  const [repo, setRepo] = useState(null);
  const [loading, setLoading] = useState(Boolean(analysisId));
  const [error, setError] = useState(null);

  const loadData = useCallback(async (id) => {
    if (!id) return;
    try {
      const data = await api.getAnalysis(id);
      setAnalysis(data);

      if (data?.repo_id) {
        try {
          const repoData = await api.getRepo(data.repo_id);
          setRepo(repoData);
        } catch {
          // Repo fetch error is secondary
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load analysis details');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    loadData(analysisId);
  }, [analysisId, loadData]);

  useEffect(() => {
    let ignore = false;
    if (!analysisId) return;

    api.getAnalysis(analysisId)
      .then((data) => {
        if (ignore) return;
        setAnalysis(data);
        if (data?.repo_id) {
          api.getRepo(data.repo_id)
            .then((repoData) => {
              if (!ignore) setRepo(repoData);
            })
            .catch(() => {});
        }
      })
      .catch((err) => {
        if (!ignore) setError(err.message || 'Failed to load analysis details');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [analysisId]);

  return {
    analysis,
    repo,
    loading,
    error,
    refetch,
  };
}
