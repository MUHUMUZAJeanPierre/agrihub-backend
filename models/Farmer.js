const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  blogTitle: { 
    type: String, 
    required: true 
    },
  blogurl: { 
    type: String, 
    required: true 
    },
  date: { 
    type: String, 
    required: true 
    },
  description: { 
    type: String, 
    required: true 
    },
  category: { 
    type: String, 
    required: true 
    },
  readTime: { 
    type: String, 
    required: true 
    },
  severity: { 
    type: String, enum: ['Low', 'Medium', 'High'], 
    required: true }
});

module.exports = mongoose.model('Farmer', farmerSchema);
