// socket/socket.js
const Message = require('../models/Message');

function initSocket(io) {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('send_message', async (data) => {
      const { sender, receiver, message } = data;

      try {
        const newMessage = new Message({ sender, receiver, message });
        await newMessage.save();

        io.emit(`receive_message_${receiver}`, newMessage);
      } catch (error) {
        console.error('Socket message save error:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
}

module.exports = initSocket;
