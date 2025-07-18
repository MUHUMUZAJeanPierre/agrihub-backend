const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

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
 

// exports.getOrders = async (req, res) => {
//   try {
//     const orders = await Order.find({ user: req.user.id }).populate('items.product');

//     if (!orders || orders.length === 0) {
//       return res.status(404).json({ message: 'No orders found for this user' });
//     }

//     res.json(orders); 
//   } catch (err) {
//     console.error('Error fetching orders:', err);
//     res.status(500).json({ error: 'Failed to fetch orders. Please try again later.' });
//   }
// };



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




// exports.placeOrder = async (req, res) => {
//   console.log("Authenticated User:", req.user);

//   try {
//     const cart = await Cart.findOne({ user: req.user.id }).populate({
//       path: 'items.product',
//       populate: {
//         path: 'farmer',
//         select: 'name email phone role' 
//       }
//     });

//     if (!cart) {
//       return res.status(400).json({ error: 'Cart not found' });
//     }

//     if (!cart.items || cart.items.length === 0) {
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

//     const savedOrder = await order.save();

//     // 🔄 Repopulate order with product & farmer details for response
//     const populatedOrder = await Order.findById(savedOrder._id).populate({
//       path: 'items.product',
//       populate: {
//         path: 'farmer',
//         select: 'name email phone role' // Choose fields you need
//       }
//     }).populate('user', 'name email');

//     res.status(201).json({ message: 'Order placed successfully', order: populatedOrder });
//   } catch (err) {
//     console.error('Error placing order:', err);
//     res.status(500).json({ error: 'Failed to place order' });
//   }
// };


exports.placeOrder = async (req, res) => {
  console.log("Authenticated User:", req.user);
  console.log("Request body:", req.body);

  try {
    const { items: directItems, totalAmount: directTotal } = req.body;

    // Check if direct order data is provided (new flow)
    if (directItems && directItems.length > 0) {
      console.log("Processing direct order...");
      
      // Validate products exist
      const productIds = directItems.map(item => item.product);
      const products = await Product.find({ _id: { $in: productIds } }).populate('farmer', 'name email phone role');
      
      if (products.length !== directItems.length) {
        return res.status(400).json({ error: 'Some products not found' });
      }

      // Calculate total amount (server-side validation for security)
      let calculatedTotal = 0;
      const orderItems = directItems.map(item => {
        const product = products.find(p => p._id.toString() === item.product);
        if (!product) {
          throw new Error(`Product with ID ${item.product} not found`);
        }
        const price = extractPrice(product.current_price);
        calculatedTotal += price * item.quantity;
        
        return {
          product: item.product,
          quantity: item.quantity,
        };
      });

      const order = new Order({
        user: req.user.id,
        items: orderItems,
        totalAmount: calculatedTotal, // Use calculated total for security
      });

      const savedOrder = await order.save();

      // Populate order with product & farmer details for response
      const populatedOrder = await Order.findById(savedOrder._id).populate({
        path: 'items.product',
        populate: {
          path: 'farmer',
          select: 'name email phone role'
        }
      }).populate('user', 'name email');

      console.log("✅ Direct order placed successfully");
      return res.status(201).json({ message: 'Order placed successfully', order: populatedOrder });
    }

    // Original cart-based flow (existing functionality)
    console.log("Processing cart-based order...");
    const cart = await Cart.findOne({ user: req.user.id }).populate({
      path: 'items.product',
      populate: {
        path: 'farmer',
        select: 'name email phone role' 
      }
    });

    if (!cart) {
      return res.status(400).json({ error: 'Cart not found and no direct order data provided' });
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

    const populatedOrder = await Order.findById(savedOrder._id).populate({
      path: 'items.product',
      populate: {
        path: 'farmer',
        select: 'name email phone role'
      }
    }).populate('user', 'name email');

    console.log("✅ Cart-based order placed successfully");
    res.status(201).json({ message: 'Order placed successfully', order: populatedOrder });
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ error: 'Failed to place order', details: err.message });
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



// Enhanced getOrders function with debugging and fixes
exports.getOrders = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    // Validate user ID exists
    if (!userId) {
      return res.status(400).json({ 
        success: false,
        message: 'User ID is required' 
      });
    }

    console.log("Searching for orders with user ID:", userId);

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid user ID format' 
      });
    }

    // Convert to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Query orders with proper ObjectId handling
    const orders = await Order.find({ 
      user: userObjectId 
    })
    .populate({
      path: 'items.product',
      populate: {
        path: 'farmer',
        select: 'name email phone role'
      }
    })
    .populate('user', 'name email')
    .sort({ createdAt: -1 }) // Sort by newest first
    .lean(); // Use lean() for better performance if you don't need Mongoose document methods

    console.log("Found orders:", orders.length);
    
    // Handle empty results
    if (!orders || orders.length === 0) {
      // Optional: Debug logging (remove in production)
      if (process.env.NODE_ENV === 'development') {
        await debugOrdersForUser(userId);
      }
      
      return res.status(200).json({ 
        success: true,
        message: 'No orders found for this user',
        data: [],
        count: 0
      });
    }

    // Success response
    res.status(200).json({
      success: true,
      message: 'Orders fetched successfully',
      data: orders,
      count: orders.length
    });

  } catch (err) {
    console.error('Error fetching orders:', err);
    
    // Handle specific MongoDB errors
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid user ID format' 
      });
    }
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid query parameters' 
      });
    }

    // Generic server error
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch orders. Please try again later.',
      ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
  }
};

// Alternative simpler version if the above doesn't work
// exports.getOrdersSimple = async (req, res) => {
//   try {
//     console.log("User from req.user:", req.user);
    
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ error: 'User not authenticated' });
//     }

//     const userId = req.user.id;
    
//     // First, try to find orders without population
//     const orders = await Order.find({ user: userId });
//     console.log("Orders found (no population):", orders.length);
    
//     if (orders.length === 0) {
//       return res.status(404).json({ message: 'No orders found for this user' });
//     }

//     // Then populate step by step
//     const populatedOrders = await Order.find({ user: userId })
//       .populate('items.product')
//       .populate('user', 'name email');

//     console.log("Orders after population:", populatedOrders.length);
    
//     res.json(populatedOrders); 
//   } catch (err) {
//     console.error('Error fetching orders:', err);
//     res.status(500).json({ error: 'Failed to fetch orders. Please try again later.' });
//   }
// };

// Debug function to check data consistency
// exports.debugOrders = async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     console.log("Debug - User ID:", userId);
    
//     // Check all orders
//     const allOrders = await Order.find({});
//     console.log("Total orders:", allOrders.length);
    
//     // Check orders for this user
//     const userOrders = await Order.find({ user: userId });
//     console.log("User orders:", userOrders.length);
    
//     // Check user ID format in existing orders
//     const sampleOrders = await Order.find({}).limit(5);
//     console.log("Sample order user IDs and types:");
//     sampleOrders.forEach((order, index) => {
//       console.log(`Order ${index + 1}:`, {
//         orderId: order._id,
//         userId: order.user,
//         userIdType: typeof order.user,
//         isObjectId: mongoose.Types.ObjectId.isValid(order.user),
//         matches: order.user.toString() === userId
//       });
//     });
    
//     res.json({
//       userId,
//       totalOrders: allOrders.length,
//       userOrders: userOrders.length,
//       sampleOrders: sampleOrders.map(o => ({
//         orderId: o._id,
//         userId: o.user,
//         userIdType: typeof o.user
//       }))
//     });
//   } catch (err) {
//     console.error('Debug error:', err);
//     res.status(500).json({ error: err.message });
//   }
// };