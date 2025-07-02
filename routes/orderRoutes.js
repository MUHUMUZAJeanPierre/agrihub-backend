const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/place-order', authMiddleware, orderController.placeOrder);
router.get('/get-order', authMiddleware, orderController.getOrders);
router.get('/get-order-without-id', orderController.getOrdersWithoutId);
router.get('/clean-order', authMiddleware, orderController.clearCart);

module.exports = router;
