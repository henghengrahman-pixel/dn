let io;
module.exports = {
  init(server) {
    io = require('socket.io')(server, { cors: { origin: '*' } });
    io.on('connection', socket => {
      socket.emit('connected', { ok: true });
    });
    return io;
  },
  emit(event, payload) {
    if (io) io.emit(event, payload);
  },
  getIO() { return io; }
};
