export function StatusBadge({ type = 'severity', value = '', size = 'sm' }) {
  if (!value) return null;

  const normalized = String(value).toUpperCase();

  let colorClass = 'badge-zinc';
  if (type === 'severity') {
    if (normalized === 'HIGH' || normalized === 'CRITICAL') colorClass = 'badge-red';
    else if (normalized === 'MEDIUM') colorClass = 'badge-amber';
    else if (normalized === 'LOW') colorClass = 'badge-emerald';
  } else if (type === 'priority') {
    if (normalized === 'HIGH') colorClass = 'badge-red';
    else if (normalized === 'MEDIUM') colorClass = 'badge-amber';
    else colorClass = 'badge-zinc';
  } else if (type === 'effort') {
    if (normalized === 'LOW' || normalized === 'EASY') colorClass = 'badge-emerald';
    else if (normalized === 'MEDIUM') colorClass = 'badge-amber';
    else colorClass = 'badge-red';
  } else if (type === 'score') {
    const num = Number(value);
    if (num >= 80) colorClass = 'badge-emerald';
    else if (num >= 50) colorClass = 'badge-amber';
    else colorClass = 'badge-red';
  } else if (type === 'layer') {
    if (normalized === 'CODE') colorClass = 'badge-emerald';
    else if (normalized === 'CI') colorClass = 'badge-blue';
    else colorClass = 'badge-zinc';
  } else if (type === 'source') {
    if (normalized === 'OLLAMA_LOCAL' || normalized === 'OLLAMA_CLOUD') colorClass = 'badge-emerald';
    else if (normalized === 'STATIC_RULES') colorClass = 'badge-zinc';
    else colorClass = 'badge-zinc';
  }

  return (
    <span className={`badge ${colorClass} ${size === 'xs' ? 'btn-sm' : ''}`}>
      {value}
    </span>
  );
}
