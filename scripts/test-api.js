const http = require('http');

const body = JSON.stringify({
  provider: 'DANA',
  amount: 100123,
  sender: 'TEST USER',
  trx_time: new Date().toISOString(),
  device_id: 'DANA-01',
  source: 'manual-test',
  raw_text: 'Uang masuk Rp100.123 dari TEST USER'
});

const req = http.request({
  hostname: 'localhost',
  port: process.env.PORT || 8080,
  path: '/api/mutasi/dana',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'x-api-secret': process.env.API_SECRET || ''
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log(data);
  });
});

req.on('error', (err) => console.error('API TEST ERROR:', err.message));
req.write(body);
req.end();
