// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  withCredentials: true // Important for sending HTTP-only cookies
});

api.interceptors.request.use((config) => {
  // Add auth token to every request, before sending
  const token = localStorage.getItem("accessToken");
  if(token)  config.headers.Authorization = `Bearer ${token}`;
  
  return config;
});

export default api;
