import * as Yup from "yup";
import { UserRole, type IAuthUser } from "@uscg/shared";

export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .required("L'email est requis")
    .email("Email invalide"),
  password: Yup.string()
    .required("Le mot de passe est requis")
    .min(6, "Le mot de passe doit contenir au moins 6 caracteres"),
});

export type LoginRequest = Yup.InferType<typeof loginSchema>;

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

// Re-export for convenience
export type AuthUser = IAuthUser;
export { UserRole };
