const crypto = require('crypto');

function clean(value) {
  return String(value || '').trim().toUpperCase().replace(/\s+/g, ' ');
}

module.exports = function createFingerprint(data) {
  const text = [
    clean(data.provider || 'DANA'),
    Number(data.amount || 0),
    clean(data.sender || '-'),
    clean(data.trx_time),
    clean(data.device_id)
  ].join('|');

  return crypto.createHash('sha256').update(text).digest('hex');
};
