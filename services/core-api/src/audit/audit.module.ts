// WO: WO-019
import { Module } from '@nestjs/common';
import { AuditDashboardController } from './audit-dashboard.controller';

/**
 * WO-019: Audit Dashboard Module
 * Provides compliance visualization for Red Book scenarios.
 */
@Module({
  controllers: [AuditDashboardController],
})
export class AuditModule {}
