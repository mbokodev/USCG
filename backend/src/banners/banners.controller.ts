import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Role } from '@prisma/client';
import { BannersService } from './banners.service';
import {
  CreateBannerDto,
  UpdateBannerDto,
  BannerResponseDto,
} from './dto';
import { Public, Roles } from '../auth/decorators';
import { RolesGuard } from '../auth/guards';

@ApiTags('banners')
@Controller('banners')
@SkipThrottle({ short: true, medium: true, long: true })
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Liste des banners actifs',
    description:
      'Récupère la liste des banners actifs pour le carousel. Retourne un banner par défaut si aucun n\'est configuré.',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste récupérée avec succès',
    type: [BannerResponseDto],
  })
  async findAllActive(): Promise<BannerResponseDto[]> {
    return this.bannersService.findAllActive();
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Liste complète des banners (admin)',
    description:
      'Récupère tous les banners (actifs et inactifs). Réservé aux SUPER_ADMIN.',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste récupérée avec succès',
    type: [BannerResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - SUPER_ADMIN requis' })
  async findAll(): Promise<BannerResponseDto[]> {
    return this.bannersService.findAll();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Détail d\'un banner',
    description: 'Récupère un banner par son ID. Réservé aux SUPER_ADMIN.',
  })
  @ApiParam({ name: 'id', description: 'ID du banner' })
  @ApiResponse({
    status: 200,
    description: 'Banner récupéré avec succès',
    type: BannerResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - SUPER_ADMIN requis' })
  @ApiResponse({ status: 404, description: 'Banner non trouvé' })
  async findOne(@Param('id') id: string): Promise<BannerResponseDto> {
    return this.bannersService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Créer un banner',
    description: 'Crée un nouveau banner pour le carousel. Réservé aux SUPER_ADMIN.',
  })
  @ApiResponse({
    status: 201,
    description: 'Banner créé avec succès',
    type: BannerResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - SUPER_ADMIN requis' })
  async create(@Body() dto: CreateBannerDto): Promise<BannerResponseDto> {
    return this.bannersService.create(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Modifier un banner',
    description: 'Modifie un banner existant. Réservé aux SUPER_ADMIN.',
  })
  @ApiParam({ name: 'id', description: 'ID du banner' })
  @ApiResponse({
    status: 200,
    description: 'Banner modifié avec succès',
    type: BannerResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - SUPER_ADMIN requis' })
  @ApiResponse({ status: 404, description: 'Banner non trouvé' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBannerDto,
  ): Promise<BannerResponseDto> {
    return this.bannersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Supprimer un banner',
    description: 'Supprime un banner. Réservé aux SUPER_ADMIN.',
  })
  @ApiParam({ name: 'id', description: 'ID du banner' })
  @ApiResponse({
    status: 200,
    description: 'Banner supprimé avec succès',
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - SUPER_ADMIN requis' })
  @ApiResponse({ status: 404, description: 'Banner non trouvé' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.bannersService.remove(id);
  }
}
