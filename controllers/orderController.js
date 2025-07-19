const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const mongoose = require('mongoose');

const extractPrice = (price) => {
  const numericPrice = parseFloat(price.replace(/[^\d.]/g, ''));
  return isNaN(numericPrice) ? 0 : numericPrice;  
};
exports.getAllOrdersDebug = async (req, res) => {
  try {
    const orders = await Order.find().populate('items.product');
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found' });
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
    res.status(500).json({ error: 'Failed to fetch orders. Please try again later.' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('items.product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ error: 'Failed to fetch the order. Please try again later.' });
  }
};
exports.getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const orders = await Order.find({ user: userId }).populate('items.product');
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this user' });
    }

    res.json(orders); 
  } catch (err) {
    console.error('Error fetching orders by user ID:', err);
    res.status(500).json({ error: 'Failed to fetch orders. Please try again later.' });
  }
};

exports.placeOrder = async (req, res) => {
  console.log("Authenticated User:", req.user);
  console.log("Request Body:", req.body);

  try {
    let orderData = null;
    let totalAmount = 0;
    if (req.body.items && req.body.totalAmount) {
      orderData = {
        user: req.user.id,
        items: req.body.items,
        totalAmount: req.body.totalAmount,
      };
      totalAmount = req.body.totalAmount;
      console.log("Using direct order data from frontend");
    } else {
      const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
      console.log("Cart after population:", cart);

      if (!cart) {
        return res.status(400).json({ error: 'Cart not found' });
      }

      if (!cart.items || cart.items.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
      }

      cart.items.forEach(item => {
        const price = extractPrice(item.product.current_price);
        totalAmount += price * item.quantity;
      });

      orderData = {
        user: req.user.id,
        items: cart.items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        totalAmount,
      };
      console.log("Using cart-based order data");
    }

    if (!orderData.items || orderData.items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    if (!orderData.totalAmount || orderData.totalAmount <= 0) {
      return res.status(400).json({ error: 'Invalid total amount' });
    }

    const order = new Order(orderData);
    await order.save();

    console.log("Order saved successfully:", order);

    res.status(201).json({ 
      message: 'Order placed successfully', 
      order: order,
      totalAmount: totalAmount
    });
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user.id });
    res.status(204).send();
  } catch (err) {
    console.error('Error clearing cart:', err);
    res.status(500).json({ error: 'Failed to clear the cart' });
  }
};


exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const validStatuses = ['Pending', 'Processed', 'Shipped', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order status updated', order });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};


exports.cancelOrder = async (req, res) => {
  try {
    let { orderId } = req.params;
    orderId = orderId.replace(/^:/, '');

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order ID format" });
    }
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === 'shipped' || order.status === 'delivered') {
      return res.status(400).json({ message: "Cannot cancel order after it has been shipped or delivered" });
    }

    order.status = 'canceled';
    await order.save();

    return res.status(200).json({ message: "Order canceled successfully", order });
  } catch (err) {
    console.error('Error cancelling order:', err);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
};