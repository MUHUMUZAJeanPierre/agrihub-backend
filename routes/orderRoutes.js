// // const express = require('express');
// // const router = express.Router();
// // const orderController = require('../controllers/orderController');
// // const authMiddleware = require('../middleware/authMiddleware');
// // router.post('/place-order', authMiddleware, orderController.placeOrder);
// // router.get('/get-order', authMiddleware, orderController.getOrders);
// // router.get('/get-order-by-user/:id', authMiddleware, orderController.getOrdersByUserId); 
// // router.get('/clean-order', authMiddleware, orderController.clearCart);
// // router.get('/get-orders-by-product', authMiddleware, orderController.getOrdersGroupedByProductForFarmer);

// // // Debug endpoint to see all orders and current user
// // router.get('/debug-all-orders', authMiddleware, orderController.getAllOrdersDebug);

// // // Admin endpoint to get all orders
// // router.get('/admin/all-orders', authMiddleware, orderController.getAllOrdersAdmin);

// // router.get('/orders/:orderId', authMiddleware, orderController.getOrderById);

// // module.exports = router;

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

// router.get('/admin/all-orders', authMiddleware, orderController.getAllOrdersAdmin);

// router.get('/orders/:orderId', authMiddleware, orderController.getOrderById);

// module.exports = router;

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController'); 
const auth = require('../middleware/auth'); // Authentication middleware

// ========== PUBLIC ROUTES (No authentication required) ==========

// Debug route to see all orders with user details (REMOVE in production)
router.get('/debug/all', auth, orderController.getAllOrdersDebug);
router.post('/place-order', auth, orderController.placeOrder);
router.get('/', auth, orderController.getOrders);
router.get('/:orderId', auth, orderController.getOrderById);
router.get('/user/:id', auth, orderController.getOrdersByUserId);
router.delete('/cart/clear', auth, orderController.clearCart);
router.put('/:orderId/status', auth, orderController.updateOrderStatus);
router.put('/:orderId/cancel', auth, orderController.cancelOrder);

router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong, please try again later.' });
});

module.exports = router;
