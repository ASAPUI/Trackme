const mongoose = require('mongoose');

const CATEGORIES = ['food','transport','shopping','health','housing','entertainment','education','salary','freelance','investment','other'];

const TransactionSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:        { type: String, enum: ['expense', 'income'], required: true },
  amount:      { type: Number, required: true, min: 0.01 },
  description: { type: String, required: true, trim: true, maxlength: 100 },
  category:    { type: String, enum: CATEGORIES, default: 'other' },
  note:        { type: String, default: '' },
  date:        { type: Date, default: Date.now },
  createdAt:   { type: Date, default: Date.now },
});

// Indexes for fast queries
TransactionSchema.index({ user: 1, date: -1 });
TransactionSchema.index({ user: 1, type: 1 });
TransactionSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
