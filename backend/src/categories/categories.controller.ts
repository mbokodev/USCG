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
  ApiQuery,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Role } from '@prisma/client';
import { CategoriesService } from './categories.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  QueryCategoriesDto,
  CategoryResponseDto,
  CategoriesListResponseDto,
} from './dto';
import { Public, Roles } from '../auth/decorators';
import { RolesGuard } from '../auth/guards';

@ApiTags('categories')
@Controller('categories')
@SkipThrottle()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Liste des catégories',
    description: 'Récupère la liste paginée des catégories. Accessible publiquement.',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste récupérée avec succès',
    type: CategoriesListResponseDto,
  })
  async findAll(@Query() query: QueryCategoriesDto): Promise<CategoriesListResponseDto> {
    return this.categoriesService.findAll(query);
  }

  @Get('active')
  @Public()
  @ApiOperation({
    summary: 'Catégories actives avec sous-catégories',
    description:
      'Récupère toutes les catégories actives avec leurs sous-catégories. Idéal pour les menus de navigation.',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste récupérée avec succès',
    type: [CategoryResponseDto],
  })
  async findAllActive(): Promise<CategoryResponseDto[]> {
    return this.categoriesService.findAllActive();
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({
    summary: 'Catégorie par slug',
    description: 'Récupère une catégorie par son slug. Accessible publiquement.',
  })
  @ApiParam({ name: 'slug', description: 'Slug de la catégorie', example: 'immobilier' })
  @ApiQuery({
    name: 'includeSubCategories',
    required: false,
    type: Boolean,
    description: 'Inclure les sous-catégories',
  })
  @ApiResponse({
    status: 200,
    description: 'Catégorie récupérée avec succès',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Catégorie non trouvée' })
  async findBySlug(
    @Param('slug') slug: string,
    @Query('includeSubCategories') includeSubCategories?: string,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.findBySlug(
      slug,
      includeSubCategories === 'true',
    );
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Détail d\'une catégorie',
    description: 'Récupère une catégorie par son ID. Accessible publiquement.',
  })
  @ApiParam({ name: 'id', description: 'ID de la catégorie' })
  @ApiQuery({
    name: 'includeSubCategories',
    required: false,
    type: Boolean,
    description: 'Inclure les sous-catégories',
  })
  @ApiResponse({
    status: 200,
    description: 'Catégorie récupérée avec succès',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Catégorie non trouvée' })
  async findOne(
    @Param('id') id: string,
    @Query('includeSubCategories') includeSubCategories?: string,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.findOne(id, includeSubCategories === 'true');
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Créer une catégorie',
    description: 'Crée une nouvelle catégorie. Réservé aux SUPER_ADMIN.',
  })
  @ApiResponse({
    status: 201,
    description: 'Catégorie créée avec succès',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - SUPER_ADMIN requis' })
  @ApiResponse({ status: 409, description: 'Nom ou slug déjà utilisé' })
  async create(@Body() dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    return this.categoriesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Modifier une catégorie',
    description: 'Modifie une catégorie existante. Réservé aux SUPER_ADMIN.',
  })
  @ApiParam({ name: 'id', description: 'ID de la catégorie' })
  @ApiResponse({
    status: 200,
    description: 'Catégorie modifiée avec succès',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - SUPER_ADMIN requis' })
  @ApiResponse({ status: 404, description: 'Catégorie non trouvée' })
  @ApiResponse({ status: 409, description: 'Nom ou slug déjà utilisé' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Supprimer une catégorie',
    description:
      'Supprime une catégorie. Impossible si des annonces y sont liées. Les sous-catégories seront supprimées en cascade. Réservé aux SUPER_ADMIN.',
  })
  @ApiParam({ name: 'id', description: 'ID de la catégorie' })
  @ApiResponse({
    status: 200,
    description: 'Catégorie supprimée avec succès',
  })
  @ApiResponse({ status: 400, description: 'Impossible de supprimer - annonces liées' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - SUPER_ADMIN requis' })
  @ApiResponse({ status: 404, description: 'Catégorie non trouvée' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.categoriesService.remove(id);
  }
}
