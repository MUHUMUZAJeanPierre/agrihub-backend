const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  current_price: { type: String, required: true }, 
  past_price: { type: String }, 
  img: { 
    type: String }, 
  category: {
  type: String,
  required: true,
  enum: [
    'vegetables', 'fruits', 'grains', 'tubers', 'legumes',
    'seeds', 'herbs', 'oil_crops', 'cereals', 'packaged'
  ]
},
  region: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
