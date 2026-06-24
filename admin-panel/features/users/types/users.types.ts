/**
 * User types for admin-panel
 * Re-exports shared types and adds admin-panel specific extensions
 */

// Re-export all shared user types
export {
  UserRole,
  type IUser,
  type IAuthUser,
  type IUserProfile,
  type IUserListItem,
  type ISellerRequestUser,
  type IUserQueryParams,
  type ICreateOperatorDto,
  type IUpdateProfileDto,
  type ICreateStaffDto,
  type IStaffQueryParams,
} from "@uscg/shared/types";

// Import shared types for aliasing
import type {
  IUser,
  IUserListItem,
  ICreateOperatorDto,
  IUpdateProfileDto,
  IUserQueryParams,
  ICreateStaffDto,
  IStaffQueryParams,
  UserRole as UserRoleEnum,
} from "@uscg/shared/types";

/**
 * Alias types for backwards compatibility
 */
export type UserRoleType = "BUYER" | "OPERATOR" | "ADMIN" | "SUPER_ADMIN";
export type User = IUser;
export type UserListItem = IUserListItem;
export type CreateOperatorDto = ICreateOperatorDto;
export type CreateStaffDto = ICreateStaffDto;
export type StaffQueryParams = IStaffQueryParams;
export type UpdateUserDto = IUpdateProfileDto;
export type UserQueryParams = IUserQueryParams;
