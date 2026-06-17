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
  QueryUsersDto,
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
  @Roles(Role.OPERATOR, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Liste des utilisateurs',
    description:
      'Récupère la liste paginée des utilisateurs. Réservé aux OPERATOR et SUPER_ADMIN.',
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

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.OPERATOR, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: "Détail d'un utilisateur",
    description:
      "Récupère le détail d'un utilisateur par son ID. Réservé aux OPERATOR et SUPER_ADMIN.",
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
}