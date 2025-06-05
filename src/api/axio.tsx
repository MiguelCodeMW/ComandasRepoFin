import axios from "axios";

// Crear una instancia de Axios con configuración base
const api = axios.create({
  baseURL: "http://localhost:8000/api", // Cambia esta URL según tu entorno
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export default api;
