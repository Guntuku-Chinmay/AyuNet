import { Module } from '@nestjs/common';
import { DiagnosticCentersService } from './diagnostic-centers.service';
import { DiagnosticCentersController } from './diagnostic-centers.controller';

@Module({
  controllers: [DiagnosticCentersController],
  providers: [DiagnosticCentersService],
  exports: [DiagnosticCentersService],
})
export class DiagnosticCentersModule {}
