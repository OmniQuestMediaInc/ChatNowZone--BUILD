export interface TipTransaction {
  userId: string;
  creatorId: string;
  tokenAmount: number;
  isVIP: boolean; 
  correlationId: string;
}
