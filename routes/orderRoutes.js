const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
router.post('/place-order', authMiddleware, orderController.placeOrder);
router.get('/get-order', authMiddleware, orderController.getOrders);
router.get('/get-order-by-user/:id', authMiddleware, orderController.getOrdersByUserId); 
router.get('/clean-order', authMiddleware, orderController.clearCart);
router.get('/get', authMiddleware, orderController.getOrdersGroupedByProductForFarmer);




module.exports = router;
