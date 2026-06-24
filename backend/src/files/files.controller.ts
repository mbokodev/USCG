import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Param,
  Body,
  Req,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  Res,
  StreamableFile,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { FilesService } from './files.service';
import { UploadFileDto, LinkFileToAdDto, FileResponseDto, UploadResponseDto, DeleteFileResponseDto } from './dto';
import { IsSellerGuard } from '../auth';
import { Public } from '../auth/decorators/public.decorator';
import { UseGuards } from '@nestjs/common';

@ApiTags('Files')
@Controller('files')
@SkipThrottle({ short: true, medium: true, long: true })
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  /**
   * Upload une image (utilisateur authentifié)
   * Note: Tous les utilisateurs peuvent uploader (ex: logo demande vendeur)
   * Les images ne sont pas liées à des annonces tant que /link n'est pas appelé
   */
  @Post('upload/image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo
    }),
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload une image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image (jpeg, png, webp, gif - max 5 Mo)',
        },
        adId: {
          type: 'string',
          description: 'ID de l\'annonce (optionnel)',
        },
        isDefault: {
          type: 'boolean',
          description: 'Définir comme image principale (optionnel)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, type: UploadResponseDto })
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
    @Body() dto: UploadFileDto,
    @Req() req: any,
  ): Promise<UploadResponseDto> {
    const uploadedFile = await this.filesService.uploadImage(
      file,
      req.user.id,
      dto.adId,
      dto.isDefault,
    );
    return {
      message: 'Image uploadée avec succès',
      file: uploadedFile,
    };
  }

  /**
   * Upload un document PDF (SELLER uniquement) - Phase 2
   */
  @Post('upload/document')
  @UseGuards(IsSellerGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mo
    }),
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload un document PDF (SELLER) - Phase 2' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Document (pdf - max 10 Mo)',
        },
        adId: {
          type: 'string',
          description: 'ID de l\'annonce (optionnel)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, type: UploadResponseDto })
  async uploadDocument(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
    @Body() dto: UploadFileDto,
    @Req() req: any,
  ): Promise<UploadResponseDto> {
    const uploadedFile = await this.filesService.uploadDocument(
      file,
      req.user.id,
      dto.adId,
    );
    return {
      message: 'Document uploadé avec succès',
      file: uploadedFile,
    };
  }

  /**
   * Associer un fichier à une annonce
   */
  @Post(':id/link')
  @UseGuards(IsSellerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Associer un fichier à une annonce (SELLER)' })
  @ApiParam({ name: 'id', description: 'ID du fichier' })
  @ApiResponse({ status: 200, type: FileResponseDto })
  async linkToAd(
    @Param('id') id: string,
    @Body() dto: LinkFileToAdDto,
    @Req() req: any,
  ): Promise<FileResponseDto> {
    return this.filesService.linkToAd(id, dto.adId, req.user.id);
  }

  /**
   * Servir un fichier (public)
   */
  @Get(':folder/:filename')
  @Public()
  @ApiOperation({ summary: 'Récupérer un fichier (public)' })
  @ApiParam({ name: 'folder', enum: ['images', 'documents'] })
  @ApiParam({ name: 'filename', description: 'Nom du fichier' })
  serveFile(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ): StreamableFile {
    // Valider le dossier (sécurité)
    const allowedFolders = ['images', 'documents'];
    if (!allowedFolders.includes(folder)) {
      throw new BadRequestException('Dossier invalide');
    }

    // Protéger contre les attaques de traversée de répertoire
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw new BadRequestException('Nom de fichier invalide');
    }

    const filePath = path.join(process.cwd(), 'uploads', folder, filename);

    // Vérifier que le fichier existe
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Fichier non trouvé');
    }

    // Déterminer le type MIME
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
    };
    const mimeType = mimeTypes[ext] || 'application/octet-stream';

    res.set({
      'Content-Type': mimeType,
      'Cache-Control': 'public, max-age=31536000', // 1 an
    });

    const file = fs.createReadStream(filePath);
    return new StreamableFile(file);
  }

  /**
   * Fichiers d'une annonce (public pour annonces approuvées)
   */
  @Get('ad/:adId')
  @Public()
  @ApiOperation({ summary: 'Liste des fichiers d\'une annonce (public)' })
  @ApiParam({ name: 'adId', description: 'ID de l\'annonce' })
  async findByAd(@Param('adId') adId: string) {
    return this.filesService.findByAd(adId);
  }

  /**
   * Mes fichiers non associés (SELLER)
   */
  @Get('my-files')
  @UseGuards(IsSellerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mes fichiers non associés à une annonce (SELLER)' })
  async findMyFiles(@Req() req: any) {
    return this.filesService.findMyFiles(req.user.id);
  }

  /**
   * Détail d'un fichier
   */
  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Détail d\'un fichier' })
  @ApiParam({ name: 'id', description: 'ID du fichier' })
  @ApiResponse({ status: 200, type: FileResponseDto })
  async findOne(@Param('id') id: string): Promise<FileResponseDto> {
    return this.filesService.findOne(id);
  }

  /**
   * Définir une image comme image par défaut d'une annonce (SELLER)
   */
  @Patch(':id/set-default')
  @UseGuards(IsSellerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Définir comme image par défaut (SELLER)' })
  @ApiParam({ name: 'id', description: 'ID du fichier' })
  @ApiResponse({ status: 200, type: DeleteFileResponseDto })
  async setDefault(
    @Param('id') id: string,
    @Body() dto: LinkFileToAdDto,
    @Req() req: any,
  ): Promise<{ message: string }> {
    return this.filesService.setDefaultImage(id, dto.adId, req.user.id);
  }

  /**
   * Retirer le statut d'image par défaut (SELLER)
   */
  @Patch(':id/unset-default')
  @UseGuards(IsSellerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retirer le statut d\'image par défaut (SELLER)' })
  @ApiParam({ name: 'id', description: 'ID du fichier' })
  @ApiResponse({ status: 200, type: DeleteFileResponseDto })
  async unsetDefault(
    @Param('id') id: string,
    @Body() dto: LinkFileToAdDto,
    @Req() req: any,
  ): Promise<{ message: string }> {
    return this.filesService.unsetDefaultImage(id, dto.adId, req.user.id);
  }

  /**
   * Supprimer un fichier
   */
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un fichier (owner ou OPERATOR)' })
  @ApiParam({ name: 'id', description: 'ID du fichier' })
  @ApiResponse({ status: 200, type: DeleteFileResponseDto })
  async remove(@Param('id') id: string, @Req() req: any): Promise<DeleteFileResponseDto> {
    return this.filesService.remove(id, req.user.id, req.user.role);
  }
}
