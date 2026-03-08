// WO: WO-INIT-001
import { logger } from '../logger';

export class GratitudeService {
  private static readonly THIRTY_MINUTES_MS = 30 * 60 * 1000;

  async triggerPostTipFollowup(
    userId: string,
    creatorName: string,
    amount: number,
  ): Promise<void> {
    const message = this.generatePraiseMessage(creatorName, amount);

    // Logic: Delay sending by 30 minutes to feel "authentic"
    await this.queueMessage(userId, message, GratitudeService.THIRTY_MINUTES_MS);
  }

  private generatePraiseMessage(name: string, amount: number): string {
    const templates = [
      `Hey! ${name} really appreciated that tip earlier. It made the show!`,
      `Just wanted to say thanks again for the support. ${name} is still buzzing.`,
      `That was a generous tip for ${name}. Hope to see you in the room again soon!`,
    ];
    // Deterministic selection: reproducible given the same inputs (no randomness)
    const index = Math.trunc(Math.abs(amount)) % templates.length;
    return templates[index];
  }

  private async queueMessage(userId: string, body: string, delayMs: number): Promise<void> {
    // Integration point for BullMQ or Redis delay queue
    logger.info('[MARKETING] Queued gratitude message', {
      context: 'GratitudeService',
      userId,
      delayMs,
      messageLength: body.length,
    });
  }
}
