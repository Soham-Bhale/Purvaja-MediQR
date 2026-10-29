import { NavLink } from 'react-router-dom';
import { Leaf, ClockCounterClockwise, GithubLogo, Globe } from '@phosphor-icons/react';

export function Navbar({ onOpenGithubModal, githubAuth }) {
  const { isAuthenticated, user } = githubAuth;

  return (
    <header
      style={{
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'rgba(9, 9, 11, 0.85)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 var(--space-6)',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
          <NavLink
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent-subtle)',
                border: '1px solid var(--accent-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent)',
              }}
            >
              <Leaf size={18} weight="fill" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ fontWeight: 600, fontSize: 'var(--text-base)', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                Carbotrace
              </span>
              <span className="badge badge-emerald" style={{ fontSize: '10px', padding: '1px 6px' }}>
                v2
              </span>
            </div>
          </NavLink>

          {/* Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `btn btn-ghost btn-sm ${isActive ? 'active' : ''}`
              }
              style={({ isActive }) => ({
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--bg-tertiary)' : 'transparent',
                fontWeight: isActive ? 600 : 400,
              })}
            >
              Analyze
            </NavLink>
            <NavLink
              to="/map"
              className={({ isActive }) =>
                `btn btn-ghost btn-sm ${isActive ? 'active' : ''}`
              }
              style={({ isActive }) => ({
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--bg-tertiary)' : 'transparent',
                fontWeight: isActive ? 600 : 400,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              })}
            >
              <Globe size={14} />
              <span>Map</span>
            </NavLink>
            <NavLink
              to="/history"
              className={({ isActive }) =>
                `btn btn-ghost btn-sm ${isActive ? 'active' : ''}`
              }
              style={({ isActive }) => ({
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--bg-tertiary)' : 'transparent',
                fontWeight: isActive ? 600 : 400,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              })}
            >
              <ClockCounterClockwise size={14} />
              <span>History</span>
            </NavLink>
          </nav>
        </div>

        {/* Right side actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button
            type="button"
            onClick={onOpenGithubModal}
            className={`btn btn-secondary btn-sm ${isAuthenticated ? 'connected' : ''}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}
          >
            {isAuthenticated && user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.login}
                style={{ width: 16, height: 16, borderRadius: '50%' }}
              />
            ) : (
              <GithubLogo size={16} />
            )}
            <span>{isAuthenticated && user ? user.login : 'Connect GitHub'}</span>
            {isAuthenticated && (
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent)',
                }}
              />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
