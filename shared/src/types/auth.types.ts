/**
 * Authentication types shared between admin-panel and marketplace
 */

import type { IAuthUser } from "./user.types";

/**
 * DTO for user registration (marketplace)
 */
export interface IRegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  acceptTerms: boolean;
}

/**
 * DTO for user login
 */
export interface ILoginDto {
  email: string;
  password: string;
}

/**
 * Login response from API
 */
export interface ILoginResponse {
  user: IAuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Refresh token response
 */
export interface IRefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Generic message response
 */
export interface IMessageResponse {
  message: string;
}
