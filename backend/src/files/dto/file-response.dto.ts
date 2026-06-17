import { ApiProperty } from '@nestjs/swagger';
import { FileType } from '@prisma/client';

export class FileResponseDto {
  @ApiProperty({ description: 'ID du fichier' })
  id: string;

  @ApiProperty({ description: 'Nom du fichier généré' })
  filename: string;

  @ApiProperty({ description: 'Nom original du fichier' })
  originalName: string;

  @ApiProperty({ description: 'Chemin relatif du fichier' })
  path: string;

  @ApiProperty({ description: 'URL publique du fichier' })
  url: string;

  @ApiProperty({ description: 'Type MIME du fichier' })
  mimeType: string;

  @ApiProperty({ description: 'Taille en bytes' })
  size: number;

  @ApiProperty({ enum: FileType, description: 'Type de fichier' })
  type: FileType;

  @ApiProperty({ description: 'Image par défaut de l\'annonce' })
  isDefault: boolean;

  @ApiProperty({ description: 'ID de l\'annonce associée (optionnel)' })
  adId: string | null;

  @ApiProperty({ description: 'Date de création' })
  createdAt: Date;
}

export class UploadResponseDto {
  @ApiProperty({ description: 'Message de succès' })
  message: string;

  @ApiProperty({ type: FileResponseDto })
  file: FileResponseDto;
}

export class FilesListResponseDto {
  @ApiProperty({ type: [FileResponseDto] })
  data: FileResponseDto[];

  @ApiProperty({ description: 'Nombre total de fichiers' })
  total: number;
}

export class DeleteFileResponseDto {
  @ApiProperty({ description: 'Message de succès' })
  message: string;
}
