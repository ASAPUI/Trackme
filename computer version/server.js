// FlowTrack Backend — Node.js + Express
// Run: npm install && node server.js
// author :Essabri Ali Rayan
// Warning : this project for free becaus i don't want to pay 30+ in month just because some weird app track what i do 
const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const DB_FILE = './db.json';

// Simple file-based DB (replace with MongoDB for production)
function readDB() {
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({ users: {}, transactions: [] }));
  return JSON.parse(fs.readFileSync(DB_FILE));
}
function writeDB(data) { fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2)); }

// GET all transactions
app.get('/api/transactions', (req, res) => {
  const db = readDB();
  res.json(db.transactions);
});

// POST add transaction
app.post('/api/transactions', (req, res) => {
  const { type, amount, description, category } = req.body;
  if (!type || !amount) return res.status(400).json({ error: 'Missing required fields' });
  const txn = { id: Date.now().toString(), type, amount: parseFloat(amount), description, category, date: new Date().toISOString() };
  const db = readDB();
  db.transactions.unshift(txn);
  writeDB(db);
  res.json(txn);
});

// DELETE transaction
app.delete('/api/transactions/:id', (req, res) => {
  const db = readDB();
  db.transactions = db.transactions.filter(t => t.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// GET stats summary
app.get('/api/stats', (req, res) => {
  const db = readDB();
  const txns = db.transactions;
  const now = new Date();

  const filter = (period) => txns.filter(t => {
    const d = new Date(t.date);
    if (period === 'day') return d.toDateString() === now.toDateString();
    if (period === 'week') {
      const start = new Date(now); start.setDate(now.getDate() - now.getDay()); start.setHours(0,0,0,0);
      return d >= start;
    }
    if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    return true;
  });

  const calcStats = (list) => ({
    income: list.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0),
    expenses: list.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0),
    balance: list.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0) - list.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0),
    count: list.length
  });

  res.json({
    day: calcStats(filter('day')),
    week: calcStats(filter('week')),
    month: calcStats(filter('month')),
    all: calcStats(txns),
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`FlowTrack API running on http://localhost:${PORT}`));
