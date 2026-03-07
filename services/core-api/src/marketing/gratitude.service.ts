// WO: WO-INIT-001
import { Injectable } from '@nestjs/common';

@Injectable()
export class GratitudeService {
  // Requirement: Users feel appreciated after the fact.
  async triggerPostTipFollowup(userId: string, creatorName: string, amount: number) {
    const message = this.generatePraiseMessage(creatorName, amount);

    // Logic: Delay sending by 30 minutes to feel "authentic"
    await this.queueMessage(userId, message, 1800000);
  }

  private generatePraiseMessage(name: string, amount: number): string {
    const templates = [
      `Hey! ${name} really appreciated that tip earlier. It made the show!`,
      `Just wanted to say thanks again for the support. ${name} is still buzzing.`,
      `That was a generous tip for ${name}. Hope to see you in the room again soon!`,
    ];
    // Deterministic selection: reproducible given the same inputs (no randomness)
    const index = Math.abs(amount) % templates.length;
    return templates[index];
  }

  private async queueMessage(_userId: string, _body: string, delayMs: number) {
    // Integration point for BullMQ or Redis delay queue
    // NOTE: userId and message body are NOT logged to prevent PII leakage.
    console.log(`[MARKETING] Queued post-tip follow-up message in ${delayMs}ms`);
  }
}
