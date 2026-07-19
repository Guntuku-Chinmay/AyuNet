import { Module } from '@nestjs/common';
import { PatientCaregiversService } from './patient-caregivers.service';
import { PatientCaregiversController } from './patient-caregivers.controller';

@Module({
  controllers: [PatientCaregiversController],
  providers: [PatientCaregiversService],
  exports: [PatientCaregiversService],
})
export class PatientCaregiversModule {}
