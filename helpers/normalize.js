function normalizeAmount(value) {
  if (typeof value === 'number') return value;
  const numeric = String(value || '').replace(/[^0-9]/g, '');
  return Number(numeric || 0);
}

function normalizeString(value, fallback = '-') {
  const text = String(value || '').trim();
  return text || fallback;
}

module.exports = { normalizeAmount, normalizeString };
