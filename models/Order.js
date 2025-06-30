// // models/Order.js
// const mongoose = require('mongoose');

// const orderSchema = new mongoose.Schema({
//   user: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'User' 
//   },
//   items: [
//     {
//       product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
//       quantity: Number,
//     },
//   ],
//   totalAmount: Number,
//   status: { 
//     type: String, 
//     default: 'Pending' 
//   },
//   createdAt: { 
//     type: Date, 
//     default: Date.now 
//   },
// });

// module.exports = mongoose.model('Order', orderSchema);


const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true, // Make sure the user is required
  },
  items: [
    {
      product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true,  // Ensure product is always provided
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,  // Ensure quantity is at least 1
        max: 99, // Limit quantity to 99 for each item (or adjust as needed)
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true, // Total amount must be calculated when creating an order
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Processed', 'Shipped', 'Delivered', 'Cancelled'], // Define the possible statuses
    default: 'Pending',
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now, 
  },
});

// Automatically set updatedAt field before saving
orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema);
