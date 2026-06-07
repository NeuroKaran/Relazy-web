import { useState } from 'react';

export default function LoginPage({ onLogin, onSwitchToRegister }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !password) { setError('Please fill in all fields'); return; }
    setLoading(true); setError('');
    try { await onLogin(name.trim(), password); }
    catch (err) { setError(err.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card card" style={{ animation: 'modalIn 0.5s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌊</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--sky-800)', marginBottom: 4 }}>
            Welcome Back
          </h1>
          <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>Log in to continue your streak!</p>
        </div>
        <form onSubmit={handleSubmit} className="flex-col gap-md">
          <div>
            <label className="input-label">Username</label>
            <input className="input" type="text" placeholder="Enter your name" value={name}
              onChange={e => setName(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="input-label">Password</label>
            <input className="input" type="password" placeholder="Enter your password" value={password}
              onChange={e => setPassword(e.target.value)} />
          </div>
          {error && <div style={{ color: 'var(--red)', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>{error}</div>}
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
            style={{ width: '100%', opacity: loading ? 0.7 : 1 }}>
            {loading ? '⏳ Logging in...' : '🚀 Log In'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>Don't have an account? </span>
          <button onClick={onSwitchToRegister} style={{
            background: 'none', border: 'none', color: 'var(--sky-500)',
            fontWeight: 700, fontSize: 13, cursor: 'pointer'
          }}>Sign Up</button>
        </div>
      </div>
    </div>
  );
}
