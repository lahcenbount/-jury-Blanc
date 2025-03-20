const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// Créer un projet
router.post('/', async (req, res) => {
  const { name, description, startDate, endDate, budget } = req.body;

  try {
    const Data = new Project({
      name,
      description,
      startDate,
      endDate,
      budget,  // Correctly include the budget field
    });

    // Save the project data and return success message
    await Data.save();
    res.status(201).json({
      message: "Projet créé avec succès",
      project: Data,  // Return the created project data
    });
  } catch (err) {
    console.error("Erreur lors de l'insertion du projet: ", err);
    res.status(500).json({ message: "Erreur lors de l'insertion du projet", error: err.message });
  }
});

// Lister tous les projets
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ startDate: -1 });
    res.json(projects);
  } catch (error) {
    console.error("Erreur lors de la récupération des projets: ", error);
    res.status(500).json({ message: "Erreur lors de la récupération des projets", error: error.message });
  }
});

// Mettre à jour un projet
router.put('/:id', async (req, res) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }  // Return the updated document
    );

    if (!updatedProject) {
      return res.status(404).json({ message: "Projet non trouvé" });
    }

    res.json(updatedProject);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du projet: ", error);
    res.status(400).json({ message: "Erreur lors de la mise à jour du projet", error: error.message });
  }
});

// Supprimer un projet
router.delete('/:id', async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);

    if (!deletedProject) {
      return res.status(404).json({ message: "Projet non trouvé" });
    }

    res.json({ message: 'Projet supprimé avec succès' });
  } catch (error) {
    console.error("Erreur lors de la suppression du projet: ", error);
    res.status(500).json({ message: "Erreur lors de la suppression du projet", error: error.message });
  }
});

module.exports = router;
