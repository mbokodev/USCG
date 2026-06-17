import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { SellerRequestsService } from './seller-requests.service';
import {
  CreateSellerRequestDto,
  ValidateSellerRequestDto,
  QuerySellerRequestsDto,
  SellerRequestResponseDto,
  SellerRequestsListResponseDto,
} from './dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Seller Requests')
@Controller('seller-requests')
@ApiBearerAuth()
export class SellerRequestsController {
  constructor(private readonly sellerRequestsService: SellerRequestsService) {}

  /**
   * Créer une demande vendeur (BUYER uniquement)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer une demande vendeur (BUYER)',
    description: 'Permet à un BUYER de soumettre une demande pour devenir vendeur',
  })
  @ApiResponse({ status: 201, type: SellerRequestResponseDto })
  @ApiResponse({ status: 400, description: 'Déjà vendeur ou demande en cours' })
  @ApiResponse({ status: 409, description: 'Demande déjà existante' })
  async create(
    @Body() dto: CreateSellerRequestDto,
    @Req() req: any,
  ): Promise<SellerRequestResponseDto> {
    return this.sellerRequestsService.create(req.user.id, dto);
  }

  /**
   * Ma demande vendeur (BUYER)
   */
  @Get('me')
  @ApiOperation({
    summary: 'Ma demande vendeur',
    description: 'Récupère la demande vendeur de l\'utilisateur connecté',
  })
  @ApiResponse({ status: 200, type: SellerRequestResponseDto })
  async findMyRequest(@Req() req: any): Promise<SellerRequestResponseDto | null> {
    return this.sellerRequestsService.findMyRequest(req.user.id);
  }

  /**
   * Liste toutes les demandes (OPERATOR/SUPER_ADMIN)
   */
  @Get()
  @Roles(Role.OPERATOR, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Liste toutes les demandes (OPERATOR/SUPER_ADMIN)',
    description: 'Récupère la liste de toutes les demandes vendeur avec pagination et filtres',
  })
  @ApiResponse({ status: 200, type: SellerRequestsListResponseDto })
  async findAll(
    @Query() query: QuerySellerRequestsDto,
  ): Promise<SellerRequestsListResponseDto> {
    return this.sellerRequestsService.findAll(query);
  }

  /**
   * Demandes en attente (OPERATOR/SUPER_ADMIN)
   */
  @Get('pending')
  @Roles(Role.OPERATOR, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Demandes en attente (OPERATOR/SUPER_ADMIN)',
    description: 'Récupère uniquement les demandes en attente de validation',
  })
  @ApiResponse({ status: 200, type: SellerRequestsListResponseDto })
  async findPending(
    @Query() query: QuerySellerRequestsDto,
  ): Promise<SellerRequestsListResponseDto> {
    return this.sellerRequestsService.findPending(query);
  }

  /**
   * Statistiques des demandes (OPERATOR/SUPER_ADMIN)
   */
  @Get('stats')
  @Roles(Role.OPERATOR, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Statistiques des demandes (OPERATOR/SUPER_ADMIN)',
  })
  async getStats() {
    return this.sellerRequestsService.getStats();
  }

  /**
   * Demande vendeur par userId (OPERATOR/SUPER_ADMIN)
   */
  @Get('user/:userId')
  @Roles(Role.OPERATOR, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Demande vendeur par userId (OPERATOR/SUPER_ADMIN)',
    description: 'Récupère la demande vendeur d\'un utilisateur spécifique',
  })
  @ApiParam({ name: 'userId', description: 'ID de l\'utilisateur' })
  @ApiResponse({ status: 200, type: SellerRequestResponseDto })
  @ApiResponse({ status: 404, description: 'Demande non trouvée' })
  async findByUserId(@Param('userId') userId: string): Promise<SellerRequestResponseDto> {
    return this.sellerRequestsService.findByUserId(userId);
  }

  /**
   * Détail d'une demande (OPERATOR/SUPER_ADMIN)
   */
  @Get(':id')
  @Roles(Role.OPERATOR, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Détail d\'une demande (OPERATOR/SUPER_ADMIN)',
  })
  @ApiParam({ name: 'id', description: 'ID de la demande' })
  @ApiResponse({ status: 200, type: SellerRequestResponseDto })
  @ApiResponse({ status: 404, description: 'Demande non trouvée' })
  async findOne(@Param('id') id: string): Promise<SellerRequestResponseDto> {
    return this.sellerRequestsService.findOne(id);
  }

  /**
   * Valider/Refuser une demande (OPERATOR/SUPER_ADMIN)
   */
  @Patch(':id/validate')
  @Roles(Role.OPERATOR, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Valider ou refuser une demande (OPERATOR/SUPER_ADMIN)',
    description: 'Approuve ou refuse une demande vendeur. Si approuvée, l\'utilisateur devient vendeur.',
  })
  @ApiParam({ name: 'id', description: 'ID de la demande' })
  @ApiResponse({ status: 200, type: SellerRequestResponseDto })
  @ApiResponse({ status: 400, description: 'Demande déjà traitée ou raison manquante' })
  @ApiResponse({ status: 404, description: 'Demande non trouvée' })
  async validate(
    @Param('id') id: string,
    @Body() dto: ValidateSellerRequestDto,
    @Req() req: any,
  ): Promise<SellerRequestResponseDto> {
    return this.sellerRequestsService.validate(id, req.user.id, dto);
  }
}
