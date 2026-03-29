// WO: WO-INIT-001, WO-036-KYC-VAULT-PUBLISH-GATE, WO-037, WO-038
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { CreatorModule } from './creator/creator.module';
import { SafetyModule } from './safety/safety.module';
import { GrowthModule } from './growth/growth.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ZoneGptModule } from '../../zone-gpt/src/zone-gpt.module';

@Module({
  imports: [CreatorModule, SafetyModule, GrowthModule, AnalyticsModule, ZoneGptModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(SovereignCaCMiddleware)
      .forRoutes('*');
  }
}
