const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController'); 
const auth = require('../middleware/auth'); 


router.get('/', auth, orderController.getOrders);
router.post('/place-order', auth, orderController.placeOrder);
router.delete('/cancel-order/:orderId', auth, orderController.cancelOrder);
router.get('/farmer-orders', auth, orderController.getOrdersForFarmer);
router.put('/:orderId/status', auth, orderController.updateOrderStatus);


router.get('/debug/all', auth, orderController.getAllOrdersDebug);
router.get('/:orderId', auth, orderController.getOrderById);
router.get('/user/:id', auth, orderController.getOrdersByUserId);
router.delete('/cart/clear', auth, orderController.clearCart);
router.put('/:orderId/status', auth, orderController.updateOrderStatus);

router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong, please try again later.' });
});

module.exports = router;
