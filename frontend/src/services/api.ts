import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // This points to your Spring Boot backend
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;