import { useState, useRef } from 'react';

function spawnConfetti(x, y) {
  const colors = ['#38bdf8', '#fbbf24', '#34d399', '#a78bfa', '#f87171', '#fb923c'];
  for (let i = 0; i < 12; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.animation = `confettiFall ${0.8 + Math.random() * 0.6}s ease forwards`;
    el.style.transform = `translateX(${(Math.random() - 0.5) * 120}px)`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  }
}

export default function HabitCard({ habit, completed, onToggle, index }) {
  const [showXP, setShowXP] = useState(false);
  const cardRef = useRef(null);

  const handleClick = (e) => {
    if (!completed) {
      const rect = cardRef.current?.getBoundingClientRect();
      if (rect) spawnConfetti(rect.left + rect.width / 2, rect.top);
      setShowXP(true);
      setTimeout(() => setShowXP(false), 1200);
    }
    onToggle();
  };

  const iconBg = {
    water: 'water', meditate: 'meditate', stretch: 'stretch', walk: 'walk', other: 'other'
  };

  return (
    <div ref={cardRef} className={`habit-card ${completed ? 'completed' : ''}`}
      onClick={handleClick} style={{ animationDelay: `${index * 60}ms` }}>
      <div className="habit-check">
        <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
          <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className={`habit-icon ${iconBg[habit.iconType] || 'other'}`}>
        {habit.emoji}
      </div>
      <div className="habit-info">
        <div className="habit-title">{habit.title}</div>
        <div className="habit-streak">🔥 Streak {habit.streak || 0} days</div>
      </div>
      <div className="habit-duration">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10"/><path d="M12 6v6l3 3"/>
        </svg>
        {habit.duration || '10 min'}
      </div>
      <div className={`habit-xp ${showXP ? 'show' : ''}`}>+10 XP ⭐</div>
    </div>
  );
}
