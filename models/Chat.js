const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  socketId: String,
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  content: String,
  readStatus: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Chat', chatSchema);
