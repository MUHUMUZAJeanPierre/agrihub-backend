const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// POST - create new chat message
router.post('/', chatController.createChat);

// GET - all chats
router.get('/', chatController.getAllChats);

// GET - chats by sender ID
router.get('/:senderId', chatController.getChatsBySender);

// PUT - update chat (e.g., mark as read)
router.put('/:id', chatController.updateChat);

// DELETE - remove chat by ID
router.delete('/:id', chatController.deleteChat);

module.exports = router;
