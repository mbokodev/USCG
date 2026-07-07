import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend | null = null;
  private fromEmail: string;
  private frontendUrl: string;
  private apiUrl: string;
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
    this.apiUrl =
      process.env.API_URL || 'http://localhost:3001';
  }

  /**
   * Get the logo URL for email templates
   */
  private getLogoUrl(): string {
    return `${this.apiUrl}/api/files/assets/logo.png`;
  }

  /**
   * Get the base email styles shared across all templates
   */
  private getBaseStyles(): string {
    return `
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        line-height: 1.6;
        color: #333333;
        margin: 0;
        padding: 0;
        background-color: #f5f5f5;
      }
      .wrapper {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .container {
        background: #ffffff;
        border: 1px solid #e0e0e0;
        border-radius: 12px;
        overflow: hidden;
      }
      .header {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        padding: 30px;
        text-align: center;
      }
      .header img {
        max-width: 180px;
        height: auto;
      }
      .content {
        padding: 40px 30px;
      }
      .title {
        color: #1f2937;
        font-size: 24px;
        font-weight: 700;
        margin: 0 0 20px 0;
        text-align: center;
      }
      .text {
        color: #4b5563;
        font-size: 16px;
        margin: 0 0 16px 0;
      }
      .button-container {
        text-align: center;
        margin: 30px 0;
      }
      .button {
        display: inline-block;
        background: #D23F57;
        color: #ffffff !important;
        padding: 16px 32px;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 16px;
      }
      .link-fallback {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 16px;
        margin: 20px 0;
        font-size: 14px;
      }
      .link-fallback p {
        margin: 0 0 8px 0;
        color: #6b7280;
      }
      .link-fallback a {
        color: #D23F57;
        word-break: break-all;
      }
      .warning {
        background: #fef3c7;
        border-left: 4px solid #f59e0b;
        padding: 12px 16px;
        margin: 20px 0;
        font-size: 14px;
        color: #92400e;
      }
      .info-box {
        background: #f3f4f6;
        border-radius: 8px;
        padding: 16px;
        margin: 20px 0;
        font-size: 14px;
        color: #4b5563;
      }
      .divider {
        border: 0;
        border-top: 1px solid #e5e7eb;
        margin: 30px 0;
      }
      .footer {
        background: #f9fafb;
        padding: 24px 30px;
        text-align: center;
        border-top: 1px solid #e5e7eb;
      }
      .footer p {
        margin: 0 0 8px 0;
        font-size: 13px;
        color: #6b7280;
      }
      .footer-links {
        margin-top: 12px;
      }
      .footer-links a {
        color: #D23F57;
        text-decoration: none;
        margin: 0 8px;
        font-size: 13px;
      }
    `;
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
    const logoUrl = this.getLogoUrl();
    const year = new Date().getFullYear();

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vérifiez votre adresse email</title>
  <style>
    ${this.getBaseStyles()}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- Header avec logo -->
      <div class="header">
        <img src="${logoUrl}" alt="USCG" />
      </div>

      <!-- Contenu principal -->
      <div class="content">
        <h1 class="title">Vérifiez votre adresse email</h1>

        <p class="text">Bonjour ${firstName},</p>

        <p class="text">
          Merci d'avoir créé votre compte sur USCG Marketplace.
        </p>

        <p class="text">
          Pour commencer à acheter et vendre sur la plateforme, veuillez confirmer votre adresse email.
        </p>

        <div class="button-container">
          <a href="${verificationUrl}" class="button">Vérifier mon adresse email</a>
        </div>

        <div class="warning">
          ⏰ Ce lien est valable pendant <strong>24 heures</strong>.
        </div>

        <div class="link-fallback">
          <p>Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</p>
          <a href="${verificationUrl}">${verificationUrl}</a>
        </div>

        <hr class="divider" />

        <div class="info-box">
          Si vous n'êtes pas à l'origine de cette inscription, ignorez simplement cet email.
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>© ${year} Universal Services Of Congo</p>
        <p>universal-services-cg.com</p>
        <div class="footer-links">
          <a href="${this.frontendUrl}/contact">Support</a>
          <a href="${this.frontendUrl}/contact">Contact</a>
          <a href="${this.frontendUrl}/terms">Conditions</a>
        </div>
      </div>
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
    const logoUrl = this.getLogoUrl();
    const year = new Date().getFullYear();

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Demande Vendeur Approuvée</title>
  <style>
    ${this.getBaseStyles()}
    .success-badge {
      background: #10b981;
      color: white;
      padding: 10px 20px;
      border-radius: 25px;
      display: inline-block;
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 20px;
    }
    .features {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .features ul {
      margin: 10px 0 0 0;
      padding-left: 20px;
    }
    .features li {
      margin: 8px 0;
      color: #166534;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img src="${logoUrl}" alt="USCG" />
      </div>

      <div class="content">
        <div style="text-align: center;">
          <span class="success-badge">✓ Demande Approuvée</span>
        </div>

        <h1 class="title">Félicitations ${firstName} !</h1>

        <p class="text">
          Nous avons le plaisir de vous informer que votre demande pour devenir vendeur sous le nom <strong>"${businessName}"</strong> a été <strong>approuvée</strong>.
        </p>

        <p class="text">
          Vous pouvez maintenant accéder à votre espace vendeur et commencer à publier vos annonces.
        </p>

        <div class="features">
          <strong>Vous pouvez désormais :</strong>
          <ul>
            <li>Créer et gérer vos annonces</li>
            <li>Suivre vos statistiques de vente</li>
            <li>Communiquer avec vos clients</li>
          </ul>
        </div>

        <div class="button-container">
          <a href="${adminPanelUrl}" class="button">Accéder à mon espace vendeur</a>
        </div>
      </div>

      <div class="footer">
        <p>Bienvenue dans la communauté des vendeurs USCG !</p>
        <p>© ${year} Universal Services Of Congo</p>
        <div class="footer-links">
          <a href="${this.frontendUrl}/contact">Support</a>
          <a href="${this.frontendUrl}/contact">Contact</a>
          <a href="${this.frontendUrl}/terms">Conditions</a>
        </div>
      </div>
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
    const logoUrl = this.getLogoUrl();
    const year = new Date().getFullYear();

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Demande Vendeur</title>
  <style>
    ${this.getBaseStyles()}
    .reason-box {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-left: 4px solid #dc2626;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
    }
    .reason-box strong {
      color: #dc2626;
    }
    .reason-box p {
      margin: 8px 0 0 0;
      color: #7f1d1d;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img src="${logoUrl}" alt="USCG" />
      </div>

      <div class="content">
        <h1 class="title">Demande en attente de modifications</h1>

        <p class="text">Bonjour ${firstName},</p>

        <p class="text">
          Nous avons examiné votre demande pour devenir vendeur sous le nom <strong>"${businessName}"</strong>.
        </p>

        <p class="text">
          Malheureusement, nous ne sommes pas en mesure d'approuver votre demande pour le moment.
        </p>

        <div class="reason-box">
          <strong>Raison :</strong>
          <p>${rejectionReason}</p>
        </div>

        <p class="text">
          Vous pouvez corriger les éléments mentionnés et soumettre une nouvelle demande.
        </p>

        <div class="button-container">
          <a href="${this.frontendUrl}/become-seller" class="button">Soumettre une nouvelle demande</a>
        </div>
      </div>

      <div class="footer">
        <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
        <p>© ${year} Universal Services Of Congo</p>
        <div class="footer-links">
          <a href="${this.frontendUrl}/contact">Support</a>
          <a href="${this.frontendUrl}/contact">Contact</a>
          <a href="${this.frontendUrl}/terms">Conditions</a>
        </div>
      </div>
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
    const logoUrl = this.getLogoUrl();
    const year = new Date().getFullYear();

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisation du mot de passe</title>
  <style>
    ${this.getBaseStyles()}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img src="${logoUrl}" alt="USCG" />
      </div>

      <div class="content">
        <h1 class="title">Réinitialisation du mot de passe</h1>

        <p class="text">Bonjour ${firstName},</p>

        <p class="text">
          Vous avez demandé la réinitialisation de votre mot de passe sur USCG Marketplace.
        </p>

        <p class="text">
          Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
        </p>

        <div class="button-container">
          <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
        </div>

        <div class="warning">
          ⏰ Ce lien expire dans <strong>1 heure</strong>.
        </div>

        <div class="link-fallback">
          <p>Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</p>
          <a href="${resetUrl}">${resetUrl}</a>
        </div>

        <hr class="divider" />

        <div class="info-box">
          🔒 <strong>Note de sécurité :</strong> Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe restera inchangé.
        </div>
      </div>

      <div class="footer">
        <p>© ${year} Universal Services Of Congo</p>
        <div class="footer-links">
          <a href="${this.frontendUrl}/contact">Support</a>
          <a href="${this.frontendUrl}/contact">Contact</a>
          <a href="${this.frontendUrl}/terms">Conditions</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Email de formulaire de contact
   */
  async sendContactFormEmail(
    name: string,
    email: string,
    subject: string,
    message: string,
  ): Promise<void> {
    const adminEmail = process.env.CONTACT_EMAIL || 'contact@universal-services-cg.com';

    if (!this.isConfigured || !this.resend) {
      this.logger.warn('='.repeat(60));
      this.logger.warn('EMAIL FORMULAIRE DE CONTACT (Mode développement)');
      this.logger.warn(`From: ${name} <${email}>`);
      this.logger.warn(`Subject: ${subject}`);
      this.logger.warn(`Message: ${message}`);
      this.logger.warn(`To Admin: ${adminEmail}`);
      this.logger.warn('='.repeat(60));
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: adminEmail,
        replyTo: email,
        subject: `[Contact USCG] ${subject}`,
        html: this.getContactFormEmailTemplate(name, email, subject, message),
      });

      this.logger.log(`Contact form email sent from ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send contact form email from ${email}`, error);
      throw error;
    }
  }

  private getContactFormEmailTemplate(
    name: string,
    email: string,
    subject: string,
    message: string,
  ): string {
    const logoUrl = this.getLogoUrl();
    const year = new Date().getFullYear();
    const date = new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouveau message de contact</title>
  <style>
    ${this.getBaseStyles()}
    .contact-info {
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
    }
    .contact-info p {
      margin: 8px 0;
    }
    .contact-info strong {
      color: #374151;
    }
    .message-box {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-left: 4px solid #D23F57;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      white-space: pre-wrap;
      font-size: 15px;
      line-height: 1.6;
      color: #374151;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img src="${logoUrl}" alt="USCG" />
      </div>

      <div class="content">
        <h1 class="title">Nouveau message de contact</h1>

        <p class="text">Vous avez reçu un nouveau message via le formulaire de contact du site.</p>

        <div class="contact-info">
          <p><strong>Date :</strong> ${date}</p>
          <p><strong>Nom :</strong> ${name}</p>
          <p><strong>Email :</strong> <a href="mailto:${email}" style="color: #D23F57;">${email}</a></p>
          <p><strong>Sujet :</strong> ${subject}</p>
        </div>

        <h3 style="margin-bottom: 10px; color: #1f2937;">Message :</h3>
        <div class="message-box">${message}</div>

        <div class="button-container">
          <a href="mailto:${email}?subject=Re: ${subject}" class="button">Répondre à ${name}</a>
        </div>
      </div>

      <div class="footer">
        <p>Ce message a été envoyé depuis le formulaire de contact USCG Marketplace.</p>
        <p>© ${year} Universal Services Of Congo</p>
      </div>
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
    const logoUrl = this.getLogoUrl();
    const year = new Date().getFullYear();

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Votre compte Opérateur</title>
  <style>
    ${this.getBaseStyles()}
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
    .credentials-box code {
      background: #e5e7eb;
      padding: 4px 8px;
      border-radius: 4px;
      font-family: monospace;
      color: #1f2937;
    }
    .features-list {
      margin: 16px 0;
      padding-left: 20px;
    }
    .features-list li {
      margin: 8px 0;
      color: #4b5563;
    }
    .security-alert {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-left: 4px solid #dc2626;
      border-radius: 8px;
      padding: 16px;
      margin-top: 20px;
      font-size: 14px;
    }
    .security-alert strong {
      color: #dc2626;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img src="${logoUrl}" alt="USCG" />
      </div>

      <div class="content">
        <h1 class="title">Bienvenue ${firstName} !</h1>

        <p class="text">
          Un compte <strong>Opérateur</strong> a été créé pour vous sur la plateforme USCG.
        </p>

        <p class="text">En tant qu'opérateur, vous pourrez :</p>
        <ul class="features-list">
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
          ⚠️ <strong>IMPORTANT :</strong> Lors de votre première connexion, vous serez obligé de changer votre mot de passe. Choisissez un mot de passe fort et unique que vous seul connaissez.
        </div>

        <div class="button-container">
          <a href="${adminPanelUrl}" class="button">Se connecter au panel admin</a>
        </div>

        <div class="security-alert">
          🔒 <strong>Sécurité :</strong> Ne partagez jamais vos identifiants avec qui que ce soit. L'équipe USCG ne vous demandera jamais votre mot de passe.
        </div>
      </div>

      <div class="footer">
        <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
        <p>© ${year} Universal Services Of Congo</p>
        <div class="footer-links">
          <a href="${this.frontendUrl}/contact">Support</a>
          <a href="${this.frontendUrl}/contact">Contact</a>
          <a href="${this.frontendUrl}/terms">Conditions</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();
  }
}
