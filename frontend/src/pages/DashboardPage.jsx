import { useState } from 'react';
import HabitCard from '../components/HabitCard';
import CalendarView from '../components/CalendarView';
import Leaderboard from '../components/Leaderboard';
import XPBar from '../components/XPBar';
import { todayStr } from '../api';

export default function DashboardPage({
  user, roomState, roomCode, onToggleHabit, onSimulate, onAddAI, onAddHabit, onRefreshUser
}) {
  const [tab, setTab] = useState('today');
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newEmoji, setNewEmoji] = useState('✨');

  const myId = user.id;
  const myProfile = roomState?.members?.[myId];

  const habits = (roomState?.habits || []).map(h => ({
    ...h,
    completed: myProfile ? myProfile.completedHabitIds.includes(h.id) : false,
  }));

  const completedCount = habits.filter(h => h.completed).length;
  const totalCount = habits.length;

  const members = roomState ? Object.values(roomState.members).map(m => ({
    id: m.id, name: m.name, avatar: m.avatar, streak: m.streak,
    completedCount: m.completedHabitIds.length,
    totalCount: roomState.habits.length,
    isMe: m.id === myId,
  })) : [];

  const calData = {};
  if (roomState?.history) {
    Object.entries(roomState.history).forEach(([date, map]) => {
      const vals = Object.values(map);
      if (vals.length) calData[date] = vals.reduce((a, b) => a + b, 0) / vals.length;
    });
  }

  // Mascot state
  const ratio = totalCount > 0 ? completedCount / totalCount : 0;
  let mascotMsg = "Check off a habit to get started! 💤";
  let mascotEmoji = "😴";
  if (ratio === 1) { mascotMsg = "ALL DONE! You're a champion! 🎉🏆"; mascotEmoji = "🤩"; }
  else if (ratio >= 0.5) { mascotMsg = "Past 50%! Keep going! ☀️"; mascotEmoji = "😊"; }
  else if (ratio > 0) { mascotMsg = "Great start! Let's keep it up! 💪"; mascotEmoji = "🙂"; }

  const avatarEmoji = { bramble: '🐻', sunny: '☀️', fox: '🦊', panda: '🐼', lion: '🦁' }[user.avatar] || '👤';

  const detectType = (t) => {
    const l = t.toLowerCase();
    if (l.includes('water') || l.includes('drink')) return { iconType: 'water', duration: '5 min' };
    if (l.includes('meditat')) return { iconType: 'meditate', duration: '15 min' };
    if (l.includes('stretch') || l.includes('yoga')) return { iconType: 'stretch', duration: '10 min' };
    if (l.includes('walk') || l.includes('run')) return { iconType: 'walk', duration: '10 min' };
    return { iconType: 'other', duration: '10 min' };
  };

  const handleAddHabit = () => {
    if (!newTitle.trim()) return;
    const { iconType, duration } = detectType(newTitle);
    onAddHabit({ title: newTitle.trim(), emoji: newEmoji, description: 'Daily habit', duration, iconType });
    setNewTitle(''); setShowModal(false);
  };

  const EMOJIS = ['💧','🧘','🤸','🚶','🏋️','🥗','💻','📚','💤','✨'];

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 16, paddingBottom: 80 }}>
        {/* Mascot Section */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, padding: 16 }}>
          <div style={{ fontSize: 56 }}>{avatarEmoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--sky-800)', marginBottom: 4 }}>
              {mascotEmoji} {user.name}'s Buddy
            </div>
            <div style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.4 }}>{mascotMsg}</div>
          </div>
        </div>

        {/* XP Bar */}
        <div style={{ marginBottom: 16 }}>
          <XPBar xp={user.xp} level={user.level} />
        </div>

        {/* Calendar */}
        <div style={{ marginBottom: 16 }}>
          <CalendarView activeDate={selectedDate} onSelectDate={setSelectedDate} completionData={calData} />
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: 16 }}>
          <button className={`tab ${tab === 'today' ? 'active' : ''}`} onClick={() => setTab('today')}>
            My Habits ({completedCount}/{totalCount})
          </button>
          <button className={`tab ${tab === 'leaderboard' ? 'active' : ''}`} onClick={() => setTab('leaderboard')}>
            Leaderboard 🥇
          </button>
        </div>

        {/* Habits Tab */}
        {tab === 'today' && (
          <div className="flex-col gap-sm">
            {habits.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--gray-400)' }}>
                No habits yet! Click + to add one 🌿
              </div>
            ) : (
              habits.map((h, i) => (
                <HabitCard key={h.id} habit={h} completed={h.completed}
                  onToggle={() => onToggleHabit(h.id, selectedDate)} index={i} />
              ))
            )}

            {/* Daily Quest Card */}
            {totalCount > 0 && (
              <div className="card" style={{
                marginTop: 8, padding: 16, background: ratio === 1
                  ? 'linear-gradient(135deg, var(--green-light), var(--white))'
                  : 'linear-gradient(135deg, var(--sky-50), var(--white))',
                borderColor: ratio === 1 ? 'var(--green)' : 'var(--sky-200)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 28 }}>{ratio === 1 ? '🏆' : '🎯'}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--sky-800)' }}>
                      {ratio === 1 ? 'Daily Quest Complete!' : 'Daily Quest'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                      {ratio === 1 ? '+50 XP bonus earned! 🎉' : `Complete all ${totalCount} habits for +50 XP bonus`}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Leaderboard Tab */}
        {tab === 'leaderboard' && (
          <div>
            <Leaderboard members={members} roomCode={roomCode} onSimulate={onSimulate} />
            <div className="card" style={{ marginTop: 12, padding: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8, color: 'var(--sky-800)' }}>
                👥 Add Co-Op Buddies
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => onAddAI('Mochi Panda', 'panda')}>
                  + 🐼 Mochi
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => onAddAI('Oliver Lion', 'lion')}>
                  + 🦁 Oliver
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FAB */}
      {tab === 'today' && (
        <button className="fab" onClick={() => setShowModal(true)}>+</button>
      )}

      {/* New Habit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--sky-800)' }}>New Habit</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="flex-col gap-md">
              <div>
                <label className="input-label">Name your habit</label>
                <input className="input" placeholder="e.g. Morning Meditations" value={newTitle}
                  onChange={e => setNewTitle(e.target.value)} autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleAddHabit()} />
              </div>
              <div>
                <label className="input-label">Choose an icon</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {EMOJIS.map(em => (
                    <button key={em} type="button" onClick={() => setNewEmoji(em)} style={{
                      width: 40, height: 40, borderRadius: 10,
                      border: newEmoji === em ? '2px solid var(--sky-400)' : '1.5px solid var(--sky-200)',
                      background: newEmoji === em ? 'var(--sky-100)' : 'var(--white)',
                      cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', transition: 'all 0.15s',
                    }}>{em}</button>
                  ))}
                </div>
              </div>
              <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleAddHabit}>
                Save Habit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
