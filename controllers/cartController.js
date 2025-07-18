// const Cart = require('../models/Cart');
// const Product = require('../models/Product');

// exports.getCart = async (req, res) => {
//   try {
//     const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
//     return res.json(cart || { user: req.user.id, items: [] });
//   } catch (err) {
//     return res.status(500).json({ error: 'Failed to fetch cart' });
//   }
// };
// exports.addToCart = async (req, res) => {
//   const { productId, quantity } = req.body;

//   let cart = await Cart.findOne({ user: req.user.id });
//   const product = await Product.findById(productId);
//   if (!product) return res.status(404).json({ error: 'Product not found' });

//   if (!cart) {
//     cart = new Cart({ user: req.user.id, items: [] });
//   }

//   const itemIndex = cart.items.findIndex(item => item.product.equals(productId));
//   if (itemIndex > -1) {
//     cart.items[itemIndex].quantity += quantity;
//   } else {
//     cart.items.push({ product: productId, quantity });
//   }

//   await cart.save();
//   res.status(200).json(cart);
// };

// exports.updateCartItem = async (req, res) => {
//   const { productId, quantity } = req.body;
//   const cart = await Cart.findOne({ user: req.user.id });

//   if (!cart) return res.status(404).json({ error: 'Cart not found' });

//   const item = cart.items.find(item => item.product.equals(productId));
//   if (item) {
//     item.quantity = quantity;
//     await cart.save();
//     return res.json(cart);
//   }

//   res.status(404).json({ error: 'Product not in cart' });
// };

// exports.removeFromCart = async (req, res) => {
//   const { productId } = req.params;
//   const cart = await Cart.findOneAndUpdate(
//     { user: req.user.id },
//     { $pull: { items: { product: productId } } },
//     { new: true }
//   );

//   res.json(cart);
// };

// exports.clearCart = async (req, res) => {
//   await Cart.findOneAndDelete({ user: req.user.id });
//   res.status(204).send();
// };



const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    return res.json(cart || { user: req.user.id, items: [] });
  } catch (err) {
    console.error('Error fetching cart:', err);
    return res.status(500).json({ error: 'Failed to fetch cart' });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Product ID and valid quantity are required' });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

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
    
    // Populate the cart before returning
    const populatedCart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    res.status(200).json(populatedCart);
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined || quantity < 0) {
      return res.status(400).json({ error: 'Product ID and valid quantity are required' });
    }

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const item = cart.items.find(item => item.product.equals(productId));
    if (item) {
      if (quantity === 0) {
        // Remove item if quantity is 0
        cart.items = cart.items.filter(item => !item.product.equals(productId));
      } else {
        item.quantity = quantity;
      }
      await cart.save();
      
      // Populate the cart before returning
      const populatedCart = await Cart.findOne({ user: req.user.id }).populate('items.product');
      return res.json(populatedCart);
    }

    res.status(404).json({ error: 'Product not in cart' });
  } catch (err) {
    console.error('Error updating cart item:', err);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const cart = await Cart.findOneAndUpdate(
      { user: req.user.id },
      { $pull: { items: { product: productId } } },
      { new: true }
    ).populate('items.product');

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    res.json(cart);
  } catch (err) {
    console.error('Error removing from cart:', err);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const deletedCart = await Cart.findOneAndDelete({ user: req.user.id });
    
    if (!deletedCart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Error clearing cart:', err);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
};