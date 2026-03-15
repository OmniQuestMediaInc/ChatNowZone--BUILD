// WO: WO-INIT-001
import { Module } from '@nestjs/common';
import { CreatorModule } from './creator/creator.module';
import { SafetyModule } from './safety/safety.module';

@Module({
  imports: [CreatorModule, SafetyModule],
})
export class AppModule {}
