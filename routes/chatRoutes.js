const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/chats', chatController.createChat);
router.get('/chats', chatController.getConversationBetweenUsers); // ?user1=...&user2=...
router.get('/chats/all', chatController.getAllChats);
router.get('/chats/sender/:senderId', chatController.getChatsBySender);
router.put('/chats/:id', chatController.updateChat);
router.delete('/chats/:id', chatController.deleteChat);

module.exports = router;
