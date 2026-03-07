// WO: WO-INIT-001

export interface RosterEntry {
  performerId: string;
  studioId: string;
  contractRef: string;
  status: string;
}

export class RosterGateway {
  getRoster(_studioId: string): RosterEntry[] {
    // TODO: Implement roster retrieval from studio_contracts
    return [];
  }

  getPerformerContract(
    _studioId: string,
    _performerId: string,
  ): RosterEntry | null {
    // TODO: Implement contract lookup from studio_contracts
    return null;
  }
}
