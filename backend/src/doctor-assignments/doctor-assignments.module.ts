import { Module } from '@nestjs/common';
import { DoctorAssignmentsService } from './doctor-assignments.service';
import { DoctorAssignmentsController } from './doctor-assignments.controller';

@Module({
  controllers: [DoctorAssignmentsController],
  providers: [DoctorAssignmentsService],
  exports: [DoctorAssignmentsService],
})
export class DoctorAssignmentsModule {}
