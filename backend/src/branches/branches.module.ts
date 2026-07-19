import { Module } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { BranchesController } from './branches.controller';
import { AddressesModule } from '../addresses/addresses.module';

@Module({
  imports: [AddressesModule],
  controllers: [BranchesController],
  providers: [BranchesService],
  exports: [BranchesService],
})
export class BranchesModule {}
