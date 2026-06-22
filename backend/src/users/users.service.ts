import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma';
import { Role } from '@prisma/client';
import {
  UpdateProfileDto,
  CreateOperatorDto,
  QueryUsersDto,
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
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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
}
