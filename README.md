# RELAZY Web — Gamified Co-Op Habit Tracker 🌊

A beautiful web app for building habits together with friends, featuring XP, levels, achievements, and co-op rooms.

## Quick Start

### Backend
```bash
cd backend
npm install
npm start        # Runs on port 3001
```

### Frontend
```bash
cd frontend
npm install
npm run dev      # Runs on port 5173
```

## Deployment

### Frontend (Vercel/Netlify)
1. Set the build directory to `frontend`
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add env variable: `VITE_BACKEND_URL=https://your-backend.onrender.com`

### Backend (Render.com — Free)
1. Create a new Web Service on [render.com](https://render.com)
2. Set root directory to `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Environment: Node

## Features
- 🔐 Login/Register with password hashing (bcrypt)
- 👑 Host or 🤝 Join co-op rooms
- ✅ Track daily habits with teammates
- ⭐ XP system with levels
- 🏆 8 unlockable achievements
- 📊 Calendar with progress rings
- 🥇 Live leaderboard
- 🎉 Confetti animations on completion
