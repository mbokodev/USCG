import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { FileType, Role } from '@prisma/client';
import { STORAGE_PROVIDER } from './storage';
import type { StorageProvider } from './storage';
import { FileResponseDto, FilesListResponseDto } from './dto';
import { FileMapper } from './mappers';

// Types MIME autorisés
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf']; // Phase 2: ajouter Word, Excel

// Tailles maximales (en bytes)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 Mo
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10 Mo (Phase 2)

@Injectable()
export class FilesService {
  constructor(
    private prisma: PrismaService,
    @Inject(STORAGE_PROVIDER) private storage: StorageProvider,
  ) {}

  /**
   * Upload un fichier image
   */
  async uploadImage(
    file: Express.Multer.File,
    userId: string,
    adId?: string,
    isDefault?: boolean,
  ): Promise<FileResponseDto> {
    // Valider le type MIME
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Type de fichier non autorisé. Types acceptés : ${ALLOWED_IMAGE_TYPES.join(', ')}`,
      );
    }

    // Valider la taille
    if (file.size > MAX_IMAGE_SIZE) {
      throw new BadRequestException(
        `Le fichier est trop volumineux. Taille maximale : ${MAX_IMAGE_SIZE / (1024 * 1024)} Mo`,
      );
    }

    // Vérifier l'annonce si fournie
    if (adId) {
      await this.validateAdOwnership(adId, userId);
    }

    // Si isDefault=true, retirer le statut default des autres images de l'annonce
    if (isDefault && adId) {
      await this.prisma.file.updateMany({
        where: { adId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Upload le fichier
    const storedFile = await this.storage.upload(file, 'images');

    // Sauvegarder en base de données
    const fileRecord = await this.prisma.file.create({
      data: {
        filename: storedFile.filename,
        originalName: storedFile.originalName,
        path: storedFile.path,
        url: storedFile.url,
        mimeType: storedFile.mimeType,
        size: storedFile.size,
        type: FileType.IMAGE,
        userId,
        adId: adId || null,
        isDefault: isDefault || false,
      },
    });

    return FileMapper.toResponse(fileRecord);
  }

  /**
   * Upload un document (Phase 2)
   */
  async uploadDocument(
    file: Express.Multer.File,
    userId: string,
    adId?: string,
  ): Promise<FileResponseDto> {
    // Valider le type MIME
    if (!ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Type de fichier non autorisé. Types acceptés : ${ALLOWED_DOCUMENT_TYPES.join(', ')}`,
      );
    }

    // Valider la taille
    if (file.size > MAX_DOCUMENT_SIZE) {
      throw new BadRequestException(
        `Le fichier est trop volumineux. Taille maximale : ${MAX_DOCUMENT_SIZE / (1024 * 1024)} Mo`,
      );
    }

    // Vérifier l'annonce si fournie
    if (adId) {
      await this.validateAdOwnership(adId, userId);
    }

    // Upload le fichier
    const storedFile = await this.storage.upload(file, 'documents');

    // Sauvegarder en base de données
    const fileRecord = await this.prisma.file.create({
      data: {
        filename: storedFile.filename,
        originalName: storedFile.originalName,
        path: storedFile.path,
        url: storedFile.url,
        mimeType: storedFile.mimeType,
        size: storedFile.size,
        type: FileType.DOCUMENT,
        userId,
        adId: adId || null,
      },
    });

    return FileMapper.toResponse(fileRecord);
  }

  /**
   * Associer un fichier à une annonce
   */
  async linkToAd(
    fileId: string,
    adId: string,
    userId: string,
  ): Promise<FileResponseDto> {
    // Vérifier que le fichier appartient à l'utilisateur
    const file = await this.prisma.file.findUnique({ where: { id: fileId } });
    if (!file) {
      throw new NotFoundException('Fichier non trouvé');
    }
    if (file.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez associer que vos propres fichiers');
    }

    // Vérifier que l'annonce appartient à l'utilisateur
    await this.validateAdOwnership(adId, userId);

    // Mettre à jour le fichier
    const updatedFile = await this.prisma.file.update({
      where: { id: fileId },
      data: { adId },
    });

    return FileMapper.toResponse(updatedFile);
  }

  /**
   * Liste des fichiers d'une annonce
   */
  async findByAd(adId: string): Promise<FilesListResponseDto> {
    const files = await this.prisma.file.findMany({
      where: { adId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });

    return {
      data: FileMapper.toResponseList(files),
      total: files.length,
    };
  }

  /**
   * Mes fichiers (non associés à une annonce)
   */
  async findMyFiles(userId: string): Promise<FilesListResponseDto> {
    const files = await this.prisma.file.findMany({
      where: { userId, adId: null },
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: FileMapper.toResponseList(files),
      total: files.length,
    };
  }

  /**
   * Détail d'un fichier
   */
  async findOne(id: string): Promise<FileResponseDto> {
    const file = await this.prisma.file.findUnique({ where: { id } });
    if (!file) {
      throw new NotFoundException('Fichier non trouvé');
    }
    return FileMapper.toResponse(file);
  }

  /**
   * Supprimer un fichier
   */
  async remove(
    id: string,
    userId: string,
    userRole: Role,
  ): Promise<{ message: string }> {
    const file = await this.prisma.file.findUnique({ where: { id } });
    if (!file) {
      throw new NotFoundException('Fichier non trouvé');
    }

    const isOwner = file.userId === userId;
    const isAdmin = userRole === Role.OPERATOR || userRole === Role.SUPER_ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos propres fichiers');
    }

    // Déterminer le dossier
    const folder = file.type === FileType.IMAGE ? 'images' : 'documents';

    // Supprimer le fichier physique
    await this.storage.delete(file.filename, folder);

    // Supprimer de la base de données
    await this.prisma.file.delete({ where: { id } });

    return { message: 'Fichier supprimé avec succès' };
  }

  /**
   * Supprimer tous les fichiers d'une annonce (fichiers physiques + DB)
   * Utilisé lors de la suppression d'une annonce
   */
  async removeByAdId(adId: string): Promise<void> {
    const files = await this.prisma.file.findMany({
      where: { adId },
    });

    // Supprimer les fichiers physiques
    for (const file of files) {
      const folder = file.type === FileType.IMAGE ? 'images' : 'documents';
      try {
        await this.storage.delete(file.filename, folder);
      } catch (error) {
        // Log l'erreur mais continue (le fichier peut déjà être supprimé)
        console.error(`Erreur suppression fichier ${file.filename}:`, error);
      }
    }

    // Supprimer les enregistrements en base (sera fait par cascade aussi, mais on le fait explicitement)
    await this.prisma.file.deleteMany({ where: { adId } });
  }

  /**
   * Définir une image comme image par défaut de l'annonce
   */
  async setDefaultImage(
    fileId: string,
    adId: string,
    userId: string,
  ): Promise<{ message: string }> {
    // Vérifier que le fichier existe
    const file = await this.prisma.file.findUnique({ where: { id: fileId } });
    if (!file) {
      throw new NotFoundException('Fichier non trouvé');
    }

    // Vérifier que le fichier appartient à l'annonce
    if (file.adId !== adId) {
      throw new BadRequestException('Ce fichier n\'appartient pas à cette annonce');
    }

    // Vérifier que l'utilisateur est propriétaire de l'annonce
    await this.validateAdOwnership(adId, userId);

    // Transaction : retirer isDefault des autres images, puis définir la nouvelle
    await this.prisma.$transaction([
      this.prisma.file.updateMany({
        where: { adId, isDefault: true },
        data: { isDefault: false },
      }),
      this.prisma.file.update({
        where: { id: fileId },
        data: { isDefault: true },
      }),
    ]);

    return { message: 'Image définie comme principale' };
  }

  /**
   * Retirer le statut d'image par défaut d'une image
   */
  async unsetDefaultImage(
    fileId: string,
    adId: string,
    userId: string,
  ): Promise<{ message: string }> {
    // Vérifier que le fichier existe
    const file = await this.prisma.file.findUnique({ where: { id: fileId } });
    if (!file) {
      throw new NotFoundException('Fichier non trouvé');
    }

    // Vérifier que le fichier appartient à l'annonce
    if (file.adId !== adId) {
      throw new BadRequestException('Ce fichier n\'appartient pas à cette annonce');
    }

    // Vérifier que l'utilisateur est propriétaire de l'annonce
    await this.validateAdOwnership(adId, userId);

    // Retirer isDefault
    await this.prisma.file.update({
      where: { id: fileId },
      data: { isDefault: false },
    });

    return { message: 'Image principale retirée' };
  }

  /**
   * Vérifier que l'utilisateur est propriétaire de l'annonce
   */
  private async validateAdOwnership(adId: string, userId: string): Promise<void> {
    const ad = await this.prisma.ad.findUnique({ where: { id: adId } });
    if (!ad) {
      throw new NotFoundException('Annonce non trouvée');
    }
    if (ad.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez ajouter des fichiers qu\'à vos propres annonces');
    }
  }
}
