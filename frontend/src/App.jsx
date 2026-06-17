import { useState, useEffect, useRef } from 'react';
import { api, todayStr } from './api';
import Toast, { useToast, notify } from './components/Toast';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WelcomePage from './pages/WelcomePage';
import HostRoomPage from './pages/HostRoomPage';
import DashboardPage from './pages/DashboardPage';
import MyRoomsModal from './components/MyRoomsModal';

export default function App() {
  const { items } = useToast();

  // Auth state
  const [user, setUser] = useState(null);
  const [authPage, setAuthPage] = useState('login'); // 'login' | 'register'

  // App state
  const [phase, setPhase] = useState('welcome'); // 'welcome' | 'host' | 'dashboard'
  const [roomCode, setRoomCode] = useState('');
  const [roomState, setRoomState] = useState(null);
  const [userRooms, setUserRooms] = useState({ created: [], joined: [] });
  const [showRoomsModal, setShowRoomsModal] = useState(false);
  const pollRef = useRef(null);

  const fetchUserRooms = async (userId) => {
    const id = userId || user?.id;
    if (!id) return;
    try {
      const rooms = await api.getUserRooms(id);
      setUserRooms(rooms);
    } catch (err) {
      console.error('Error fetching user rooms:', err);
    }
  };

  // Load saved session (with 30-day expiry)
  useEffect(() => {
    const saved = localStorage.getItem('relazy_user');
    const sessionTime = localStorage.getItem('relazy_session_time');
    
    if (saved) {
      // Check if session is still valid (30 days)
      const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
      if (sessionTime && (Date.now() - parseInt(sessionTime, 10)) > THIRTY_DAYS_MS) {
        // Session expired — clear everything
        localStorage.removeItem('relazy_user');
        localStorage.removeItem('relazy_room');
        localStorage.removeItem('relazy_session_time');
        return;
      }
      
      try {
        const u = JSON.parse(saved);
        // Refresh from server
        api.getUser(u.id).then(fresh => {
          setUser(fresh);
          localStorage.setItem('relazy_user', JSON.stringify(fresh));
          fetchUserRooms(fresh.id);
        }).catch(() => {
          setUser(u);
          fetchUserRooms(u.id);
        });
      } catch { /* ignore */ }
    }

    const savedRoom = localStorage.getItem('relazy_room');
    if (savedRoom && saved) {
      const u = JSON.parse(saved);
      api.getRoom(savedRoom).then(room => {
        if (room.members[u.id]) {
          setRoomCode(savedRoom);
          setRoomState(room);
          setPhase('dashboard');
          notify('Reconnected to room ' + savedRoom + ' ⚡');
        } else {
          localStorage.removeItem('relazy_room');
        }
      }).catch(() => localStorage.removeItem('relazy_room'));
    }
  }, []);

  // Poll room state
  useEffect(() => {
    if (phase !== 'dashboard' || !roomCode) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    const poll = () => api.getRoom(roomCode).then(setRoomState).catch(() => {});
    poll();
    pollRef.current = setInterval(poll, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [phase, roomCode]);

  // ── Auth handlers ──
  const handleLogin = async (name, password) => {
    const u = await api.login(name, password);
    setUser(u);
    localStorage.setItem('relazy_user', JSON.stringify(u));
    localStorage.setItem('relazy_session_time', Date.now().toString());
    fetchUserRooms(u.id);
    notify('Welcome back, ' + u.name + '! 🎉');
  };

  const handleRegister = async (name, password, avatar) => {
    const u = await api.register(name, password, avatar);
    setUser(u);
    localStorage.setItem('relazy_user', JSON.stringify(u));
    localStorage.setItem('relazy_session_time', Date.now().toString());
    fetchUserRooms(u.id);
    notify('Account created! Let\'s go! 🚀');
  };

  const handleLogout = () => {
    setUser(null);
    setPhase('welcome');
    setRoomCode('');
    setRoomState(null);
    setUserRooms({ created: [], joined: [] });
    localStorage.removeItem('relazy_user');
    localStorage.removeItem('relazy_room');
    localStorage.removeItem('relazy_session_time');
    notify('Logged out 👋');
  };

  // ── Room handlers ──
  const handleHost = async () => {
    console.log('handleHost triggered!');
    try {
      const avatarEmoji = { bramble: '🐻', sunny: '☀️', fox: '🦊', panda: '🐼', lion: '🦁' }[user.avatar] || '';
      console.log('Calling api.hostRoom with:', user.id, user.name + ' ' + avatarEmoji, user.avatar);
      const room = await api.hostRoom(user.id, user.name + ' ' + avatarEmoji, user.avatar);
      console.log('Room created successfully:', room);
      setRoomCode(room.roomCode);
      setRoomState(room);
      localStorage.setItem('relazy_room', room.roomCode);
      setPhase('host');
      refreshUser();
      fetchUserRooms(user.id);
      notify('Room ' + room.roomCode + ' created! 👑');
    } catch (err) {
      console.error('handleHost error:', err);
      notify('Failed to host: ' + err.message);
    }
  };

  const handleJoin = async (code) => {
    console.log('handleJoin triggered with code:', code);
    try {
      const avatarEmoji = { bramble: '🐻', sunny: '☀️', fox: '🦊', panda: '🐼', lion: '🦁' }[user.avatar] || '';
      const room = await api.joinRoom(code, user.id, user.name + ' ' + avatarEmoji, user.avatar);
      console.log('Room joined successfully:', room);
      setRoomCode(code);
      setRoomState(room);
      localStorage.setItem('relazy_room', code);
      setPhase('dashboard');
      refreshUser();
      fetchUserRooms(user.id);
      notify('Joined room ' + code + '! 🤝');
    } catch (err) {
      console.error('handleJoin error:', err);
      notify('Failed to join: ' + err.message);
    }
  };

  const handleAddHabit = async (habit) => {
    try {
      const room = await api.addHabit(roomCode, habit);
      setRoomState(room);
      notify('Added: ' + habit.title + ' ✨');
    } catch (err) { notify('Error: ' + err.message); }
  };

  const handleRemoveHabit = async (habitId) => {
    try {
      const room = await api.removeHabit(roomCode, habitId);
      setRoomState(room);
      notify('Habit removed 🗑️');
    } catch (err) { notify('Error: ' + err.message); }
  };

  const handleToggleHabit = async (habitId, date) => {
    try {
      const result = await api.toggleHabit(roomCode, user.id, habitId, date);
      setRoomState(result.room);
      if (result.xpInfo) {
        setUser(prev => ({ ...prev, ...result.xpInfo }));
        localStorage.setItem('relazy_user', JSON.stringify({ ...user, ...result.xpInfo }));
      }
      if (result.justCompleted) notify('Habit done! +10 XP ⭐');
    } catch (err) { notify('Error: ' + err.message); }
  };

  const handleSimulate = async (memberId) => {
    try {
      const room = await api.simulate(roomCode, memberId);
      setRoomState(room);
      notify('Buddy completed a habit! 🏆');
    } catch (err) { notify(err.message); }
  };

  const handleAddAI = async (name, avatar) => {
    try {
      const room = await api.addAI(roomCode, name, avatar);
      setRoomState(room);
      notify('Spawned ' + name + '! 🐼');
    } catch (err) { notify('Error: ' + err.message); }
  };

  const refreshUser = () => {
    api.getUser(user.id).then(u => {
      setUser(u);
      localStorage.setItem('relazy_user', JSON.stringify(u));
    }).catch(() => {});
  };

  const handleBack = () => {
    setPhase('welcome');
    setRoomCode('');
    setRoomState(null);
    localStorage.removeItem('relazy_room');
  };

  const handleDeleteRoom = async (code) => {
    try {
      await api.deleteRoom(code, user.id);
      // If we're currently in the deleted room, go back to welcome
      if (roomCode === code) {
        setPhase('welcome');
        setRoomCode('');
        setRoomState(null);
        localStorage.removeItem('relazy_room');
      }
      fetchUserRooms(user.id);
      notify('Room ' + code + ' deleted 🗑️');
    } catch (err) {
      notify('Error: ' + err.message);
    }
  };

  // ── Render ──
  if (!user) {
    return (
      <>
        <Toast items={items} />
        {authPage === 'login'
          ? <LoginPage onLogin={handleLogin} onSwitchToRegister={() => setAuthPage('register')} />
          : <RegisterPage onRegister={handleRegister} onSwitchToLogin={() => setAuthPage('login')} />
        }
      </>
    );
  }

  return (
    <>
      <Toast items={items} />
      <Navbar user={user} roomCode={phase === 'dashboard' ? roomCode : null}
        onBack={phase !== 'welcome' ? handleBack : null} onLogout={handleLogout}
        totalRooms={userRooms.created.length + userRooms.joined.length}
        onOpenRooms={() => { fetchUserRooms(); setShowRoomsModal(true); }} />

      {phase === 'welcome' && (
        <WelcomePage user={user} onHost={handleHost} onJoin={handleJoin} />
      )}

      {phase === 'host' && (
        <HostRoomPage roomCode={roomCode} roomState={roomState}
          onAddHabit={handleAddHabit} onRemoveHabit={handleRemoveHabit}
          onLaunch={() => setPhase('dashboard')} />
      )}

      {phase === 'dashboard' && roomState && (
        <DashboardPage user={user} roomState={roomState} roomCode={roomCode}
          onToggleHabit={handleToggleHabit} onSimulate={handleSimulate}
          onAddAI={handleAddAI} onAddHabit={handleAddHabit} onRefreshUser={refreshUser} />
      )}

      {showRoomsModal && (
        <MyRoomsModal
          rooms={userRooms}
          onClose={() => setShowRoomsModal(false)}
          onSelectRoom={handleJoin}
          onDeleteRoom={handleDeleteRoom}
          userId={user.id}
        />
      )}
    </>
  );
}
