import { Module } from '@nestjs/common';
import { ChronicConditionsService } from './chronic-conditions.service';
import { ChronicConditionsController } from './chronic-conditions.controller';

@Module({
  controllers: [ChronicConditionsController],
  providers: [ChronicConditionsService],
  exports: [ChronicConditionsService],
})
export class ChronicConditionsModule {}
