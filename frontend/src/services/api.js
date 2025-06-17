// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  withCredentials: true // Important for sending HTTP-only cookies
});

export default api;
