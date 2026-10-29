import { useEffect, useState } from 'react';

export function ScoreGauge({ score = 100, size = 180 }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  const cleanScore = Math.min(100, Math.max(0, Math.round(Number(score) || 0)));

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(cleanScore);
    }, 50);
    return () => clearTimeout(timer);
  }, [cleanScore]);

  // SVG parameters
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Semi-circle gauge with 240 degree arc
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * (animatedScore / 100));

  let color = 'var(--accent)';
  let statusText = 'Optimal Eco-Efficiency';
  if (cleanScore < 50) {
    color = 'var(--danger)';
    statusText = 'Critical Carbon Impact';
  } else if (cleanScore < 80) {
    color = 'var(--warning)';
    statusText = 'Moderate Carbon Footprint';
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4) 0',
      }}
    >
      <div style={{ position: 'relative', width: size, height: size * 0.85 }}>
        <svg
          width={size}
          height={size}
          style={{ transform: 'rotate(135deg)', overflow: 'visible' }}
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--bg-tertiary)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />

          {/* Foreground Active Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.4s ease',
            }}
          />
        </svg>

        {/* Center Text */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '8px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '44px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1,
              letterSpacing: '-0.03em',
            }}
          >
            {animatedScore}
          </div>
          <div
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginTop: '4px',
            }}
          >
            Eco-Score
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 'var(--space-1)',
          fontSize: 'var(--text-xs)',
          fontWeight: 500,
          color,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: color }} />
        {statusText}
      </div>
    </div>
  );
}
