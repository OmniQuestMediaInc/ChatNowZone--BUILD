// services/zonebot-scheduler/src/zonebot-scheduler.module.ts
// WO-002: HCZ ZoneBot Zoey — NestJS module declaration.
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ZonebotSchedulingService } from './zonebot-scheduler.service';
import { ZonebotSchedulerController } from './zonebot-scheduler.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ZonebotSchedulerController],
  providers: [ZonebotSchedulingService],
  exports: [ZonebotSchedulingService],
})
export class ZonebotSchedulerModule {}
