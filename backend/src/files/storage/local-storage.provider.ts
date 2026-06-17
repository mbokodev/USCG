import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { StorageProvider, StoredFile } from './storage.interface';

/**
 * Provider de stockage local (système de fichiers)
 * Phase 1: Stockage local simple
 * Phase 2+: Peut être remplacé par S3Provider, CloudinaryProvider, etc.
 */
@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    // Dossier de base pour les uploads (relatif à la racine du projet)
    this.uploadDir = path.resolve(process.cwd(), 'uploads');
    // URL de base pour accéder aux fichiers
    this.baseUrl = this.configService.get<string>('API_URL', 'http://localhost:3000');
  }

  async upload(
    file: Express.Multer.File,
    folder: 'images' | 'documents',
  ): Promise<StoredFile> {
    // Générer un nom de fichier unique
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    const folderPath = path.join(this.uploadDir, folder);
    const filePath = path.join(folderPath, filename);

    // Créer le dossier si nécessaire
    await fs.mkdir(folderPath, { recursive: true });

    // Écrire le fichier
    await fs.writeFile(filePath, file.buffer);

    this.logger.log(`File uploaded: ${filename} to ${folder}`);

    return {
      filename,
      originalName: file.originalname,
      path: `${folder}/${filename}`,
      url: this.getUrl(filename, folder),
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  async delete(filename: string, folder: 'images' | 'documents'): Promise<void> {
    const filePath = path.join(this.uploadDir, folder, filename);

    try {
      await fs.unlink(filePath);
      this.logger.log(`File deleted: ${filename} from ${folder}`);
    } catch (error) {
      // Ignorer si le fichier n'existe pas
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
      this.logger.warn(`File not found for deletion: ${filename}`);
    }
  }

  async exists(filename: string, folder: 'images' | 'documents'): Promise<boolean> {
    const filePath = path.join(this.uploadDir, folder, filename);

    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  getUrl(filename: string, folder: 'images' | 'documents'): string {
    return `${this.baseUrl}/files/${folder}/${filename}`;
  }
}
