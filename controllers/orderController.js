const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const mongoose = require('mongoose');

exports.getOrdersWithoutId = async (req, res) => {
  try {
    const orders = await Order.find().populate('items.product'); 
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found' }); // Adjusted message since no user filter is applied
    }

    res.json(orders); 
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders. Please try again later.' });
  }
};
 

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('items.product');

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this user' });
    }

    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};




exports.clearCart = async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user.id });
  res.status(204).send();
};


const extractPrice = (price) => {
  const numericPrice = parseFloat(price.replace(/[^\d.]/g, ''));
  return isNaN(numericPrice) ? 0 : numericPrice;  
};




exports.getOrdersByUserId = async (req, res) => {
  try {
    const buyerId = req.query.userId;  
    if (!buyerId) {
      return res.status(400).json({ error: 'Buyer ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(buyerId)) {
      return res.status(400).json({ error: 'Invalid Buyer ID format' });
    }

    const orders = await Order.find({ user: buyerId }).populate('items.product');

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this buyer' });
    }

    res.status(200).json(orders); 
  } catch (err) {
    console.error('Error fetching orders by buyer ID:', err);
    res.status(500).json({ error: 'Failed to fetch orders. Please try again later.' });
  }
};



exports.placeOrder = async (req, res) => {
  console.log("Authenticated User:", req.user);

  try {
    // Retrieve the user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate({
      path: 'items.product',
      populate: {
        path: 'farmer',
        select: 'name email phone role' 
      }
    });

    if (!cart || !cart.items.length) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate total amount
    let totalAmount = 0;
    cart.items.forEach(item => {
      const price = parseFloat(item.product.current_price.replace(/[^\d.]/g, ''));
      totalAmount += price * item.quantity;
    });

    // Create an order from the cart
    const order = new Order({
      user: req.user.id,
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
      })),
      totalAmount,
    });

    // Save the order
    const savedOrder = await order.save();

    // Repopulate order with product & farmer details
    const populatedOrder = await Order.findById(savedOrder._id).populate({
      path: 'items.product',
      populate: {
        path: 'farmer',
        select: 'name email phone role'
      }
    }).populate('user', 'name email');

    // Clear the cart after placing the order
    await Cart.findOneAndDelete({ user: req.user.id });

    // Return the populated order
    res.status(201).json({ message: 'Order placed successfully', order: populatedOrder });
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
};


exports.getOrdersGroupedByProductForFarmer = async (req, res) => {
  try {
    const farmerId = req.user.id;

    // Fetch products by farmer
    const products = await Product.find({ farmer: farmerId }).select('_id name');
    const productIds = products.map(p => p._id);

    if (productIds.length === 0) {
      return res.status(404).json({ message: 'No products found for this farmer' });
    }

    // Fetch orders for products that belong to this farmer
    const orders = await Order.find({ 'items.product': { $in: productIds } })
      .populate('items.product')
      .populate('user');

    // Group orders by product
    const grouped = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        const product = item.product;
        if (product.farmer.toString() !== farmerId) return;

        const productId = product._id.toString();
        if (!grouped[productId]) {
          grouped[productId] = {
            product: product.name,
            orders: []
          };
        }

        grouped[productId].orders.push({
          buyer: {
            name: order.user.name,
            email: order.user.email
          },
          quantity: item.quantity,
          orderId: order._id,
          date: order.createdAt
        });
      });
    });

    res.json(Object.values(grouped));
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to fetch orders grouped by product' });
  }
};
