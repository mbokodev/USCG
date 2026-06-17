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
import { Role } from '@prisma/client';
import { SubCategoriesService } from './subcategories.service';
import {
  CreateSubCategoryDto,
  UpdateSubCategoryDto,
  QuerySubCategoriesDto,
  SubCategoryResponseDto,
  SubCategoriesListResponseDto,
} from './dto';
import { Public, Roles } from '../auth/decorators';
import { RolesGuard } from '../auth/guards';

@ApiTags('subcategories')
@Controller('subcategories')
export class SubCategoriesController {
  constructor(private readonly subCategoriesService: SubCategoriesService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Liste des sous-catégories',
    description:
      'Récupère la liste paginée des sous-catégories. Accessible publiquement.',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste récupérée avec succès',
    type: SubCategoriesListResponseDto,
  })
  async findAll(
    @Query() query: QuerySubCategoriesDto,
  ): Promise<SubCategoriesListResponseDto> {
    return this.subCategoriesService.findAll(query);
  }

  @Get('by-category/:categoryId')
  @Public()
  @ApiOperation({
    summary: 'Sous-catégories par catégorie',
    description:
      'Récupère toutes les sous-catégories actives d\'une catégorie. Accessible publiquement.',
  })
  @ApiParam({ name: 'categoryId', description: 'ID de la catégorie' })
  @ApiResponse({
    status: 200,
    description: 'Liste récupérée avec succès',
    type: [SubCategoryResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Catégorie non trouvée' })
  async findByCategory(
    @Param('categoryId') categoryId: string,
  ): Promise<SubCategoryResponseDto[]> {
    return this.subCategoriesService.findByCategory(categoryId);
  }

  @Get('slug/:categorySlug/:subCategorySlug')
  @Public()
  @ApiOperation({
    summary: 'Sous-catégorie par slugs',
    description:
      'Récupère une sous-catégorie par le slug de sa catégorie parente et son propre slug. Accessible publiquement.',
  })
  @ApiParam({
    name: 'categorySlug',
    description: 'Slug de la catégorie parente',
    example: 'immobilier',
  })
  @ApiParam({
    name: 'subCategorySlug',
    description: 'Slug de la sous-catégorie',
    example: 'appartements',
  })
  @ApiResponse({
    status: 200,
    description: 'Sous-catégorie récupérée avec succès',
    type: SubCategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Catégorie ou sous-catégorie non trouvée' })
  async findBySlug(
    @Param('categorySlug') categorySlug: string,
    @Param('subCategorySlug') subCategorySlug: string,
  ): Promise<SubCategoryResponseDto> {
    return this.subCategoriesService.findBySlug(categorySlug, subCategorySlug);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Détail d\'une sous-catégorie',
    description: 'Récupère une sous-catégorie par son ID. Accessible publiquement.',
  })
  @ApiParam({ name: 'id', description: 'ID de la sous-catégorie' })
  @ApiQuery({
    name: 'includeCategory',
    required: false,
    type: Boolean,
    description: 'Inclure les informations de la catégorie parente',
  })
  @ApiResponse({
    status: 200,
    description: 'Sous-catégorie récupérée avec succès',
    type: SubCategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Sous-catégorie non trouvée' })
  async findOne(
    @Param('id') id: string,
    @Query('includeCategory') includeCategory?: string,
  ): Promise<SubCategoryResponseDto> {
    return this.subCategoriesService.findOne(id, includeCategory === 'true');
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Créer une sous-catégorie',
    description: 'Crée une nouvelle sous-catégorie. Réservé aux SUPER_ADMIN.',
  })
  @ApiResponse({
    status: 201,
    description: 'Sous-catégorie créée avec succès',
    type: SubCategoryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - SUPER_ADMIN requis' })
  @ApiResponse({ status: 404, description: 'Catégorie parente non trouvée' })
  @ApiResponse({ status: 409, description: 'Slug déjà utilisé dans cette catégorie' })
  async create(@Body() dto: CreateSubCategoryDto): Promise<SubCategoryResponseDto> {
    return this.subCategoriesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Modifier une sous-catégorie',
    description: 'Modifie une sous-catégorie existante. Réservé aux SUPER_ADMIN.',
  })
  @ApiParam({ name: 'id', description: 'ID de la sous-catégorie' })
  @ApiResponse({
    status: 200,
    description: 'Sous-catégorie modifiée avec succès',
    type: SubCategoryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - SUPER_ADMIN requis' })
  @ApiResponse({ status: 404, description: 'Sous-catégorie ou catégorie parente non trouvée' })
  @ApiResponse({ status: 409, description: 'Slug déjà utilisé dans cette catégorie' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSubCategoryDto,
  ): Promise<SubCategoryResponseDto> {
    return this.subCategoriesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Supprimer une sous-catégorie',
    description:
      'Supprime une sous-catégorie. Impossible si des annonces y sont liées. Réservé aux SUPER_ADMIN.',
  })
  @ApiParam({ name: 'id', description: 'ID de la sous-catégorie' })
  @ApiResponse({
    status: 200,
    description: 'Sous-catégorie supprimée avec succès',
  })
  @ApiResponse({ status: 400, description: 'Impossible de supprimer - annonces liées' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - SUPER_ADMIN requis' })
  @ApiResponse({ status: 404, description: 'Sous-catégorie non trouvée' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.subCategoriesService.remove(id);
  }
}
