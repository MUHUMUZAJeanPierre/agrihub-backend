// const express = require('express');
// const router = express.Router();
// const chatController = require('../controllers/chatController');

// router.post('/chats', chatController.createChat);
// router.get('/chats', chatController.getConversationBetweenUsers); // ?user1=...&user2=...
// router.get('/chats/all', chatController.getAllChats);
// router.get('/chats/sender/:senderId', chatController.getChatsBySender);
// router.put('/chats/:id', chatController.updateChat);
// router.delete('/chats/:id', chatController.deleteChat);

// module.exports = router;


const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/', chatController.createChat);
router.get('/', chatController.getConversationBetweenUsers); 
router.get('/all', chatController.getAllChats);
router.get('/sender/:senderId', chatController.getChatsBySender);
router.get('/unread/:userId', chatController.getUnreadCount);
router.post('/mark-read', chatController.markMessagesAsRead);
router.put('/:id', chatController.updateChat);
router.delete('/:id', chatController.deleteChat);

module.exports = router;