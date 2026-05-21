const { readJson, writeJson, pushLog } = require('./json-db');

function autoApproveByTransaction(trx) {
  const deposits = readJson('deposits.json');
  const amount = Number(trx.amount || 0);
  const now = Date.now();
  const expiredMs = 1000 * 60 * 60 * 3;

  const match = deposits.find(d =>
    d.status === 'PENDING' &&
    Number(d.amount) === amount &&
    !d.transactionFingerprint &&
    now - new Date(d.createdAt).getTime() <= expiredMs
  );

  if (!match) return null;

  match.status = 'APPROVED';
  match.approvedAt = new Date().toISOString();
  match.transactionFingerprint = trx.fingerprint;
  match.device_id = trx.device_id;
  match.sender = trx.sender;

  writeJson('deposits.json', deposits);
  pushLog('AUTO_APPROVE', `Deposit ${match.username || '-'} approved`, { depositId: match.id, amount });
  return match;
}

module.exports = { autoApproveByTransaction };
