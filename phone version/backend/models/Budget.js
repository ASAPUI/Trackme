const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  monthly: { type: Number, default: 5000 },
  categoryLimits: {
    food: { type: Number, default: 0 },
    transport: { type: Number, default: 0 },
    shopping: { type: Number, default: 0 },
    health: { type: Number, default: 0 },
    housing: { type: Number, default: 0 },
    entertainment: { type: Number, default: 0 },
    education: { type: Number, default: 0 },
  },
  alertAt: { type: Number, default: 80 }, // alert at 80%
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Budget', budgetSchema);
