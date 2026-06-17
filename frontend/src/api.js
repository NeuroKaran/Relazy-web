const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

async function request(path, options = {}) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  register: (name, password, avatar) => request('/api/auth/register', { method: 'POST', body: { name, password, avatar } }),
  login: (name, password) => request('/api/auth/login', { method: 'POST', body: { name, password } }),
  getUser: (id) => request(`/api/users/${id}`),
  getUserRooms: (userId) => request(`/api/users/${userId}/rooms`),
  getAchievements: () => request('/api/achievements'),
  hostRoom: (hostId, hostName, hostAvatar) => request('/api/rooms', { method: 'POST', body: { hostId, hostName, hostAvatar, date: todayStr() } }),
  getRoom: (code) => request(`/api/rooms/${code}`),
  joinRoom: (code, playerId, playerName, playerAvatar) => request(`/api/rooms/${code}/join`, { method: 'POST', body: { playerId, playerName, playerAvatar, date: todayStr() } }),
  addHabit: (code, habit) => request(`/api/rooms/${code}/habits`, { method: 'POST', body: habit }),
  removeHabit: (code, habitId) => request(`/api/rooms/${code}/habits/${habitId}`, { method: 'DELETE' }),
  toggleHabit: (code, memberId, habitId, date) => request(`/api/rooms/${code}/members/${memberId}/toggle-habit`, { method: 'POST', body: { habitId, date } }),
  addAI: (code, name, avatar) => request(`/api/rooms/${code}/members/ai`, { method: 'POST', body: { name, avatar, date: todayStr() } }),
  simulate: (code, memberId) => request(`/api/rooms/${code}/members/${memberId}/simulate`, { method: 'POST', body: { date: todayStr() } }),
  deleteRoom: (code, userId) => request(`/api/rooms/${code}`, { method: 'DELETE', body: { userId } }),
};

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export { todayStr };
