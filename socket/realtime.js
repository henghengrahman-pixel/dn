let io;

module.exports = {
  init(server) {
    io = require('socket.io')(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
    io.on('connection', (socket) => {
      socket.emit('connected', { ok: true, time: new Date().toISOString() });
    });
    return io;
  },
  getIO() {
    if (!io) throw new Error('Socket.IO belum aktif');
    return io;
  }
};
