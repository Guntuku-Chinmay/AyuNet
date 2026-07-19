import { Module } from '@nestjs/common';
import { PrescriptionItemsService } from './prescription-items.service';
import { PrescriptionItemsController } from './prescription-items.controller';
import { PrescriptionsModule } from '../prescriptions/prescriptions.module';

@Module({
  imports: [PrescriptionsModule],
  controllers: [PrescriptionItemsController],
  providers: [PrescriptionItemsService],
  exports: [PrescriptionItemsService],
})
export class PrescriptionItemsModule {}
