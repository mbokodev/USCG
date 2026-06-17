/**
 * Utilitaires pour l'autorisation et la vérification de propriété
 */

import { ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';

export interface OwnershipCheckResult {
  isOwner: boolean;
  isAdmin: boolean;
}

/**
 * Vérifier si l'utilisateur est propriétaire ou admin
 * Lance une ForbiddenException si aucun accès autorisé
 */
export function checkOwnership(
  resourceUserId: string,
  currentUserId: string,
  currentUserRole: Role,
  errorMessage = "Vous n'avez pas accès à cette ressource",
): OwnershipCheckResult {
  const isOwner = resourceUserId === currentUserId;
  const isAdmin =
    currentUserRole === Role.OPERATOR || currentUserRole === Role.SUPER_ADMIN;

  if (!isOwner && !isAdmin) {
    throw new ForbiddenException(errorMessage);
  }

  return { isOwner, isAdmin };
}

/**
 * Vérifier si l'utilisateur a un rôle admin (OPERATOR ou SUPER_ADMIN)
 */
export function isAdminRole(role: Role): boolean {
  return role === Role.OPERATOR || role === Role.SUPER_ADMIN;
}

/**
 * Vérifier si l'utilisateur est SUPER_ADMIN
 */
export function isSuperAdmin(role: Role): boolean {
  return role === Role.SUPER_ADMIN;
}

/**
 * Vérifier si l'utilisateur peut accéder à une ressource
 * (soit propriétaire, soit admin)
 */
export function canAccessResource(
  resourceUserId: string,
  currentUserId: string,
  currentUserRole: Role,
): boolean {
  return resourceUserId === currentUserId || isAdminRole(currentUserRole);
}
