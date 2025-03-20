require('dotenv').config(); // This will load the .env file
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const cors = require("cors");
const RouterProject = require("./routes/projects");
const routerResource = require("./routes/resources");
const routerTask = require("./routes/tasks");

const PORT = process.env.PORT || 5001; // Use the port from .env or default to 5001
const MONGODB_URI = process.env.MONGODB_URI; // Get the MongoDB URI from .env

app.use(cors()); // Enabling CORS for all routes
app.use(express.json()); // For parsing JSON bodies

// Correct usage of app.use() with routes
app.use("/project", RouterProject); // Using RouterProject for the /project route
app.use("/resource", routerResource); // Using routerResource for the /resource route
app.use("/Task", routerTask); // Using routerTask for the /Task route

// Connecting to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Error connecting to MongoDB: ', err));

// Starting the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
