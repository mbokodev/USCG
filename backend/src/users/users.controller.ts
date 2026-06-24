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
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import {
  UpdateProfileDto,
  CreateOperatorDto,
  CreateStaffDto,
  QueryUsersDto,
  QueryStaffDto,
  UserProfileResponseDto,
  UsersListResponseDto,
} from './dto';
import { CurrentUser, Roles } from '../auth/decorators';
import { RolesGuard } from '../auth/guards';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Mon profil',
    description: "Récupère le profil de l'utilisateur connecté.",
  })
  @ApiResponse({
    status: 200,
    description: 'Profil récupéré avec succès',
    type: UserProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async getProfile(
    @CurrentUser('id') userId: string,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.getProfile(userId);
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Modifier mon profil',
    description:
      "Modifie le profil de l'utilisateur connecté (nom, prénom, téléphone, mot de passe).",
  })
  @ApiResponse({
    status: 200,
    description: 'Profil modifié avec succès',
    type: UserProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.updateProfile(userId, dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Liste des utilisateurs',
    description:
      'Récupère la liste paginée des utilisateurs. Réservé aux OPERATOR, ADMIN et SUPER_ADMIN.',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste récupérée avec succès',
    type: UsersListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  async findAll(@Query() query: QueryUsersDto): Promise<UsersListResponseDto> {
    return this.usersService.findAll(query);
  }

  // ============================================================================
  // STAFF MANAGEMENT (OPERATOR + ADMIN)
  // ============================================================================

  @Get('staff')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Liste du staff',
    description:
      'Récupère la liste paginée du staff. ADMIN voit les OPERATOR, SUPER_ADMIN voit OPERATOR + ADMIN.',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste récupérée avec succès',
    type: UsersListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  async getStaff(
    @CurrentUser('role') callerRole: Role,
    @Query() query: QueryStaffDto,
  ): Promise<UsersListResponseDto> {
    return this.usersService.findStaff(callerRole, query);
  }

  @Post('staff')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Créer un membre du staff',
    description:
      'Crée un OPERATOR ou ADMIN. ADMIN peut créer OPERATOR seulement. SUPER_ADMIN peut créer les deux.',
  })
  @ApiResponse({
    status: 201,
    description: 'Staff créé avec succès',
    type: UserProfileResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé ou action non autorisée' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  async createStaff(
    @CurrentUser('role') callerRole: Role,
    @Body() dto: CreateStaffDto,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.createStaff(callerRole, dto);
  }

  @Delete('staff/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Supprimer un membre du staff',
    description:
      'Supprime un OPERATOR ou ADMIN. Réservé au SUPER_ADMIN uniquement.',
  })
  @ApiParam({ name: 'id', description: 'ID du membre du staff à supprimer' })
  @ApiResponse({
    status: 200,
    description: 'Staff supprimé avec succès',
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé ou action non autorisée' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async deleteStaff(
    @Param('id') id: string,
    @CurrentUser('id') callerId: string,
    @CurrentUser('role') callerRole: Role,
  ): Promise<{ message: string }> {
    return this.usersService.deleteStaff(callerId, callerRole, id);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: "Détail d'un utilisateur",
    description:
      "Récupère le détail d'un utilisateur par son ID. Réservé aux OPERATOR, ADMIN et SUPER_ADMIN.",
  })
  @ApiParam({ name: 'id', description: "ID de l'utilisateur" })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur récupéré avec succès',
    type: UserProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async findOne(@Param('id') id: string): Promise<UserProfileResponseDto> {
    return this.usersService.findOne(id);
  }

  @Post('operator')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Créer un OPERATOR',
    description:
      'Crée un nouveau compte OPERATOR. Réservé aux SUPER_ADMIN uniquement.',
  })
  @ApiResponse({
    status: 201,
    description: 'OPERATOR créé avec succès',
    type: UserProfileResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - SUPER_ADMIN requis' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  async createOperator(
    @Body() dto: CreateOperatorDto,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.createOperator(dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Supprimer un utilisateur',
    description:
      "Supprime un utilisateur par son ID. Réservé aux SUPER_ADMIN. Impossible de supprimer un SUPER_ADMIN ou soi-même.",
  })
  @ApiParam({ name: 'id', description: "ID de l'utilisateur à supprimer" })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur supprimé avec succès',
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé ou action interdite' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') currentUserId: string,
  ): Promise<{ message: string }> {
    return this.usersService.remove(id, currentUserId);
  }

  // ============================================================================
  // BLOCKING / UNBLOCKING USERS
  // ============================================================================

  @Patch(':id/block')
  @UseGuards(RolesGuard)
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Bloquer un utilisateur',
    description:
      "Bloque un utilisateur (isActive=false). L'utilisateur ne pourra plus se connecter. OPERATOR peut bloquer BUYER, ADMIN peut bloquer OPERATOR, SUPER_ADMIN peut bloquer tous sauf SUPER_ADMIN.",
  })
  @ApiParam({ name: 'id', description: "ID de l'utilisateur à bloquer" })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur bloqué avec succès',
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé ou action interdite' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async blockUser(
    @Param('id') id: string,
    @CurrentUser('id') callerId: string,
    @CurrentUser('role') callerRole: Role,
  ): Promise<{ message: string }> {
    return this.usersService.blockUser(callerId, callerRole, id);
  }

  @Patch(':id/unblock')
  @UseGuards(RolesGuard)
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Débloquer un utilisateur',
    description:
      "Débloque un utilisateur (isActive=true). L'utilisateur pourra à nouveau se connecter. Mêmes restrictions de rôle que pour le blocage.",
  })
  @ApiParam({ name: 'id', description: "ID de l'utilisateur à débloquer" })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur débloqué avec succès',
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé ou action interdite' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async unblockUser(
    @Param('id') id: string,
    @CurrentUser('id') callerId: string,
    @CurrentUser('role') callerRole: Role,
  ): Promise<{ message: string }> {
    return this.usersService.unblockUser(callerId, callerRole, id);
  }
}