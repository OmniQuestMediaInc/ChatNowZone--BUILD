// WO: WO-INIT-001, WO-036-KYC-VAULT-PUBLISH-GATE, WO-037, WO-038
import { Module } from '@nestjs/common';
import { NatsModule } from './nats/nats.module';
import { CreatorModule } from './creator/creator.module';
import { SafetyModule } from './safety/safety.module';
import { GrowthModule } from './growth/growth.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ZoneGptModule } from '../../zone-gpt/src/zone-gpt.module';

@Module({
  imports: [CreatorModule, SafetyModule, GrowthModule, AnalyticsModule, ZoneGptModule],
})
export class AppModule {}
