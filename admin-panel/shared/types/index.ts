export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Backend returns flat pagination fields (not nested in meta)
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export type Locale = "fr" | "en";

export interface I18nText {
  fr: string;
  en: string;
}

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
