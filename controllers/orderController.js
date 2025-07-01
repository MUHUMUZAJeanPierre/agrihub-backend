// controllers/orderController.js
const Order = require('../models/Order');
const Cart = require('../models/Cart');


exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('items.product');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

const extractPrice = (price) => {
  const numericPrice = parseFloat(price.replace(/[^\d.]/g, ''));
  return isNaN(numericPrice) ? 0 : numericPrice;  
};


// exports.placeOrder = async (req, res) => {
//   console.log("Authenticated User:", req.user);  
  
//   try {
//     const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
//     if (!cart || cart.items.length === 0) {
//       return res.status(400).json({ error: 'Cart is empty' });
//     }

//     let totalAmount = 0;
//     cart.items.forEach(item => {
//       const price = extractPrice(item.product.current_price);
//       totalAmount += price * item.quantity;
//     });

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

//     res.status(201).json({ message: 'Order placed successfully', order });
//   } catch (err) {
//     console.error('Error placing order:', err);
//     res.status(500).json({ error: 'Failed to place order' });
//   }
// };

exports.placeOrder = async (req, res) => {
  console.log("Authenticated User:", req.user);

  try {
    // Get the user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let totalAmount = 0;
    cart.items.forEach(item => {
      const price = extractPrice(item.product.current_price);
      totalAmount += price * item.quantity;
    });

    // Create a new order from the cart
    const order = new Order({
      user: req.user.id,
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
      })),
      totalAmount,
    });

    // Save the order to the database
    await order.save();

    // Do not clear the cart. Keep the items in the cart for future use.
    // await Cart.findOneAndDelete({ user: req.user.id }); // Remove this line if you don't want to clear the cart

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
};


exports.clearCart = async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user.id });
  res.status(204).send();
};

