/**
 * Utilitaires pour les requêtes paginées
 */

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationConfig {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Extraire et valider les paramètres de pagination
 */
export function getPaginationParams(
  query: PaginationParams,
  defaultLimit = 20,
  maxLimit = 100,
): PaginationConfig {
  const page = Math.max(1, query.page || 1);
  const limit = Math.min(Math.max(1, query.limit || defaultLimit), maxLimit);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Construire un filtre de recherche textuelle sur plusieurs champs
 */
export function buildSearchFilter(
  search: string | undefined,
  fields: string[],
): Record<string, unknown> | undefined {
  if (!search || !search.trim()) {
    return undefined;
  }

  return {
    OR: fields.map((field) => ({
      [field]: { contains: search.trim(), mode: 'insensitive' },
    })),
  };
}

/**
 * Construire un objet where en filtrant les valeurs undefined
 */
export function buildWhereClause<T extends Record<string, unknown>>(
  filters: T,
): Partial<T> {
  const where: Partial<T> = {};

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      (where as Record<string, unknown>)[key] = value;
    }
  }

  return where;
}
