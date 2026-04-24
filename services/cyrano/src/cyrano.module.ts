// PAYLOAD 5 — Cyrano module
import { Module } from '@nestjs/common';
import { NatsModule } from '../../core-api/src/nats/nats.module';
import { CyranoService } from './cyrano.service';
import { PersonaManager } from './persona.manager';
import { SessionMemoryStore } from './session-memory.store';

@Module({
  imports: [NatsModule],
  providers: [SessionMemoryStore, PersonaManager, CyranoService],
  exports: [SessionMemoryStore, PersonaManager, CyranoService],
})
export class CyranoModule {}
