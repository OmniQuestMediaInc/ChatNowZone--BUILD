// HZ: HeartSync module
import { Module } from '@nestjs/common';
import { HeartSyncService } from './heartsync.service';

@Module({
  providers: [HeartSyncService],
  exports: [HeartSyncService],
})
export class HeartSyncModule {}
