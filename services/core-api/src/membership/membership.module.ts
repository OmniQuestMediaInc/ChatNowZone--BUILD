// FIZ: MEMB-002 — MembershipModule
// Provides MembershipService for tier resolution and subscription lifecycle.
import { Module } from '@nestjs/common';
import { MembershipService } from './membership.service';

@Module({
  providers: [MembershipService],
  exports: [MembershipService],
})
export class MembershipModule {}
