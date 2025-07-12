// const Chat = require('../models/Chat');
// const User = require('../models/User');

// // Create chat from socket or internal use
// const createChatFromSocket = async ({ sender, receiver, message }) => {
//   return await Chat.create({
//     sender,
//     receiver,
//     message,
//     readStatus: false,
//   });
// };

// // Create chat from REST request
// const createChat = async (req, res) => {
//   try {
//     const { sender, receiver, message } = req.body;
//     const chat = await createChatFromSocket({ sender, receiver, message });
//     res.status(201).json(chat);
//   } catch (error) {
//     console.error("Error creating chat:", error);
//     res.status(500).json({ error: 'Failed to send message' });
//   }
// };

// // Get all chats (admin/debug)
// const getAllChats = async (req, res) => {
//   try {
//     const chats = await Chat.find().sort({ timestamp: -1 });
//     res.json(chats);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch chats' });
//   }
// };

// // Get chats by sender ID only (optional)
// const getChatsBySender = async (req, res) => {
//   try {
//     const { senderId } = req.params;
//     const chats = await Chat.find({ sender: senderId });
//     res.json(chats);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch sender chats' });
//   }
// };

// // ✅ Get conversation between two users (sender + receiver)
// const getConversationBetweenUsers = async (req, res) => {
//   try {
//     const { user1, user2 } = req.query;

//     if (!user1 || !user2) {
//       return res.status(400).json({ error: 'Missing user1 or user2' });
//     }

//     const chats = await Chat.find({
//       $or: [
//         { sender: user1, receiver: user2 },
//         { sender: user2, receiver: user1 }
//       ]
//     }).sort({ timestamp: 1 });

//     res.status(200).json(chats);
//   } catch (error) {
//     console.error('Error fetching conversation:', error);
//     res.status(500).json({ error: 'Failed to fetch chat conversation' });
//   }
// };

// // Update a chat message (e.g., readStatus)
// const updateChat = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updatedChat = await Chat.findByIdAndUpdate(id, req.body, { new: true });
//     res.json(updatedChat);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to update chat' });
//   }
// };

// // Delete a chat message
// const deleteChat = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await Chat.findByIdAndDelete(id);
//     res.json({ message: 'Chat deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to delete chat' });
//   }
// };

// module.exports = {
//   createChat,
//   createChatFromSocket,
//   getAllChats,
//   getChatsBySender,
//   getConversationBetweenUsers,
//   updateChat,
//   deleteChat,
// };



const Chat = require('../models/Chat');
const User = require('../models/User');
const mongoose = require('mongoose');


const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const validateUsers = async (senderId, receiverId) => {
  if (!validateObjectId(senderId) || !validateObjectId(receiverId)) {
    throw new Error('Invalid user ID format');
  }
  
  const [sender, receiver] = await Promise.all([
    User.findById(senderId),
    User.findById(receiverId)
  ]);
  
  if (!sender) throw new Error('Sender not found');
  if (!receiver) throw new Error('Receiver not found');
  
  return { sender, receiver };
};


const createChatFromSocket = async ({ sender, receiver, message }) => {
  try {
    if (!sender || !receiver || !message?.trim()) {
      throw new Error('Missing required fields: sender, receiver, or message');
    }

    await validateUsers(sender, receiver);

    const chat = await Chat.create({
      sender,
      receiver,
      message: message.trim(),
      readStatus: false,
    });

    await chat.populate([
      { path: 'sender', select: 'username email' },
      { path: 'receiver', select: 'username email' }
    ]);

    return chat;
  } catch (error) {
    console.error('Error in createChatFromSocket:', error);
    throw error;
  }
};


const createChat = async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;
    
    if (!sender || !receiver || !message?.trim()) {
      return res.status(400).json({ 
        error: 'Missing required fields: sender, receiver, or message' 
      });
    }

    const chat = await createChatFromSocket({ sender, receiver, message });
    res.status(201).json({
      success: true,
      data: chat,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error("Error creating chat:", error);
    
    if (error.message.includes('not found') || error.message.includes('Invalid user ID')) {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to send message' });
  }
};


const getAllChats = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const chats = await Chat.find()
      .populate([
        { path: 'sender', select: 'username email' },
        { path: 'receiver', select: 'username email' }
      ])
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Chat.countDocuments();

    res.json({
      success: true,
      data: chats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching all chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
};


const getChatsBySender = async (req, res) => {
  try {
    const { senderId } = req.params;
    
    if (!validateObjectId(senderId)) {
      return res.status(400).json({ error: 'Invalid sender ID format' });
    }

    const chats = await Chat.find({ sender: senderId })
      .populate([
        { path: 'sender', select: 'username email' },
        { path: 'receiver', select: 'username email' }
      ])
      .sort({ timestamp: -1 });

    res.json({
      success: true,
      data: chats
    });
  } catch (error) {
    console.error('Error fetching sender chats:', error);
    res.status(500).json({ error: 'Failed to fetch sender chats' });
  }
};


const getConversationBetweenUsers = async (req, res) => {
  try {
    const { user1, user2 } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    if (!user1 || !user2) {
      return res.status(400).json({ error: 'Missing user1 or user2 parameters' });
    }

    if (!validateObjectId(user1) || !validateObjectId(user2)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const chats = await Chat.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    })
    .populate([
      { path: 'sender', select: 'username email' },
      { path: 'receiver', select: 'username email' }
    ])
    .sort({ timestamp: 1 })
    .skip(skip)
    .limit(limit);

    const total = await Chat.countDocuments({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    });

    res.status(200).json({
      success: true,
      data: chats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch chat conversation' });
  }
};


const markMessagesAsRead = async (req, res) => {
  try {
    const { user1, user2 } = req.body;
    
    if (!validateObjectId(user1) || !validateObjectId(user2)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    await Chat.updateMany(
      { sender: user2, receiver: user1, readStatus: false },
      { readStatus: true }
    );

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
};


const updateChat = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateObjectId(id)) {
      return res.status(400).json({ error: 'Invalid chat ID format' });
    }

    const updatedChat = await Chat.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true, runValidators: true }
    ).populate([
      { path: 'sender', select: 'username email' },
      { path: 'receiver', select: 'username email' }
    ]);

    if (!updatedChat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json({
      success: true,
      data: updatedChat
    });
  } catch (error) {
    console.error('Error updating chat:', error);
    res.status(500).json({ error: 'Failed to update chat' });
  }
};


const deleteChat = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateObjectId(id)) {
      return res.status(400).json({ error: 'Invalid chat ID format' });
    }

    const deletedChat = await Chat.findByIdAndDelete(id);
    
    if (!deletedChat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
};


const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!validateObjectId(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const unreadCount = await Chat.countDocuments({
      receiver: userId,
      readStatus: false
    });

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
};

module.exports = {
  createChat,
  createChatFromSocket,
  getAllChats,
  getChatsBySender,
  getConversationBetweenUsers,
  markMessagesAsRead,
  updateChat,
  deleteChat,
  getUnreadCount,
};

