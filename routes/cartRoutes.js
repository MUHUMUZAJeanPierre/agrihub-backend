const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware); // Protect all cart routes

router.get('/', getCart);
router.post('/', addToCart);
router.put('/', updateCartItem);
router.delete('/', removeFromCart);
router.delete('/', clearCart);

module.exports = router;
