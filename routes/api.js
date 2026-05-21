const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { readJson, writeJson, pushLog } = require('../helpers/json-db');
const createFingerprint = require('../helpers/fingerprint');
const realtime = require('../socket/realtime');
const apiKey = require('../middleware/api-key');
const { autoApproveByTransaction } = require('../helpers/deposit');

router.get('/health', (req, res) => res.json({ success: true, time: new Date().toISOString() }));

router.post('/device/ping', apiKey, (req, res) => {
  const { device_id, provider = 'DANA', app_version = '-' } = req.body;
  if (!device_id) return res.status(400).json({ success: false, message: 'device_id wajib' });
  const devices = readJson('devices.json');
  let device = devices.find(d => d.device_id === device_id);
  if (!device) {
    device = { id: uuidv4(), device_id, provider, app_version, status: 'ONLINE', createdAt: new Date().toISOString() };
    devices.push(device);
  }
  device.status = 'ONLINE';
  device.provider = provider;
  device.app_version = app_version;
  device.last_seen = new Date().toISOString();
  writeJson('devices.json', devices);
  realtime.emit('device_update', device);
  res.json({ success: true, device });
});

router.post('/mutasi/dana', apiKey, (req, res) => {
  const provider = String(req.body.provider || 'DANA').toUpperCase();
  const amount = Number(req.body.amount || 0);
  const sender = String(req.body.sender || 'UNKNOWN').trim();
  const trx_time = String(req.body.trx_time || new Date().toISOString()).trim();
  const device_id = String(req.body.device_id || '').trim();
  const source = String(req.body.source || 'notification').trim();
  const ref_id = String(req.body.ref_id || '').trim();

  if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'amount tidak valid' });
  if (!device_id) return res.status(400).json({ success: false, message: 'device_id wajib' });

  const fingerprint = createFingerprint({ provider, amount, sender, trx_time, device_id, ref_id });
  const transactions = readJson('transactions.json');
  const existing = transactions.find(t => t.fingerprint === fingerprint);
  if (existing) return res.json({ success: false, duplicate: true, transaction: existing });

  const trx = {
    id: uuidv4(), provider, amount, sender, trx_time, device_id, source, ref_id,
    fingerprint, status: 'NEW', createdAt: new Date().toISOString()
  };

  const approvedDeposit = autoApproveByTransaction(trx);
  if (approvedDeposit) {
    trx.status = 'MATCHED_DEPOSIT';
    trx.depositId = approvedDeposit.id;
  }

  transactions.push(trx);
  writeJson('transactions.json', transactions.slice(-5000));

  const devices = readJson('devices.json');
  let device = devices.find(d => d.device_id === device_id);
  if (!device) {
    device = { id: uuidv4(), device_id, provider, status: 'ONLINE', createdAt: new Date().toISOString() };
    devices.push(device);
  }
  device.status = 'ONLINE';
  device.last_seen = new Date().toISOString();
  device.last_amount = amount;
  writeJson('devices.json', devices);

  pushLog('MUTASI', `Dana masuk ${amount} dari ${sender}`, { device_id, fingerprint });
  realtime.emit('new_transaction', trx);
  realtime.emit('device_update', device);
  if (approvedDeposit) realtime.emit('deposit_approved', approvedDeposit);

  res.json({ success: true, transaction: trx, approvedDeposit });
});

module.exports = router;
