// services/core-api/src/app.module.ts
// CHORE: HOUSE-001 — restore missing module registrations dropped in merge
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { CreatorModule } from './creator/creator.module';
import { SafetyModule } from './safety/safety.module';
import { GrowthModule } from './growth/growth.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ComplianceModule } from './compliance/compliance.module';
import { NatsModule } from './nats/nats.module';
import { PrismaModule } from './prisma.module';
import { GamesModule } from './games/games.module';
import { SovereignCaCMiddleware } from './compliance/sovereign-cac.middleware';
import { ZoneGptModule } from '../../zone-gpt/src/zone-gpt.module';
import { BijouModule } from '../../bijou/src/bijou.module';

@Module({
  imports: [
    NatsModule,        // FIRST — global module, must be registered before all others
    PrismaModule,      // SECOND — global Prisma client
    CreatorModule,
    SafetyModule,
    GrowthModule,
    AnalyticsModule,
    ComplianceModule,
    GamesModule,
    ZoneGptModule,
    BijouModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(SovereignCaCMiddleware)
      .forRoutes('*');
  }
}
