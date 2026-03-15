// Latest implementation details for the ledger module

import { Module } from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { LedgerController } from './ledger.controller';

@Module({
  imports: [],
  controllers: [LedgerController],
  providers: [LedgerService],
})
export class LedgerModule {}