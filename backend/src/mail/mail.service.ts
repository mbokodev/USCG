import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend | null = null;
  private fromEmail: string;
  private frontendUrl: string;
  private isConfigured: boolean;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.isConfigured = !!apiKey;

    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.logger.warn(
        'RESEND_API_KEY not configured. Emails will be logged to console in development.',
      );
    }

    this.fromEmail =
      process.env.RESEND_FROM_EMAIL || 'noreply@universal-services-cg.com';
    this.frontendUrl =
      process.env.FRONTEND_URL || 'http://localhost:3000';
  }

  /**
   * Email d'approbation vendeur
   */
  async sendSellerApprovalEmail(
    email: string,
    firstName: string,
    businessName: string,
  ): Promise<void> {
    const adminPanelUrl = process.env.ADMIN_PANEL_URL || 'http://localhost:3000';

    if (!this.isConfigured || !this.resend) {
      this.logger.warn('='.repeat(60));
      this.logger.warn('EMAIL APPROBATION VENDEUR (Mode développement)');
      this.logger.warn(`To: ${email}`);
      this.logger.warn(`Name: ${firstName}`);
      this.logger.warn(`Business: ${businessName}`);
      this.logger.warn(`Admin Panel: ${adminPanelUrl}`);
      this.logger.warn('='.repeat(60));
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Félicitations ! Votre demande vendeur a été approuvée - USCG',
        html: this.getSellerApprovalEmailTemplate(firstName, businessName, adminPanelUrl),
      });

      this.logger.log(`Seller approval email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send seller approval email to ${email}`, error);
      // On ne throw pas l'erreur pour ne pas bloquer le processus d'approbation
    }
  }

  /**
   * Email de refus vendeur
   */
  async sendSellerRejectionEmail(
    email: string,
    firstName: string,
    businessName: string,
    rejectionReason: string,
  ): Promise<void> {
    if (!this.isConfigured || !this.resend) {
      this.logger.warn('='.repeat(60));
      this.logger.warn('EMAIL REFUS VENDEUR (Mode développement)');
      this.logger.warn(`To: ${email}`);
      this.logger.warn(`Name: ${firstName}`);
      this.logger.warn(`Business: ${businessName}`);
      this.logger.warn(`Reason: ${rejectionReason}`);
      this.logger.warn('='.repeat(60));
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Votre demande vendeur - USCG',
        html: this.getSellerRejectionEmailTemplate(firstName, businessName, rejectionReason),
      });

      this.logger.log(`Seller rejection email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send seller rejection email to ${email}`, error);
    }
  }

  /**
   * Email de credentials pour un nouvel OPERATOR
   */
  async sendOperatorCredentialsEmail(
    email: string,
    firstName: string,
    password: string,
  ): Promise<void> {
    const adminPanelUrl = process.env.ADMIN_PANEL_URL || 'http://localhost:3000';

    if (!this.isConfigured || !this.resend) {
      this.logger.warn('='.repeat(60));
      this.logger.warn('EMAIL CREDENTIALS OPERATOR (Mode développement)');
      this.logger.warn(`To: ${email}`);
      this.logger.warn(`Name: ${firstName}`);
      this.logger.warn(`Password: ${password}`);
      this.logger.warn(`Admin Panel: ${adminPanelUrl}`);
      this.logger.warn('='.repeat(60));
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Votre compte Opérateur USCG a été créé',
        html: this.getOperatorCredentialsEmailTemplate(firstName, email, password, adminPanelUrl),
      });

      this.logger.log(`Operator credentials email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send operator credentials email to ${email}`, error);
    }
  }

  /**
   * Email de réinitialisation de mot de passe
   */
  async sendPasswordResetEmail(
    email: string,
    firstName: string,
    token: string,
  ): Promise<void> {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;

    if (!this.isConfigured || !this.resend) {
      this.logger.warn('='.repeat(60));
      this.logger.warn('EMAIL RESET MOT DE PASSE (Mode développement)');
      this.logger.warn(`To: ${email}`);
      this.logger.warn(`Name: ${firstName}`);
      this.logger.warn(`URL: ${resetUrl}`);
      this.logger.warn('='.repeat(60));
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Réinitialisation de votre mot de passe - USCG',
        html: this.getPasswordResetEmailTemplate(firstName, resetUrl),
      });

      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}`, error);
      // On ne throw pas l'erreur pour ne pas révéler si l'email existe
    }
  }

  async sendVerificationEmail(
    email: string,
    token: string,
    firstName: string,
  ): Promise<void> {
    const verificationUrl = `${this.frontendUrl}/verify-email?token=${token}`;

    // En mode développement sans API key, on log simplement l'URL
    if (!this.isConfigured || !this.resend) {
      this.logger.warn('='.repeat(60));
      this.logger.warn('EMAIL DE VÉRIFICATION (Mode développement)');
      this.logger.warn(`To: ${email}`);
      this.logger.warn(`Name: ${firstName}`);
      this.logger.warn(`URL: ${verificationUrl}`);
      this.logger.warn('='.repeat(60));
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Vérifiez votre email - USCG Marketplace',
        html: this.getVerificationEmailTemplate(firstName, verificationUrl),
      });

      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error);
      throw error;
    }
  }

  private getVerificationEmailTemplate(
    firstName: string,
    verificationUrl: string,
  ): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vérification Email</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 40px;
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo h1 {
      color: #2563eb;
      margin: 0;
      font-size: 28px;
    }
    h2 {
      color: #1f2937;
      margin-top: 0;
    }
    .button {
      display: inline-block;
      background: #2563eb;
      color: #ffffff !important;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
    }
    .button:hover {
      background: #1d4ed8;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
    }
    .warning {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 12px;
      margin-top: 20px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <h1>USCG Marketplace</h1>
    </div>

    <h2>Bienvenue ${firstName} !</h2>

    <p>Merci de vous être inscrit sur USCG Marketplace. Pour activer votre compte et commencer à explorer nos annonces, veuillez vérifier votre adresse email.</p>

    <p style="text-align: center;">
      <a href="${verificationUrl}" class="button">Vérifier mon email</a>
    </p>

    <p>Ou copiez ce lien dans votre navigateur :</p>
    <p style="word-break: break-all; color: #2563eb;">${verificationUrl}</p>

    <div class="warning">
      ⏰ Ce lien expire dans <strong>24 heures</strong>.
    </div>

    <div class="footer">
      <p>Si vous n'avez pas créé de compte sur USCG Marketplace, vous pouvez ignorer cet email.</p>
      <p>© ${new Date().getFullYear()} Universal Services of Congo. Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private getSellerApprovalEmailTemplate(
    firstName: string,
    businessName: string,
    adminPanelUrl: string,
  ): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Demande Vendeur Approuvée</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 40px;
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo h1 {
      color: #2563eb;
      margin: 0;
      font-size: 28px;
    }
    h2 {
      color: #1f2937;
      margin-top: 0;
    }
    .success-badge {
      background: #10b981;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      display: inline-block;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .button {
      display: inline-block;
      background: #2563eb;
      color: #ffffff !important;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
    }
    .features {
      background: #f3f4f6;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .features ul {
      margin: 0;
      padding-left: 20px;
    }
    .features li {
      margin: 8px 0;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <h1>USCG Marketplace</h1>
    </div>

    <div style="text-align: center;">
      <span class="success-badge">✓ Demande Approuvée</span>
    </div>

    <h2>Félicitations ${firstName} !</h2>

    <p>Nous avons le plaisir de vous informer que votre demande pour devenir vendeur sous le nom <strong>"${businessName}"</strong> a été <strong>approuvée</strong>.</p>

    <p>Vous pouvez maintenant accéder à votre espace vendeur et commencer à publier vos annonces.</p>

    <div class="features">
      <strong>Vous pouvez désormais :</strong>
      <ul>
        <li>Créer et gérer vos annonces</li>
        <li>Suivre vos statistiques de vente</li>
        <li>Communiquer avec vos clients</li>
      </ul>
    </div>

    <p style="text-align: center;">
      <a href="${adminPanelUrl}" class="button">Accéder à mon espace vendeur</a>
    </p>

    <div class="footer">
      <p>Bienvenue dans la communauté des vendeurs USCG !</p>
      <p>© ${new Date().getFullYear()} Universal Services of Congo. Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private getSellerRejectionEmailTemplate(
    firstName: string,
    businessName: string,
    rejectionReason: string,
  ): string {
    const marketplaceUrl = this.frontendUrl;

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Demande Vendeur</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 40px;
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo h1 {
      color: #2563eb;
      margin: 0;
      font-size: 28px;
    }
    h2 {
      color: #1f2937;
      margin-top: 0;
    }
    .reason-box {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
    }
    .reason-box strong {
      color: #dc2626;
    }
    .button {
      display: inline-block;
      background: #2563eb;
      color: #ffffff !important;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <h1>USCG Marketplace</h1>
    </div>

    <h2>Bonjour ${firstName},</h2>

    <p>Nous avons examiné votre demande pour devenir vendeur sous le nom <strong>"${businessName}"</strong>.</p>

    <p>Malheureusement, nous ne sommes pas en mesure d'approuver votre demande pour le moment.</p>

    <div class="reason-box">
      <strong>Raison :</strong>
      <p style="margin: 8px 0 0 0;">${rejectionReason}</p>
    </div>

    <p>Vous pouvez corriger les éléments mentionnés et soumettre une nouvelle demande.</p>

    <p style="text-align: center;">
      <a href="${marketplaceUrl}/become-seller" class="button">Soumettre une nouvelle demande</a>
    </p>

    <div class="footer">
      <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
      <p>© ${new Date().getFullYear()} Universal Services of Congo. Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private getPasswordResetEmailTemplate(
    firstName: string,
    resetUrl: string,
  ): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisation du mot de passe</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 40px;
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo h1 {
      color: #2563eb;
      margin: 0;
      font-size: 28px;
    }
    h2 {
      color: #1f2937;
      margin-top: 0;
    }
    .button {
      display: inline-block;
      background: #2563eb;
      color: #ffffff !important;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
    }
    .button:hover {
      background: #1d4ed8;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
    }
    .warning {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 12px;
      margin-top: 20px;
      font-size: 14px;
    }
    .security-note {
      background: #f3f4f6;
      border-radius: 8px;
      padding: 16px;
      margin-top: 20px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <h1>USCG Marketplace</h1>
    </div>

    <h2>Bonjour ${firstName},</h2>

    <p>Vous avez demandé la réinitialisation de votre mot de passe sur USCG Marketplace.</p>

    <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>

    <p style="text-align: center;">
      <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
    </p>

    <p>Ou copiez ce lien dans votre navigateur :</p>
    <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>

    <div class="warning">
      ⏰ Ce lien expire dans <strong>1 heure</strong>.
    </div>

    <div class="security-note">
      🔒 <strong>Note de sécurité :</strong> Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe restera inchangé.
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} Universal Services of Congo. Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private getOperatorCredentialsEmailTemplate(
    firstName: string,
    email: string,
    password: string,
    adminPanelUrl: string,
  ): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Votre compte Opérateur</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 40px;
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo h1 {
      color: #2563eb;
      margin: 0;
      font-size: 28px;
    }
    h2 {
      color: #1f2937;
      margin-top: 0;
    }
    .credentials-box {
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .credentials-box p {
      margin: 8px 0;
    }
    .credentials-box strong {
      color: #1f2937;
    }
    .credentials-box code {
      background: #e5e7eb;
      padding: 4px 8px;
      border-radius: 4px;
      font-family: monospace;
    }
    .button {
      display: inline-block;
      background: #2563eb;
      color: #ffffff !important;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
    }
    .warning {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
    }
    .warning-icon {
      font-size: 20px;
    }
    .warning strong {
      color: #b45309;
    }
    .security-note {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 16px;
      margin-top: 20px;
      font-size: 14px;
    }
    .security-note strong {
      color: #dc2626;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <h1>USCG Admin</h1>
    </div>

    <h2>Bienvenue ${firstName} !</h2>

    <p>Un compte <strong>Opérateur</strong> a été créé pour vous sur la plateforme USCG.</p>

    <p>En tant qu'opérateur, vous pourrez :</p>
    <ul>
      <li>Valider ou refuser les annonces des vendeurs</li>
      <li>Traiter les demandes pour devenir vendeur</li>
      <li>Gérer les utilisateurs de la plateforme</li>
    </ul>

    <div class="credentials-box">
      <p><strong>Vos identifiants de connexion :</strong></p>
      <p>📧 Email : <code>${email}</code></p>
      <p>🔑 Mot de passe : <code>${password}</code></p>
    </div>

    <div class="warning">
      <span class="warning-icon">⚠️</span>
      <strong>IMPORTANT :</strong>
      <p style="margin: 8px 0 0 0;">Lors de votre première connexion, vous serez obligé de changer votre mot de passe. Choisissez un mot de passe fort et unique que vous seul connaissez.</p>
    </div>

    <p style="text-align: center;">
      <a href="${adminPanelUrl}" class="button">Se connecter au panel admin</a>
    </p>

    <div class="security-note">
      🔒 <strong>Sécurité :</strong> Ne partagez jamais vos identifiants avec qui que ce soit. L'équipe USCG ne vous demandera jamais votre mot de passe.
    </div>

    <div class="footer">
      <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
      <p>© ${new Date().getFullYear()} Universal Services of Congo. Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }
}
