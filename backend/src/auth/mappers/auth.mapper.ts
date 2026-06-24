/**
 * Mapper pour le module Auth
 * Convertit les entités Prisma en DTOs
 */

import type { User } from '@prisma/client';
import type { UserResponseDto, LoginResponseDto, RefreshResponseDto } from '../dto';
import type { Tokens, UserPayload, AuthResult } from '../auth.service';

// Type pour un User partiel (select Prisma)
type UserBasic = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role' | 'isSeller' | 'mustChangePassword'>;

export const AuthMapper = {
  /**
   * Convertit un User en UserResponseDto
   */
  toUserResponse(user: UserBasic): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isSeller: user.isSeller,
      mustChangePassword: user.mustChangePassword,
    };
  },

  /**
   * Convertit un User en UserPayload (interface interne)
   */
  toUserPayload(user: UserBasic): UserPayload {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isSeller: user.isSeller,
      mustChangePassword: user.mustChangePassword,
    };
  },

  /**
   * Crée un AuthResult à partir d'un User et des tokens
   */
  toAuthResult(user: UserBasic, tokens: Tokens): AuthResult {
    return {
      user: this.toUserPayload(user),
      tokens,
    };
  },

  /**
   * Convertit en LoginResponseDto pour le controller
   */
  toLoginResponse(user: UserBasic, tokens: Tokens, expiresIn: number): LoginResponseDto {
    return {
      user: this.toUserResponse(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn,
    };
  },

  /**
   * Convertit en RefreshResponseDto pour le controller
   */
  toRefreshResponse(tokens: Tokens, expiresIn: number): RefreshResponseDto {
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn,
    };
  },
};
