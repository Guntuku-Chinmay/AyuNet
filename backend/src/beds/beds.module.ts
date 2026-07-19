import { Module } from '@nestjs/common';
import { BedsService } from './beds.service';
import { BedsController } from './beds.controller';

@Module({
  controllers: [BedsController],
  providers: [BedsService],
  exports: [BedsService],
})
export class BedsModule {}
