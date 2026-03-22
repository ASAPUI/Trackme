# 🚀 FlowTrack — Complete Setup Guide

## Project Structure
```
flowtrack/
├── backend/                  ← Node.js + Express + MongoDB
│   ├── server.js             ← Entry point
│   ├── config/db.js          ← MongoDB connection
│   ├── models/
│   │   ├── User.js           ← User schema
│   │   └── Transaction.js    ← Transaction schema
│   ├── routes/
│   │   ├── auth.js           ← Register, login, profile
│   │   ├── transactions.js   ← CRUD + stats aggregation
│   │   └── ai.js             ← Groq AI chat endpoint
│   ├── middleware/auth.js    ← JWT verification
│   └── .env.example          ← Copy to .env and fill in
│
└── mobile/                   ← React Native + Expo
    ├── App.js                ← Root component
    ├── app.json              ← Expo config
    ├── src/
    │   ├── screens/
    │   │   ├── AuthScreen.js     ← Login + Register
    │   │   ├── HomeScreen.js     ← Dashboard + charts
    │   │   ├── AddScreen.js      ← Add expense/income
    │   │   ├── HistoryScreen.js  ← Transaction list
    │   │   ├── ReportsScreen.js  ← Donut chart + health
    │   │   ├── AIScreen.js       ← AI chat assistant
    │   │   └── SettingsScreen.js ← Profile + budget
    │   ├── store/useStore.js     ← Zustand global state
    │   ├── utils/
    │   │   ├── api.js            ← Axios + JWT interceptors
    │   │   └── helpers.js        ← Formatting + filtering
    │   ├── navigation/
    │   │   └── AppNavigator.js   ← Bottom tab + stack nav
    │   └── theme/index.js        ← Colors + categories
```

---

## STEP 1 — Backend Setup

### 1.1 MongoDB Atlas (free)
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a FREE cluster (M0 — forever free)
3. Create a database user (Settings → Database Access)
4. Whitelist all IPs: 0.0.0.0/0 (Network Access)
5. Get connection string: Clusters → Connect → Drivers

### 1.2 Groq API (free AI)
1. Go to https://console.groq.com
2. Sign up → API Keys → Create key
3. Copy your key

### 1.3 Start the backend
```bash
cd backend
cp .env.example .env
# Edit .env and fill in:
#   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/flowtrack
#   JWT_SECRET=any_long_random_string
#   GROQ_API_KEY=gsk_your_groq_key

npm install
npm run dev     # Development (auto-restart)
# or
npm start       # Production
```

API runs on: http://localhost:3001

Test it:
```bash
curl http://localhost:3001/health
# {"status":"ok","version":"1.0.0"}
```

---

## STEP 2 — Mobile App Setup

### 2.1 Install dependencies
```bash
cd mobile
npm install
```

### 2.2 Configure backend URL
Edit `src/utils/api.js`:
```js
// For emulator:
export const BASE_URL = 'http://10.0.2.2:3001/api';   // Android emulator
export const BASE_URL = 'http://localhost:3001/api';   // iOS simulator

// For real device (use your computer's local IP):
export const BASE_URL = 'http://192.168.1.XXX:3001/api';

// For production (after deploying):
export const BASE_URL = 'https://your-app.railway.app/api';
```

### 2.3 Run the app
```bash
npx expo start
```
- Press `a` → Android emulator
- Press `i` → iOS simulator
- Scan QR code → Expo Go app on your phone

---

## STEP 3 — Deploy (optional, free)

### Backend on Railway (free tier)
```bash
# Install Railway CLI
npm install -g @railway/cli
railway login
cd backend
railway init
railway up
# Set environment variables in Railway dashboard
```

### Alternative: Render.com
- Connect GitHub repo
- Set start command: `node server.js`
- Add environment variables

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Get JWT token |
| GET  | /api/auth/me | Current user |
| PATCH| /api/auth/profile | Update profile |
| GET  | /api/transactions | List (with ?period=day\|week\|month\|all) |
| POST | /api/transactions | Add transaction |
| PATCH| /api/transactions/:id | Update |
| DELETE| /api/transactions/:id | Delete |
| GET  | /api/transactions/stats | Aggregated stats |
| POST | /api/ai/chat | AI chat (Groq) |

---

## Features Implemented ✅

- [x] User authentication (JWT)
- [x] Add expense / income with categories
- [x] Day / Week / Month / All-time views
- [x] Balance & gains tracker
- [x] 7-day spending bar chart
- [x] Category donut chart
- [x] Financial health indicators
- [x] Monthly budget with alerts
- [x] AI assistant (Groq + offline fallback)
- [x] Transaction history with search
- [x] Offline support (AsyncStorage cache)
- [x] Dark theme throughout
- [x] iOS + Android compatible

## Next Steps 🔲

- [ ] Push notifications (Expo Notifications)
- [ ] Export to PDF/CSV
- [ ] Multiple currencies
- [ ] Recurring transactions
- [ ] Bank sync (Plaid)
- [ ] Widgets for home screen
