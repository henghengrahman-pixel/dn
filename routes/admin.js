const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');
const { readJson, writeJson, DATA_DIR } = require('../helpers/json-db');
const { rupiah } = require('../helpers/format');
const realtime = require('../socket/realtime');

router.use(auth);

router.get('/dashboard', (req, res) => {
  const transactions = readJson('transactions.json').slice().reverse().slice(0, 100);
  const devices = readJson('devices.json').map(d => {
    const diff = d.last_seen ? Date.now() - new Date(d.last_seen).getTime() : Infinity;
    return { ...d, computedStatus: diff <= 90000 ? 'ONLINE' : 'OFFLINE' };
  });
  const deposits = readJson('deposits.json').slice().reverse().slice(0, 100);
  const logs = readJson('logs.json').slice().reverse().slice(0, 50);
  const today = new Date().toISOString().slice(0,10);
  const todayTrx = transactions.filter(t => String(t.createdAt || '').slice(0,10) === today);
  const approved = deposits.filter(d => d.status === 'APPROVED');
  res.render('dashboard', { title: 'Dashboard', transactions, devices, deposits, logs, rupiah, stats: { totalTrx: transactions.length, todayAmount: todayTrx.reduce((s,t)=>s+Number(t.amount||0),0), pending: deposits.filter(d=>d.status==='PENDING').length, approved: approved.length }, DATA_DIR });
});

router.post('/deposits', (req, res) => {
  const deposits = readJson('deposits.json');
  const amount = Number(req.body.amount || 0);
  if (amount > 0) {
    deposits.push({ id: uuidv4(), username: req.body.username || '-', amount, status: 'PENDING', note: req.body.note || '', createdAt: new Date().toISOString() });
    writeJson('deposits.json', deposits);
    realtime.emit('deposit_created', deposits[deposits.length - 1]);
  }
  res.redirect('/admin/dashboard#deposits');
});

router.post('/deposits/:id/cancel', (req, res) => {
  const deposits = readJson('deposits.json');
  const d = deposits.find(x => x.id === req.params.id);
  if (d && d.status === 'PENDING') {
    d.status = 'CANCELLED';
    d.cancelledAt = new Date().toISOString();
    writeJson('deposits.json', deposits);
  }
  res.redirect('/admin/dashboard#deposits');
});

router.post('/clear-logs', (req, res) => {
  writeJson('logs.json', []);
  res.redirect('/admin/dashboard#logs');
});

module.exports = router;
