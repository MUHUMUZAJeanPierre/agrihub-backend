// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/place-order', authMiddleware, orderController.placeOrder);
router.get('/orders', authMiddleware, orderController.getOrders);

module.exports = router;
    