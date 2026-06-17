import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Helmet - Headers de sécurité HTTP
  // Configuration pour permettre le chargement d'images cross-origin
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'blob:', '*'],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
        },
      },
    }),
  );

  // Cookie parser - IMPORTANT: avant les autres middlewares
  app.use(cookieParser());

  // Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Filter global pour standardiser les réponses d'erreur
  app.useGlobalFilters(new HttpExceptionFilter());

  // Intercepteur de logging pour les requêtes HTTP
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Global API prefix
  app.setGlobalPrefix('api');

  // CORS avec credentials pour les cookies
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('USCG API')
    .setDescription(
      'API de la marketplace Universal Services of Congo. ' +
        "L'authentification utilise des cookies HTTP-only pour les tokens JWT.",
    )
    .setVersion('1.0')
    .addTag('auth', 'Authentification (cookies HTTP-only)')
    .addTag('users', 'Gestion des utilisateurs')
    .addTag('seller-requests', 'Demandes vendeur')
    .addTag('categories', 'Catégories')
    .addTag('ads', 'Annonces')
    .addTag('files', 'Upload de fichiers')
    .addTag('dashboard', 'Statistiques')
    .addCookieAuth('accessToken', {
      type: 'apiKey',
      in: 'cookie',
      name: 'accessToken',
      description: 'Token JWT stocké dans un cookie HTTP-only',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3001;
  const host = process.env.HOST || '0.0.0.0';
  await app.listen(port, host);

  console.log(`Application running on: http://${host}:${port}`);
  console.log(`API available at: http://localhost:${port}/api`);
  console.log(`Swagger docs available at: http://localhost:${port}/docs`);
}
bootstrap();
