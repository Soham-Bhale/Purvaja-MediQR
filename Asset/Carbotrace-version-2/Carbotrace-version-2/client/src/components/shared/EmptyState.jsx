import { Package } from '@phosphor-icons/react';

export function EmptyState({
  icon: Icon = Package,
  title = 'No data found',
  description = 'No items to display at this time.',
  action = null,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-12) var(--space-6)',
        textAlign: 'center',
        border: '1px dashed var(--border)',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--bg-secondary)',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-tertiary)',
          marginBottom: 'var(--space-4)',
        }}
      >
        <Icon size={24} weight="duotone" />
      </div>
      <h3
        style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-2)',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-secondary)',
          maxWidth: '400px',
          marginBottom: action ? 'var(--space-6)' : 0,
        }}
      >
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
