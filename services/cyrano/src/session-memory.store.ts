// PAYLOAD 5 — Cyrano persistent session memory
// Keyed by (creator_id, guest_id) — facts, arcs, inferences persist across
// sessions so Cyrano can surface callback suggestions and recovery nudges.
//
// In-memory implementation — swap-in PrismaRepo is a follow-up. Tests
// exercise the interface; production wiring comes in the Cyrano-L2 payload.

import { Injectable, Logger } from '@nestjs/common';
import type { MemoryFact } from './cyrano.types';

export interface SessionArc {
  arc_id: string;
  started_at_utc: string;
  topic: string;
  last_touched_at_utc: string;
}

interface MemoryRecord {
  facts: Map<string, MemoryFact>;
  arcs: Map<string, SessionArc>;
}

function memKey(creatorId: string, guestId: string): string {
  return `${creatorId}::${guestId}`;
}

@Injectable()
export class SessionMemoryStore {
  private readonly logger = new Logger(SessionMemoryStore.name);
  private readonly store = new Map<string, MemoryRecord>();

  private ensure(creatorId: string, guestId: string): MemoryRecord {
    const key = memKey(creatorId, guestId);
    let rec = this.store.get(key);
    if (!rec) {
      rec = { facts: new Map(), arcs: new Map() };
      this.store.set(key, rec);
    }
    return rec;
  }

  upsertFact(args: {
    creator_id: string;
    guest_id: string;
    fact: MemoryFact;
  }): void {
    const rec = this.ensure(args.creator_id, args.guest_id);
    rec.facts.set(args.fact.key, args.fact);
    this.logger.debug('SessionMemoryStore: fact upserted', {
      creator_id: args.creator_id,
      guest_id: args.guest_id,
      key: args.fact.key,
    });
  }

  listFacts(creatorId: string, guestId: string): MemoryFact[] {
    const rec = this.store.get(memKey(creatorId, guestId));
    if (!rec) return [];
    return Array.from(rec.facts.values());
  }

  getFact(creatorId: string, guestId: string, key: string): MemoryFact | null {
    const rec = this.store.get(memKey(creatorId, guestId));
    return rec?.facts.get(key) ?? null;
  }

  upsertArc(args: {
    creator_id: string;
    guest_id: string;
    arc: SessionArc;
  }): void {
    const rec = this.ensure(args.creator_id, args.guest_id);
    rec.arcs.set(args.arc.arc_id, args.arc);
  }

  listArcs(creatorId: string, guestId: string): SessionArc[] {
    const rec = this.store.get(memKey(creatorId, guestId));
    if (!rec) return [];
    return Array.from(rec.arcs.values());
  }

  /** Test seam. */
  reset(): void {
    this.store.clear();
  }
}
