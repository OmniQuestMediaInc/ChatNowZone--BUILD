// WO: WO-INIT-001

export interface RosterEntry {
  performerId: string;
  studioId: string;
  contractRef: string;
  status: string;
}

export class RosterGateway {
  async getRoster(studioId: string): Promise<RosterEntry[]> {
    // TODO: Implement roster retrieval from studio_contracts
    return [];
  }

  async getPerformerContract(
    studioId: string,
    performerId: string,
  ): Promise<RosterEntry | null> {
    // TODO: Implement contract lookup from studio_contracts
    return null;
  }
}
