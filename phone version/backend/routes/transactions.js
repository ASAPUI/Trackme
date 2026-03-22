const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// Helper: build date range filter
function dateFilter(period) {
  const now = new Date();
  if (period === 'day') {
    const start = new Date(now); start.setHours(0,0,0,0);
    return { $gte: start };
  }
  if (period === 'week') {
    const start = new Date(now); start.setDate(now.getDate() - now.getDay()); start.setHours(0,0,0,0);
    return { $gte: start };
  }
  if (period === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { $gte: start };
  }
  return undefined;
}

// GET /api/transactions  — list with filters
router.get('/', auth, async (req, res) => {
  try {
    const { period, type, category, limit = 50, page = 1 } = req.query;
    const query = { user: req.user._id };
    if (period && period !== 'all') query.date = dateFilter(period);
    if (type) query.type = type;
    if (category) query.category = category;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [transactions, total] = await Promise.all([
      Transaction.find(query).sort({ date: -1 }).skip(skip).limit(parseInt(limit)),
      Transaction.countDocuments(query),
    ]);
    res.json({ transactions, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/transactions
router.post('/', auth, [
  body('type').isIn(['expense','income']),
  body('amount').isFloat({ min: 0.01 }),
  body('description').trim().notEmpty(),
  body('category').optional().isString(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const txn = await Transaction.create({ ...req.body, user: req.user._id });
    res.status(201).json(txn);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/transactions/:id
router.patch('/:id', auth, async (req, res) => {
  try {
    const txn = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!txn) return res.status(404).json({ error: 'Transaction not found' });
    res.json(txn);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const txn = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!txn) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/transactions/stats — aggregated stats for all periods
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const periods = {
      day: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      week: (() => { const d = new Date(now); d.setDate(now.getDate() - now.getDay()); d.setHours(0,0,0,0); return d; })(),
      month: new Date(now.getFullYear(), now.getMonth(), 1),
    };

    const aggregateFor = async (startDate) => {
      const match = { user: userId };
      if (startDate) match.date = { $gte: startDate };
      const result = await Transaction.aggregate([
        { $match: match },
        { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]);
      const income = result.find(r => r._id === 'income') || { total: 0, count: 0 };
      const expense = result.find(r => r._id === 'expense') || { total: 0, count: 0 };
      return { income: income.total, expenses: expense.total, balance: income.total - expense.total, count: income.count + expense.count };
    };

    const [day, week, month, all] = await Promise.all([
      aggregateFor(periods.day),
      aggregateFor(periods.week),
      aggregateFor(periods.month),
      aggregateFor(null),
    ]);

    // Category breakdown for this month
    const catBreakdown = await Transaction.aggregate([
      { $match: { user: userId, type: 'expense', date: { $gte: periods.month } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } }
    ]);

    // 7-day daily totals
    const sevenDaysAgo = new Date(now); sevenDaysAgo.setDate(now.getDate() - 6); sevenDaysAgo.setHours(0,0,0,0);
    const dailyTotals = await Transaction.aggregate([
      { $match: { user: userId, type: 'expense', date: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, total: { $sum: '$amount' } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({ day, week, month, all, catBreakdown, dailyTotals });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
