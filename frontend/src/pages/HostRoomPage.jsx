import { useState } from 'react';

const EMOJIS = ['💧', '🧘', '🤸', '🚶', '🏋️', '🥗', '💻', '📚', '💤', '🧹', '✨'];

export default function HostRoomPage({ roomCode, roomState, onAddHabit, onRemoveHabit, onLaunch }) {
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('✨');

  const detectType = (t) => {
    const l = t.toLowerCase();
    if (l.includes('water') || l.includes('drink')) return { iconType: 'water', duration: '5 min' };
    if (l.includes('meditat') || l.includes('relax') || l.includes('calm')) return { iconType: 'meditate', duration: '15 min' };
    if (l.includes('stretch') || l.includes('yoga')) return { iconType: 'stretch', duration: '10 min' };
    if (l.includes('walk') || l.includes('run') || l.includes('step')) return { iconType: 'walk', duration: '10 min' };
    return { iconType: 'other', duration: '10 min' };
  };

  const handleAdd = () => {
    if (!title.trim()) return;
    const { iconType, duration } = detectType(title);
    onAddHabit({ title: title.trim(), emoji, description: 'Daily habit', duration, iconType });
    setTitle('');
  };

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 24 }}>
        <div style={{ marginBottom: 24, animation: 'modalIn 0.4s ease' }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--sky-800)' }}>Configure Room 📋</h1>
          <p style={{ fontSize: 14, color: 'var(--gray-500)', marginTop: 4 }}>
            Room <span style={{ fontWeight: 800, color: 'var(--sky-500)' }}>{roomCode}</span> — set up habits for your team
          </p>
        </div>

        {/* Habit count */}
        <div className="card" style={{ padding: 14, marginBottom: 16, background: 'var(--sky-50)',
          borderColor: 'var(--sky-200)', animation: 'modalIn 0.5s ease' }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--sky-700)' }}>
            🚀 {roomState?.habits?.length || 0} habits configured
          </span>
        </div>

        {/* Existing Habits */}
        <div className="flex-col gap-sm" style={{ marginBottom: 20, animation: 'modalIn 0.55s ease' }}>
          {roomState?.habits?.map(h => (
            <div key={h.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', background: 'var(--white)', borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--sky-100)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>{h.emoji}</span>
                <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--sky-900)' }}>{h.title}</span>
              </div>
              <button className="btn btn-sm btn-danger" onClick={() => onRemoveHabit(h.id)}>Remove</button>
            </div>
          ))}
        </div>

        {/* Add Habit Form */}
        <div className="card" style={{ padding: 20, marginBottom: 20, animation: 'modalIn 0.6s ease' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--sky-800)', marginBottom: 12 }}>Add Habit</h3>
          <input className="input" placeholder="e.g. Do 20 pushups" value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            style={{ marginBottom: 12 }} />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {EMOJIS.map(em => (
              <button key={em} type="button" onClick={() => setEmoji(em)} style={{
                width: 38, height: 38, borderRadius: 10, border: emoji === em ? '2px solid var(--sky-400)' : '1.5px solid var(--sky-200)',
                background: emoji === em ? 'var(--sky-100)' : 'var(--white)',
                cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}>{em}</button>
            ))}
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleAdd}>
            ➕ Add Habit
          </button>
        </div>

        {/* Launch Button */}
        <button className="btn btn-lg" onClick={onLaunch} style={{
          width: '100%', background: 'linear-gradient(135deg, #34d399, #10b981)',
          color: 'white', boxShadow: '0 4px 16px rgba(52,211,153,0.3)',
          animation: 'modalIn 0.7s ease'
        }}>
          🚀 Launch Dashboard
        </button>
      </div>
    </div>
  );
}
