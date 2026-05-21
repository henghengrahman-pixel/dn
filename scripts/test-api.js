const http = require('http');
const payload = JSON.stringify({ provider:'DANA', amount:100123, sender:'TESTER', trx_time:new Date().toISOString(), device_id:'DANA-01', source:'test' });
const req = http.request({ hostname:'localhost', port:process.env.PORT||8080, path:'/api/mutasi/dana', method:'POST', headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(payload),'x-api-key':process.env.API_KEY||''}}, res=>{let data='';res.on('data',c=>data+=c);res.on('end',()=>console.log(data));});
req.on('error',console.error);req.write(payload);req.end();
