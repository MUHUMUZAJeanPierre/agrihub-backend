// controllers/orderController.js
const Order = require('../models/Order');
const Cart = require('../models/Cart');

// exports.placeOrder = async (req, res) => {
//   try {
//     const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
//     if (!cart || cart.items.length === 0) {
//       return res.status(400).json({ error: 'Cart is empty' });
//     }

//     const totalAmount = cart.items.reduce((sum, item) => {
//       return sum + item.quantity * item.product.price;
//     }, 0);

//     const order = new Order({
//       user: req.user.id,
//       items: cart.items.map(item => ({
//         product: item.product._id,
//         quantity: item.quantity,
//       })),
//       totalAmount,
//     });

//     await order.save();
//     await Cart.findOneAndDelete({ user: req.user.id });

//     res.status(201).json({ message: 'Order placed', order });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to place order' });
//   }
// };



exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('items.product');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};


// exports.placeOrder = async (req, res) => {
//   try {
//     const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
//     if (!cart || cart.items.length === 0) {
//       return res.status(400).json({ error: 'Cart is empty' });
//     }

//     console.log('Cart items:', cart.items); // Log cart items for debugging

//     const totalAmount = cart.items.reduce((sum, item) => {
//       return sum + item.quantity * item.product.price;
//     }, 0);

//     console.log('Total amount calculated:', totalAmount); // Log calculated total amount

//     const order = new Order({
//       user: req.user.id,
//       items: cart.items.map(item => ({
//         product: item.product._id,
//         quantity: item.quantity,
//       })),
//       totalAmount,
//     });

//     await order.save();
//     await Cart.findOneAndDelete({ user: req.user.id });

//     res.status(201).json({ message: 'Order placed', order });
//   } catch (err) {
//     console.error('Error placing order:', err); // Log full error for debugging
//     res.status(500).json({ error: 'Failed to place order' });
//   }
// };

exports.placeOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate total amount dynamically
    const totalAmount = cart.items.reduce((sum, item) => {
      return sum + item.quantity * item.product.price;
    }, 0);

    // Create order
    const order = new Order({
      user: req.user.id,
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
      })),
      totalAmount,
    });

    await order.save();
    
    // Optionally clear cart after placing the order
    await Cart.findOneAndDelete({ user: req.user.id });

    res.status(201).json({ message: 'Order placed', order });
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
};
