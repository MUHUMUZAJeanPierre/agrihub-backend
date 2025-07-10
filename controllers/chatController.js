const  Chat  = require('../models/Chat');
const User  = require('../models/User');

// For socket use
const createChatFromSocket = async ({ senderId, socketId, content }) => {
  return await Chat.create({
    senderId,
    socketId,
    content,
    readStatus: false,
  });
};

// Called by REST route (unchanged)
const createChat = async (req, res) => {
  try {
    const { senderId, socketId, content } = req.body;
    const chat = await createChatFromSocket({ senderId, socketId, content });
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};

const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find().sort({ createdAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
};

const getChatsBySender = async (req, res) => {
  try {
    const { senderId } = req.params;
    const chats = await Chat.find({ senderId });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sender chats' });
  }
};

const updateChat = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedChat = await Chat.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedChat);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update chat' });
  }
};

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
  updateChat,
  deleteChat,
};
