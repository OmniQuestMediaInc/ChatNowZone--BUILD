// WO: WO-INIT-001
import { db } from '../db';
import { logger } from '../logger';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RiskScore {
  userId: string;
  level: RiskLevel;
  score: number;
}

export class RiskScoreService {
  async getScore(userId: string): Promise<RiskScore> {
    try {
      const profile = await db.user_risk_profiles.findUnique({
        where: { user_id: userId },
      });

      if (!profile) {
        return { userId, level: 'LOW', score: 0 };
      }

      const chargedBack = Number(profile.total_charged_back);
      const disputed = Number(profile.total_disputed);
      const approved = Number(profile.total_approved);

      const total = chargedBack + disputed + approved;
      const riskRatio = total > 0 ? (chargedBack + disputed) / total : 0;
      const score = Math.round(riskRatio * 100);

      let level: RiskLevel = 'LOW';
      if (chargedBack > 0 || score >= 50) {
        level = 'HIGH';
      } else if (score >= 20) {
        level = 'MEDIUM';
      }

      return { userId, level, score };
    } catch (err) {
      logger.error('RiskScoreService.getScore failed', {
        user_id: userId,
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  }
}

