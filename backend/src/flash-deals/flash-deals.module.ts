import { Module } from '@nestjs/common';
import { FlashDealsController } from './flash-deals.controller';
import { FlashDealsService } from './flash-deals.service';
import { PrismaModule } from '../prisma';

@Module({
  imports: [PrismaModule],
  controllers: [FlashDealsController],
  providers: [FlashDealsService],
  exports: [FlashDealsService],
})
export class FlashDealsModule {}
