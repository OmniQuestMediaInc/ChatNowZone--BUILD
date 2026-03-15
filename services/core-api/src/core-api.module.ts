import { Module } from '@nestjs/common';
import { StatementsService } from '../services/statements.service';

@Module({
  providers: [StatementsService],
  exports: [StatementsService],
})
export class CoreApiModule {}