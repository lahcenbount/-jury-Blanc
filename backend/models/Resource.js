const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Le nom de la ressource est obligatoire"] 
  },
  type: { 
    type: String,
    required: [true, "Le type de ressource est obligatoire"]
  },
  quantity: { 
    type: Number, 
    min: [0, "La quantité ne peut pas être négative"],
    required: true 
  },
  supplier: {
    name: String,
    contact: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Resource', ResourceSchema);
