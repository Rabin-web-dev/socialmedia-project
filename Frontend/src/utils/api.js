import axios from "axios";

const isDev = import.meta.env.MODE === "development";

// const api = axios.create({
// baseURL: import.meta.env.VITE_API_URL || "https://stark-socialmedia.onrender.com/api",
//   withCredentials: true,
// });

const api = axios.create({
  baseURL: isDev
    ? "http://localhost:5000/api" 
    : import.meta.env.VITE_API_URL, 
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;