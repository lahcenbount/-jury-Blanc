require('dotenv').config(); 
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const cors = require("cors");
const RouterProject = require("./routes/projects");
const routerResource = require("./routes/resources");
const routerTask = require("./routes/tasks");

const PORT = process.env.PORT || 5001; 
const MONGODB_URI = process.env.MONGODB_URI; 
app.use(cors()); 
app.use(express.json());

app.use("/project", RouterProject); 
app.use("/resource", routerResource); 
app.use("/Task", routerTask); 

// Connecting to MongoDB
mongoose.connect(MONGODB_URI, {
 
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Error connecting to MongoDB: ', err));


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
