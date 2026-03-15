import { createHash } from 'crypto';
import { CommissionSplitEntry } from './schema';

export class BatchPayoutService {
  public static generateStudioBatch(studioId: string, entries: CommissionSplitEntry[]): any {
    const validEntries = entries.filter(e => e.studioId === studioId && (e.modelNetCents + e.studioAgencyHoldbackCents === e.grossCents));
    let totalCents = 0n;
    const ids: string[] = [];

    validEntries.forEach(entry => {
      totalCents += (entry.studioAgencyHoldbackCents + entry.studioServiceFeesCents) - entry.platformSystemFeeCents;
      ids.push(entry.transactionId);
    });

    const payload = `${studioId}:${totalCents.toString()}:${ids.sort().join(',')}`;
    return {
      batchId: `OQMI-BATCH-${studioId}-${Date.now()}`,
      totalPayoutCents: totalCents,
      batchChecksum: createHash('sha256').update(payload).digest('hex'),
      processedAt: new Date().toISOString()
    };
  }
}