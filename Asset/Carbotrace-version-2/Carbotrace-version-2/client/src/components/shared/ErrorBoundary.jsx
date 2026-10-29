import React from 'react';
import { WarningCircle, ArrowClockwise } from '@phosphor-icons/react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: 'var(--space-6)',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--danger-border)',
            borderRadius: 'var(--radius-lg)',
            margin: 'var(--space-4) 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
            <WarningCircle
              size={24}
              color="var(--danger)"
              weight="fill"
              style={{ flexShrink: 0, marginTop: 2 }}
            />
            <div>
              <h3
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 600,
                  color: 'var(--danger)',
                  marginBottom: 'var(--space-1)',
                }}
              >
                Failed to load component
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                {this.state.error?.message || 'An unexpected rendering error occurred.'}
              </p>
              <button
                type="button"
                onClick={this.handleReset}
                className="btn btn-secondary btn-sm"
                style={{
                  marginTop: 'var(--space-3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <ArrowClockwise size={14} />
                <span>Reload Component</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
