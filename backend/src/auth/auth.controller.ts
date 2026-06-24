import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  LoginResponseDto,
  RefreshResponseDto,
  MessageResponseDto,
  ResendVerificationDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto';
import { Public, CurrentUser } from './decorators';
import { JwtRefreshGuard } from './guards';

// Sécurité Niveau 2 : Les cookies sont gérés par le frontend (Server Actions)
// Le backend retourne les tokens dans le body pour que le frontend puisse les stocker en httpOnly

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 inscriptions par minute max
  @ApiOperation({
    summary: 'Inscription BUYER',
    description:
      "Crée un nouveau compte utilisateur avec le rôle BUYER. L'utilisateur doit accepter les CGU et vérifier son email avant de pouvoir se connecter.",
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Utilisateur créé, email de vérification envoyé',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides ou CGU non acceptées',
  })
  @ApiResponse({
    status: 409,
    description: 'Email déjà utilisé',
  })
  async register(@Body() dto: RegisterDto): Promise<MessageResponseDto> {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 tentatives de connexion par minute max
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Connexion',
    description:
      "Authentifie un utilisateur. Les tokens sont retournés dans le body pour le frontend. L'historique de connexion est enregistré pour les OPERATOR et SUPER_ADMIN.",
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Connexion réussie',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Email ou mot de passe incorrect / Compte désactivé',
  })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
  ): Promise<LoginResponseDto> {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket.remoteAddress ||
      'unknown';
    const userAgent = req.headers['user-agent'];

    const { user, tokens } = await this.authService.login(dto, ipAddress, userAgent);

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: this.authService.accessTokenMaxAge / 1000, // en secondes
    };
  }

  @Public()
  @Get('verify-email/:token')
  @ApiOperation({
    summary: 'Vérifier email',
    description: "Vérifie l'email de l'utilisateur à partir du token envoyé par email.",
  })
  @ApiParam({
    name: 'token',
    description: 'Token de vérification envoyé par email',
  })
  @ApiResponse({
    status: 200,
    description: 'Email vérifié avec succès',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Token invalide ou expiré',
  })
  async verifyEmail(@Param('token') token: string): Promise<MessageResponseDto> {
    return this.authService.verifyEmail(token);
  }

  @Public()
  @Post('resend-verification')
  @Throttle({ default: { limit: 1, ttl: 60000 } }) // 1 demande par minute max
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Renvoyer email de vérification',
    description: "Renvoie l'email de vérification à l'adresse indiquée.",
  })
  @ApiBody({ type: ResendVerificationDto })
  @ApiResponse({
    status: 200,
    description: 'Email de vérification envoyé (si le compte existe)',
    type: MessageResponseDto,
  })
  async resendVerification(
    @Body() dto: ResendVerificationDto,
  ): Promise<MessageResponseDto> {
    return this.authService.resendVerificationEmail(dto.email);
  }

  @Public()
  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 demandes par minute max
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mot de passe oublié',
    description:
      "Envoie un email de réinitialisation de mot de passe. Pour des raisons de sécurité, le même message est retourné que l'email existe ou non.",
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Email de réinitialisation envoyé (si le compte existe)',
    type: MessageResponseDto,
  })
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<MessageResponseDto> {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Réinitialiser le mot de passe',
    description:
      "Réinitialise le mot de passe avec le token reçu par email. Le token expire après 1 heure.",
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Mot de passe réinitialisé avec succès',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Token invalide ou expiré',
  })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<MessageResponseDto> {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  @Public()
  @Post('login/admin')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 tentatives de connexion par minute max
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Connexion Admin Panel',
    description:
      "Authentifie un utilisateur pour le panel admin. Refuse l'accès aux BUYER sans statut vendeur approuvé.",
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Connexion réussie',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Email ou mot de passe incorrect / Compte désactivé',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès au panel admin non autorisé',
  })
  async loginAdmin(
    @Body() dto: LoginDto,
    @Req() req: Request,
  ): Promise<LoginResponseDto> {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket.remoteAddress ||
      'unknown';
    const userAgent = req.headers['user-agent'];

    const { user, tokens } = await this.authService.loginAdmin(dto, ipAddress, userAgent);

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: this.authService.accessTokenMaxAge / 1000,
    };
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rafraîchir les tokens',
    description:
      'Génère une nouvelle paire de tokens à partir du refresh token (lu depuis le cookie).',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens rafraîchis avec succès',
    type: RefreshResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token invalide ou expiré',
  })
  async refresh(@CurrentUser('id') userId: string): Promise<RefreshResponseDto> {
    const tokens = await this.authService.refreshTokens(userId);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: this.authService.accessTokenMaxAge / 1000,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Déconnexion',
    description: 'Invalide la session utilisateur. Les cookies sont supprimés par le frontend.',
  })
  @ApiResponse({
    status: 200,
    description: 'Déconnexion réussie',
    type: MessageResponseDto,
  })
  async logout(): Promise<MessageResponseDto> {
    // Les cookies httpOnly sont supprimés par le frontend (Server Actions)
    return { message: 'Déconnexion réussie' };
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Changer le mot de passe',
    description:
      "Change le mot de passe de l'utilisateur connecté. Utilisé notamment pour le changement obligatoire à la première connexion des OPERATOR.",
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Mot de passe modifié avec succès',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Mot de passe actuel incorrect ou nouveau mot de passe invalide',
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
  })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ): Promise<MessageResponseDto> {
    return this.authService.changePassword(
      userId,
      dto.currentPassword,
      dto.newPassword,
    );
  }
}