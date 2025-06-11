const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: String,
  basePrice: Number,
  price: String,
  minOrder: String,
  category: String,
  img: String,
  region: String,
  discount: String,
  farmer: String,
  isFlashDeal: Boolean,
});

module.exports = mongoose.model('Product', productSchema);
