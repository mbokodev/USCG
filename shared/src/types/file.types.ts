/**
 * File type enum
 */
export enum FileType {
  IMAGE = "IMAGE",
  DOCUMENT = "DOCUMENT",
}

/**
 * Base file interface
 */
export interface IFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  type: FileType;
  isDefault?: boolean;
  adId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
