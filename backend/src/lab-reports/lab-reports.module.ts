import { Module } from '@nestjs/common';
import { LabReportsService } from './lab-reports.service';
import { LabReportsController } from './lab-reports.controller';
import { LabOrdersModule } from '../lab-orders/lab-orders.module';

@Module({
  imports: [LabOrdersModule],
  controllers: [LabReportsController],
  providers: [LabReportsService],
  exports: [LabReportsService],
})
export class LabReportsModule {}
