const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_FILE = path.join(__dirname, 'db.json');

let client = null;
let mongoDb = null;
let isMongo = false;

// In-memory fallback db
let localDb = { users: {}, rooms: {} };

async function init() {
  if (MONGODB_URI) {
    try {
      console.log('🔌 Connecting to MongoDB Atlas...');
      client = new MongoClient(MONGODB_URI);
      await client.connect();
      mongoDb = client.db();
      isMongo = true;
      console.log('✅ Connected to MongoDB successfully!');
      
      // Create indexes for performance
      await mongoDb.collection('users').createIndex({ id: 1 }, { unique: true });
      await mongoDb.collection('users').createIndex({ name: 1 });
      await mongoDb.collection('rooms').createIndex({ roomCode: 1 }, { unique: true });
    } catch (err) {
      console.error('❌ MongoDB connection failed, falling back to JSON storage:', err.message);
      loadJsonDb();
    }
  } else {
    console.log('📦 No MONGODB_URI found, using local JSON storage.');
    loadJsonDb();
  }
}

function loadJsonDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      localDb = JSON.parse(data);
      if (!localDb.users) localDb.users = {};
      if (!localDb.rooms) localDb.rooms = {};
    } else {
      saveJsonDb();
    }
  } catch (error) {
    console.error('Error loading JSON database:', error);
  }
}

function saveJsonDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(localDb, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving JSON database:', error);
  }
}

// ─── Database Operations ───────────────────────────────────────

async function getUser(id) {
  if (isMongo) {
    return await mongoDb.collection('users').findOne({ id });
  }
  return localDb.users[id] || null;
}

async function getUserByName(name) {
  if (isMongo) {
    return await mongoDb.collection('users').findOne({
      name: { $regex: new RegExp('^' + name.trim() + '$', 'i') }
    });
  }
  return Object.values(localDb.users).find(
    u => u.name.toLowerCase() === name.trim().toLowerCase()
  ) || null;
}

async function createUser(user) {
  if (isMongo) {
    await mongoDb.collection('users').insertOne({ ...user });
    return user;
  }
  localDb.users[user.id] = user;
  saveJsonDb();
  return user;
}

async function updateUser(id, updates) {
  if (isMongo) {
    const res = await mongoDb.collection('users').findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: 'after' }
    );
    return res;
  }
  if (!localDb.users[id]) return null;
  localDb.users[id] = { ...localDb.users[id], ...updates };
  saveJsonDb();
  return localDb.users[id];
}

async function getRoom(code) {
  const formattedCode = code.toUpperCase();
  if (isMongo) {
    return await mongoDb.collection('rooms').findOne({ roomCode: formattedCode });
  }
  return localDb.rooms[formattedCode] || null;
}

async function createRoom(room) {
  if (isMongo) {
    await mongoDb.collection('rooms').insertOne({ ...room });
    return room;
  }
  localDb.rooms[room.roomCode] = room;
  saveJsonDb();
  return room;
}

async function updateRoom(code, updates) {
  const formattedCode = code.toUpperCase();
  if (isMongo) {
    const res = await mongoDb.collection('rooms').findOneAndUpdate(
      { roomCode: formattedCode },
      { $set: updates },
      { returnDocument: 'after' }
    );
    return res;
  }
  if (!localDb.rooms[formattedCode]) return null;
  localDb.rooms[formattedCode] = { ...localDb.rooms[formattedCode], ...updates };
  saveJsonDb();
  return localDb.rooms[formattedCode];
}

async function getRoomsForUser(userId) {
  if (isMongo) {
    return await mongoDb.collection('rooms').find({
      [`members.${userId}`]: { $exists: true }
    }).toArray();
  }
  return Object.values(localDb.rooms).filter(
    room => room.members && room.members[userId]
  );
}

// Helper to count totals for logging
async function getStats() {
  if (isMongo) {
    const usersCount = await mongoDb.collection('users').countDocuments();
    const roomsCount = await mongoDb.collection('rooms').countDocuments();
    return { usersCount, roomsCount, mode: 'MongoDB' };
  }
  return {
    usersCount: Object.keys(localDb.users).length,
    roomsCount: Object.keys(localDb.rooms).length,
    mode: 'JSON'
  };
}

module.exports = {
  init,
  getUser,
  getUserByName,
  createUser,
  updateUser,
  getRoom,
  createRoom,
  updateRoom,
  getRoomsForUser,
  getStats
};
