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
//       origin: process.env.FRONTEND_URL || '*',
//       methods: ['GET', 'POST'],
//       credentials: true
//     },
//     pingTimeout: 60000,
//     pingInterval: 25000
//   });

//   // Middleware to authenticate and assign roles
//   io.use(async (socket, next) => {
//     try {
//       const userId = socket.handshake.auth?.userId;
      
//       if (!userId) {
//         return next(new Error('Missing userId in authentication'));
//       }

//       const role = await findUserRole(userId);
      
//       if (!['farmer', 'plant pathologist'].includes(role)) {
//         return next(new Error('Unauthorized role'));
//       }

//       socket.userId = userId;
//       socket.role = role;
//       next();
//     } catch (error) {
//       console.error('Socket authentication error:', error);
//       next(new Error('Authentication failed'));
//     }
//   });

//   io.on('connection', (socket) => {
//     console.log(`🟢 Connected: ${socket.userId} (${socket.role})`);

//     // Join user to their personal room for notifications
//     socket.join(`user_${socket.userId}`);

//     socket.on('join_room', ({ otherUserId }) => {
//       try {
//         if (!otherUserId) {
//           socket.emit('error', { message: 'Missing otherUserId' });
//           return;
//         }

//         const roomId = getRoomId(socket.userId, otherUserId);
//         socket.join(roomId);
//         console.log(`🔗 ${socket.userId} joined room ${roomId}`);
        
//         socket.emit('joined_room', { roomId, otherUserId });
//       } catch (error) {
//         console.error('Error joining room:', error);
//         socket.emit('error', { message: 'Failed to join room' });
//       }
//     });

//     socket.on('send_room_message', async (data) => {
//       try {
//         const { receiver, message } = data;
        
//         if (!receiver || !message?.trim()) {
//           socket.emit('message_error', { 
//             message: 'Missing receiver or message content' 
//           });
//           return;
//         }

//         const sender = socket.userId;
//         const roomId = getRoomId(sender, receiver);

//         // Save message to database
//         const savedMessage = await chatController.createChatFromSocket({
//           sender,
//           receiver,
//           message: message.trim(),
//         });

//         const senderName = await findUsername(sender);

//         // Emit to room
//         io.to(roomId).emit('room_message', {
//           ...savedMessage.toObject(),
//           senderName,
//         });

//         // Emit to receiver's personal room for notifications
//         io.to(`user_${receiver}`).emit('new_message_notification', {
//           from: sender,
//           fromName: senderName,
//           message: message.trim(),
//           timestamp: savedMessage.timestamp
//         });

//         // Confirm message sent
//         socket.emit('message_sent', {
//           messageId: savedMessage._id,
//           timestamp: savedMessage.timestamp
//         });

//       } catch (error) {
//         console.error('❌ Error sending room message:', error);
//         socket.emit('message_error', { 
//           message: 'Failed to send message',
//           error: error.message 
//         });
//       }
//     });

//     socket.on('typing', ({ otherUserId, isTyping }) => {
//       try {
//         if (!otherUserId) return;
        
//         const roomId = getRoomId(socket.userId, otherUserId);
//         socket.to(roomId).emit('user_typing', { 
//           userId: socket.userId, 
//           isTyping,
//           timestamp: new Date()
//         });
//       } catch (error) {
//         console.error('Error handling typing:', error);
//       }
//     });

//     socket.on('mark_messages_read', async ({ otherUserId }) => {
//       try {
//         if (!otherUserId) return;

//         await chatController.markMessagesAsRead({
//           body: { user1: socket.userId, user2: otherUserId }
//         }, {
//           json: () => {}, 
//           status: () => ({ json: () => {} })
//         });

//         const roomId = getRoomId(socket.userId, otherUserId);
//         socket.to(roomId).emit('messages_read', {
//           readBy: socket.userId,
//           timestamp: new Date()
//         });
//       } catch (error) {
//         console.error('Error marking messages as read:', error);
//       }
//     });

//     socket.on('disconnect', (reason) => {
//       console.log(`🔴 Disconnected: ${socket.userId} - Reason: ${reason}`);
//     });

//     socket.on('error', (error) => {
//       console.error(`Socket error for ${socket.userId}:`, error);
//     });
//   });

//   return io;
// };

// module.exports = { initializeSocketIo };


const { Server } = require('socket.io');
const chatController = require('../controllers/chatController');
const { findUsername, findUserRole } = require('../utils/tokenGenerate');

// FIXED: Enhanced room ID generation for specific conversation pairs
const getRoomId = (user1, user2, user1Role, user2Role) => {
  if (user1Role === 'farmer' && user2Role === 'plant pathologist') {
    return `farmer_pathologist_${user1}_${user2}`;
  }
  if (user1Role === 'plant pathologist' && user2Role === 'farmer') {
    return `pathologist_farmer_${user1}_${user2}`;
  }
  
  // For other role combinations, create unique room IDs
  const sortedIds = [user1, user2].sort();
  return `chat_${user1Role}_${user2Role}_${sortedIds[0]}_${sortedIds[1]}`;
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

    // FIXED: Enhanced room joining with specific recipient targeting
    socket.on('join_room', ({ roomId, userId, token }) => {
      try {
        if (!roomId) {
          socket.emit('error', { message: 'Missing roomId' });
          return;
        }

        socket.join(roomId);
        console.log(`🔗 ${socket.userId} joined room ${roomId}`);
        
        socket.emit('joined_room', { roomId });
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // FIXED: Enhanced room message handling with strict targeting
    socket.on('send_room_message', async (data) => {
      try {
        const { receiver, message, targetRecipient, roomId, senderValidation, receiverValidation } = data;
        
        if (!receiver || !message?.trim()) {
          socket.emit('message_error', { 
            message: 'Missing receiver or message content' 
          });
          return;
        }

        const sender = socket.userId;
        
        // FIXED: Validate that the sender is actually sending to the intended recipient
        if (receiver !== targetRecipient) {
          console.error('Recipient mismatch:', { receiver, targetRecipient });
          socket.emit('message_error', { 
            message: 'Recipient validation failed' 
          });
          return;
        }

        // Save message to database
        const savedMessage = await chatController.createChatFromSocket({
          sender,
          receiver,
          message: message.trim(),
        });

        const senderName = await findUsername(sender);

        // FIXED: Send message only to the specific recipient, not broadcast to room
        const messageData = {
          ...savedMessage.toObject(),
          senderName,
          targetRecipient,
          senderValidation,
          receiverValidation,
        };

        // Send to the specific recipient's personal room
        io.to(`user_${receiver}`).emit('room_message', messageData);
        
        // Also send to the sender for confirmation
        socket.emit('room_message', messageData);

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

    // FIXED: Add private message handler for strict targeting
    socket.on('send_private_message', async (data) => {
      try {
        const { receiver, message, targetRecipient, senderValidation, receiverValidation } = data;
        
        if (!receiver || !message?.trim() || !targetRecipient) {
          socket.emit('message_error', { 
            message: 'Missing receiver, message content, or target recipient' 
          });
          return;
        }

        const sender = socket.userId;
        
        // FIXED: Strict validation for private messages
        if (receiver !== targetRecipient) {
          console.error('Private message recipient mismatch:', { receiver, targetRecipient });
          socket.emit('message_error', { 
            message: 'Private message recipient validation failed' 
          });
          return;
        }

        // Save message to database
        const savedMessage = await chatController.createChatFromSocket({
          sender,
          receiver,
          message: message.trim(),
        });

        const senderName = await findUsername(sender);

        const messageData = {
          ...savedMessage.toObject(),
          senderName,
          targetRecipient,
          senderValidation,
          receiverValidation,
        };

        // FIXED: Send private message only to the target recipient
        io.to(`user_${targetRecipient}`).emit('private_message', messageData);
        
        // Send confirmation to sender
        socket.emit('private_message', messageData);

        // Emit to receiver's personal room for notifications
        io.to(`user_${targetRecipient}`).emit('new_message_notification', {
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
        console.error('❌ Error sending private message:', error);
        socket.emit('message_error', { 
          message: 'Failed to send private message',
          error: error.message 
        });
      }
    });

    socket.on('typing', ({ otherUserId, isTyping }) => {
      try {
        if (!otherUserId) return;
        
        const roomId = getRoomId(socket.userId, otherUserId, socket.role, 'farmer');
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

        const roomId = getRoomId(socket.userId, otherUserId, socket.role, 'farmer');
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