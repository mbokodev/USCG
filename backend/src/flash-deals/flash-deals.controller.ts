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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { FlashDealsService } from './flash-deals.service';
import {
  CreateFlashDealDto,
  UpdateFlashDealDto,
  QueryFlashDealsDto,
  FlashDealResponseDto,
  FlashDealsListResponseDto,
} from './dto';
import { AdListItemDto } from '../ads/dto';

@ApiTags('flash-deals')
@Controller('flash-deals')
@SkipThrottle({ short: true, medium: true, long: true })
export class FlashDealsController {
  constructor(private readonly flashDealsService: FlashDealsService) {}

  // ============================================
  // Routes publiques
  // ============================================

  @Get()
  @Public()
  @ApiOperation({ summary: 'Liste publique des flash deals actifs' })
  @ApiResponse({ status: 200, type: FlashDealsListResponseDto })
  findAllPublic(@Query() query: QueryFlashDealsDto): Promise<FlashDealsListResponseDto> {
    return this.flashDealsService.findAllPublic(query);
  }

  // ============================================
  // Routes admin (SUPER_ADMIN)
  // ============================================

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Liste admin de tous les flash deals' })
  @ApiResponse({ status: 200, type: FlashDealsListResponseDto })
  findAllAdmin(@Query() query: QueryFlashDealsDto): Promise<FlashDealsListResponseDto> {
    return this.flashDealsService.findAllAdmin(query);
  }

  @Get('eligible-ads')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Liste des annonces éligibles pour devenir Flash Deals' })
  @ApiQuery({ name: 'search', required: false, description: 'Recherche par titre' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limite de résultats', type: Number })
  @ApiResponse({ status: 200, type: [AdListItemDto] })
  getEligibleAds(
    @Query('search') search?: string,
    @Query('limit') limit?: string,
  ): Promise<AdListItemDto[]> {
    return this.flashDealsService.getEligibleAds(search, limit ? parseInt(limit, 10) : 20);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Détail d'un flash deal" })
  @ApiResponse({ status: 200, type: FlashDealResponseDto })
  findOne(@Param('id') id: string): Promise<FlashDealResponseDto> {
    return this.flashDealsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un flash deal' })
  @ApiResponse({ status: 201, type: FlashDealResponseDto })
  create(@Body() dto: CreateFlashDealDto): Promise<FlashDealResponseDto> {
    return this.flashDealsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modifier un flash deal' })
  @ApiResponse({ status: 200, type: FlashDealResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFlashDealDto,
  ): Promise<FlashDealResponseDto> {
    return this.flashDealsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un flash deal' })
  @ApiResponse({ status: 200 })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.flashDealsService.remove(id);
  }
}
