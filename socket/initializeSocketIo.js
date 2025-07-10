const { Server } = require('socket.io');
const chatController = require('../controllers/chatController');
const { findUsername, findUserRole } = require('../utils/tokenGenerate');

const getRoomId = (user1, user2) => {
  const sorted = [user1, user2].sort();
  return `chat_${sorted[0]}_${sorted[1]}`;
};

const initializeSocketIo = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Middleware to authenticate and assign roles
  io.use(async (socket, next) => {
    const userId = socket.handshake.auth?.userId;
    if (!userId) return next(new Error('Missing userId'));

    const role = await findUserRole(userId);
    if (!['farmer', 'plant pathologist'].includes(role)) {
      return next(new Error('Unauthorized role'));
    }

    socket.userId = userId;
    socket.role = role;
    next();
  });

  io.on('connection', (socket) => {
    console.log(`🟢 Connected: ${socket.userId}`);

    socket.on('join_room', ({ otherUserId }) => {
      const roomId = getRoomId(socket.userId, otherUserId);
      socket.join(roomId);
      console.log(`🔗 ${socket.userId} joined room ${roomId}`);
    });

    socket.on('send_room_message', async (data) => {
      try {
        const { receiver, message } = data;
        const sender = socket.userId;
        const roomId = getRoomId(sender, receiver);

        const savedMessage = await chatController.createChatFromSocket({
          sender,
          receiver,
          message,
        });

        const senderName = await findUsername(sender);

        io.to(roomId).emit('room_message', {
          ...savedMessage.toObject(),
          name: senderName,
        });
      } catch (err) {
        console.error('❌ Error sending room message:', err);
      }
    });

    socket.on('typing', ({ otherUserId, name }) => {
      const roomId = getRoomId(socket.userId, otherUserId);
      io.to(roomId).emit('typing', { from: socket.userId, name });
    });

    socket.on('disconnect', () => {
      console.log(`🔴 Disconnected: ${socket.userId}`);
    });
  });
};

module.exports = { initializeSocketIo };
