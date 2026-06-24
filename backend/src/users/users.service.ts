import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma';
import { MailService } from '../mail/mail.service';
import { Role } from '@prisma/client';
import {
  UpdateProfileDto,
  CreateOperatorDto,
  CreateStaffDto,
  QueryUsersDto,
  QueryStaffDto,
  UserProfileResponseDto,
  UsersListResponseDto,
} from './dto';
import { UserMapper } from './mappers';
import { toPaginatedResult } from '../common/mappers';

// Select sans le password pour éviter de le fetcher inutilement
const userSelectWithoutPassword = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  role: true,
  isSeller: true,
  isActive: true,
  termsAcceptedAt: true,
  preferredLanguage: true,
  emailVerified: true,
  emailVerificationToken: true,
  emailVerificationExpires: true,
  passwordResetToken: true,
  passwordResetExpires: true,
  mustChangePassword: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async getProfile(userId: string): Promise<UserProfileResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: userSelectWithoutPassword,
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return UserMapper.toProfile(user);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UserProfileResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const updateData: Record<string, unknown> = {};

    if (dto.firstName) updateData.firstName = dto.firstName;
    if (dto.lastName) updateData.lastName = dto.lastName;
    if (dto.phone !== undefined) updateData.phone = dto.phone;

    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: userSelectWithoutPassword,
    });

    return UserMapper.toProfile(updatedUser);
  }

  async findAll(query: QueryUsersDto): Promise<UsersListResponseDto> {
    const { page = 1, limit = 20, role, isSeller, isActive, search } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    // Filtrer par rôle (par défaut BUYER uniquement pour les listes)
    if (role) {
      where.role = role;
    }

    if (isSeller !== undefined) {
      where.isSeller = isSeller;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: userSelectWithoutPassword,
      }),
      this.prisma.user.count({ where }),
    ]);

    return toPaginatedResult(UserMapper.toListItems(users), total, page, limit);
  }

  async findOne(id: string): Promise<UserProfileResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSelectWithoutPassword,
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return UserMapper.toProfile(user);
  }

  async createOperator(
    dto: CreateOperatorDto,
  ): Promise<UserProfileResponseDto> {
    // Vérifier si l'email existe déjà
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const operator = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        role: Role.OPERATOR,
        isSeller: false,
        termsAcceptedAt: new Date(),
        isActive: true,
      },
      select: userSelectWithoutPassword,
    });

    return UserMapper.toProfile(operator);
  }

  async remove(
    id: string,
    currentUserId: string,
  ): Promise<{ message: string }> {
    // Vérifier que l'utilisateur ne se supprime pas lui-même
    if (id === currentUserId) {
      throw new ForbiddenException(
        'Vous ne pouvez pas supprimer votre propre compte',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Empêcher la suppression d'un SUPER_ADMIN
    if (user.role === Role.SUPER_ADMIN) {
      throw new ForbiddenException('Impossible de supprimer un SUPER_ADMIN');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'Utilisateur supprimé avec succès' };
  }

  // ============================================================================
  // STAFF MANAGEMENT (OPERATOR + ADMIN)
  // ============================================================================

  /**
   * Liste le staff selon le rôle du demandeur
   * - ADMIN voit seulement les OPERATOR
   * - SUPER_ADMIN voit les OPERATOR et les ADMIN
   */
  async findStaff(
    callerRole: Role,
    query: QueryStaffDto,
  ): Promise<UsersListResponseDto> {
    const { page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;

    // Déterminer les rôles visibles selon le demandeur
    const allowedRoles =
      callerRole === Role.SUPER_ADMIN
        ? [Role.ADMIN, Role.OPERATOR]
        : [Role.OPERATOR]; // ADMIN ne voit que les OPERATOR

    const where: Record<string, unknown> = {
      role: { in: allowedRoles },
    };

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: userSelectWithoutPassword,
      }),
      this.prisma.user.count({ where }),
    ]);

    return toPaginatedResult(UserMapper.toListItems(users), total, page, limit);
  }

  /**
   * Créer un membre du staff
   * - ADMIN peut créer seulement des OPERATOR
   * - SUPER_ADMIN peut créer des OPERATOR et des ADMIN
   * - Pour OPERATOR: force le changement de mot de passe + envoi email avec credentials
   */
  async createStaff(
    callerRole: Role,
    dto: CreateStaffDto,
  ): Promise<UserProfileResponseDto> {
    // ADMIN ne peut créer que des OPERATOR (le DTO n'accepte que OPERATOR ou ADMIN)
    if (callerRole === Role.ADMIN && dto.role === 'ADMIN') {
      throw new ForbiddenException(
        "Un ADMIN ne peut pas créer d'autres ADMIN",
      );
    }

    // Vérifier si l'email existe déjà
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // OPERATOR doit changer son mot de passe à la première connexion
    const isOperator = dto.role === 'OPERATOR';

    const staff = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        role: dto.role,
        isSeller: false,
        termsAcceptedAt: new Date(),
        isActive: true,
        mustChangePassword: isOperator, // true pour OPERATOR, false pour ADMIN
      },
      select: userSelectWithoutPassword,
    });

    // Envoyer email avec credentials pour OPERATOR seulement
    if (isOperator) {
      await this.mailService.sendOperatorCredentialsEmail(
        dto.email,
        dto.firstName,
        dto.password, // mot de passe en clair pour l'email
      );
    }

    return UserMapper.toProfile(staff);
  }

  /**
   * Supprimer un membre du staff
   * - Réservé au SUPER_ADMIN uniquement
   * - Peut supprimer OPERATOR et ADMIN
   * - Ne peut pas supprimer un autre SUPER_ADMIN
   */
  async deleteStaff(
    callerId: string,
    _callerRole: Role,
    targetId: string,
  ): Promise<{ message: string }> {
    // Ne peut pas se supprimer soi-même
    if (callerId === targetId) {
      throw new ForbiddenException(
        'Vous ne pouvez pas supprimer votre propre compte',
      );
    }

    const target = await this.prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true, role: true },
    });

    if (!target) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Ne peut pas supprimer un SUPER_ADMIN
    if (target.role === Role.SUPER_ADMIN) {
      throw new ForbiddenException('Impossible de supprimer un SUPER_ADMIN');
    }

    await this.prisma.user.delete({
      where: { id: targetId },
    });

    return { message: 'Membre du staff supprimé avec succès' };
  }

  // ============================================================================
  // BLOCKING / UNBLOCKING USERS
  // ============================================================================

  /**
   * Bloquer un utilisateur (BUYER ou OPERATOR selon permissions)
   * - Empêche la connexion
   * - Si déjà connecté, le refresh token échouera
   */
  async blockUser(
    callerId: string,
    callerRole: Role,
    targetId: string,
  ): Promise<{ message: string }> {
    // Ne peut pas se bloquer soi-même
    if (callerId === targetId) {
      throw new ForbiddenException(
        'Vous ne pouvez pas bloquer votre propre compte',
      );
    }

    const target = await this.prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true, role: true, isActive: true },
    });

    if (!target) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Personne ne peut bloquer un SUPER_ADMIN
    if (target.role === Role.SUPER_ADMIN) {
      throw new ForbiddenException('Impossible de bloquer un SUPER_ADMIN');
    }

    // ADMIN ne peut bloquer que des OPERATOR (pas d'autres ADMIN)
    if (callerRole === Role.ADMIN && target.role === Role.ADMIN) {
      throw new ForbiddenException('Un ADMIN ne peut pas bloquer un autre ADMIN');
    }

    // OPERATOR ne peut bloquer que des BUYER
    if (callerRole === Role.OPERATOR && target.role !== Role.BUYER) {
      throw new ForbiddenException('Un OPERATOR ne peut bloquer que des BUYER');
    }

    if (!target.isActive) {
      throw new ForbiddenException('Cet utilisateur est déjà bloqué');
    }

    await this.prisma.user.update({
      where: { id: targetId },
      data: { isActive: false },
    });

    return { message: 'Utilisateur bloqué avec succès' };
  }

  /**
   * Débloquer un utilisateur
   */
  async unblockUser(
    callerId: string,
    callerRole: Role,
    targetId: string,
  ): Promise<{ message: string }> {
    const target = await this.prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true, role: true, isActive: true },
    });

    if (!target) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Personne ne peut débloquer un SUPER_ADMIN (ne devrait jamais être bloqué)
    if (target.role === Role.SUPER_ADMIN) {
      throw new ForbiddenException('Action non autorisée sur un SUPER_ADMIN');
    }

    // ADMIN ne peut débloquer que des OPERATOR (pas d'autres ADMIN)
    if (callerRole === Role.ADMIN && target.role === Role.ADMIN) {
      throw new ForbiddenException('Un ADMIN ne peut pas débloquer un autre ADMIN');
    }

    // OPERATOR ne peut débloquer que des BUYER
    if (callerRole === Role.OPERATOR && target.role !== Role.BUYER) {
      throw new ForbiddenException('Un OPERATOR ne peut débloquer que des BUYER');
    }

    if (target.isActive) {
      throw new ForbiddenException('Cet utilisateur n\'est pas bloqué');
    }

    await this.prisma.user.update({
      where: { id: targetId },
      data: { isActive: true },
    });

    return { message: 'Utilisateur débloqué avec succès' };
  }
}
