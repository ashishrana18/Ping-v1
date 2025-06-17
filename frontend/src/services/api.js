// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://ping-v1.onrender.com/api",
  withCredentials: true // Important for sending HTTP-only cookies
});

export default api;
