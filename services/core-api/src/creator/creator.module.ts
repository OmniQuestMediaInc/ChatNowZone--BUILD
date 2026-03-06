import { Module } from '@nestjs/common';
import { StatementsController } from './statements.controller';
import { StatementsService } from './statements.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [StatementsController],
  providers: [StatementsService, PrismaService],
  exports: [StatementsService],
})
export class CreatorModule {}
