// // const Order = require('../models/Order');
// // const Cart = require('../models/Cart');
// // const Product = require('../models/Product');
// // const mongoose = require('mongoose');

// // exports.getOrdersWithoutId = async (req, res) => {
// //   try {
// //     const orders = await Order.find().populate('items.product'); 
// //     if (!orders || orders.length === 0) {
// //       return res.status(404).json({ message: 'No orders found' }); // Adjusted message since no user filter is applied
// //     }

// //     res.json(orders); 
// //   } catch (err) {
// //     console.error('Error fetching orders:', err);
// //     res.status(500).json({ error: 'Failed to fetch orders. Please try again later.' });
// //   }
// // };
 

// // // exports.getOrders = async (req, res) => {
// // //   try {
// // //     const orders = await Order.find({ user: req.user.id }).populate('items.product');

// // //     if (!orders || orders.length === 0) {
// // //       return res.status(404).json({ message: 'No orders found for this user' });
// // //     }

// // //     res.json(orders); 
// // //   } catch (err) {
// // //     console.error('Error fetching orders:', err);
// // //     res.status(500).json({ error: 'Failed to fetch orders. Please try again later.' });
// // //   }
// // // };


// // // Example of fetching orders by user ID
// // // exports.getOrders = async (req, res) => {
// // //   try {
// // //     const orders = await Order.find({ user: req.user.id })
// // //     if (!orders) {
// // //       return res.status(404).json({ message: 'No orders found for this user' });
// // //     }
// // //     res.json(orders);
// // //   } catch (err) {
// // //     console.error('Error fetching orders:', err);
// // //     res.status(500).json({ message: 'Failed to fetch orders' });
// // //   }
// // // };

// // exports.getOrders = async (req, res) => {
// //   try {
// //     console.log('🔍 DEBUG - Fetching orders for user ID:', req.user.id);
// //     console.log('🔍 DEBUG - User email:', req.user.email);
// //     console.log('🔍 DEBUG - User role:', req.user.role);
    
// //     const orders = await Order.find({ user: req.user.id })
// //       .populate('items.product')
// //       .populate('user', 'name email');
      
// //     console.log('🔍 DEBUG - Found orders count:', orders.length);
    
// //     // Log all orders for this user with details
// //     orders.forEach(order => {
// //       console.log(`🔍 DEBUG - Order: ${order._id}, User: ${order.user._id}, Created: ${order.createdAt}`);
// //     });
    
// //     if (!orders || orders.length === 0) {
// //       return res.status(404).json({ 
// //         message: 'No orders found for this user',
// //         debug: {
// //           userId: req.user.id,
// //           userEmail: req.user.email,
// //           userRole: req.user.role
// //         }
// //       });
// //     }
    
// //     res.json({
// //       orders,
// //       debug: {
// //         userId: req.user.id,
// //         userEmail: req.user.email,
// //         orderCount: orders.length
// //       }
// //     });
// //   } catch (err) {
// //     console.error('Error fetching orders:', err);
// //     res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
// //   }
// // };


// // exports.clearCart = async (req, res) => {
// //   await Cart.findOneAndDelete({ user: req.user.id });
// //   res.status(204).send();
// // };


// // const extractPrice = (price) => {
// //   const numericPrice = parseFloat(price.replace(/[^\d.]/g, ''));
// //   return isNaN(numericPrice) ? 0 : numericPrice;  
// // };




// // exports.getOrdersByUserId = async (req, res) => {
// //   try {
// //     const buyerId = req.params.id;

// //     if (!buyerId) {
// //       return res.status(400).json({ error: 'Buyer ID is required' });
// //     }

// //     if (!mongoose.Types.ObjectId.isValid(buyerId)) {
// //       return res.status(400).json({ error: 'Invalid Buyer ID format' });
// //     }

// //     const orders = await Order.find({ user: buyerId }).populate('items.product');

// //     if (!orders || orders.length === 0) {
// //       return res.status(404).json({ message: 'No orders found for this buyer' });
// //     }

// //     res.status(200).json(orders); 
// //   } catch (err) {
// //     console.error('Error fetching orders by buyer ID:', err);
// //     res.status(500).json({ error: 'Failed to fetch orders. Please try again later.' });
// //   }
// // };




// // // exports.placeOrder = async (req, res) => {
// // //   console.log("Authenticated User:", req.user);

// // //   try {
// // //     const cart = await Cart.findOne({ user: req.user.id }).populate({
// // //       path: 'items.product',
// // //       populate: {
// // //         path: 'farmer',
// // //         select: 'name email phone role' 
// // //       }
// // //     });

// // //     if (!cart) {
// // //       return res.status(400).json({ error: 'Cart not found' });
// // //     }

// // //     if (!cart.items || cart.items.length === 0) {
// // //       return res.status(400).json({ error: 'Cart is empty' });
// // //     }

// // //     let totalAmount = 0;
// // //     cart.items.forEach(item => {
// // //       const price = extractPrice(item.product.current_price);
// // //       totalAmount += price * item.quantity;
// // //     });

// // //     const order = new Order({
// // //       user: req.user.id,
// // //       items: cart.items.map(item => ({
// // //         product: item.product._id,
// // //         quantity: item.quantity,
// // //       })),
// // //       totalAmount,
// // //     });

// // //     const savedOrder = await order.save();

// // //     // 🔄 Repopulate order with product & farmer details for response
// // //     const populatedOrder = await Order.findById(savedOrder._id).populate({
// // //       path: 'items.product',
// // //       populate: {
// // //         path: 'farmer',
// // //         select: 'name email phone role' // Choose fields you need
// // //       }
// // //     }).populate('user', 'name email');

// // //     res.status(201).json({ message: 'Order placed successfully', order: populatedOrder });
// // //   } catch (err) {
// // //     console.error('Error placing order:', err);
// // //     res.status(500).json({ error: 'Failed to place order' });
// // //   }
// // // };


// // // exports.placeOrder = async (req, res) => {
// // //   console.log("Authenticated User:", req.user);
// // //   console.log("Request body:", req.body);

// // //   try {
// // //     const { items: directItems, totalAmount: directTotal } = req.body;

// // //     // Check if direct order data is provided (new flow)
// // //     if (directItems && directItems.length > 0) {
// // //       console.log("Processing direct order...");
      
// // //       // Validate products exist
// // //       const productIds = directItems.map(item => item.product);
// // //       const products = await Product.find({ _id: { $in: productIds } }).populate('farmer', 'name email phone role');
      
// // //       if (products.length !== directItems.length) {
// // //         return res.status(400).json({ error: 'Some products not found' });
// // //       }

// // //       // Calculate total amount (server-side validation for security)
// // //       let calculatedTotal = 0;
// // //       const orderItems = directItems.map(item => {
// // //         const product = products.find(p => p._id.toString() === item.product);
// // //         if (!product) {
// // //           throw new Error(`Product with ID ${item.product} not found`);
// // //         }
// // //         const price = extractPrice(product.current_price);
// // //         calculatedTotal += price * item.quantity;
        
// // //         return {
// // //           product: item.product,
// // //           quantity: item.quantity,
// // //         };
// // //       });

// // //       const order = new Order({
// // //         user: req.user.id,
// // //         items: orderItems,
// // //         totalAmount: calculatedTotal, // Use calculated total for security
// // //       });

// // //       const savedOrder = await order.save();

// // //       // Populate order with product & farmer details for response
// // //       const populatedOrder = await Order.findById(savedOrder._id).populate({
// // //         path: 'items.product',
// // //         populate: {
// // //           path: 'farmer',
// // //           select: 'name email phone role'
// // //         }
// // //       }).populate('user', 'name email');

// // //       console.log("✅ Direct order placed successfully");
// // //       return res.status(201).json({ message: 'Order placed successfully', order: populatedOrder });
// // //     }

// // //     // Original cart-based flow (existing functionality)
// // //     console.log("Processing cart-based order...");
// // //     const cart = await Cart.findOne({ user: req.user.id }).populate({
// // //       path: 'items.product',
// // //       populate: {
// // //         path: 'farmer',
// // //         select: 'name email phone role' 
// // //       }
// // //     });

// // //     if (!cart) {
// // //       return res.status(400).json({ error: 'Cart not found and no direct order data provided' });
// // //     }

// // //     if (!cart.items || cart.items.length === 0) {
// // //       return res.status(400).json({ error: 'Cart is empty' });
// // //     }

// // //     let totalAmount = 0;
// // //     cart.items.forEach(item => {
// // //       const price = extractPrice(item.product.current_price);
// // //       totalAmount += price * item.quantity;
// // //     });

// // //     const order = new Order({
// // //       user: req.user.id,
// // //       items: cart.items.map(item => ({
// // //         product: item.product._id,
// // //         quantity: item.quantity,
// // //       })),
// // //       totalAmount,
// // //     });

// // //     const savedOrder = await order.save();

// // //     const populatedOrder = await Order.findById(savedOrder._id).populate({
// // //       path: 'items.product',
// // //       populate: {
// // //         path: 'farmer',
// // //         select: 'name email phone role'
// // //       }
// // //     }).populate('user', 'name email');

// // //     console.log("✅ Cart-based order placed successfully");
// // //     res.status(201).json({ message: 'Order placed successfully', order: populatedOrder });
// // //   } catch (err) {
// // //     console.error('Error placing order:', err);
// // //     res.status(500).json({ error: 'Failed to place order', details: err.message });
// // //   }
// // // };


// // exports.placeOrder = async (req, res) => {
// //   console.log("🔍 DEBUG - Authenticated User:", req.user);
// //   console.log("🔍 DEBUG - User ID being saved:", req.user.id);
// //   console.log("🔍 DEBUG - Request body:", req.body);

// //   try {
// //     const { items: directItems, totalAmount: directTotal } = req.body;

// //     // Check if direct order data is provided (new flow)
// //     if (directItems && directItems.length > 0) {
// //       console.log("Processing direct order...");
      
// //       // Validate products exist
// //       const productIds = directItems.map(item => item.product);
// //       const products = await Product.find({ _id: { $in: productIds } }).populate('farmer', 'name email phone role');
      
// //       if (products.length !== directItems.length) {
// //         return res.status(400).json({ error: 'Some products not found' });
// //       }

// //       let calculatedTotal = 0;
// //       const orderItems = directItems.map(item => {
// //         const product = products.find(p => p._id.toString() === item.product);
// //         if (!product) {
// //           throw new Error(`Product with ID ${item.product} not found`);
// //         }
// //         const price = extractPrice(product.current_price);
// //         calculatedTotal += price * item.quantity;
        
// //         return {
// //           product: item.product,
// //           quantity: item.quantity,
// //         };
// //       });

// //       const order = new Order({
// //         user: req.user.id,
// //         items: orderItems,
// //         totalAmount: calculatedTotal,
// //       });

// //       const savedOrder = await order.save();
// //       console.log("🔍 DEBUG - Order saved with user ID:", savedOrder.user);

// //       // Populate order with product & farmer details for response
// //       const populatedOrder = await Order.findById(savedOrder._id).populate({
// //         path: 'items.product',
// //         populate: {
// //           path: 'farmer',
// //           select: 'name email phone role'
// //         }
// //       }).populate('user', 'name email');

// //       console.log("✅ Direct order placed successfully");
// //       return res.status(201).json({ message: 'Order placed successfully', order: populatedOrder });
// //     }

// //     // Original cart-based flow (existing functionality)
// //     console.log("Processing cart-based order...");
// //     const cart = await Cart.findOne({ user: req.user.id }).populate({
// //       path: 'items.product',
// //       populate: {
// //         path: 'farmer',
// //         select: 'name email phone role' 
// //       }
// //     });

// //     if (!cart) {
// //       return res.status(400).json({ error: 'Cart not found and no direct order data provided' });
// //     }

// //     if (!cart.items || cart.items.length === 0) {
// //       return res.status(400).json({ error: 'Cart is empty' });
// //     }

// //     let totalAmount = 0;
// //     cart.items.forEach(item => {
// //       const price = extractPrice(item.product.current_price);
// //       totalAmount += price * item.quantity;
// //     });

// //     const order = new Order({
// //       user: req.user.id,
// //       items: cart.items.map(item => ({
// //         product: item.product._id,
// //         quantity: item.quantity,
// //       })),
// //       totalAmount,
// //     });

// //     const savedOrder = await order.save();
// //     console.log("🔍 DEBUG - Cart order saved with user ID:", savedOrder.user);

// //     const populatedOrder = await Order.findById(savedOrder._id).populate({
// //       path: 'items.product',
// //       populate: {
// //         path: 'farmer',
// //         select: 'name email phone role'
// //       }
// //     }).populate('user', 'name email');

// //     console.log("✅ Cart-based order placed successfully");
// //     res.status(201).json({ message: 'Order placed successfully', order: populatedOrder });
// //   } catch (err) {
// //     console.error('Error placing order:', err);
// //     res.status(500).json({ error: 'Failed to place order', details: err.message });
// //   }
// // };


// // exports.getOrdersGroupedByProductForFarmer = async (req, res) => {
// //   try {
// //     const farmerId = req.user.id;

// //     // 1. Fata ibicuruzwa by'uyu mufama
// //     const products = await Product.find({ farmer: farmerId }).select('_id name');
// //     const productIds = products.map(p => p._id);

// //     if (productIds.length === 0) {
// //       return res.status(404).json({ message: 'Nta bicuruzwa byabonetse by\'uyu mufama' });
// //     }

// //     // 2. Fata orders zose zifite ibyo bicuruzwa
// //     const orders = await Order.find({ 'items.product': { $in: productIds } })
// //       .populate('items.product')
// //       .populate('user');

// //     // 3. Group orders by product
// //     const grouped = {};

// //     orders.forEach(order => {
// //       order.items.forEach(item => {
// //         const product = item.product;
// //         if (!product || product.farmer.toString() !== farmerId) return;

// //         const productId = product._id.toString();
// //         if (!grouped[productId]) {
// //           grouped[productId] = {
// //             product: product.name,
// //             orders: []
// //           };
// //         }

// //         grouped[productId].orders.push({
// //           buyer: {
// //             name: order.user.name,
// //             email: order.user.email
// //           },
// //           quantity: item.quantity,
// //           orderId: order._id,
// //           date: order.createdAt
// //         });
// //       });
// //     });

// //     res.json(Object.values(grouped));
// //   } catch (err) {
// //     console.error('Error:', err);
// //     res.status(500).json({ error: 'Ntibyakunze kubona orders z’ibicuruzwa' });
// //   }
// // };



// // exports.getOrderById = async (req, res) => {
// //   const { orderId } = req.params;

// //   // Validate ObjectId
// //   if (!mongoose.Types.ObjectId.isValid(orderId)) {
// //     return res.status(400).json({ error: 'Invalid order ID' });
// //   }

// //   try {
// //     const order = await Order.findById(orderId)
// //       .populate('user', 'name email') // Populate user details
// //       .populate({
// //         path: 'items.product',
// //         populate: {
// //           path: 'farmer', // Assuming product has a farmer field
// //           select: 'name email phone role'
// //         }
// //       });

// //     if (!order) {
// //       return res.status(404).json({ error: 'Order not found' });
// //     }

// //     res.status(200).json({ order });
// //   } catch (err) {
// //     console.error('Error fetching order:', err);
// //     res.status(500).json({ error: 'Server error', details: err.message });
// //   }
// // };

// // // TEMPORARY - Remove after debugging
// // exports.getAllOrdersDebug = async (req, res) => {
// //   try {
// //     const orders = await Order.find({})
// //       .populate('items.product')
// //       .populate('user', 'name email');
    
// //     res.json({
// //       message: `Found ${orders.length} total orders`,
// //       currentUser: req.user.id,
// //       currentUserEmail: req.user.email,
// //       orders: orders.map(order => ({
// //         id: order._id,
// //         userId: order.user._id,
// //         userEmail: order.user.email,
// //         itemCount: order.items.length,
// //         createdAt: order.createdAt
// //       }))
// //     });
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // };

// // // Admin endpoint to get all orders (for debugging)
// // exports.getAllOrdersAdmin = async (req, res) => {
// //   try {
// //     // Check if user is admin or has special privileges
// //     if (req.user.role !== 'admin' && req.user.role !== 'plant pathologist') {
// //       return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
// //     }

// //     const orders = await Order.find({})
// //       .populate('items.product')
// //       .populate('user', 'name email');
    
// //     res.json({
// //       message: `Found ${orders.length} total orders`,
// //       orders: orders
// //     });
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // };



// const Order = require('../models/Order');
// const Cart = require('../models/Cart');
// const Product = require('../models/Product');
// const mongoose = require('mongoose');

// exports.getOrdersWithoutId = async (req, res) => {
//   try {
//     const orders = await Order.find().populate('items.product'); 
//     if (!orders || orders.length === 0) {
//       return res.status(404).json({ message: 'No orders found' }); // Adjusted message since no user filter is applied
//     }

//     res.json(orders); 
//   } catch (err) {
//     console.error('Error fetching orders:', err);
//     res.status(500).json({ error: 'Failed to fetch orders. Please try again later.' });
//   }
// };
 

// // exports.getOrders = async (req, res) => {
// //   try {
// //     const orders = await Order.find({ user: req.user.id }).populate('items.product');

// //     if (!orders || orders.length === 0) {
// //       return res.status(404).json({ message: 'No orders found for this user' });
// //     }

// //     res.json(orders); 
// //   } catch (err) {
// //     console.error('Error fetching orders:', err);
// //     res.status(500).json({ error: 'Failed to fetch orders. Please try again later.' });
// //   }
// // };


// // Example of fetching orders by user ID
// // exports.getOrders = async (req, res) => {
// //   try {
// //     const orders = await Order.find({ user: req.user.id })
// //     if (!orders) {
// //       return res.status(404).json({ message: 'No orders found for this user' });
// //     }
// //     res.json(orders);
// //   } catch (err) {
// //     console.error('Error fetching orders:', err);
// //     res.status(500).json({ message: 'Failed to fetch orders' });
// //   }
// // };

// exports.getOrders = async (req, res) => {
//   try {
//     console.log('🔍 DEBUG - Fetching orders for user ID:', req.user.id);
//     console.log('🔍 DEBUG - User email:', req.user.email);
//     console.log('🔍 DEBUG - User role:', req.user.role);
    
//     const orders = await Order.find({ user: req.user.id })
//       .populate('items.product')
//       .populate('user', 'name email');
      
//     console.log('🔍 DEBUG - Found orders count:', orders.length);
    
//     // Log all orders for this user with details
//     orders.forEach(order => {
//       console.log(`🔍 DEBUG - Order: ${order._id}, User: ${order.user._id}, Created: ${order.createdAt}`);
//     });
    
//     if (!orders || orders.length === 0) {
//       return res.status(404).json({ 
//         message: 'No orders found for this user',
//         debug: {
//           userId: req.user.id,
//           userEmail: req.user.email,
//           userRole: req.user.role
//         }
//       });
//     }
    
//     res.json({
//       orders,
//       debug: {
//         userId: req.user.id,
//         userEmail: req.user.email,
//         orderCount: orders.length
//       }
//     });
//   } catch (err) {
//     console.error('Error fetching orders:', err);
//     res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
//   }
// };


// exports.clearCart = async (req, res) => {
//   await Cart.findOneAndDelete({ user: req.user.id });
//   res.status(204).send();
// };


// const extractPrice = (price) => {
//   const numericPrice = parseFloat(price.replace(/[^\d.]/g, ''));
//   return isNaN(numericPrice) ? 0 : numericPrice;  
// };




// exports.getOrdersByUserId = async (req, res) => {
//   try {
//     const buyerId = req.params.id;

//     if (!buyerId) {
//       return res.status(400).json({ error: 'Buyer ID is required' });
//     }

//     if (!mongoose.Types.ObjectId.isValid(buyerId)) {
//       return res.status(400).json({ error: 'Invalid Buyer ID format' });
//     }

//     const orders = await Order.find({ user: buyerId }).populate('items.product');

//     if (!orders || orders.length === 0) {
//       return res.status(404).json({ message: 'No orders found for this buyer' });
//     }

//     res.status(200).json(orders); 
//   } catch (err) {
//     console.error('Error fetching orders by buyer ID:', err);
//     res.status(500).json({ error: 'Failed to fetch orders. Please try again later.' });
//   }
// };




// // exports.placeOrder = async (req, res) => {
// //   console.log("Authenticated User:", req.user);

// //   try {
// //     const cart = await Cart.findOne({ user: req.user.id }).populate({
// //       path: 'items.product',
// //       populate: {
// //         path: 'farmer',
// //         select: 'name email phone role' 
// //       }
// //     });

// //     if (!cart) {
// //       return res.status(400).json({ error: 'Cart not found' });
// //     }

// //     if (!cart.items || cart.items.length === 0) {
// //       return res.status(400).json({ error: 'Cart is empty' });
// //     }

// //     let totalAmount = 0;
// //     cart.items.forEach(item => {
// //       const price = extractPrice(item.product.current_price);
// //       totalAmount += price * item.quantity;
// //     });

// //     const order = new Order({
// //       user: req.user.id,
// //       items: cart.items.map(item => ({
// //         product: item.product._id,
// //         quantity: item.quantity,
// //       })),
// //       totalAmount,
// //     });

// //     const savedOrder = await order.save();

// //     // 🔄 Repopulate order with product & farmer details for response
// //     const populatedOrder = await Order.findById(savedOrder._id).populate({
// //       path: 'items.product',
// //       populate: {
// //         path: 'farmer',
// //         select: 'name email phone role' // Choose fields you need
// //       }
// //     }).populate('user', 'name email');

// //     res.status(201).json({ message: 'Order placed successfully', order: populatedOrder });
// //   } catch (err) {
// //     console.error('Error placing order:', err);
// //     res.status(500).json({ error: 'Failed to place order' });
// //   }
// // };


// // exports.placeOrder = async (req, res) => {
// //   console.log("Authenticated User:", req.user);
// //   console.log("Request body:", req.body);

// //   try {
// //     const { items: directItems, totalAmount: directTotal } = req.body;

// //     // Check if direct order data is provided (new flow)
// //     if (directItems && directItems.length > 0) {
// //       console.log("Processing direct order...");
      
// //       // Validate products exist
// //       const productIds = directItems.map(item => item.product);
// //       const products = await Product.find({ _id: { $in: productIds } }).populate('farmer', 'name email phone role');
      
// //       if (products.length !== directItems.length) {
// //         return res.status(400).json({ error: 'Some products not found' });
// //       }

// //       // Calculate total amount (server-side validation for security)
// //       let calculatedTotal = 0;
// //       const orderItems = directItems.map(item => {
// //         const product = products.find(p => p._id.toString() === item.product);
// //         if (!product) {
// //           throw new Error(`Product with ID ${item.product} not found`);
// //         }
// //         const price = extractPrice(product.current_price);
// //         calculatedTotal += price * item.quantity;
        
// //         return {
// //           product: item.product,
// //           quantity: item.quantity,
// //         };
// //       });

// //       const order = new Order({
// //         user: req.user.id,
// //         items: orderItems,
// //         totalAmount: calculatedTotal, // Use calculated total for security
// //       });

// //       const savedOrder = await order.save();

// //       // Populate order with product & farmer details for response
// //       const populatedOrder = await Order.findById(savedOrder._id).populate({
// //         path: 'items.product',
// //         populate: {
// //           path: 'farmer',
// //           select: 'name email phone role'
// //         }
// //       }).populate('user', 'name email');

// //       console.log("✅ Direct order placed successfully");
// //       return res.status(201).json({ message: 'Order placed successfully', order: populatedOrder });
// //     }

// //     // Original cart-based flow (existing functionality)
// //     console.log("Processing cart-based order...");
// //     const cart = await Cart.findOne({ user: req.user.id }).populate({
// //       path: 'items.product',
// //       populate: {
// //         path: 'farmer',
// //         select: 'name email phone role' 
// //       }
// //     });

// //     if (!cart) {
// //       return res.status(400).json({ error: 'Cart not found and no direct order data provided' });
// //     }

// //     if (!cart.items || cart.items.length === 0) {
// //       return res.status(400).json({ error: 'Cart is empty' });
// //     }

// //     let totalAmount = 0;
// //     cart.items.forEach(item => {
// //       const price = extractPrice(item.product.current_price);
// //       totalAmount += price * item.quantity;
// //     });

// //     const order = new Order({
// //       user: req.user.id,
// //       items: cart.items.map(item => ({
// //         product: item.product._id,
// //         quantity: item.quantity,
// //       })),
// //       totalAmount,
// //     });

// //     const savedOrder = await order.save();

// //     const populatedOrder = await Order.findById(savedOrder._id).populate({
// //       path: 'items.product',
// //       populate: {
// //         path: 'farmer',
// //         select: 'name email phone role'
// //       }
// //     }).populate('user', 'name email');

// //     console.log("✅ Cart-based order placed successfully");
// //     res.status(201).json({ message: 'Order placed successfully', order: populatedOrder });
// //   } catch (err) {
// //     console.error('Error placing order:', err);
// //     res.status(500).json({ error: 'Failed to place order', details: err.message });
// //   }
// // };


// exports.placeOrder = async (req, res) => {
//   console.log("🔍 DEBUG - Authenticated User:", req.user);
//   console.log("🔍 DEBUG - User ID being saved:", req.user.id);
//   console.log("🔍 DEBUG - Request body:", req.body);

//   try {
//     const { items: directItems, totalAmount: directTotal } = req.body;

//     // Check if direct order data is provided (new flow)
//     if (directItems && directItems.length > 0) {
//       console.log("Processing direct order...");
      
//       // Validate products exist
//       const productIds = directItems.map(item => item.product);
//       const products = await Product.find({ _id: { $in: productIds } }).populate('farmer', 'name email phone role');
      
//       if (products.length !== directItems.length) {
//         return res.status(400).json({ error: 'Some products not found' });
//       }

//       let calculatedTotal = 0;
//       const orderItems = directItems.map(item => {
//         const product = products.find(p => p._id.toString() === item.product);
//         if (!product) {
//           throw new Error(`Product with ID ${item.product} not found`);
//         }
//         const price = extractPrice(product.current_price);
//         calculatedTotal += price * item.quantity;
        
//         return {
//           product: item.product,
//           quantity: item.quantity,
//         };
//       });

//       const order = new Order({
//         user: req.user.id,
//         items: orderItems,
//         totalAmount: calculatedTotal,
//       });

//       const savedOrder = await order.save();
//       console.log("🔍 DEBUG - Order saved with user ID:", savedOrder.user);

//       // Populate order with product & farmer details for response
//       const populatedOrder = await Order.findById(savedOrder._id).populate({
//         path: 'items.product',
//         populate: {
//           path: 'farmer',
//           select: 'name email phone role'
//         }
//       }).populate('user', 'name email');

//       console.log("✅ Direct order placed successfully");
//       return res.status(201).json({ message: 'Order placed successfully', order: populatedOrder });
//     }

//     // Original cart-based flow (existing functionality)
//     console.log("Processing cart-based order...");
//     const cart = await Cart.findOne({ user: req.user.id }).populate({
//       path: 'items.product',
//       populate: {
//         path: 'farmer',
//         select: 'name email phone role' 
//       }
//     });

//     if (!cart) {
//       return res.status(400).json({ error: 'Cart not found and no direct order data provided' });
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
//     console.log("🔍 DEBUG - Cart order saved with user ID:", savedOrder.user);

//     const populatedOrder = await Order.findById(savedOrder._id).populate({
//       path: 'items.product',
//       populate: {
//         path: 'farmer',
//         select: 'name email phone role'
//       }
//     }).populate('user', 'name email');

//     console.log("✅ Cart-based order placed successfully");
//     res.status(201).json({ message: 'Order placed successfully', order: populatedOrder });
//   } catch (err) {
//     console.error('Error placing order:', err);
//     res.status(500).json({ error: 'Failed to place order', details: err.message });
//   }
// };


// exports.getOrdersGroupedByProductForFarmer = async (req, res) => {
//   try {
//     const farmerId = req.user.id;

//     // 1. Fata ibicuruzwa by'uyu mufama
//     const products = await Product.find({ farmer: farmerId }).select('_id name');
//     const productIds = products.map(p => p._id);

//     if (productIds.length === 0) {
//       return res.status(404).json({ message: 'Nta bicuruzwa byabonetse by\'uyu mufama' });
//     }

//     // 2. Fata orders zose zifite ibyo bicuruzwa
//     const orders = await Order.find({ 'items.product': { $in: productIds } })
//       .populate('items.product')
//       .populate('user');

//     // 3. Group orders by product
//     const grouped = {};

//     orders.forEach(order => {
//       order.items.forEach(item => {
//         const product = item.product;
//         if (!product || product.farmer.toString() !== farmerId) return;

//         const productId = product._id.toString();
//         if (!grouped[productId]) {
//           grouped[productId] = {
//             product: product.name,
//             orders: []
//           };
//         }

//         grouped[productId].orders.push({
//           buyer: {
//             name: order.user.name,
//             email: order.user.email
//           },
//           quantity: item.quantity,
//           orderId: order._id,
//           date: order.createdAt
//         });
//       });
//     });

//     res.json(Object.values(grouped));
//   } catch (err) {
//     console.error('Error:', err);
//     res.status(500).json({ error: 'Ntibyakunze kubona orders z’ibicuruzwa' });
//   }
// };



// exports.getOrderById = async (req, res) => {
//   const { orderId } = req.params;

//   // Validate ObjectId
//   if (!mongoose.Types.ObjectId.isValid(orderId)) {
//     return res.status(400).json({ error: 'Invalid order ID' });
//   }

//   try {
//     const order = await Order.findById(orderId)
//       .populate('user', 'name email') // Populate user details
//       .populate({
//         path: 'items.product',
//         populate: {
//           path: 'farmer', // Assuming product has a farmer field
//           select: 'name email phone role'
//         }
//       });

//     if (!order) {
//       return res.status(404).json({ error: 'Order not found' });
//     }

//     res.status(200).json({ order });
//   } catch (err) {
//     console.error('Error fetching order:', err);
//     res.status(500).json({ error: 'Server error', details: err.message });
//   }
// };

// // TEMPORARY - Remove after debugging
// exports.getAllOrdersDebug = async (req, res) => {
//   try {
//     const orders = await Order.find({})
//       .populate('items.product')
//       .populate('user', 'name email');
    
//     res.json({
//       message: `Found ${orders.length} total orders`,
//       currentUser: req.user.id,
//       currentUserEmail: req.user.email,
//       orders: orders.map(order => ({
//         id: order._id,
//         userId: order.user._id,
//         userEmail: order.user.email,
//         itemCount: order.items.length,
//         createdAt: order.createdAt
//       }))
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Admin endpoint to get all orders (for debugging)
// exports.getAllOrdersAdmin = async (req, res) => {
//   try {
//     // Check if user is admin or has special privileges
//     if (req.user.role !== 'admin' && req.user.role !== 'plant pathologist') {
//       return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
//     }

//     const orders = await Order.find({})
//       .populate('items.product')
//       .populate('user', 'name email');
    
//     res.json({
//       message: `Found ${orders.length} total orders`,
//       orders: orders
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// const Order = require('../models/Order');
// const Cart = require('../models/Cart');

// exports.getOrdersWithoutId = async (req, res) => {
//   try {
//     const orders = await Order.find().populate('items.product'); // Removed user filtering

//     if (!orders || orders.length === 0) {
//       return res.status(404).json({ message: 'No orders found' }); // Adjusted message since no user filter is applied
//     }

//     res.json(orders); 
//   } catch (err) {
//     console.error('Error fetching orders:', err);
//     res.status(500).json({ error: 'Failed to fetch orders. Please try again later.' });
//   }
// };
 

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

// // New function to get orders by user ID from query parameter
// exports.getOrdersByUserId = async (req, res) => {
//   try {
//     const { userId } = req.query;
    
//     if (!userId) {
//       return res.status(400).json({ error: 'User ID is required' });
//     }

//     const orders = await Order.find({ user: userId }).populate('items.product');

//     if (!orders || orders.length === 0) {
//       return res.status(404).json({ message: 'No orders found for this user' });
//     }

//     res.json(orders); 
//   } catch (err) {
//     console.error('Error fetching orders by user ID:', err);
//     res.status(500).json({ error: 'Failed to fetch orders. Please try again later.' });
//   }
// };



// exports.clearCart = async (req, res) => {
//   await Cart.findOneAndDelete({ user: req.user.id });
//   res.status(204).send();
// };


// const extractPrice = (price) => {
//   const numericPrice = parseFloat(price.replace(/[^\d.]/g, ''));
//   return isNaN(numericPrice) ? 0 : numericPrice;  
// };







// exports.placeOrder = async (req, res) => {
//   console.log("Authenticated User:", req.user);

//   try {
//     // Get the user's cart
//     const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    
//     // Log the cart to verify its contents
//     console.log("Cart after population:", cart);

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

//     // Create a new order from the cart
//     const order = new Order({
//       user: req.user.id,
//       items: cart.items.map(item => ({
//         product: item.product._id,
//         quantity: item.quantity,
//       })),
//       totalAmount,
//     });

//     // Save the order to the database
//     await order.save();

//     // Optionally clear the cart, if needed
//     // await Cart.findOneAndDelete({ user: req.user.id });

//     res.status(201).json({ message: 'Order placed successfully', order });
//   } catch (err) {
//     console.error('Error placing order:', err);
//     res.status(500).json({ error: 'Failed to place order' });
//   }
// };

const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');

// Utility function to extract price
const extractPrice = (price) => {
  const numericPrice = parseFloat(price.replace(/[^\d.]/g, ''));
  return isNaN(numericPrice) ? 0 : numericPrice;  
};

// Fetch all orders (for admin purposes)
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

// Fetch orders for authenticated user
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

// Fetch a specific order by ID
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

// Fetch orders by specific user ID (admin or user-specific access)
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

// Place an order based on cart or direct order data
exports.placeOrder = async (req, res) => {
  console.log("Authenticated User:", req.user);
  console.log("Request Body:", req.body);

  try {
    let orderData = null;
    let totalAmount = 0;

    // Check if direct order data is provided in request body
    if (req.body.items && req.body.totalAmount) {
      // Use direct order data from frontend
      orderData = {
        user: req.user.id,
        items: req.body.items,
        totalAmount: req.body.totalAmount,
      };
      totalAmount = req.body.totalAmount;
      console.log("Using direct order data from frontend");
    } else {
      // Fallback to cart-based order (for Postman compatibility)
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

    // Validate order data
    if (!orderData.items || orderData.items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    if (!orderData.totalAmount || orderData.totalAmount <= 0) {
      return res.status(400).json({ error: 'Invalid total amount' });
    }

    // Create and save the order
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

// Clear user's cart
exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user.id });
    res.status(204).send();
  } catch (err) {
    console.error('Error clearing cart:', err);
    res.status(500).json({ error: 'Failed to clear the cart' });
  }
};

// Update order status (for admin or farmer)
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

// Cancel an order (for user)
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (['Shipped', 'Delivered'].includes(order.status)) {
      return res.status(400).json({ error: 'Cannot cancel shipped or delivered orders' });
    }

    order.status = 'Cancelled';
    await order.save();

    res.json({ message: 'Order cancelled successfully', order });
  } catch (err) {
    console.error('Error cancelling order:', err);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
};
