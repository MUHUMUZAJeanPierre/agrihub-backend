const Message = require('../models/Message');

// GET messages between two users
const getMessagesBetweenUsers = async (req, res) => {
  const { user1, user2 } = req.query;

  try {
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// POST a new message
const postMessage = async (req, res) => {
  const { sender, receiver, message } = req.body;

  if (!sender || !receiver || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const newMessage = new Message({ sender, receiver, message });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// PUT (Update) a message
const updateMessage = async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      id,
      { message },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(updatedMessage);
  } catch (err) {
    console.error('Error updating message:', err);
    res.status(500).json({ error: 'Failed to update message' });
  }
};

// DELETE a message
const deleteMessage = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedMessage = await Message.findByIdAndDelete(id);

    if (!deletedMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

module.exports = {
  getMessagesBetweenUsers,
  postMessage,
  updateMessage,
  deleteMessage,
};
