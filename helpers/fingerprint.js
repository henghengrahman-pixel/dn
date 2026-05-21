const crypto = require('crypto');
function norm(v) { return String(v || '').trim().toUpperCase(); }
module.exports = function createFingerprint({ provider, amount, sender, trx_time, device_id, ref_id }) {
  const base = [norm(provider), Number(amount || 0), norm(sender), norm(trx_time), norm(device_id), norm(ref_id)].join('|');
  return crypto.createHash('sha256').update(base).digest('hex');
};
