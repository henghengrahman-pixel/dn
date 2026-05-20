const express = require('express');
const router = express.Router();

const Transaction = require('../models/Transaction');
const Device = require('../models/Device');
const Deposit = require('../models/Deposit');
const createFingerprint = require('../helpers/fingerprint');
const apiAuth = require('../helpers/apiAuth');
const { normalizeAmount, normalizeString } = require('../helpers/normalize');
const realtime = require('../socket/realtime');

async function tryAutoApprove(transaction) {
  const now = new Date();
  const deposit = await Deposit.findOne({
    amount: transaction.amount,
    status: 'PENDING',
    expired_at: { $gte: now }
  }).sort({ createdAt: 1 });

  if (!deposit) return { matched: false };

  deposit.status = 'APPROVED';
  deposit.approved_at = now;
  deposit.transaction_id = transaction._id;
  await deposit.save();

  transaction.status = 'MATCHED_DEPOSIT';
  transaction.matched_deposit_id = deposit._id;
  await transaction.save();

  return { matched: true, deposit };
}

router.get('/health', (req, res) => res.json({ success: true, service: 'mutasi-dana', time: new Date().toISOString() }));

router.post('/mutasi/dana', apiAuth, async (req, res) => {
  try {
    const provider = normalizeString(req.body.provider || 'DANA', 'DANA').toUpperCase();
    const amount = normalizeAmount(req.body.amount);
    const sender = normalizeString(req.body.sender, '-');
    const trx_time = normalizeString(req.body.trx_time || new Date().toISOString(), new Date().toISOString());
    const device_id = normalizeString(req.body.device_id, 'DANA-01');
    const source = normalizeString(req.body.source, 'notification');
    const raw_text = normalizeString(req.body.raw_text, '');

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'amount tidak valid' });
    }

    const fingerprint = createFingerprint({ provider, amount, sender, trx_time, device_id });
    const existing = await Transaction.findOne({ fingerprint });
    if (existing) {
      return res.json({ success: false, duplicate: true, transaction: existing });
    }

    const transaction = await Transaction.create({ provider, amount, sender, trx_time, device_id, source, raw_text, fingerprint, status: 'NEW' });

    await Device.findOneAndUpdate(
      { device_id },
      { provider, status: 'ONLINE', last_seen: new Date(), last_ip: req.ip },
      { upsert: true, new: true }
    );

    const autoApprove = await tryAutoApprove(transaction);
    const payload = await Transaction.findById(transaction._id).lean();

    realtime.getIO().emit('new_transaction', payload);
    if (autoApprove.matched) realtime.getIO().emit('deposit_approved', autoApprove.deposit);

    return res.json({ success: true, duplicate: false, transaction: payload, auto_approve: autoApprove.matched });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.json({ success: false, duplicate: true, message: 'Duplicate transaction' });
    }
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/device/ping', apiAuth, async (req, res) => {
  const device_id = normalizeString(req.body.device_id, 'DANA-01');
  const provider = normalizeString(req.body.provider || 'DANA', 'DANA').toUpperCase();
  const device = await Device.findOneAndUpdate(
    { device_id },
    { provider, status: 'ONLINE', last_seen: new Date(), last_ip: req.ip },
    { upsert: true, new: true }
  );
  realtime.getIO().emit('device_update', device);
  res.json({ success: true, device });
});

module.exports = router;
