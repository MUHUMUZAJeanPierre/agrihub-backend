// const { Server } = require('socket.io');
// const chatController = require('../controllers/chatController');
// const { findUsername, findUserRole } = require('../utils/tokenGenerate');

// const getRoomId = (user1, user2) => {
//   const sorted = [user1, user2].sort();
//   return `chat_${sorted[0]}_${sorted[1]}`;
// };

// const initializeSocketIo = (server) => {
//   const io = new Server(server, {
//     cors: {
//       origin: '*',
//       methods: ['GET', 'POST'],
//     },
//   });

//   // Middleware to authenticate and assign roles
//   io.use(async (socket, next) => {
//     const userId = socket.handshake.auth?.userId;
//     if (!userId) return next(new Error('Missing userId'));

//     const role = await findUserRole(userId);
//     if (!['farmer', 'plant pathologist'].includes(role)) {
//       return next(new Error('Unauthorized role'));
//     }

//     socket.userId = userId;
//     socket.role = role;
//     next();
//   });

//   io.on('connection', (socket) => {
//     console.log(`🟢 Connected: ${socket.userId}`);

//     socket.on('join_room', ({ otherUserId }) => {
//       const roomId = getRoomId(socket.userId, otherUserId);
//       socket.join(roomId);
//       console.log(`🔗 ${socket.userId} joined room ${roomId}`);
//     });

//     socket.on('send_room_message', async (data) => {
//       try {
//         const { receiver, message } = data;
//         const sender = socket.userId;
//         const roomId = getRoomId(sender, receiver);

//         const savedMessage = await chatController.createChatFromSocket({
//           sender,
//           receiver,
//           message,
//         });

//         const senderName = await findUsername(sender);

//         io.to(roomId).emit('room_message', {
//           ...savedMessage.toObject(),
//           name: senderName,
//         });
//       } catch (err) {
//         console.error('❌ Error sending room message:', err);
//       }
//     });

//     socket.on('typing', ({ otherUserId, name }) => {
//       const roomId = getRoomId(socket.userId, otherUserId);
//       io.to(roomId).emit('typing', { from: socket.userId, name });
//     });

//     socket.on('disconnect', () => {
//       console.log(`🔴 Disconnected: ${socket.userId}`);
//     });
//   });
// };

// module.exports = { initializeSocketIo };



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
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Middleware to authenticate and assign roles
  io.use(async (socket, next) => {
    try {
      const userId = socket.handshake.auth?.userId;
      
      if (!userId) {
        return next(new Error('Missing userId in authentication'));
      }

      const role = await findUserRole(userId);
      
      if (!['farmer', 'plant pathologist'].includes(role)) {
        return next(new Error('Unauthorized role'));
      }

      socket.userId = userId;
      socket.role = role;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🟢 Connected: ${socket.userId} (${socket.role})`);

    // Join user to their personal room for notifications
    socket.join(`user_${socket.userId}`);

    socket.on('join_room', ({ otherUserId }) => {
      try {
        if (!otherUserId) {
          socket.emit('error', { message: 'Missing otherUserId' });
          return;
        }

        const roomId = getRoomId(socket.userId, otherUserId);
        socket.join(roomId);
        console.log(`🔗 ${socket.userId} joined room ${roomId}`);
        
        socket.emit('joined_room', { roomId, otherUserId });
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    socket.on('send_room_message', async (data) => {
      try {
        const { receiver, message } = data;
        
        if (!receiver || !message?.trim()) {
          socket.emit('message_error', { 
            message: 'Missing receiver or message content' 
          });
          return;
        }

        const sender = socket.userId;
        const roomId = getRoomId(sender, receiver);

        // Save message to database
        const savedMessage = await chatController.createChatFromSocket({
          sender,
          receiver,
          message: message.trim(),
        });

        const senderName = await findUsername(sender);

        // Emit to room
        io.to(roomId).emit('room_message', {
          ...savedMessage.toObject(),
          senderName,
        });

        // Emit to receiver's personal room for notifications
        io.to(`user_${receiver}`).emit('new_message_notification', {
          from: sender,
          fromName: senderName,
          message: message.trim(),
          timestamp: savedMessage.timestamp
        });

        // Confirm message sent
        socket.emit('message_sent', {
          messageId: savedMessage._id,
          timestamp: savedMessage.timestamp
        });

      } catch (error) {
        console.error('❌ Error sending room message:', error);
        socket.emit('message_error', { 
          message: 'Failed to send message',
          error: error.message 
        });
      }
    });

    socket.on('typing', ({ otherUserId, isTyping }) => {
      try {
        if (!otherUserId) return;
        
        const roomId = getRoomId(socket.userId, otherUserId);
        socket.to(roomId).emit('user_typing', { 
          userId: socket.userId, 
          isTyping,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error handling typing:', error);
      }
    });

    socket.on('mark_messages_read', async ({ otherUserId }) => {
      try {
        if (!otherUserId) return;

        await chatController.markMessagesAsRead({
          body: { user1: socket.userId, user2: otherUserId }
        }, {
          json: () => {}, 
          status: () => ({ json: () => {} })
        });

        const roomId = getRoomId(socket.userId, otherUserId);
        socket.to(roomId).emit('messages_read', {
          readBy: socket.userId,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔴 Disconnected: ${socket.userId} - Reason: ${reason}`);
    });

    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.userId}:`, error);
    });
  });

  return io;
};

module.exports = { initializeSocketIo };