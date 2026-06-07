import { useState } from 'react';

const AVATARS = [
  { id: 'bramble', emoji: '🐻', name: 'Bramble Bear' },
  { id: 'sunny', emoji: '☀️', name: 'Sunny Ball' },
  { id: 'fox', emoji: '🦊', name: 'Foxy' },
  { id: 'panda', emoji: '🐼', name: 'Mochi' },
  { id: 'lion', emoji: '🦁', name: 'Leo' },
];

export default function RegisterPage({ onRegister, onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('bramble');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !password) { setError('Please fill in all fields'); return; }
    if (password.length < 3) { setError('Password must be at least 3 characters'); return; }
    setLoading(true); setError('');
    try { await onRegister(name.trim(), password, avatar); }
    catch (err) { setError(err.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card card" style={{ animation: 'modalIn 0.5s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌊</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--sky-800)', marginBottom: 4 }}>Create Account</h1>
          <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>Start building habits today!</p>
        </div>
        <form onSubmit={handleSubmit} className="flex-col gap-md">
          <div>
            <label className="input-label">Choose Your Name</label>
            <input className="input" type="text" placeholder="e.g. Karan" value={name}
              onChange={e => setName(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="input-label">Password</label>
            <input className="input" type="password" placeholder="Create a password" value={password}
              onChange={e => setPassword(e.target.value)} />
          </div>
          <div>
            <label className="input-label">Pick Your Avatar</label>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {AVATARS.map(a => (
                <button key={a.id} type="button" onClick={() => setAvatar(a.id)} style={{
                  width: 60, height: 60, borderRadius: 16, border: avatar === a.id ? '3px solid var(--sky-400)' : '2px solid var(--sky-200)',
                  background: avatar === a.id ? 'var(--sky-100)' : 'var(--white)', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 2, transition: 'all 0.2s', transform: avatar === a.id ? 'scale(1.1)' : 'scale(1)',
                }}>
                  <span style={{ fontSize: 24 }}>{a.emoji}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--sky-700)' }}>{a.name}</span>
                </button>
              ))}
            </div>
          </div>
          {error && <div style={{ color: 'var(--red)', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>{error}</div>}
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
            style={{ width: '100%', opacity: loading ? 0.7 : 1 }}>
            {loading ? '⏳ Creating...' : '🎉 Create Account'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>Already have an account? </span>
          <button onClick={onSwitchToLogin} style={{
            background: 'none', border: 'none', color: 'var(--sky-500)',
            fontWeight: 700, fontSize: 13, cursor: 'pointer'
          }}>Log In</button>
        </div>
      </div>
    </div>
  );
}
