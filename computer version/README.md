# 💸 FlowTrack — Personal Expense Tracker

A mobile-first expense tracking app with AI assistant, built for Moroccan users (MAD currency).

## 🚀 Quick Start (Web Version)

Just open `app.html` in your browser. Works offline with localStorage.

## 📱 Features

- **Track expenses & income** with categories (Food, Transport, Shopping, Health, Housing, Fun, Study)
- **Day / Week / Month / All-time** views with real stats
- **Balance & Gains tracker** — income minus expenses
- **Visual charts** — 7-day spending bar chart + category donut chart
- **Financial health indicators** — savings rate, budget usage
- **Budget alerts** — notification when you reach 80% of monthly budget
- **AI Assistant** — powered by Claude/Groq, knows your real spending data
- **Full history** — filterable transaction log

## 🏗️ Tech Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| Frontend | React Native + Expo | Free |
| Web demo | Vanilla HTML/CSS/JS | Free |
| State | localStorage / AsyncStorage | Free |
| Backend | Node.js + Express | Free |
| Database | MongoDB Atlas | Free (512MB) |
| AI | Claude API / Groq | Free tier |
| Deploy | Railway / Render | Free tier |
| Push Notif | Expo Push | Free |

## 🤖 AI Setup (Groq - Free)

1. Sign up at https://console.groq.com (free)
2. Get your API key
3. Replace the fetch URL in `app.html` with:
   ```
   https://api.groq.com/openai/v1/chat/completions
   ```
   And add header: `Authorization: Bearer YOUR_GROQ_KEY`
   Model: `llama-3.1-70b-versatile`

## 🖥️ Backend Setup

```bash
cd backend
npm init -y
npm install express cors
node server.js
# API runs on http://localhost:3001
```

## 📲 React Native Setup (Full Mobile App)

```bash
npx create-expo-app FlowTrack
cd FlowTrack
npx expo install @react-navigation/native @react-navigation/bottom-tabs
npx expo install react-native-async-storage/async-storage
npx expo install victory-native react-native-svg
```

## 📂 Project Structure

```
expense-tracker/
├── app.html              ← Full web demo (start here!)
├── README.md
└── backend/
    └── server.js         ← Node.js REST API
```

## 🔧 Build Order

1. ✅ Web demo (app.html) — done
2. ⬜ React Native screens
3. ⬜ MongoDB integration  
4. ⬜ Groq AI integration
5. ⬜ Push notifications
6. ⬜ Deploy to Expo / App Store
