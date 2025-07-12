const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  receiver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  readStatus: { 
    type: Boolean, 
    default: false 
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  }
},
  {
    timestamps: true
  }
);

chatSchema.index({ sender: 1, receiver: 1, timestamp: 1 });
chatSchema.index({ receiver: 1, sender: 1, timestamp: 1 });

module.exports = mongoose.model('Chat', chatSchema);
