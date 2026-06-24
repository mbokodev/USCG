import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
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
import { AdsService } from './ads.service';
import {
  CreateAdDto,
  UpdateAdDto,
  ValidateAdDto,
  QueryAdsDto,
  AdPublicResponseDto,
  AdFullResponseDto,
  AdsListResponseDto,
} from './dto';
import { Public, Roles, CurrentUser } from '../auth/decorators';
import { RolesGuard, IsSellerGuard } from '../auth/guards';

@ApiTags('ads')
@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  // =========================================================================
  // ENDPOINTS PUBLICS
  // =========================================================================

  @Get()
  @Public()
  @SkipThrottle()
  @ApiOperation({
    summary: 'Liste des annonces (public)',
    description: 'Récupère les annonces approuvées. Location masquée.',
  })
  @ApiResponse({ status: 200, type: AdsListResponseDto })
  async findAllPublic(@Query() query: QueryAdsDto): Promise<AdsListResponseDto> {
    return this.adsService.findAllPublic(query);
  }

  @Get('detail/:id')
  @Public()
  @SkipThrottle()
  @ApiOperation({
    summary: "Détail d'une annonce (public)",
    description: 'Récupère une annonce approuvée. Location masquée.',
  })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: AdPublicResponseDto })
  @ApiResponse({ status: 404, description: 'Annonce non trouvée' })
  async findOnePublic(@Param('id') id: string): Promise<AdPublicResponseDto> {
    return this.adsService.findOnePublic(id);
  }

  // =========================================================================
  // ENDPOINTS SELLER (isSeller=true)
  // =========================================================================

  @Post()
  @UseGuards(IsSellerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Créer une annonce (SELLER)',
    description: 'Crée une nouvelle annonce. Status initial: PENDING.',
  })
  @ApiResponse({ status: 201, type: AdFullResponseDto })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 403, description: 'Accès refusé - SELLER requis' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAdDto,
  ): Promise<AdFullResponseDto> {
    return this.adsService.create(userId, dto);
  }

  @Get('my-ads')
  @UseGuards(IsSellerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Mes annonces (SELLER)',
    description: 'Liste les annonces du vendeur connecté.',
  })
  @ApiResponse({ status: 200, type: AdsListResponseDto })
  async findMyAds(
    @CurrentUser('id') userId: string,
    @Query() query: QueryAdsDto,
  ): Promise<AdsListResponseDto> {
    return this.adsService.findMyAds(userId, query);
  }

  @Get('my-ads/:id')
  @UseGuards(IsSellerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: "Détail de mon annonce (SELLER)",
    description: 'Récupère une de mes annonces avec location.',
  })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: AdFullResponseDto })
  @ApiResponse({ status: 404, description: 'Annonce non trouvée' })
  async findMyAd(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ): Promise<AdFullResponseDto> {
    return this.adsService.findOne(id, userId, userRole);
  }

  @Patch(':id')
  @UseGuards(IsSellerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Modifier mon annonce (SELLER)',
    description: 'Modifie une annonce. Remet en PENDING si était refusée.',
  })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: AdFullResponseDto })
  @ApiResponse({ status: 403, description: 'Non propriétaire' })
  @ApiResponse({ status: 404, description: 'Annonce non trouvée' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateAdDto,
  ): Promise<AdFullResponseDto> {
    return this.adsService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Supprimer une annonce',
    description: 'SELLER peut supprimer ses annonces, OPERATOR/ADMIN toutes.',
  })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Annonce supprimée' })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Annonce non trouvée' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ): Promise<{ message: string }> {
    return this.adsService.remove(id, userId, userRole);
  }

  // =========================================================================
  // ENDPOINTS OPERATOR/SUPER_ADMIN
  // =========================================================================

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Toutes les annonces (ADMIN)',
    description: 'Liste toutes les annonces avec filtres (status, categorie, recherche).',
  })
  @ApiResponse({ status: 200, type: AdsListResponseDto })
  async findAll(@Query() query: QueryAdsDto): Promise<AdsListResponseDto> {
    return this.adsService.findAll(query);
  }

  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Annonces en attente (OPERATOR/ADMIN)',
    description: 'Liste les annonces en attente de validation.',
  })
  @ApiResponse({ status: 200, type: AdsListResponseDto })
  async findPending(@Query() query: QueryAdsDto): Promise<AdsListResponseDto> {
    return this.adsService.findPending(query);
  }

  @Get('admin/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: "Détail annonce (OPERATOR/ADMIN)",
    description: 'Récupère une annonce avec location complète.',
  })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: AdFullResponseDto })
  @ApiResponse({ status: 404, description: 'Annonce non trouvée' })
  async findOneAdmin(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ): Promise<AdFullResponseDto> {
    return this.adsService.findOne(id, userId, userRole);
  }

  @Patch(':id/validate')
  @UseGuards(RolesGuard)
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Valider/Refuser une annonce (OPERATOR/ADMIN)',
    description: 'Change le statut: APPROVED, REJECTED ou MODIFICATION_REQUESTED.',
  })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: AdFullResponseDto })
  @ApiResponse({ status: 400, description: 'Raison requise pour refus' })
  @ApiResponse({ status: 404, description: 'Annonce non trouvée' })
  async validate(
    @Param('id') id: string,
    @CurrentUser('id') validatorId: string,
    @Body() dto: ValidateAdDto,
  ): Promise<AdFullResponseDto> {
    return this.adsService.validate(id, validatorId, dto);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Statistiques dashboard (OPERATOR/ADMIN)',
    description: 'Récupère les statistiques globales pour le dashboard.',
  })
  async getGlobalStats() {
    return this.adsService.getAdminStats();
  }

  @Get('my-stats')
  @UseGuards(IsSellerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Mes statistiques (SELLER)',
    description: 'Récupère les statistiques de mes annonces.',
  })
  async getMyStats(@CurrentUser('id') userId: string) {
    return this.adsService.getStats(userId);
  }
}
