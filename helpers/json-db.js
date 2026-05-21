const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const defaultFiles = {
  'transactions.json': [],
  'devices.json': [],
  'deposits.json': [],
  'logs.json': []
};

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function filePath(file) {
  ensureDir();
  return path.join(DATA_DIR, file);
}

function ensureFile(file) {
  const p = filePath(file);
  if (!fs.existsSync(p)) {
    const initial = Object.prototype.hasOwnProperty.call(defaultFiles, file) ? defaultFiles[file] : [];
    fs.writeFileSync(p, JSON.stringify(initial, null, 2), 'utf8');
  }
  return p;
}

function readJson(file) {
  const p = ensureFile(file);
  try {
    const raw = fs.readFileSync(p, 'utf8').trim();
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    const backup = `${p}.broken-${Date.now()}`;
    try { fs.copyFileSync(p, backup); } catch (_) {}
    fs.writeFileSync(p, '[]', 'utf8');
    return [];
  }
}

function writeJson(file, data) {
  const p = ensureFile(file);
  const tmp = `${p}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, p);
}

function initDataFiles() {
  ensureDir();
  Object.keys(defaultFiles).forEach(ensureFile);
}

function pushLog(type, message, meta = {}) {
  const logs = readJson('logs.json');
  logs.push({ id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, type, message, meta, createdAt: new Date().toISOString() });
  writeJson('logs.json', logs.slice(-300));
}

module.exports = { DATA_DIR, initDataFiles, readJson, writeJson, pushLog };
