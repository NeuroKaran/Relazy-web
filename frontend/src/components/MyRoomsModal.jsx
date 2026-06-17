import { useState } from 'react';

export default function MyRoomsModal({ rooms, onClose, onSelectRoom, onDeleteRoom, userId }) {
  const [activeTab, setActiveTab] = useState('created'); // 'created' | 'joined'
  const [copiedCode, setCopiedCode] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleCopyCode = (code, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const handleDelete = (code, e) => {
    e.stopPropagation();
    if (confirmDelete === code) {
      // Second click = confirmed
      onDeleteRoom(code);
      setConfirmDelete(null);
    } else {
      // First click = show confirmation
      setConfirmDelete(code);
      // Auto-reset after 3 seconds
      setTimeout(() => setConfirmDelete(prev => prev === code ? null : prev), 3000);
    }
  };

  const createdRooms = rooms?.created || [];
  const joinedRooms = rooms?.joined || [];
  const activeRooms = activeTab === 'created' ? createdRooms : joinedRooms;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--sky-800)', display: 'flex', alignItems: 'center', gap: 8 }}>
            🚪 My Rooms
          </h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Tab Selection */}
        <div className="tabs" style={{ marginBottom: 20 }}>
          <button
            className={`tab ${activeTab === 'created' ? 'active' : ''}`}
            onClick={() => setActiveTab('created')}
          >
            👑 Created ({createdRooms.length})
          </button>
          <button
            className={`tab ${activeTab === 'joined' ? 'active' : ''}`}
            onClick={() => setActiveTab('joined')}
          >
            🤝 Joined ({joinedRooms.length})
          </button>
        </div>

        {/* Rooms List */}
        <div className="flex-col gap-sm" style={{ maxHeight: '50vh', overflowY: 'auto', paddingRight: 4 }}>
          {activeRooms.length === 0 ? (
            <div className="card text-center" style={{ padding: '32px 16px', borderStyle: 'dashed', borderColor: 'var(--sky-200)' }}>
              <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>
                {activeTab === 'created' ? '👑' : '🤝'}
              </span>
              <p style={{ fontWeight: 700, color: 'var(--sky-800)', fontSize: 15 }}>
                {activeTab === 'created' ? 'No rooms created yet' : 'No rooms joined yet'}
              </p>
              <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 4 }}>
                {activeTab === 'created' 
                  ? 'Host a room to start tracking habits together!' 
                  : 'Get a room code from a friend to join them!'}
              </p>
            </div>
          ) : (
            activeRooms.map((room) => (
              <div
                key={room.roomCode}
                className="habit-card"
                onClick={() => {
                  onSelectRoom(room.roomCode);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  animation: 'modalIn 0.2s ease',
                  border: '1.5px solid var(--sky-100)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 800, color: 'var(--sky-800)', letterSpacing: '0.5px', fontSize: 15 }}>
                      {room.roomCode}
                    </span>
                    <button
                      onClick={(e) => handleCopyCode(room.roomCode, e)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 12,
                        padding: 2,
                        display: 'flex',
                        alignItems: 'center',
                        color: copiedCode === room.roomCode ? 'var(--green)' : 'var(--gray-400)',
                        transition: 'all 0.15s'
                      }}
                      title="Copy room code"
                    >
                      {copiedCode === room.roomCode ? '✅' : '📋'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <span className="text-xs text-muted" style={{ fontWeight: 600 }}>
                      🌿 {room.habitsCount} {room.habitsCount === 1 ? 'habit' : 'habits'}
                    </span>
                    <span className="text-xs text-muted" style={{ fontWeight: 600 }}>
                      👥 {room.membersCount} {room.membersCount === 1 ? 'member' : 'members'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {/* Delete button — only on Created tab */}
                  {activeTab === 'created' && onDeleteRoom && (
                    <button
                      onClick={(e) => handleDelete(room.roomCode, e)}
                      style={{
                        background: confirmDelete === room.roomCode ? '#fee2e2' : 'none',
                        border: confirmDelete === room.roomCode ? '1.5px solid #fca5a5' : '1.5px solid transparent',
                        cursor: 'pointer',
                        fontSize: 12,
                        padding: '5px 8px',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        color: confirmDelete === room.roomCode ? '#dc2626' : 'var(--gray-400)',
                        fontWeight: confirmDelete === room.roomCode ? 700 : 400,
                        transition: 'all 0.2s ease',
                      }}
                      title={confirmDelete === room.roomCode ? 'Click again to confirm deletion' : 'Delete room'}
                    >
                      {confirmDelete === room.roomCode ? '⚠️ Confirm?' : '🗑️'}
                    </button>
                  )}

                  <button
                    className="btn btn-primary btn-sm"
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    Enter ⚡
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
