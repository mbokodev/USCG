import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma';
import { RegisterDto, LoginDto } from './dto';
import { Role } from '@prisma/client';
import type { CookieOptions } from 'express';
import { ERROR_MESSAGES } from '../common/constants/error-messages';
import { AuthMapper } from './mappers';

export interface UserPayload {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isSeller: boolean;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: UserPayload;
  tokens: Tokens;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // Durées d'expiration en millisecondes
  get accessTokenMaxAge(): number {
    return 15 * 60 * 1000; // 15 minutes (Sécurité Niveau 2)
  }

  get refreshTokenMaxAge(): number {
    return 30 * 24 * 60 * 60 * 1000; // 30 jours
  }

  getCookieOptions(maxAge: number): CookieOptions {
    return {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax', // lax pour compatibilité cross-origin
      maxAge,
      path: '/',
    };
  }

  async register(dto: RegisterDto): Promise<AuthResult> {
    if (!dto.acceptTerms) {
      throw new BadRequestException(ERROR_MESSAGES.CGU_REQUIRED);
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException(ERROR_MESSAGES.EMAIL_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        role: Role.BUYER,
        isSeller: false,
        termsAcceptedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isSeller: true,
      },
    });

    const tokens = await this.generateTokens(user);

    return { user, tokens };
  }

  async login(
    dto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    if (!user.isActive) {
      throw new UnauthorizedException(ERROR_MESSAGES.ACCOUNT_DISABLED);
    }

    // Historique de connexion uniquement pour OPERATOR et SUPER_ADMIN
    if (user.role === Role.OPERATOR || user.role === Role.SUPER_ADMIN) {
      await this.prisma.loginHistory.create({
        data: {
          userId: user.id,
          ipAddress: ipAddress || 'unknown',
          userAgent: userAgent,
        },
      });
    }

    const tokens = await this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      isSeller: user.isSeller,
    });

    return AuthMapper.toAuthResult(user, tokens);
  }

  /**
   * Login pour Admin Panel (vendeurs, operators, super_admin)
   * Refuse l'accès aux BUYER sans statut vendeur
   */
  async loginAdmin(
    dto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    if (!user.isActive) {
      throw new UnauthorizedException(ERROR_MESSAGES.ACCOUNT_DISABLED);
    }

    // Vérifier accès au panel admin
    const hasAdminAccess =
      user.role === Role.SUPER_ADMIN ||
      user.role === Role.OPERATOR ||
      user.isSeller === true;

    if (!hasAdminAccess) {
      throw new ForbiddenException(ERROR_MESSAGES.ADMIN_ACCESS_DENIED);
    }

    // Historique de connexion pour OPERATOR et SUPER_ADMIN
    if (user.role === Role.OPERATOR || user.role === Role.SUPER_ADMIN) {
      await this.prisma.loginHistory.create({
        data: {
          userId: user.id,
          ipAddress: ipAddress || 'unknown',
          userAgent: userAgent,
        },
      });
    }

    const tokens = await this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      isSeller: user.isSeller,
    });

    return AuthMapper.toAuthResult(user, tokens);
  }

  async refreshTokens(userId: string): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        isSeller: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    if (!user.isActive) {
      throw new UnauthorizedException(ERROR_MESSAGES.ACCOUNT_DISABLED);
    }

    return this.generateTokens(user);
  }

  async generateTokens(user: {
    id: string;
    email: string;
    role: Role;
    isSeller: boolean;
  }): Promise<Tokens> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      isSeller: user.isSeller,
    };

    const accessTokenExpiresIn =
      this.configService.get<string>('JWT_EXPIRES_IN') || '15m';
    const refreshTokenExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '30d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: accessTokenExpiresIn,
      } as any),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshTokenExpiresIn,
      } as any),
    ]);

    return { accessToken, refreshToken };
  }
}