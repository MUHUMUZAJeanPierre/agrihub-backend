const Chat = require('../models/Chat');
const User = require('../models/User');

// Create chat from socket or internal use
const createChatFromSocket = async ({ sender, receiver, message }) => {
  return await Chat.create({
    sender,
    receiver,
    message,
    readStatus: false,
  });
};

// Create chat from REST request
const createChat = async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;
    const chat = await createChatFromSocket({ sender, receiver, message });
    res.status(201).json(chat);
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Get all chats (admin/debug)
const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find().sort({ timestamp: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
};

// Get chats by sender ID only (optional)
const getChatsBySender = async (req, res) => {
  try {
    const { senderId } = req.params;
    const chats = await Chat.find({ sender: senderId });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sender chats' });
  }
};

// ✅ Get conversation between two users (sender + receiver)
const getConversationBetweenUsers = async (req, res) => {
  try {
    const { user1, user2 } = req.query;

    if (!user1 || !user2) {
      return res.status(400).json({ error: 'Missing user1 or user2' });
    }

    const chats = await Chat.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    }).sort({ timestamp: 1 });

    res.status(200).json(chats);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch chat conversation' });
  }
};

// Update a chat message (e.g., readStatus)
const updateChat = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedChat = await Chat.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedChat);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update chat' });
  }
};

// Delete a chat message
const deleteChat = async (req, res) => {
  try {
    const { id } = req.params;
    await Chat.findByIdAndDelete(id);
    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete chat' });
  }
};

module.exports = {
  createChat,
  createChatFromSocket,
  getAllChats,
  getChatsBySender,
  getConversationBetweenUsers,
  updateChat,
  deleteChat,
};
