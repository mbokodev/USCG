import { Module } from '@nestjs/common';
import { StaticPagesController } from './static-pages.controller';
import { StaticPagesService } from './static-pages.service';
import { PrismaModule } from '../prisma';

@Module({
  imports: [PrismaModule],
  controllers: [StaticPagesController],
  providers: [StaticPagesService],
  exports: [StaticPagesService],
})
export class StaticPagesModule {}
