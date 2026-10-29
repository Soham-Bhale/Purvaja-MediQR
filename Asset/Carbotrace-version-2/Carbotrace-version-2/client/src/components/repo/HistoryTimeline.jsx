import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { ArrowSquareOut, Leaf } from '@phosphor-icons/react';

export function HistoryTimeline({ history = [] }) {
  if (!history || history.length === 0) {
    return (
      <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', padding: 'var(--space-4) 0' }}>
        No historical audit runs recorded yet.
      </div>
    );
  }

  // Format chart data sorted by date ascending
  const chartData = [...history]
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .map((item) => {
      const d = new Date(item.created_at);
      return {
        id: item.id,
        label: d.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
        fullDate: d.toLocaleString(),
        score: Math.round(item.total_score),
        codeCarbon: Number(item.code_carbon || 0).toFixed(1),
        ciCarbon: Number(item.ci_carbon || 0).toFixed(1),
        infraCarbon: Number(item.infra_carbon || 0).toFixed(1),
      };
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Chart visualization */}
      {chartData.length > 1 && (
        <div style={{ width: '100%', height: 160, marginTop: 'var(--space-2)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                stroke="var(--text-tertiary)"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                stroke="var(--text-tertiary)"
                fontSize={11}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
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
                        <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                          {data.fullDate}
                        </div>
                        <div style={{ fontWeight: 600, color: 'var(--accent)' }}>
                          Eco-Score: {data.score}/100
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#scoreGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* List of past analyses */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {history.map((item) => {
          const totalCarbon = (
            (item.code_carbon || 0) +
            (item.ci_carbon || 0) +
            (item.infra_carbon || 0)
          ).toFixed(1);
          const score = Math.round(item.total_score);

          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-xs)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color:
                      score >= 80
                        ? 'var(--accent)'
                        : score >= 50
                        ? 'var(--warning)'
                        : 'var(--danger)',
                    minWidth: '28px',
                  }}
                >
                  {score}
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {new Date(item.created_at).toLocaleString()}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <span style={{ color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Leaf size={12} />
                  {totalCarbon} gCO2e
                </span>
                <Link
                  to={`/dashboard/${item.id}`}
                  style={{
                    color: 'var(--accent)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    textDecoration: 'none',
                  }}
                  className="btn-ghost"
                >
                  <span>View</span>
                  <ArrowSquareOut size={12} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
