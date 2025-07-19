const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true, 
  },
  items: [
    {
      product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true,  
      },
      quantity: {
        type: Number,
        required: true,
        min: 1, 
        max: 99, 
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Processed', 'Shipped', 'Delivered', 'canceled'],
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

orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema);
