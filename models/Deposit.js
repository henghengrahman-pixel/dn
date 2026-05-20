const mongoose = require('mongoose');

const DepositSchema = new mongoose.Schema({
  username: { type: String, required: true, index: true },
  amount: { type: Number, required: true, index: true },
  status: { type: String, default: 'PENDING', index: true },
  expired_at: { type: Date, required: true, index: true },
  approved_at: { type: Date, default: null },
  transaction_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Deposit', DepositSchema);
