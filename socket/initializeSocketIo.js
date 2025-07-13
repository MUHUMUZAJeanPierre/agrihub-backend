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

const getRoomId = (user1, user2) => {
  const sorted = [user1, user2].sort();
  return `chat_${sorted[0]}_${sorted[1]}`;
};

// Helper function to validate if users can communicate
const canUsersChat = async (user1Id, user2Id) => {
  try {
    const [user1Role, user2Role] = await Promise.all([
      findUserRole(user1Id),
      findUserRole(user2Id)
    ]);
    
    // Define allowed communication pairs
    const allowedCommunication = {
      'farmer': ['plant pathologist'],
      'plant pathologist': ['farmer'],
      // Add more rules as needed
    };
    
    return allowedCommunication[user1Role]?.includes(user2Role) || 
           allowedCommunication[user2Role]?.includes(user1Role);
  } catch (error) {
    console.error('Error checking user communication permissions:', error);
    return false;
  }
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

  // Enhanced middleware with better error handling
  io.use(async (socket, next) => {
    try {
      const userId = socket.handshake.auth?.userId;
      const token = socket.handshake.auth?.token; // Add token validation if needed
      
      if (!userId) {
        return next(new Error('Missing userId in authentication'));
      }

      // Additional token validation if you're using JWT
      // if (token) {
      //   const decoded = jwt.verify(token, process.env.JWT_SECRET);
      //   if (decoded.userId !== userId) {
      //     return next(new Error('Token user mismatch'));
      //   }
      // }

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

    socket.on('join_room', async ({ otherUserId }) => {
      try {
        if (!otherUserId) {
          socket.emit('error', { message: 'Missing otherUserId' });
          return;
        }

        // Validate if these users can communicate
        const canChat = await canUsersChat(socket.userId, otherUserId);
        if (!canChat) {
          socket.emit('error', { message: 'Users cannot communicate with each other' });
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
        
        // Additional security: Validate users can communicate
        const canChat = await canUsersChat(sender, receiver);
        if (!canChat) {
          socket.emit('message_error', { 
            message: 'You cannot send messages to this user' 
          });
          return;
        }

        const roomId = getRoomId(sender, receiver);
        
        // Verify sender is actually in the room
        const senderInRoom = socket.rooms.has(roomId);
        if (!senderInRoom) {
          socket.emit('message_error', { 
            message: 'You must join the room first' 
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

        // Emit to room (only users in this specific room will receive)
        io.to(roomId).emit('room_message', {
          ...savedMessage.toObject(),
          senderName,
        });

        // Emit to receiver's personal room for notifications
        // Only if receiver is online
        const receiverSockets = await io.in(`user_${receiver}`).fetchSockets();
        if (receiverSockets.length > 0) {
          io.to(`user_${receiver}`).emit('new_message_notification', {
            from: sender,
            fromName: senderName,
            message: message.trim(),
            timestamp: savedMessage.timestamp
          });
        }

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
        
        // Only send to the room, not broadcast
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