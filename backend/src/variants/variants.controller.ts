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
import { VariantsService } from './variants.service';
import {
  CreateVariantDto,
  UpdateVariantDto,
  QueryVariantsDto,
  VariantResponseDto,
  VariantsListResponseDto,
} from './dto';
import { Public, Roles } from '../auth/decorators';
import { RolesGuard } from '../auth/guards';

@ApiTags('variants')
@Controller('variants')
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Liste des variantes' })
  @ApiResponse({ status: 200, type: VariantsListResponseDto })
  async findAll(@Query() query: QueryVariantsDto): Promise<VariantsListResponseDto> {
    return this.variantsService.findAll(query);
  }

  @Get('by-category/:categoryId')
  @Public()
  @ApiOperation({ summary: 'Variantes par catégorie (pour formulaire annonce)' })
  @ApiParam({ name: 'categoryId', description: 'ID de la catégorie' })
  @ApiQuery({ name: 'subCategoryId', required: false })
  @ApiResponse({ status: 200, type: [VariantResponseDto] })
  async findByCategory(
    @Param('categoryId') categoryId: string,
    @Query('subCategoryId') subCategoryId?: string,
  ): Promise<VariantResponseDto[]> {
    return this.variantsService.findByCategory(categoryId, subCategoryId);
  }

  @Get('filterable/:categoryId')
  @Public()
  @ApiOperation({ summary: 'Variantes filtrables (pour filtres recherche)' })
  @ApiParam({ name: 'categoryId', description: 'ID de la catégorie' })
  @ApiQuery({ name: 'subCategoryId', required: false })
  @ApiResponse({ status: 200, type: [VariantResponseDto] })
  async findFilterableByCategory(
    @Param('categoryId') categoryId: string,
    @Query('subCategoryId') subCategoryId?: string,
  ): Promise<VariantResponseDto[]> {
    return this.variantsService.findFilterableByCategory(categoryId, subCategoryId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Détail d\'une variante' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: VariantResponseDto })
  @ApiResponse({ status: 404, description: 'Variante non trouvée' })
  async findOne(@Param('id') id: string): Promise<VariantResponseDto> {
    return this.variantsService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Créer une variante (SUPER_ADMIN)' })
  @ApiResponse({ status: 201, type: VariantResponseDto })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 403, description: 'SUPER_ADMIN requis' })
  async create(@Body() dto: CreateVariantDto): Promise<VariantResponseDto> {
    return this.variantsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Modifier une variante (SUPER_ADMIN)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: VariantResponseDto })
  @ApiResponse({ status: 404, description: 'Variante non trouvée' })
  async update(@Param('id') id: string, @Body() dto: UpdateVariantDto): Promise<VariantResponseDto> {
    return this.variantsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Supprimer une variante (SUPER_ADMIN)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Variante supprimée' })
  @ApiResponse({ status: 400, description: 'Annonces liées' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.variantsService.remove(id);
  }
}
