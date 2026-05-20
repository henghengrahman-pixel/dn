const express = require('express');
const router = express.Router();

const requireAdmin = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const Device = require('../models/Device');
const Deposit = require('../models/Deposit');

router.use(requireAdmin);

router.get('/dashboard', async (req, res, next) => {
  try {
    const [transactions, devices, pendingDeposits, todayCount, todayTotal] = await Promise.all([
      Transaction.find().sort({ createdAt: -1 }).limit(100).lean(),
      Device.find().sort({ updatedAt: -1 }).lean(),
      Deposit.find({ status: 'PENDING' }).sort({ createdAt: -1 }).limit(50).lean(),
      Transaction.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
      Transaction.aggregate([
        { $match: { createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    res.render('dashboard', {
      transactions,
      devices,
      pendingDeposits,
      stats: {
        todayCount,
        todayTotal: todayTotal[0]?.total || 0,
        deviceCount: devices.length,
        pendingCount: pendingDeposits.length
      }
    });
  } catch (err) {
    next(err);
  }
});

router.post('/deposit/create', async (req, res, next) => {
  try {
    const username = String(req.body.username || '').trim();
    const amount = Number(String(req.body.amount || '').replace(/[^0-9]/g, ''));
    const minutes = Number(req.body.minutes || 30);

    if (!username || !amount) return res.redirect('/admin/dashboard?error=deposit_invalid');

    await Deposit.create({
      username,
      amount,
      status: 'PENDING',
      expired_at: new Date(Date.now() + minutes * 60 * 1000)
    });

    res.redirect('/admin/dashboard');
  } catch (err) {
    next(err);
  }
});

router.post('/deposit/:id/reject', async (req, res, next) => {
  try {
    await Deposit.findByIdAndUpdate(req.params.id, { status: 'REJECTED' });
    res.redirect('/admin/dashboard');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
