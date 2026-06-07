export default function Leaderboard({ members, roomCode, onSimulate }) {
  const sorted = [...members].sort((a, b) => {
    const ar = a.totalCount > 0 ? a.completedCount / a.totalCount : 0;
    const br = b.totalCount > 0 ? b.completedCount / b.totalCount : 0;
    return ar !== br ? br - ar : b.streak - a.streak;
  });

  const avatarEmoji = (a) => ({ bramble: '🐻', sunny: '☀️', fox: '🦊', panda: '🐼', lion: '🦁' }[a] || '👤');
  const rankBadge = (i) => ['🥇','🥈','🥉'][i] || `${i + 1}th`;

  return (
    <div>
      <div className="lb-header">
        <div>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7 }}>Co-Op Room</div>
          <div className="lb-code">{roomCode}</div>
        </div>
        <span className="badge badge-green">{members.length} Players</span>
      </div>
      <div className="card" style={{ padding: 12 }}>
        {sorted.map((m, i) => {
          const pct = m.totalCount > 0 ? Math.round((m.completedCount / m.totalCount) * 100) : 0;
          return (
            <div key={m.id} className={`lb-member ${m.isMe ? 'is-me' : ''}`}>
              <div className="lb-rank">{rankBadge(i)}</div>
              <div className="lb-avatar">{avatarEmoji(m.avatar)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: m.isMe ? 'var(--sky-600)' : 'var(--sky-900)' }}>
                    {m.name} {m.isMe && '(You)'}
                  </span>
                  <span className="badge badge-gold" style={{ fontSize: 11 }}>🔥 {m.streak}d</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="lb-track">
                    <div className="lb-fill" style={{
                      width: `${pct}%`,
                      background: m.isMe ? 'var(--sky-400)' : 'var(--gold)'
                    }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', minWidth: 55, textAlign: 'right' }}>
                    {m.completedCount}/{m.totalCount}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {onSimulate && (
        <div className="card" style={{ marginTop: 12, padding: 16, background: 'var(--gold-light)', borderColor: 'var(--gold)' }}>
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>🎮 Co-Op Simulation</div>
          <div style={{ fontSize: 12, color: 'var(--gray-600)', marginBottom: 12 }}>
            Tap to simulate a buddy completing a habit!
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {members.filter(m => !m.isMe).map(m => (
              <button key={m.id} className="btn btn-sm btn-secondary" onClick={() => onSimulate(m.id)}>
                {avatarEmoji(m.avatar)} {m.name.split(' ')[0]}
              </button>
            ))}
            {members.filter(m => !m.isMe).length === 0 && (
              <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>No buddies yet — add one!</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
