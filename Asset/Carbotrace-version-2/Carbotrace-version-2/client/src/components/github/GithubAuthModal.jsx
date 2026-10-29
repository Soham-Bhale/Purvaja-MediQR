import { useState } from 'react';
import { X, Key, CheckCircle, Warning, Eye, EyeSlash, SignOut, GithubLogo } from '@phosphor-icons/react';

export function GithubAuthModal({ isOpen, onClose, githubAuth }) {
  const { token, user, loading, error, saveToken, logout, isAuthenticated } = githubAuth;
  const [inputVal, setInputVal] = useState(token || '');
  const [showToken, setShowToken] = useState(false);
  const [localError, setLocalError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    if (!inputVal.trim()) {
      setLocalError('Please enter a GitHub personal access token.');
      return;
    }
    const success = await saveToken(inputVal.trim());
    if (success) {
      onClose();
    }
  };

  const handleDisconnect = () => {
    logout();
    setInputVal('');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: 'var(--space-6)',
          backgroundColor: 'var(--bg-secondary)',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <GithubLogo size={22} weight="fill" />
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>GitHub Integration</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost"
            style={{ padding: 4 }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {isAuthenticated && user ? (
          /* Authenticated state */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-4)',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
              }}
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.login}
                  style={{ width: 44, height: 44, borderRadius: '50%' }}
                />
              ) : (
                <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'var(--accent)' }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
                  {user.name || user.login}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  @{user.login} • {user.public_repos + (user.total_private_repos || 0)} repositories
                </div>
              </div>
              <CheckCircle size={22} color="var(--accent)" weight="fill" />
            </div>

            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              Connected with GitHub Personal Access Token. Carbotrace can access your public and private repositories to calculate carbon metrics.
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              <button
                type="button"
                onClick={handleDisconnect}
                className="btn btn-secondary"
                style={{ color: 'var(--danger)', borderColor: 'var(--danger-border)' }}
              >
                <SignOut size={16} />
                Disconnect
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-primary"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form state */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Enter a GitHub Personal Access Token (classic or fine-grained) to clone private repos, bypass rate limits, and choose directly from your repositories.
            </p>

            <div>
              <label
                htmlFor="github-token"
                style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}
              >
                Personal Access Token (PAT)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="github-token"
                  type={showToken ? 'text' : 'password'}
                  className="input-text"
                  placeholder="ghp_xxxxxxxxxxxx..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  style={{ paddingRight: '40px', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-tertiary)',
                  }}
                  aria-label="Toggle token visibility"
                >
                  {showToken ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {(error || localError) && (
              <div
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  backgroundColor: 'var(--danger-subtle)',
                  border: '1px solid var(--danger-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--danger)',
                  fontSize: 'var(--text-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                }}
              >
                <Warning size={14} weight="fill" />
                <span>{localError || error}</span>
              </div>
            )}

            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Token requires <code>repo</code> permissions. Token is only saved locally in your browser storage.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Key size={16} />
                    <span>Connect Account</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
