export default function Navbar({ user, roomCode, onBack, onLogout }) {
  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {onBack && (
          <button onClick={onBack} className="btn-sm" style={{
            width: 36, height: 36, borderRadius: '50%', background: 'var(--sky-50)',
            border: '1.5px solid var(--sky-200)', cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sky-700)'
          }}>←</button>
        )}
        <div className="navbar-logo">🌊 RELAZY</div>
      </div>
      <div className="navbar-right">
        {roomCode && <span className="badge badge-sky">{roomCode}</span>}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="badge badge-gold">⭐ Lv.{user.level}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--sky-600)' }}>{user.name}</span>
            {onLogout && (
              <button onClick={onLogout} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, color: 'var(--gray-400)', fontWeight: 600
              }}>Logout</button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
