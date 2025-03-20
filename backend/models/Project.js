const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Le nom du projet est obligatoire"] 
  },
  description: {type:String,
    required: [true, "Le description du projet est obligatoire"] 
  },
  startDate: { 
    type: Date, 
    required: [true, "La date de début est obligatoire"] 
  },
  endDate:{type:Date,
    required: [true, "Le date du projet est obligatoire"] 
  } ,
  budget: { 
    type: Number, 
    min: [0, "Le budget ne peut pas être négatif"] 
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);