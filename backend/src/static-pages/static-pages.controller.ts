import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Role } from '@prisma/client';
import { StaticPagesService } from './static-pages.service';
import {
  UpdateTermsDto,
  UpdatePrivacyDto,
  UpdateAboutDto,
  UpdateSellerTermsDto,
  UpdateSellerPrivacyDto,
} from './dto';
import { Public, Roles } from '../auth/decorators';
import { RolesGuard } from '../auth/guards';

@ApiTags('static-pages')
@Controller('static-pages')
@SkipThrottle({ short: true, medium: true, long: true })
export class StaticPagesController {
  constructor(private readonly staticPagesService: StaticPagesService) {}

  // ============================================
  // Terms Page
  // ============================================

  @Get('terms')
  @Public()
  @ApiOperation({
    summary: 'Récupérer les CGU',
    description: 'Récupère le contenu de la page Conditions Générales d\'Utilisation.',
  })
  @ApiResponse({
    status: 200,
    description: 'CGU récupérées avec succès',
  })
  async getTerms() {
    return this.staticPagesService.getTerms();
  }

  @Patch('terms')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Modifier les CGU',
    description: 'Modifie le contenu de la page CGU. Réservé aux SUPER_ADMIN.',
  })
  @ApiResponse({
    status: 200,
    description: 'CGU modifiées avec succès',
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - SUPER_ADMIN requis' })
  async updateTerms(@Body() dto: UpdateTermsDto) {
    return this.staticPagesService.updateTerms(dto);
  }

  // ============================================
  // Privacy Page
  // ============================================

  @Get('privacy')
  @Public()
  @ApiOperation({
    summary: "Récupérer les conditions d'utilisation",
    description: "Récupère le contenu de la page Conditions d'utilisation.",
  })
  @ApiResponse({
    status: 200,
    description: "Conditions d'utilisation récupérées avec succès",
  })
  async getPrivacy() {
    return this.staticPagesService.getPrivacy();
  }

  @Patch('privacy')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: "Modifier les conditions d'utilisation",
    description: "Modifie le contenu des conditions d'utilisation. Réservé aux SUPER_ADMIN.",
  })
  @ApiResponse({
    status: 200,
    description: "Conditions d'utilisation modifiées avec succès",
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - SUPER_ADMIN requis' })
  async updatePrivacy(@Body() dto: UpdatePrivacyDto) {
    return this.staticPagesService.updatePrivacy(dto);
  }

  // ============================================
  // About Page
  // ============================================

  @Get('about')
  @Public()
  @ApiOperation({
    summary: 'Récupérer la page À propos',
    description: 'Récupère le contenu de la page À propos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Page À propos récupérée avec succès',
  })
  async getAbout() {
    return this.staticPagesService.getAbout();
  }

  @Patch('about')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Modifier la page À propos',
    description: 'Modifie le contenu de la page À propos. Réservé aux SUPER_ADMIN.',
  })
  @ApiResponse({
    status: 200,
    description: 'Page À propos modifiée avec succès',
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - SUPER_ADMIN requis' })
  async updateAbout(@Body() dto: UpdateAboutDto) {
    return this.staticPagesService.updateAbout(dto);
  }

  // ============================================
  // Seller Terms Page
  // ============================================

  @Get('seller-terms')
  @Public()
  @ApiOperation({
    summary: 'Récupérer les CGU vendeur',
    description: "Récupère le contenu de la page Conditions Générales d'Utilisation pour les vendeurs.",
  })
  @ApiResponse({
    status: 200,
    description: 'CGU vendeur récupérées avec succès',
  })
  async getSellerTerms() {
    return this.staticPagesService.getSellerTerms();
  }

  @Patch('seller-terms')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Modifier les CGU vendeur',
    description: 'Modifie le contenu de la page CGU vendeur. CREATE: traduit automatiquement. UPDATE: modifie langue source uniquement.',
  })
  @ApiResponse({
    status: 200,
    description: 'CGU vendeur modifiées avec succès',
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - ADMIN/SUPER_ADMIN requis' })
  async updateSellerTerms(@Body() dto: UpdateSellerTermsDto) {
    return this.staticPagesService.updateSellerTerms(dto);
  }

  // ============================================
  // Seller Privacy Page
  // ============================================

  @Get('seller-privacy')
  @Public()
  @ApiOperation({
    summary: 'Récupérer la politique de confidentialité vendeur',
    description: 'Récupère le contenu de la page Politique de confidentialité pour les vendeurs.',
  })
  @ApiResponse({
    status: 200,
    description: 'Politique de confidentialité vendeur récupérée avec succès',
  })
  async getSellerPrivacy() {
    return this.staticPagesService.getSellerPrivacy();
  }

  @Patch('seller-privacy')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Modifier la politique de confidentialité vendeur',
    description: 'Modifie la politique de confidentialité vendeur. CREATE: traduit automatiquement. UPDATE: modifie langue source uniquement.',
  })
  @ApiResponse({
    status: 200,
    description: 'Politique de confidentialité vendeur modifiée avec succès',
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - ADMIN/SUPER_ADMIN requis' })
  async updateSellerPrivacy(@Body() dto: UpdateSellerPrivacyDto) {
    return this.staticPagesService.updateSellerPrivacy(dto);
  }
}
