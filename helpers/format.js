function rupiah(value) {
  return 'Rp ' + Number(value || 0).toLocaleString('id-ID');
}
function nowIso() { return new Date().toISOString(); }
module.exports = { rupiah, nowIso };
