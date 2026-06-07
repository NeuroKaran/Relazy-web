export default function AchievementBadge({ achievement, unlocked }) {
  return (
    <div className={`achievement ${unlocked ? 'unlocked' : 'locked'}`}>
      <div className="achievement-icon">{achievement.icon}</div>
      <div className="achievement-info">
        <div className="achievement-title">{achievement.title}</div>
        <div className="achievement-desc">{achievement.description}</div>
      </div>
      <span className="badge badge-gold" style={{ fontSize: 11 }}>+{achievement.xpReward} XP</span>
    </div>
  );
}
