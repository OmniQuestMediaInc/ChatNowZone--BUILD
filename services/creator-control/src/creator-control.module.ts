// PAYLOAD 5 — CreatorControl.Zone module
import { Module } from '@nestjs/common';
import { NatsModule } from '../../core-api/src/nats/nats.module';
import { BroadcastTimingCopilot } from './broadcast-timing.copilot';
import { CreatorControlService } from './creator-control.service';
import { RoomHeatEngine } from './room-heat.engine';
import { SessionMonitoringCopilot } from './session-monitoring.copilot';

@Module({
  imports: [NatsModule],
  providers: [
    RoomHeatEngine,
    BroadcastTimingCopilot,
    SessionMonitoringCopilot,
    CreatorControlService,
  ],
  exports: [
    RoomHeatEngine,
    BroadcastTimingCopilot,
    SessionMonitoringCopilot,
    CreatorControlService,
  ],
})
export class CreatorControlModule {}
