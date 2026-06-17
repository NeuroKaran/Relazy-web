const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ─── Helper: Get today's date string ───────────────────────────
function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ─── Achievement Definitions ───────────────────────────────────
const ACHIEVEMENTS = {
  first_habit: { id: 'first_habit', title: 'First Step', description: 'Complete your first habit', icon: '🌱', xpReward: 20 },
  streak_3: { id: 'streak_3', title: 'On Fire', description: '3-day streak', icon: '🔥', xpReward: 50 },
  streak_7: { id: 'streak_7', title: 'Unstoppable', description: '7-day streak', icon: '⚡', xpReward: 100 },
  streak_30: { id: 'streak_30', title: 'Legendary', description: '30-day streak', icon: '👑', xpReward: 500 },
  perfect_day: { id: 'perfect_day', title: 'Perfect Day', description: 'Complete all habits in a day', icon: '⭐', xpReward: 50 },
  team_player: { id: 'team_player', title: 'Team Player', description: 'Join a co-op room', icon: '🤝', xpReward: 30 },
  room_host: { id: 'room_host', title: 'Leader', description: 'Host your first room', icon: '👑', xpReward: 30 },
  five_habits: { id: 'five_habits', title: 'Habit Builder', description: 'Add 5 habits to a room', icon: '🏗️', xpReward: 40 },
};

async function grantAchievement(userId, achievementId) {
  const user = await db.getUser(userId);
  if (!user) return false;
  if (user.achievements.includes(achievementId)) return false;

  const achievements = [...user.achievements, achievementId];
  let xp = user.xp;
  const achievement = ACHIEVEMENTS[achievementId];
  if (achievement) {
    xp += achievement.xpReward;
  }
  const level = Math.floor(xp / 100) + 1;
  await db.updateUser(userId, { achievements, xp, level });
  return true;
}

async function addXP(userId, amount) {
  const user = await db.getUser(userId);
  if (!user) return;
  const xp = user.xp + amount;
  const level = Math.floor(xp / 100) + 1;
  await db.updateUser(userId, { xp, level });
}

// ═══════════════════════════════════════════════════════════════
// AUTH ENDPOINTS
// ═══════════════════════════════════════════════════════════════

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, password, avatar } = req.body;
    if (!name || !password) {
      return res.status(400).json({ error: 'Name and password are required.' });
    }

    const existingUser = await db.getUserByName(name);
    if (existingUser) {
      return res.status(409).json({ error: 'Username already taken.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userId = 'usr_' + Math.random().toString(36).substring(2, 11);
    const user = {
      id: userId,
      name: name.trim(),
      password: hashedPassword,
      avatar: avatar || 'bramble',
      xp: 0,
      level: 1,
      streak: 0,
      achievements: [],
      createdAt: getTodayStr(),
    };

    await db.createUser(user);

    const { password: _, ...safeUser } = user;
    res.status(201).json(safeUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { name, password } = req.body;
    if (!name || !password) {
      return res.status(400).json({ error: 'Name and password are required.' });
    }

    const user = await db.getUserByName(name);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user profile
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await db.getUser(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's rooms (created and joined)
app.get('/api/users/:id/rooms', async (req, res) => {
  try {
    const userId = req.params.id;
    const rooms = await db.getRoomsForUser(userId);
    
    const created = [];
    const joined = [];
    
    rooms.forEach(room => {
      const hostId = room.hostId || Object.keys(room.members)[0];
      const roomSummary = {
        roomCode: room.roomCode,
        habitsCount: room.habits ? room.habits.length : 0,
        membersCount: room.members ? Object.keys(room.members).length : 0,
      };
      
      if (hostId === userId) {
        created.push(roomSummary);
      } else {
        joined.push(roomSummary);
      }
    });
    
    res.json({ created, joined });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get achievements list
app.get('/api/achievements', (req, res) => {
  res.json(ACHIEVEMENTS);
});

// ═══════════════════════════════════════════════════════════════
// ROOM ENDPOINTS
// ═══════════════════════════════════════════════════════════════

// Host Room
app.post('/api/rooms', async (req, res) => {
  try {
    const { hostId, hostName, hostAvatar, date } = req.body;
    if (!hostId || !hostName) {
      return res.status(400).json({ error: 'hostId and hostName are required.' });
    }

    let roomCode;
    do {
      roomCode = 'ROOM-' + Math.floor(1000 + Math.random() * 9000);
    } while (await db.getRoom(roomCode));

    const activeDate = date || getTodayStr();

    const initialRoom = {
      roomCode,
      hostId,
      createdAt: new Date().toISOString(),
      habits: [
        { id: 'h1', title: 'Drink a glass of water', description: 'Stay hydrated', emoji: '💧', completed: false, streak: 0, duration: '5 min', iconType: 'water' },
        { id: 'h2', title: 'Meditate for 5 minutes', description: 'Find your calm', emoji: '🧘', completed: false, streak: 0, duration: '5 min', iconType: 'meditate' },
        { id: 'h3', title: 'Stretch for 10 minutes', description: 'Loosen up', emoji: '🤸', completed: false, streak: 0, duration: '10 min', iconType: 'stretch' },
      ],
      members: {
        [hostId]: {
          id: hostId,
          name: hostName,
          avatar: hostAvatar || 'bramble',
          streak: 0,
          completedHabitIds: [],
        }
      },
      history: {
        [activeDate]: { [hostId]: 0 }
      }
    };

    await db.createRoom(initialRoom);
    await grantAchievement(hostId, 'room_host');

    res.status(201).json(initialRoom);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Room (host only)
app.delete('/api/rooms/:code', async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required.' });
    }

    const room = await db.getRoom(code);
    if (!room) return res.status(404).json({ error: 'Room not found.' });

    // Only the host can delete the room
    const hostId = room.hostId || Object.keys(room.members)[0];
    if (hostId !== userId) {
      return res.status(403).json({ error: 'Only the room host can delete this room.' });
    }

    await db.deleteRoom(code);
    res.json({ success: true, roomCode: code });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Room State
app.get('/api/rooms/:code', async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const room = await db.getRoom(code);
    if (!room) return res.status(404).json({ error: 'Room not found.' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Join Room
app.post('/api/rooms/:code/join', async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const { playerId, playerName, playerAvatar, date } = req.body;

    if (!playerId || !playerName) {
      return res.status(400).json({ error: 'playerId and playerName are required.' });
    }

    const room = await db.getRoom(code);
    if (!room) return res.status(404).json({ error: 'Room not found.' });

    const activeDate = date || getTodayStr();

    if (!room.members[playerId]) {
      room.members[playerId] = {
        id: playerId,
        name: playerName,
        avatar: playerAvatar || 'sunny',
        streak: 0,
        completedHabitIds: [],
      };
      if (!room.history[activeDate]) room.history[activeDate] = {};
      room.history[activeDate][playerId] = 0;

      await db.updateRoom(code, { members: room.members, history: room.history });
      await grantAchievement(playerId, 'team_player');
    } else {
      room.members[playerId].name = playerName;
      room.members[playerId].avatar = playerAvatar || room.members[playerId].avatar;
      await db.updateRoom(code, { members: room.members });
    }

    const updatedRoom = await db.getRoom(code);
    res.json(updatedRoom);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Habit
app.post('/api/rooms/:code/habits', async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const { title, emoji, description, duration, iconType } = req.body;

    if (!title) return res.status(400).json({ error: 'Habit title is required.' });

    const room = await db.getRoom(code);
    if (!room) return res.status(404).json({ error: 'Room not found.' });

    const newHabit = {
      id: 'h_' + Date.now().toString(),
      title: title.trim(),
      description: description || 'Daily habit',
      emoji: emoji || '✨',
      completed: false,
      streak: 0,
      duration: duration || '10 min',
      iconType: iconType || 'other',
    };

    room.habits.push(newHabit);
    await db.updateRoom(code, { habits: room.habits });

    if (room.habits.length >= 5) {
      for (const mId of Object.keys(room.members)) {
        await grantAchievement(mId, 'five_habits');
      }
    }

    const updatedRoom = await db.getRoom(code);
    res.json(updatedRoom);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove Habit
app.delete('/api/rooms/:code/habits/:id', async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const habitId = req.params.id;

    const room = await db.getRoom(code);
    if (!room) return res.status(404).json({ error: 'Room not found.' });

    room.habits = room.habits.filter(h => h.id !== habitId);
    Object.keys(room.members).forEach(memberId => {
      room.members[memberId].completedHabitIds = room.members[memberId].completedHabitIds.filter(id => id !== habitId);
    });

    await db.updateRoom(code, { habits: room.habits, members: room.members });
    const updatedRoom = await db.getRoom(code);
    res.json(updatedRoom);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle Habit
app.post('/api/rooms/:code/members/:memberId/toggle-habit', async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const memberId = req.params.memberId;
    const { habitId, date } = req.body;

    if (!habitId || !date) return res.status(400).json({ error: 'habitId and date are required.' });

    const room = await db.getRoom(code);
    if (!room) return res.status(404).json({ error: 'Room not found.' });

    const member = room.members[memberId];
    if (!member) return res.status(404).json({ error: 'Member not found.' });

    const index = member.completedHabitIds.indexOf(habitId);
    let justCompleted = false;
    if (index >= 0) {
      member.completedHabitIds.splice(index, 1);
    } else {
      member.completedHabitIds.push(habitId);
      justCompleted = true;
    }

    const totalCount = room.habits.length;
    const ratio = totalCount > 0 ? member.completedHabitIds.length / totalCount : 0;
    if (!room.history[date]) room.history[date] = {};
    room.history[date][memberId] = ratio;

    await db.updateRoom(code, { members: room.members, history: room.history });

    if (justCompleted) {
      await addXP(memberId, 10);
      await grantAchievement(memberId, 'first_habit');

      if (ratio === 1) {
        await grantAchievement(memberId, 'perfect_day');
        await addXP(memberId, 50);
      }

      const user = await db.getUser(memberId);
      if (user && ratio === 1) {
        user.streak = (user.streak || 0) + 1;
        room.members[memberId].streak = user.streak;
        await db.updateRoom(code, { members: room.members });
        await db.updateUser(memberId, { streak: user.streak });

        if (user.streak >= 3) await grantAchievement(memberId, 'streak_3');
        if (user.streak >= 7) await grantAchievement(memberId, 'streak_7');
        if (user.streak >= 30) await grantAchievement(memberId, 'streak_30');
      }
    }

    const updatedRoom = await db.getRoom(code);
    const updatedUser = await db.getUser(memberId);
    const xpInfo = updatedUser ? { xp: updatedUser.xp, level: updatedUser.level, achievements: updatedUser.achievements } : null;
    res.json({ room: updatedRoom, xpInfo, justCompleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add AI Buddy
app.post('/api/rooms/:code/members/ai', async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const { name, avatar, date } = req.body;

    if (!name) return res.status(400).json({ error: 'AI buddy name is required.' });

    const room = await db.getRoom(code);
    if (!room) return res.status(404).json({ error: 'Room not found.' });

    const aiId = 'ai_' + Math.random().toString(36).substring(2, 9);
    const activeDate = date || getTodayStr();

    room.members[aiId] = {
      id: aiId,
      name: `${name} 🤖`,
      avatar: avatar || 'panda',
      streak: Math.floor(3 + Math.random() * 10),
      completedHabitIds: [],
    };

    if (!room.history[activeDate]) room.history[activeDate] = {};
    room.history[activeDate][aiId] = 0;

    await db.updateRoom(code, { members: room.members, history: room.history });
    const updatedRoom = await db.getRoom(code);
    res.json(updatedRoom);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Simulate Buddy Progress
app.post('/api/rooms/:code/members/:memberId/simulate', async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const memberId = req.params.memberId;
    const { date } = req.body;

    if (!date) return res.status(400).json({ error: 'date is required.' });

    const room = await db.getRoom(code);
    if (!room) return res.status(404).json({ error: 'Room not found.' });

    const member = room.members[memberId];
    if (!member) return res.status(404).json({ error: 'Member not found.' });

    const uncompleted = room.habits.filter(h => !member.completedHabitIds.includes(h.id));
    if (uncompleted.length === 0) {
      return res.status(400).json({ error: 'All habits already completed.' });
    }

    const randomHabit = uncompleted[Math.floor(Math.random() * uncompleted.length)];
    member.completedHabitIds.push(randomHabit.id);

    const totalCount = room.habits.length;
    const ratio = totalCount > 0 ? member.completedHabitIds.length / totalCount : 0;
    if (!room.history[date]) room.history[date] = {};
    room.history[date][memberId] = ratio;

    await db.updateRoom(code, { members: room.members, history: room.history });
    const updatedRoom = await db.getRoom(code);
    res.json(updatedRoom);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Start Server ──────────────────────────────────────────────
db.init().then(() => {
  app.listen(PORT, async () => {
    const stats = await db.getStats();
    console.log(`✅ RELAZY Backend running on port ${PORT}`);
    console.log(`📦 Database loaded in ${stats.mode} mode with ${stats.usersCount} users and ${stats.roomsCount} rooms`);
  });
});
