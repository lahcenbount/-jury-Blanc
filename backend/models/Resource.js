const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
  },
  type: { 
    type: String,
    required: true, 
  },
  quantity: { 
    type: Number, 
    min: 0, 
    required: true 
  },
  supplier: {
    name: String,
    contact: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Resource', ResourceSchema);
