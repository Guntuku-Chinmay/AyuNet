import { Module } from '@nestjs/common';
import { DiagnosesService } from './diagnoses.service';
import { DiagnosesController } from './diagnoses.controller';
import { MedicalRecordsModule } from '../medical-records/medical-records.module';

@Module({
  imports: [MedicalRecordsModule],
  controllers: [DiagnosesController],
  providers: [DiagnosesService],
  exports: [DiagnosesService],
})
export class DiagnosesModule {}
