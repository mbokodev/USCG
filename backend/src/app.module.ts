import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma';
import { TranslationModule } from './translation';
import { AuthModule, JwtAuthGuard, RolesGuard } from './auth';
import { UsersModule } from './users';
import { CategoriesModule } from './categories';
import { SubCategoriesModule } from './subcategories';
import { VariantsModule } from './variants';
import { AdsModule } from './ads';
import { FilesModule } from './files';
import { SellerRequestsModule } from './seller-requests';
import { BannersModule } from './banners';
import { FlashDealsModule } from './flash-deals';
import { FeaturedSectionsModule } from './featured-sections';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Rate limiting global - protection contre les attaques brute force
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 seconde
        limit: 3, // 3 requêtes max par seconde
      },
      {
        name: 'medium',
        ttl: 10000, // 10 secondes
        limit: 20, // 20 requêtes max par 10 secondes
      },
      {
        name: 'long',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requêtes max par minute
      },
    ]),
    PrismaModule,
    TranslationModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    SubCategoriesModule,
    VariantsModule,
    AdsModule,
    FilesModule,
    SellerRequestsModule,
    BannersModule,
    FlashDealsModule,
    FeaturedSectionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Guard Throttler global - rate limiting sur toutes les routes
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Guard JWT global - toutes les routes nécessitent un token sauf @Public()
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Guard Roles global - vérifie les rôles si @Roles() est présent
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
