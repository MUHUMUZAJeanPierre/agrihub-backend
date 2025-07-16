const Order = require('../models/Order');
const Cart = require('../models/Cart');

exports.getOrdersWithoutId = async (req, res) => {
  try {
    const orders = await Order.find().populate('items.product'); // Removed user filtering

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
    // Get the user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    
    // Log the cart to verify its contents
    console.log("Cart after population:", cart);

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

    await order.save();
    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
};
