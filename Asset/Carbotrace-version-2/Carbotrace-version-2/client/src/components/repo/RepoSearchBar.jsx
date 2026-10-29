import { useState } from 'react';
import { MagnifyingGlass, GitBranch, Sparkle, ArrowRight, SlidersHorizontal, GithubLogo } from '@phosphor-icons/react';

export function RepoSearchBar({
  onAnalyze,
  loading = false,
  onOpenGithubModal,
  isAuthenticated = false,
  defaultUrl = '',
}) {
  const [url, setUrl] = useState(defaultUrl);
  const [branch, setBranch] = useState('');
  const [includeLlm, setIncludeLlm] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    const trimmed = url.trim();
    if (!trimmed) {
      setValidationError('Please enter a GitHub repository URL');
      return;
    }

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.includes('github.com')) {
      setValidationError('Please enter a valid GitHub URL (e.g. https://github.com/owner/repo)');
      return;
    }

    onAnalyze({
      repoUrl: trimmed,
      branch: branch.trim() || null,
      includeLlm,
    });
  };

  return (
    <div style={{ width: '100%' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {/* Main Search Input Group */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-secondary)',
            border: `1px solid ${validationError ? 'var(--danger)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '4px 6px 4px 16px',
            boxShadow: 'var(--shadow-sm)',
            transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
          }}
        >
          <MagnifyingGlass size={18} color="var(--text-tertiary)" style={{ flexShrink: 0, marginRight: '10px' }} />
          
          <input
            type="text"
            placeholder="https://github.com/owner/repository"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (validationError) setValidationError('');
            }}
            disabled={loading}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              padding: '8px 0',
            }}
          />

          <button
            type="button"
            onClick={() => setShowOptions(!showOptions)}
            className="btn btn-ghost btn-sm"
            style={{
              color: showOptions ? 'var(--accent)' : 'var(--text-tertiary)',
              marginRight: '6px',
            }}
            title="Analysis options"
          >
            <SlidersHorizontal size={16} />
          </button>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              padding: '9px 18px',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
            }}
          >
            {loading ? (
              <>
                <span className="spinner" />
                <span>Analyzing repo...</span>
              </>
            ) : (
              <>
                <span>Run Audit</span>
                <ArrowRight size={16} weight="bold" />
              </>
            )}
          </button>
        </div>

        {validationError && (
          <div style={{ color: 'var(--danger)', fontSize: 'var(--text-xs)', paddingLeft: 'var(--space-2)' }}>
            {validationError}
          </div>
        )}

        {/* Collapsible Options Bar */}
        {showOptions && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 'var(--space-4)',
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-xs)',
            }}
          >
            {/* Branch selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <GitBranch size={14} color="var(--text-tertiary)" />
              <span style={{ color: 'var(--text-secondary)' }}>Branch:</span>
              <input
                type="text"
                placeholder="default"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                disabled={loading}
                className="input-text"
                style={{
                  width: '120px',
                  height: '28px',
                  padding: '2px 8px',
                  fontSize: 'var(--text-xs)',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>

            {/* LLM toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={includeLlm}
                onChange={(e) => setIncludeLlm(e.target.checked)}
                disabled={loading}
                style={{ accentColor: 'var(--accent)' }}
              />
              <Sparkle size={14} color="var(--accent)" weight="fill" />
              <span>Include AI optimizations</span>
            </label>

            {/* GitHub PAT prompt */}
            {!isAuthenticated && onOpenGithubModal && (
              <button
                type="button"
                onClick={onOpenGithubModal}
                className="btn btn-ghost btn-sm"
                style={{ marginLeft: 'auto', padding: '2px 8px', fontSize: 'var(--text-xs)' }}
              >
                <GithubLogo size={14} />
                <span>Add GitHub token for private repos</span>
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
