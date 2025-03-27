const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  description: { 
    type: String, 
    required: true, 
  },
  startDate: { 
    type: Date, 
    required: true, 
  },
  endDate: Date,
  project: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  resources: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  }],
  status: {
    type: String,
    enum: ['À faire', 'En cours', 'Terminé'],
    default: 'À faire'
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);