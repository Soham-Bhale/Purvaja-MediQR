export function CarbonSplit({ code = 0, ci = 0, infra = 0 }) {
  const codeVal = Math.max(0, Number(code) || 0);
  const ciVal = Math.max(0, Number(ci) || 0);
  const infraVal = Math.max(0, Number(infra) || 0);
  const total = codeVal + ciVal + infraVal;

  const codePct = total > 0 ? (codeVal / total) * 100 : 33.3;
  const ciPct = total > 0 ? (ciVal / total) * 100 : 33.3;
  const infraPct = total > 0 ? (infraVal / total) * 100 : 33.4;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Emissions Proportion
        </span>
        <span style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
          Total: <strong style={{ color: 'var(--accent)' }}>{total.toFixed(2)}</strong> gCO2e
        </span>
      </div>

      {/* Stacked Bar */}
      <div
        style={{
          height: '10px',
          width: '100%',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-pill)',
          overflow: 'hidden',
          display: 'flex',
        }}
      >
        {codePct > 0 && (
          <div
            style={{
              width: `${codePct}%`,
              backgroundColor: 'var(--layer-code)',
              transition: 'width 0.6s ease',
            }}
            title={`Code: ${codeVal.toFixed(2)} gCO2e (${codePct.toFixed(1)}%)`}
          />
        )}
        {ciPct > 0 && (
          <div
            style={{
              width: `${ciPct}%`,
              backgroundColor: 'var(--layer-ci)',
              transition: 'width 0.6s ease',
            }}
            title={`CI/CD: ${ciVal.toFixed(2)} gCO2e (${ciPct.toFixed(1)}%)`}
          />
        )}
        {infraPct > 0 && (
          <div
            style={{
              width: `${infraPct}%`,
              backgroundColor: 'var(--layer-infra)',
              transition: 'width 0.6s ease',
            }}
            title={`Infra: ${infraVal.toFixed(2)} gCO2e (${infraPct.toFixed(1)}%)`}
          />
        )}
      </div>

      {/* Legend / Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--space-2)',
          fontSize: 'var(--text-xs)',
          paddingTop: 'var(--space-1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--layer-code)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Code:</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {codeVal.toFixed(1)}g
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--layer-ci)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>CI/CD:</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {ciVal.toFixed(1)}g
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--layer-infra)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Infra:</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {infraVal.toFixed(1)}g
          </span>
        </div>
      </div>
    </div>
  );
}
