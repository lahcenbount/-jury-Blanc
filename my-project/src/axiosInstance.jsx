import axios from 'axios';

// Create an Axios instance with a base URL
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001/', // Replace this with the appropriate backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
