// WO: WO-INIT-001, WO-036-KYC-VAULT-PUBLISH-GATE, WO-037, WO-038
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { CreatorModule } from './creator/creator.module';
import { SafetyModule } from './safety/safety.module';
import { GrowthModule } from './growth/growth.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SovereignCaCMiddleware } from './compliance/sovereign-cac.middleware';

@Module({
  imports: [CreatorModule, SafetyModule, GrowthModule, AnalyticsModule, ComplianceModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(SovereignCaCMiddleware)
      .forRoutes('*');
  }
}
