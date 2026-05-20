const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
  device_id: { type: String, required: true, unique: true, index: true },
  provider: { type: String, default: 'DANA' },
  label: { type: String, default: '' },
  status: { type: String, default: 'ONLINE', index: true },
  last_seen: { type: Date, default: Date.now },
  last_ip: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Device', DeviceSchema);
