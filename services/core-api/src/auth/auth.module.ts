// services/core-api/src/auth/auth.module.ts
// AUTH: AUTH-002 — AuthModule with StepUpService + RbacGuard
import { Module } from '@nestjs/common';
import { StepUpService } from './step-up.service';
import { RbacGuard } from './rbac.guard';

@Module({
  providers: [StepUpService, RbacGuard],
  exports: [StepUpService, RbacGuard],
})
export class AuthModule {}
