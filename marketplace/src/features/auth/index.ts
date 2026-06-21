// Services
export { default as authService } from "./services/auth.service";
export type {
  LoginResponse,
  RegisterResponse,
  MessageResponse,
  ApiResult,
} from "./services/auth.service";

// Actions
export {
  loginAction,
  registerAction,
  verifyEmailAction,
  resendVerificationAction,
  logoutAction,
  getCurrentUser,
} from "./actions/auth.actions";
export type { AuthActionResult } from "./actions/auth.actions";

// Hooks
export { useAuth } from "./hooks/useAuth";
