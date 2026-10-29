export function LayerBreakdown({ layerType, breakdown = {} }) {
  if (!breakdown || Object.keys(breakdown).length === 0) {
    return (
      <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', padding: 'var(--space-2) 0' }}>
        No detailed telemetry breakdown recorded for this layer.
      </div>
    );
  }

  if (layerType === 'code') {
    const deps = breakdown.dependencies || {};
    const ast = breakdown.ast_patterns || {};
    const tests = breakdown.tests || {};

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
        {/* Dependencies info */}
        <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Dependencies & Bloat
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', color: 'var(--text-secondary)' }}>
            <div>Packages analyzed: <strong style={{ color: 'var(--text-primary)' }}>{deps.total_packages ?? '0'}</strong></div>
            <div>Installed footprint: <strong style={{ color: 'var(--text-primary)' }}>{deps.total_size_mb ? `${Number(deps.total_size_mb).toFixed(1)} MB` : '0 MB'}</strong></div>
            {deps.carbon_gco2e !== undefined && (
              <div>Package emissions: <strong style={{ color: 'var(--layer-code)' }}>{Number(deps.carbon_gco2e).toFixed(2)} gCO2e</strong></div>
            )}
          </div>
        </div>

        {/* AST static analysis */}
        <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Static Code Smells & Complexity
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', color: 'var(--text-secondary)' }}>
            <div>Files analyzed: <strong style={{ color: 'var(--text-primary)' }}>{ast.files_scanned ?? 0}</strong></div>
            <div>Nested loops: <strong style={{ color: ast.nested_loops > 0 ? 'var(--warning)' : 'var(--text-primary)' }}>{ast.nested_loops ?? 0}</strong></div>
            <div>N+1 query smells: <strong style={{ color: ast.n_plus_one_queries > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>{ast.n_plus_one_queries ?? 0}</strong></div>
            <div>Unused imports: <strong style={{ color: 'var(--text-primary)' }}>{ast.unused_imports ?? 0}</strong></div>
          </div>
        </div>

        {/* Test suite status */}
        {tests && (
          <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Test Coverage & Efficiency
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', color: 'var(--text-secondary)' }}>
              <div>Test files detected: <strong style={{ color: 'var(--text-primary)' }}>{tests.test_files ?? 0}</strong></div>
              <div>Gap penalty: <strong style={{ color: tests.test_gap_penalty ? 'var(--warning)' : 'var(--accent)' }}>{tests.test_gap_penalty ? `-${tests.test_gap_penalty} pts` : 'None'}</strong></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (layerType === 'ci') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
        <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            CI/CD Pipeline Telemetry
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', color: 'var(--text-secondary)' }}>
            <div>Workflows: <strong style={{ color: 'var(--text-primary)' }}>{breakdown.num_workflows ?? 0}</strong></div>
            <div>Missing cache steps: <strong style={{ color: breakdown.missing_caching ? 'var(--warning)' : 'var(--accent)' }}>{breakdown.missing_caching ?? 0}</strong></div>
            {breakdown.num_jobs !== undefined && (
              <div>Jobs per run: <strong style={{ color: 'var(--text-primary)' }}>{breakdown.num_jobs}</strong></div>
            )}
            {breakdown.runs_per_week !== undefined && (
              <div>Estimated runs/wk: <strong style={{ color: 'var(--text-primary)' }}>{breakdown.runs_per_week}</strong></div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (layerType === 'infra') {
    const instances = breakdown.instances || [];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
        <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Compute & Cloud Footprint
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', color: 'var(--text-secondary)' }}>
            <div>Instances detected: <strong style={{ color: 'var(--text-primary)' }}>{breakdown.num_instances ?? instances.length}</strong></div>
            <div>Cloud provider: <strong style={{ color: 'var(--text-primary)' }}>{breakdown.cloud_provider || 'Local / Docker'}</strong></div>
            {breakdown.region && (
              <div>Region: <strong style={{ color: 'var(--text-primary)' }}>{breakdown.region}</strong></div>
            )}
            {breakdown.grid_carbon_intensity && (
              <div>Grid intensity: <strong style={{ color: 'var(--layer-infra)' }}>{breakdown.grid_carbon_intensity} gCO2/kWh</strong></div>
            )}
          </div>

          {instances.length > 0 && (
            <div style={{ marginTop: 'var(--space-2)' }}>
              <div style={{ color: 'var(--text-tertiary)', marginBottom: '2px' }}>Provisioned resources:</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {instances.slice(0, 4).map((inst, idx) => (
                  <li key={idx} style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    • {typeof inst === 'object' ? `${inst.type || inst.name} (${inst.count || 1}x)` : String(inst)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fallback raw viewer
  return (
    <pre
      style={{
        padding: 'var(--space-3)',
        backgroundColor: 'var(--bg-primary)',
        borderRadius: 'var(--radius-sm)',
        fontSize: 'var(--text-xs)',
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-secondary)',
        overflowX: 'auto',
      }}
    >
      {JSON.stringify(breakdown, null, 2)}
    </pre>
  );
}
