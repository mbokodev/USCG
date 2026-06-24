/**
 * User types shared between admin-panel and marketplace
 */

/**
 * User roles in the system
 */
export enum UserRole {
  BUYER = "BUYER",
  OPERATOR = "OPERATOR",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

/**
 * Base user interface (full database model)
 */
export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: UserRole;
  isSeller: boolean;
  isActive: boolean;
  preferredLanguage?: string | null;
  termsAcceptedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * User for authentication context (JWT payload)
 */
export interface IAuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: UserRole;
  isSeller: boolean;
  mustChangePassword: boolean;
}

/**
 * User profile response (for /users/me)
 */
export interface IUserProfile extends IUser {}

/**
 * User list item (for admin lists)
 */
export interface IUserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isSeller: boolean;
  isActive: boolean;
  createdAt: string;
}

/**
 * User info in seller requests
 */
export interface ISellerRequestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
}

/**
 * Query params for users list
 */
export interface IUserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isSeller?: boolean;
  isActive?: boolean;
}

/**
 * DTO for creating an operator (SUPER_ADMIN only)
 * @deprecated Use ICreateStaffDto instead
 */
export interface ICreateOperatorDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

/**
 * DTO for creating staff (OPERATOR or ADMIN)
 * - ADMIN can only create OPERATOR
 * - SUPER_ADMIN can create OPERATOR and ADMIN
 */
export interface ICreateStaffDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole.OPERATOR | UserRole.ADMIN;
}

/**
 * Query params for staff list
 */
export interface IStaffQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * DTO for updating user profile
 */
export interface IUpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  preferredLanguage?: string;
}
