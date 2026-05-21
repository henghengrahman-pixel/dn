const socket = io();
function esc(v){return String(v ?? '').replace(/[&<>'"]/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[s]));}
function rupiah(v){return 'Rp '+Number(v||0).toLocaleString('id-ID');}
socket.on('connected',()=>{const b=document.getElementById('liveBadge'); if(b) b.textContent='LIVE';});
socket.on('new_transaction',(trx)=>{
 const body=document.getElementById('trxBody'); if(!body) return;
 body.insertAdjacentHTML('afterbegin',`<tr><td>${new Date(trx.createdAt).toLocaleString('id-ID')}</td><td>${esc(trx.provider)}</td><td>${rupiah(trx.amount)}</td><td>${esc(trx.sender)}</td><td>${esc(trx.device_id)}</td><td><span class="badge">${esc(trx.status)}</span></td></tr>`);
 const s=document.getElementById('statTrx'); if(s) s.textContent=Number(s.textContent||0)+1;
});
socket.on('device_update',(d)=>{
 const list=document.getElementById('deviceList'); if(!list) return;
 let card=list.querySelector(`[data-device="${CSS.escape(d.device_id)}"]`);
 const html=`<b>${esc(d.device_id)}</b><span class="online">ONLINE</span><small>Last seen: ${new Date(d.last_seen).toLocaleString('id-ID')}</small>`;
 if(card) card.innerHTML=html; else list.insertAdjacentHTML('afterbegin',`<div class="device-card" data-device="${esc(d.device_id)}">${html}</div>`);
});
socket.on('deposit_approved',(d)=>{location.reload();});
