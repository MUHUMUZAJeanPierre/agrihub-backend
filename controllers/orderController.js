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
    res.status(500).json({ error: 'Failed to fetch orders. Please try again later.' });
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
    const buyerId = req.params.id;

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
    const cart = await Cart.findOne({ user: req.user.id }).populate({
      path: 'items.product',
      populate: {
        path: 'farmer',
        select: 'name email phone role' 
      }
    });

    if (!cart) {
      return res.status(400).json({ error: 'Cart not found' });
    }

    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let totalAmount = 0;
    cart.items.forEach(item => {
      const price = extractPrice(item.product.current_price);
      totalAmount += price * item.quantity;
    });

    const order = new Order({
      user: req.user.id,
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
      })),
      totalAmount,
    });

    const savedOrder = await order.save();

    // 🔄 Repopulate order with product & farmer details for response
    const populatedOrder = await Order.findById(savedOrder._id).populate({
      path: 'items.product',
      populate: {
        path: 'farmer',
        select: 'name email phone role' // Choose fields you need
      }
    }).populate('user', 'name email');

    res.status(201).json({ message: 'Order placed successfully', order: populatedOrder });
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
};







exports.getOrdersGroupedByProductForFarmer = async (req, res) => {
  try {
    const farmerId = req.user.id;

    // 1. Fata ibicuruzwa by'uyu mufama
    const products = await Product.find({ farmer: farmerId }).select('_id name');
    const productIds = products.map(p => p._id);

    if (productIds.length === 0) {
      return res.status(404).json({ message: 'Nta bicuruzwa byabonetse by\'uyu mufama' });
    }

    // 2. Fata orders zose zifite ibyo bicuruzwa
    const orders = await Order.find({ 'items.product': { $in: productIds } })
      .populate('items.product')
      .populate('user');

    // 3. Group orders by product
    const grouped = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        const product = item.product;
        if (!product || product.farmer.toString() !== farmerId) return;

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
    res.status(500).json({ error: 'Ntibyakunze kubona orders z’ibicuruzwa' });
  }
};
