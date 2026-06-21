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
      process.env.FRONTEND_URL || 'http://localhost:3003';
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
}
