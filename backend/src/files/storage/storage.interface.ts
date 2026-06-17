/**
 * Interface abstraite pour le stockage de fichiers
 * Permet de changer facilement de provider (local → S3, Cloudinary, etc.)
 */
export interface StorageProvider {
  /**
   * Upload un fichier
   * @param file - Fichier multer
   * @param folder - Dossier de destination (images, documents)
   * @returns Informations du fichier uploadé
   */
  upload(
    file: Express.Multer.File,
    folder: 'images' | 'documents',
  ): Promise<StoredFile>;

  /**
   * Supprime un fichier
   * @param filename - Nom du fichier à supprimer
   * @param folder - Dossier du fichier
   */
  delete(filename: string, folder: 'images' | 'documents'): Promise<void>;

  /**
   * Vérifie si un fichier existe
   * @param filename - Nom du fichier
   * @param folder - Dossier du fichier
   */
  exists(filename: string, folder: 'images' | 'documents'): Promise<boolean>;

  /**
   * Retourne l'URL publique d'un fichier
   * @param filename - Nom du fichier
   * @param folder - Dossier du fichier
   */
  getUrl(filename: string, folder: 'images' | 'documents'): string;
}

export interface StoredFile {
  filename: string;
  originalName: string;
  path: string;
  url: string;
  mimeType: string;
  size: number;
}

export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';
