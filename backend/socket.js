const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

const initializeSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "https://filfrontendnew.vercel.app",
      methods: ["GET", "POST"],
      credentials: true
    },
    path: '/socket.io'
  });

  // Bildirim namespace'i
  const notificationNamespace = io.of('/notifications');

  // Middleware - Token doğrulama
  notificationNamespace.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  // Bağlantı olayları
  notificationNamespace.on('connection', (socket) => {
    console.log('Kullanıcı bağlandı:', socket.userId);

    // Kullanıcıya özel oda oluştur
    socket.join(socket.userId);

    socket.on('disconnect', () => {
      console.log('Kullanıcı ayrıldı:', socket.userId);
      socket.leave(socket.userId);
    });
  });

  return { io, notificationNamespace };
};

module.exports = initializeSocket; 