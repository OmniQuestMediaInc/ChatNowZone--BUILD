// HZ: HeartSync module
import { Module } from '@nestjs/common';
import { HeartSyncController } from './heartsync.controller';
import { HeartSyncService } from './heartsync.service';

@Module({
  controllers: [HeartSyncController],
  providers: [HeartSyncService],
  exports: [HeartSyncService],
})
export class HeartSyncModule {}
