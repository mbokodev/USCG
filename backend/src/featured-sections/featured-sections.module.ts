import { Module } from '@nestjs/common';
import { FeaturedSectionsController } from './featured-sections.controller';
import { FeaturedSectionsService } from './featured-sections.service';
import { PrismaModule } from '../prisma';
import { TranslationModule } from '../translation';

@Module({
  imports: [PrismaModule, TranslationModule],
  controllers: [FeaturedSectionsController],
  providers: [FeaturedSectionsService],
  exports: [FeaturedSectionsService],
})
export class FeaturedSectionsModule {}
