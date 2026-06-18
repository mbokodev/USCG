/**
 * Shared file utilities for building file URLs
 */

export interface FileUrlInput {
  filename?: string;
  path?: string;
  type?: string;
  mimeType?: string;
}

/**
 * Get the full URL for a file
 * Works with both admin-panel and marketplace
 *
 * @param file - File object with filename or path
 * @param baseUrl - API base URL (defaults to NEXT_PUBLIC_API_URL or localhost)
 * @returns Full URL to access the file
 */
export function getFileUrl(
  file: FileUrlInput | null | undefined,
  baseUrl?: string
): string {
  if (!file) return "";

  const apiUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  // Determine folder based on type or mimeType (case-insensitive)
  const isImage = file.type?.toUpperCase() === "IMAGE" || file.mimeType?.startsWith("image/");
  const folder = isImage ? "images" : "documents";

  // Use filename if available, otherwise extract from path
  let filename = file.filename;
  if (!filename && file.path) {
    // path format: "uploads/images/xxx.jpg" -> extract "xxx.jpg"
    const parts = file.path.split("/");
    filename = parts[parts.length - 1];
  }

  if (!filename) return "";

  return `${apiUrl}/api/files/${folder}/${filename}`;
}

/**
 * Get the default image from a list of files
 */
export function getDefaultImage<T extends { isDefault?: boolean }>(
  files: T[] | null | undefined
): T | undefined {
  if (!files || files.length === 0) return undefined;
  return files.find((f) => f.isDefault) || files[0];
}

/**
 * Get the thumbnail URL from a list of files
 * Returns fallback image if no files available
 */
export function getThumbnailUrl(
  files: FileUrlInput[] | null | undefined,
  fallbackImage = "/assets/images/products/placeholder.png",
  baseUrl?: string
): string {
  const defaultFile = getDefaultImage(files as Array<FileUrlInput & { isDefault?: boolean }>);
  if (!defaultFile) return fallbackImage;
  return getFileUrl(defaultFile, baseUrl) || fallbackImage;
}

/**
 * Get all image URLs from a list of files
 */
export function getImageUrls(
  files: FileUrlInput[] | null | undefined,
  baseUrl?: string
): string[] {
  if (!files || files.length === 0) return [];
  return files
    .map((f) => getFileUrl(f, baseUrl))
    .filter((url) => url !== "");
}

/**
 * Build file URL from a simple path string
 * Useful when backend returns path directly (e.g., "images/xxx.jpg")
 *
 * @param path - Path string (e.g., "images/xxx.jpg" or "uploads/images/xxx.jpg")
 * @param baseUrl - API base URL
 * @returns Full URL to access the file
 */
export function getFileUrlFromPath(
  path: string | null | undefined,
  baseUrl?: string
): string {
  if (!path) return "";

  const apiUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  // Remove "uploads/" prefix if present
  const cleanPath = path.replace(/^uploads\//, "");

  return `${apiUrl}/api/files/${cleanPath}`;
}
