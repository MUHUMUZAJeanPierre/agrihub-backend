// const express = require('express');
// const router = express.Router();
// const orderController = require('../controllers/orderController');
// const authMiddleware = require('../middleware/authMiddleware');
// router.post('/place-order', authMiddleware, orderController.placeOrder);
// router.get('/get-order', authMiddleware, orderController.getOrders);
// router.get('/get-order-by-user/:id', authMiddleware, orderController.getOrdersByUserId); 
// router.get('/clean-order', authMiddleware, orderController.clearCart);
// router.get('/get-orders-by-product', authMiddleware, orderController.getOrdersGroupedByProductForFarmer);

// // Debug endpoint to see all orders and current user
// router.get('/debug-all-orders', authMiddleware, orderController.getAllOrdersDebug);

// // Admin endpoint to get all orders
// router.get('/admin/all-orders', authMiddleware, orderController.getAllOrdersAdmin);

// router.get('/orders/:orderId', authMiddleware, orderController.getOrderById);

// module.exports = router;

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
router.post('/place-order', authMiddleware, orderController.placeOrder);
router.get('/get-order', authMiddleware, orderController.getOrders);
router.get('/get-order-by-user/:id', authMiddleware, orderController.getOrdersByUserId); 
router.get('/clean-order', authMiddleware, orderController.clearCart);
router.get('/get-orders-by-product', authMiddleware, orderController.getOrdersGroupedByProductForFarmer);

// Debug endpoint to see all orders and current user
router.get('/debug-all-orders', authMiddleware, orderController.getAllOrdersDebug);

// Admin endpoint to get all orders
router.get('/admin/all-orders', authMiddleware, orderController.getAllOrdersAdmin);

router.get('/orders/:orderId', authMiddleware, orderController.getOrderById);

module.exports = router;
