import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

export function EmissionsChart({ code = 0, ci = 0, infra = 0 }) {
  const data = [
    { name: 'Code Base', carbon: Number(Number(code || 0).toFixed(2)), color: '#10b981' },
    { name: 'CI/CD Pipelines', carbon: Number(Number(ci || 0).toFixed(2)), color: '#3b82f6' },
    { name: 'Cloud & Infra', carbon: Number(Number(infra || 0).toFixed(2)), color: '#8b5cf6' },
  ];

  return (
    <div style={{ width: '100%', height: 180 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="name"
            stroke="var(--text-tertiary)"
            fontSize={11}
            tickLine={false}
          />
          <YAxis
            stroke="var(--text-tertiary)"
            fontSize={11}
            tickLine={false}
            unit="g"
          />
          <Tooltip
            cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 12px',
                      fontSize: 'var(--text-xs)',
                      boxShadow: 'var(--shadow-md)',
                    }}
                  >
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '2px' }}>
                      {item.name}
                    </div>
                    <div style={{ fontWeight: 600, color: item.color, fontFamily: 'var(--font-mono)' }}>
                      {item.carbon} gCO2e
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="carbon" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
