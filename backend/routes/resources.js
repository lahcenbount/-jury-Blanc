const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');

// Ajoute
router.post('/', async (req, res) => {
  try {
    const newResource = await Resource.create(req.body);
    res.status(201).json(newResource);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lister toutes les ressources
router.get('/', async (req, res) => {
  try {
    const resources = await Resource.find()
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mettre à jour une ressource
router.put('/:id', async (req, res) => {
  try {
    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedResource);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer une ressource
router.delete('/:id', async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: 'Ressource supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;