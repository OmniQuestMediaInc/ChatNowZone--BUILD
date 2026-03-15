// WO: WO-020
import { Injectable } from '@nestjs/common';
import { logger } from '../logger';

export interface IngestionPayload {
  sourceType: 'STUDIO' | 'MODEL';
  sourceId: string;
  eventType: string;
  data: Record<string, unknown>;
  correlationId: string;
}

export interface IngestionResult {
  accepted: boolean;
  correlationId: string;
  reason?: string;
}

/**
 * WO-020: Frontend Ingestion Layer
 * Integrates backend services into Studio/Model UI components.
 * TODO: Implement full event routing and UI surface binding.
 */
@Injectable()
export class IngestionService {
  async ingest(payload: IngestionPayload): Promise<IngestionResult> {
    if (!payload.sourceId || !payload.correlationId || !payload.eventType) {
      const reason = 'ingest: missing required fields: sourceId, correlationId, or eventType';
      logger.error(reason, undefined, {
        context: 'IngestionService',
        correlationId: payload.correlationId,
      });
      return { accepted: false, correlationId: payload.correlationId, reason };
    }

    logger.info('IngestionService: event ingested', {
      context: 'IngestionService',
      sourceType: payload.sourceType,
      sourceId: payload.sourceId,
      eventType: payload.eventType,
      correlationId: payload.correlationId,
    });

    // TODO: Route event to appropriate backend service based on sourceType
    return { accepted: true, correlationId: payload.correlationId };
  }
}
