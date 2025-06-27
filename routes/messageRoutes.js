const express = require('express');
const router = express.Router();
const {
  getMessagesBetweenUsers,
  postMessage,
  updateMessage,
  deleteMessage,
} = require('../controllers/messageController');

// Routes
router.get('/messages', getMessagesBetweenUsers);           // GET
router.post('/messages', postMessage);                      // POST
router.put('/messages/:id', updateMessage);                 // PUT
router.delete('/messages/:id', deleteMessage);              // DELETE

module.exports = router;
