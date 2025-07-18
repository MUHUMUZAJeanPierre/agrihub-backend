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

  try {
    // Find the product by ID
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Find or create a cart for the user
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    // Check if the product is already in the cart
    const itemIndex = cart.items.findIndex(item => item.product.equals(productId));
    if (itemIndex > -1) {
      // Update quantity if the product exists in the cart
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Add new item to the cart
      cart.items.push({ product: productId, quantity });
    }

    // Save the updated cart
    await cart.save();
    return res.status(200).json(cart);
  } catch (err) {
    console.error('Error adding to cart:', err);
    return res.status(500).json({ error: 'Failed to add product to cart' });
  }
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
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user.id },
      { $pull: { items: { product: productId } } },
      { new: true }
    );

    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    res.json(cart);
  } catch (err) {
    console.error('Error removing item from cart:', err);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
};

exports.clearCart = async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user.id });
  res.status(204).send();
};
