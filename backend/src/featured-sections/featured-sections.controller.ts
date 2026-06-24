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
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { FeaturedSectionsService } from './featured-sections.service';
import { CreateFeaturedSectionDto, UpdateFeaturedSectionDto } from './dto';

@ApiTags('featured-sections')
@Controller('featured-sections')
@SkipThrottle({ short: true, medium: true, long: true })
export class FeaturedSectionsController {
  constructor(
    private readonly featuredSectionsService: FeaturedSectionsService,
  ) {}

  // ============================================
  // Routes publiques
  // ============================================

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Liste publique des sections actives avec leurs annonces',
  })
  @ApiResponse({ status: 200 })
  findAllPublic() {
    return this.featuredSectionsService.getAllSectionsWithAds();
  }

  @Get(':id/ads')
  @Public()
  @ApiOperation({
    summary: "Annonces d'une section avec filtres disponibles",
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    description: 'Valeur du filtre (ville, sous-catégorie, ou option variante)',
  })
  @ApiResponse({ status: 200 })
  getSectionAds(@Param('id') id: string, @Query('filter') filter?: string) {
    return this.featuredSectionsService.getSectionAds(id, filter);
  }

  // ============================================
  // Routes admin (SUPER_ADMIN)
  // ============================================

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Liste admin de toutes les sections' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200 })
  findAllAdmin(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.featuredSectionsService.findAllAdmin({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Détail d'une section" })
  @ApiResponse({ status: 200 })
  findOne(@Param('id') id: string) {
    return this.featuredSectionsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer une section' })
  @ApiResponse({ status: 201 })
  create(@Body() dto: CreateFeaturedSectionDto) {
    return this.featuredSectionsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modifier une section' })
  @ApiResponse({ status: 200 })
  update(@Param('id') id: string, @Body() dto: UpdateFeaturedSectionDto) {
    return this.featuredSectionsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer une section' })
  @ApiResponse({ status: 200 })
  remove(@Param('id') id: string) {
    return this.featuredSectionsService.remove(id);
  }
}
