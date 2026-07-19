import { Module } from '@nestjs/common';
import { RefundsService } from './refunds.service';
import { RefundsController } from './refunds.controller';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [PaymentsModule],
  controllers: [RefundsController],
  providers: [RefundsService],
  exports: [RefundsService],
})
export class RefundsModule {}
