// WO-003 — Room-Heat Engine: module
// Business Plan B.4 — real-time composite heat score service.
// NatsModule and PrismaModule are global — no local import needed.
import { Module } from '@nestjs/common';
import { RoomHeatController } from './room-heat.controller';
import { RoomHeatService } from './room-heat.service';

@Module({
  controllers: [RoomHeatController],
  providers:   [RoomHeatService],
  exports:     [RoomHeatService],
})
export class RoomHeatModule {}
