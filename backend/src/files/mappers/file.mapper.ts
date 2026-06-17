/**
 * Mapper pour le module Files
 */

import type { File } from '@prisma/client';
import type { FileResponseDto } from '../dto';

export const FileMapper = {
  /**
   * Convertit un File en FileResponseDto
   */
  toResponse(file: File, baseUrl: string = ''): FileResponseDto {
    return {
      id: file.id,
      filename: file.filename,
      originalName: file.originalName,
      path: file.path,
      url: `${baseUrl}/${file.path}`,
      mimeType: file.mimeType,
      size: file.size,
      type: file.type,
      isDefault: file.isDefault,
      adId: file.adId,
      createdAt: file.createdAt,
    };
  },

  /**
   * Convertit une liste de Files
   */
  toResponseList(files: File[], baseUrl: string = ''): FileResponseDto[] {
    return files.map((file) => this.toResponse(file, baseUrl));
  },
};
