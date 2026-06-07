export default function XPBar({ xp = 0, level = 1 }) {
  const xpInLevel = xp % 100;
  const xpNeeded = 100;
  const pct = Math.min(100, (xpInLevel / xpNeeded) * 100);

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 24 }}>⭐</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--sky-800)' }}>Level {level}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{xpInLevel} / {xpNeeded} XP</div>
          </div>
        </div>
        <div className="badge badge-sky" style={{ fontSize: 14, fontWeight: 800 }}>
          {xp} XP Total
        </div>
      </div>
      <div className="xp-bar-container">
        <div className="xp-bar-fill xp-bar-glow" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
