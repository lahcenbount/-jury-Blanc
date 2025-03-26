import React, { useState, useEffect } from 'react';
import { resourceService, taskService } from '../services/api';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const ResourceManager = () => {
  const [resources, setResources] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [editingResource, setEditingResource] = useState(null);
  const [error, setError] = useState(null);

  const resourceSchema = Yup.object().shape({
    name: Yup.string().required('Le nom est obligatoire'),
    type: Yup.string().required('Le type est obligatoire'),
    quantity: Yup.number()
      .positive('La quantité doit être un nombre positif')
      .integer('La quantité doit être un entier')
      .required('La quantité est obligatoire'),
    supplier: Yup.object().shape({
      name: Yup.string().notRequired(),
      contact: Yup.string().notRequired()
    })
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const resourcesResponse = await resourceService.getAll();
        const tasksResponse = await taskService.getAll();  
        setResources(resourcesResponse.data);
        setTasks(tasksResponse.data);
      } catch (err) {
        setError(`Erreur lors du chargement des données: ${err.message}`);
      }
    };

    fetchInitialData();
  }, []);

  const handleSubmit = async (values) => {
    try {
      if (editingResource) {
        await resourceService.update(editingResource._id, values);
      } else {
        await resourceService.create(values);
      }

      const resourcesResponse = await resourceService.getAll();
      setResources(resourcesResponse.data);
      resetForm();
    } catch (err) {
      setError("Erreur lors de l'enregistrement de la ressource: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const isResourceUsed = tasks.some(task => task.resources?.includes(id));

      if (isResourceUsed) {
        setError("Impossible de supprimer une ressource utilisée dans des tâches");
        return;
      }

      await resourceService.delete(id);
      const resourcesResponse = await resourceService.getAll();
      setResources(resourcesResponse.data);
    } catch (err) {
      setError("Erreur lors de la suppression de la ressource: " + err.message);
    }
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
  };

  const resetForm = () => {
    setEditingResource(null);
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Gestion des Ressources</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Formik
        initialValues={{
          name: editingResource ? editingResource.name : '',
          type: editingResource ? editingResource.type : '',
          quantity: editingResource ? editingResource.quantity : 0,
          supplier: {
            name: editingResource?.supplier?.name || '',
            contact: editingResource?.supplier?.contact || ''
          }
        }}
        validationSchema={resourceSchema}
        onSubmit={handleSubmit}
      >
        {({ values, handleChange, handleBlur }) => (
          <Form className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-xl font-semibold mb-4">
              {editingResource ? 'Modifier la Ressource' : 'Nouvelle Ressource'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Nom</label>
                <Field
                  type="text"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full p-2 border rounded"
                />
                <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="block mb-2">Type</label>
                <Field
                  type="text"
                  name="type"
                  value={values.type}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full p-2 border rounded"
                />
                <ErrorMessage name="type" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="block mb-2">Quantité</label>
                <Field
                  type="number"
                  name="quantity"
                  value={values.quantity}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full p-2 border rounded"
                />
                <ErrorMessage name="quantity" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="block mb-2">Nom du Fournisseur</label>
                <Field
                  type="text"
                  name="supplier.name"
                  value={values.supplier.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block mb-2">Contact du Fournisseur</label>
                <Field
                  type="text"
                  name="supplier.contact"
                  value={values.supplier.contact}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <button
                type="submit"
                className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {editingResource ? 'Mettre à Jour' : 'Créer'}
              </button>
              {editingResource && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Annuler
                </button>
              )}
            </div>
          </Form>
        )}
      </Formik>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource) => {
          const relatedTasks = tasks.filter(task => task.resources?.includes(resource._id));

          return (
            <div key={resource._id} className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="font-bold text-lg mb-2">{resource.name}</h3>
              <div className="text-sm space-y-1">
                <p>🏷️ Type: {resource.type}</p>
                <p>🔢 Quantité: {resource.quantity}</p>

                {resource.supplier && resource.supplier.name && (
                  <>
                    <p>🏢 Fournisseur: {resource.supplier.name}</p>
                    {resource.supplier.contact && (
                      <p>Contact: {resource.supplier.contact}</p>
                    )}
                  </>
                )}

                {relatedTasks.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Utilisée dans {relatedTasks.length} tâche(s):</p>
                    <ul className="ml-4 list-disc text-xs mt-1">
                      {relatedTasks.slice(0, 3).map(task => (
                        <li key={task._id}>
                          {task.description} ({task.status})
                        </li>
                      ))}
                      {relatedTasks.length > 3 && (
                        <li>Et {relatedTasks.length - 3} autres...</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => handleEdit(resource)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => handleDelete(resource._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResourceManager;
