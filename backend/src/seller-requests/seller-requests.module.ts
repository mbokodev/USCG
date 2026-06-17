import { Module } from '@nestjs/common';
import { SellerRequestsController } from './seller-requests.controller';
import { SellerRequestsService } from './seller-requests.service';

@Module({
  controllers: [SellerRequestsController],
  providers: [SellerRequestsService],
  exports: [SellerRequestsService],
})
export class SellerRequestsModule {}
