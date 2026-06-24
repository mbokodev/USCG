/**
 * Mapper pour le module Users
 */

import type { User } from '@prisma/client';
import type { UserProfileResponseDto, UserListItemDto } from '../dto';

// Type pour User pour le profil (sans password)
type UserProfile = Omit<User, 'password'>;

// Type pour User dans une liste
type UserListItem = Pick<
  User,
  'id' | 'email' | 'firstName' | 'lastName' | 'role' | 'isSeller' | 'isActive' | 'createdAt'
>;

export const UserMapper = {
  /**
   * Convertit un User en UserProfileResponseDto
   */
  toProfile(user: UserProfile): UserProfileResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      isSeller: user.isSeller,
      termsAcceptedAt: user.termsAcceptedAt,
      preferredLanguage: user.preferredLanguage,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      mustChangePassword: user.mustChangePassword,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },

  /**
   * Convertit un User en UserListItemDto
   */
  toListItem(user: UserListItem): UserListItemDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isSeller: user.isSeller,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  },

  /**
   * Convertit une liste d'Users en UserListItemDto[]
   */
  toListItems(users: UserListItem[]): UserListItemDto[] {
    return users.map((user) => this.toListItem(user));
  },
};
