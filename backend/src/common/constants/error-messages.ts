export const ERROR_MESSAGES = {
  // Auth
  CGU_REQUIRED: "L'acceptation des CGU est obligatoire",
  EMAIL_EXISTS: "Cet email est déjà utilisé",
  INVALID_CREDENTIALS: "Email ou mot de passe incorrect",
  ACCOUNT_DISABLED: "Votre compte a été désactivé",
  SESSION_EXPIRED: "Session expirée, veuillez vous reconnecter",
  FORBIDDEN: "Accès non autorisé",
  ADMIN_ACCESS_DENIED: "Accès au panel admin non autorisé. Votre demande vendeur est en attente de validation.",

  // Users
  USER_NOT_FOUND: "Utilisateur non trouvé",
  CANNOT_DELETE_SELF: "Vous ne pouvez pas supprimer votre propre compte",
  CANNOT_DELETE_SUPER_ADMIN: "Impossible de supprimer un SUPER_ADMIN",

  // Seller requests
  ALREADY_SELLER: "Vous êtes déjà vendeur",
  REQUEST_PENDING: "Vous avez déjà une demande en cours",
  REQUEST_NOT_FOUND: "Demande non trouvée",
  REQUEST_ALREADY_PROCESSED: "Cette demande a déjà été traitée",
  REJECTION_REASON_REQUIRED: "Une raison est requise pour le refus",

  // Ads
  AD_NOT_FOUND: "Annonce non trouvée",
  AD_ALREADY_PROCESSED: "Cette annonce a déjà été traitée",
  AD_NOT_OWNER: "Vous ne pouvez pas modifier cette annonce",

  // Categories
  CATEGORY_NOT_FOUND: "Catégorie non trouvée",
  CATEGORY_NAME_EXISTS: "Une catégorie avec ce nom existe déjà",
  CATEGORY_HAS_CHILDREN:
    "Impossible de supprimer une catégorie avec des sous-catégories",
  SUBCATEGORY_INVALID: "Sous-catégorie invalide pour cette catégorie",

  // Files
  FILE_INVALID_TYPE: "Type de fichier non autorisé",
  FILE_TOO_LARGE: "Le fichier est trop volumineux",

  // Generic
  SERVER_ERROR: "Une erreur est survenue, veuillez réessayer",
  NOT_FOUND: "Ressource introuvable",
  BAD_REQUEST: "Données invalides",
} as const;
