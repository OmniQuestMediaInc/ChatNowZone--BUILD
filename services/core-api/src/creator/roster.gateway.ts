// WO: WO-INIT-001
import { Injectable } from '@nestjs/common';

export interface RosterEntry {
  performerId: string;
  studioId: string;
  contractRef: string;
  status: string;
}

export class RosterGateway {
  getRoster(_studioId: string): RosterEntry[] {
@Injectable()
export class RosterGateway {
  async getRoster(studioId: string): Promise<RosterEntry[]> {
    // TODO: Implement roster retrieval from studio_contracts
    return [];
  }

  getPerformerContract(
    _studioId: string,
    _performerId: string,
  ): RosterEntry | null {
  async getPerformerContract(
    studioId: string,
    performerId: string,
  ): Promise<RosterEntry | null> {
    // TODO: Implement contract lookup from studio_contracts
    return null;
  }
}
