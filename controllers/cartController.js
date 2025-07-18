const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    return res.json(cart || { user: req.user.id, items: [] });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch cart' });
  }
};
exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  let cart = await Cart.findOne({ user: req.user.id });
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  if (!cart) {
    cart = new Cart({ user: req.user.id, items: [] });
  }

  const itemIndex = cart.items.findIndex(item => item.product.equals(productId));
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  res.status(200).json(cart);
};

exports.updateCartItem = async (req, res) => {
  const { productId, quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) return res.status(404).json({ error: 'Cart not found' });

  const item = cart.items.find(item => item.product.equals(productId));
  if (item) {
    item.quantity = quantity;
    await cart.save();
    return res.json(cart);
  }

  res.status(404).json({ error: 'Product not in cart' });
};

exports.removeFromCart = async (req, res) => {
  const { productId } = req.params;
  const cart = await Cart.findOneAndUpdate(
    { user: req.user.id },
    { $pull: { items: { product: productId } } },
    { new: true }
  );

  res.json(cart);
};

exports.clearCart = async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user.id });
  res.status(204).send();
};
