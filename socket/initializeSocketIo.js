const { Server } = require('socket.io');
const chatController = require('../controllers/chatController');
const { findUsername, findUserRole } = require('../utils/tokenGenerate.js');
const { User } = require('../models/User'); // ✅ correct if models/index.js exports User

const initializeSocketIo = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // 🔐 Auth middleware: expects userId in handshake
  io.use(async (socket, next) => {
    const userId = socket.handshake.auth?.userId;
    if (!userId) return next(new Error('Missing userId in socket auth'));

    const role = await findUserRole(userId);
    if (!['farmer', 'plant pathologist'].includes(role)) {
      return next(new Error('Unauthorized role'));
    }

    socket.userId = userId;
    socket.role = role;
    socket.join(userId); // Join room for direct messaging
    next();
  });

  // ✅ Handle connection
  io.on('connection', (socket) => {
    console.log(`🟢 User connected: ${socket.userId}`);

    // 📨 Handle message sending
    socket.on('send_message', async (data) => {
      try {
        const { receiver, message } = data;
        const senderId = socket.userId;

        // Save to DB
        const savedMessage = await chatController.createChatFromSocket({
          senderId,
          socketId: socket.id,
          content: message,
        });

        const senderName = await findUsername(senderId);

        // Emit to receiver room only
        io.to(receiver).emit(`receive_message_${receiver}`, {
          ...savedMessage.toObject(),
          name: senderName,
          receiver,
        });
      } catch (err) {
        console.error('❌ Socket message error:', err);
      }
    });

    // ✍️ Typing indicator
    socket.on('typing', ({ toUserId, name }) => {
      io.to(toUserId).emit('typing', { from: socket.userId, name });
    });

    socket.on('disconnect', () => {
      console.log(`🔴 User disconnected: ${socket.userId}`);
    });
  });
};

module.exports = { initializeSocketIo };
