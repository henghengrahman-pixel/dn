const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  provider: { type: String, default: 'DANA', index: true },
  amount: { type: Number, required: true, index: true },
  sender: { type: String, default: '-' },
  trx_time: { type: String, required: true },
  device_id: { type: String, required: true, index: true },
  source: { type: String, default: 'notification' },
  raw_text: { type: String, default: '' },
  fingerprint: { type: String, required: true, unique: true, index: true },
  status: { type: String, default: 'NEW', index: true },
  matched_deposit_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Deposit', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
