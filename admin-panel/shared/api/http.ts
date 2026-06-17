import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const API_URL = `${API_BASE}/api`;

// Sécurité Niveau 2 : Les tokens sont dans des cookies httpOnly
// Le backend lit les tokens directement depuis les cookies
// Pas besoin d'interceptor Authorization

export const http = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Envoie les cookies httpOnly automatiquement
});

// Response interceptor - fallback si le middleware n'a pas pu refresh
http.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 = session expirée (le middleware gère normalement le refresh)
    // Redirect vers login comme fallback
    if (error.response?.status === 401 && typeof window !== "undefined") {
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default http;
