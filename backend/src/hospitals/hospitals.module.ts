import { Module } from '@nestjs/common';
import { HospitalsService } from './hospitals.service';
import { HospitalsController } from './hospitals.controller';
import { AddressesModule } from '../addresses/addresses.module';

@Module({
  imports: [AddressesModule],
  controllers: [HospitalsController],
  providers: [HospitalsService],
  exports: [HospitalsService],
})
export class HospitalsModule {}
