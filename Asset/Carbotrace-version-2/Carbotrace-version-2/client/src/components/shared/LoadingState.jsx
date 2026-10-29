export function LoadingSkeleton({ width = '100%', height = '20px', radius = 'var(--radius-sm)', style = {} }) {
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        borderRadius: radius,
        ...style,
      }}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <LoadingSkeleton width="280px" height="32px" />
          <LoadingSkeleton width="180px" height="18px" style={{ marginTop: '8px' }} />
        </div>
        <LoadingSkeleton width="120px" height="36px" radius="var(--radius-md)" />
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Left card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <LoadingSkeleton width="140px" height="24px" />
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-6) 0' }}>
            <LoadingSkeleton width="180px" height="180px" radius="50%" />
          </div>
          <LoadingSkeleton height="14px" />
          <LoadingSkeleton height="40px" radius="var(--radius-md)" />
        </div>

        {/* Right card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <LoadingSkeleton width="160px" height="24px" />
          <LoadingSkeleton height="60px" radius="var(--radius-md)" />
          <LoadingSkeleton height="60px" radius="var(--radius-md)" />
          <LoadingSkeleton height="60px" radius="var(--radius-md)" />
        </div>
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 3 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <LoadingSkeleton width="60%" height="20px" />
            <LoadingSkeleton width="45px" height="20px" radius="var(--radius-pill)" />
          </div>
          <LoadingSkeleton width="40%" height="14px" />
          <LoadingSkeleton width="80%" height="14px" style={{ marginTop: 'var(--space-2)' }} />
        </div>
      ))}
    </div>
  );
}
