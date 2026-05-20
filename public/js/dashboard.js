const socket = io();
const statusEl = document.getElementById('socketStatus');
const trxBody = document.getElementById('trxBody');
const todayCount = document.getElementById('todayCount');

function rupiah(n) {
  return 'Rp ' + Number(n || 0).toLocaleString('id-ID');
}

socket.on('connect', () => {
  statusEl.textContent = 'Online';
  statusEl.classList.add('online');
});

socket.on('disconnect', () => {
  statusEl.textContent = 'Offline';
  statusEl.classList.remove('online');
});

socket.on('new_transaction', (trx) => {
  const empty = trxBody.querySelector('.empty')?.closest('tr');
  if (empty) empty.remove();

  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${new Date(trx.createdAt || Date.now()).toLocaleString('id-ID')}</td>
    <td>${trx.provider || 'DANA'}</td>
    <td>${rupiah(trx.amount)}</td>
    <td>${trx.sender || '-'}</td>
    <td>${trx.device_id || '-'}</td>
    <td>${trx.source || '-'}</td>
    <td><span class="badge">${trx.status || 'NEW'}</span></td>
  `;
  trxBody.prepend(row);
  if (todayCount) todayCount.textContent = Number(todayCount.textContent || 0) + 1;
});

socket.on('device_update', (device) => {
  let item = document.querySelector(`[data-device="${device.device_id}"]`);
  if (!item) {
    item = document.createElement('div');
    item.className = 'device-item';
    item.dataset.device = device.device_id;
    document.getElementById('deviceList').prepend(item);
  }
  item.innerHTML = `<strong>${device.device_id}</strong><span>${device.status} · ${device.provider}</span>`;
});

socket.on('deposit_approved', () => {
  window.location.reload();
});
