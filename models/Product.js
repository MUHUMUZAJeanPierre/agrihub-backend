// --- models/Product.js ---
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: String,
  price: String,
  minOrder: String,
  img: String,
  category: String,
  farmer: {
    name: String,
    cooperative: String,
    location: String,
    rating: Number,
    completedOrders: Number,
    yearsExperience: Number
  },
  description: {
    kinyarwanda: String,
    english: String
  },
  specifications: {
    origin: String,
    harvestDate: String,
    organic: Boolean,
    certifications: [String],
    shelfLife: String,
    storageTemp: String
  },
  availability: {
    inStock: Boolean,
    quantity: String,
    nextHarvest: String
  },
  pricing: {
    basePrice: Number,
    bulk10kg: Number,
    bulk50kg: Number,
    bulk100kg: Number
  }
});

module.exports = mongoose.model('Product', productSchema);
