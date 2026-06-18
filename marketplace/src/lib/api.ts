import axios from "axios";

// API instance pour le vrai backend USCG
// API_URL pour runtime (SSR), fallback NEXT_PUBLIC_API_URL pour build-time
const API_BASE = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
