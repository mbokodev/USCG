import { AxiosError } from "axios";

interface ApiErrorResponse {
  message?: string;
}

/**
 * Extrait le message d'erreur de l'API.
 * L'API renvoie toujours un message compréhensible.
 * Fallback uniquement pour les erreurs réseau.
 */
export function getApiErrorMessage(error: unknown): string {
  // Erreur réseau (pas de response du serveur)
  if (error instanceof AxiosError && !error.response) {
    return "Connexion impossible au serveur";
  }

  // Message de l'API
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data as ApiErrorResponse;
    if (data.message) {
      return data.message;
    }
  }

  // Fallback (ne devrait jamais arriver si l'API est correcte)
  return "Une erreur inattendue est survenue";
}
