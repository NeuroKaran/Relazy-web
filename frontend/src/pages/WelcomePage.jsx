import { useState } from 'react';
import XPBar from '../components/XPBar';
import AchievementBadge from '../components/AchievementBadge';

const ALL_ACHIEVEMENTS = {
  first_habit: { id: 'first_habit', title: 'First Step', description: 'Complete your first habit', icon: '🌱', xpReward: 20 },
  streak_3: { id: 'streak_3', title: 'On Fire', description: '3-day streak', icon: '🔥', xpReward: 50 },
  streak_7: { id: 'streak_7', title: 'Unstoppable', description: '7-day streak', icon: '⚡', xpReward: 100 },
  streak_30: { id: 'streak_30', title: 'Legendary', description: '30-day streak', icon: '👑', xpReward: 500 },
  perfect_day: { id: 'perfect_day', title: 'Perfect Day', description: 'Complete all habits in a day', icon: '⭐', xpReward: 50 },
  team_player: { id: 'team_player', title: 'Team Player', description: 'Join a co-op room', icon: '🤝', xpReward: 30 },
  room_host: { id: 'room_host', title: 'Leader', description: 'Host your first room', icon: '👑', xpReward: 30 },
  five_habits: { id: 'five_habits', title: 'Habit Builder', description: 'Add 5 habits to a room', icon: '🏗️', xpReward: 40 },
};

export default function WelcomePage({ user, onHost, onJoin }) {
  const [joinCode, setJoinCode] = useState('');
  const [showJoin, setShowJoin] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  const avatarEmoji = { bramble: '🐻', sunny: '☀️', fox: '🦊', panda: '🐼', lion: '🦁' }[user.avatar] || '👤';

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 24 }}>
        {/* Profile Card */}
        <div className="card" style={{ textAlign: 'center', marginBottom: 20, animation: 'modalIn 0.4s ease' }}>
          <div style={{ fontSize: 64, marginBottom: 8 }}>{avatarEmoji}</div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--sky-800)' }}>Hey, {user.name}! 👋</h2>
          <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>Ready to build some habits today?</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
            <span className="badge badge-sky">🔥 {user.streak || 0} day streak</span>
            <span className="badge badge-gold">⭐ Level {user.level}</span>
          </div>
        </div>

        {/* XP Bar */}
        <div style={{ marginBottom: 20, animation: 'modalIn 0.5s ease' }}>
          <XPBar xp={user.xp} level={user.level} />
        </div>

        {/* Action Buttons */}
        <div className="flex-col gap-md" style={{ marginBottom: 20, animation: 'modalIn 0.6s ease' }}>
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={onHost}>
            👑 Host a Room
          </button>

          {!showJoin ? (
            <button className="btn btn-secondary btn-lg" style={{ width: '100%' }} onClick={() => setShowJoin(true)}>
              🤝 Join a Room
            </button>
          ) : (
            <div className="card" style={{ padding: 16 }}>
              <label className="input-label">Enter Room Code</label>
              <input className="input" placeholder="ROOM-XXXX" value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                style={{ letterSpacing: 2, fontWeight: 800, textAlign: 'center', marginBottom: 12 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" style={{ flex: 1 }}
                  onClick={() => joinCode.trim() && onJoin(joinCode.trim())}>
                  ⚡ Connect
                </button>
                <button className="btn btn-secondary" onClick={() => setShowJoin(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* Achievements Preview */}
        <div style={{ animation: 'modalIn 0.7s ease' }}>
          <button className="btn btn-secondary" style={{ width: '100%', marginBottom: 12 }}
            onClick={() => setShowAchievements(!showAchievements)}>
            🏆 {showAchievements ? 'Hide' : 'View'} Achievements ({user.achievements?.length || 0}/{Object.keys(ALL_ACHIEVEMENTS).length})
          </button>
          {showAchievements && (
            <div className="flex-col gap-sm">
              {Object.values(ALL_ACHIEVEMENTS).map(a => (
                <AchievementBadge key={a.id} achievement={a}
                  unlocked={user.achievements?.includes(a.id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
