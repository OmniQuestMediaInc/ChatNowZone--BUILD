// WO: WO-057-SCENARIO-PROVISIONING
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../logger';

export interface ScenarioEntry {
  id: string;
  category: string;
  title: string;
  trigger_code: string;
  severity: number;
  expected_action: string;
}

const MANIFEST_PATH = path.resolve(
  __dirname,
  '../../../../tests/scenarios/scenario_manifest.json',
);

let cachedScenarios: ScenarioEntry[] | null = null;

function loadManifest(): ScenarioEntry[] {
  if (cachedScenarios !== null) {
    return cachedScenarios;
  }
  try {
    const raw = fs.readFileSync(MANIFEST_PATH, 'utf-8');
    cachedScenarios = JSON.parse(raw) as ScenarioEntry[];
    return cachedScenarios;
  } catch (error) {
    logger.error('IncidentDensityService: failed to load scenario manifest', error, {
      context: 'IncidentDensityService',
      manifestPath: MANIFEST_PATH,
    });
    cachedScenarios = [];
    return cachedScenarios;
  }
}

export class IncidentDensityService {
  private readonly scenarios: ScenarioEntry[];

  constructor() {
    this.scenarios = loadManifest();
  }

  isValidScenario(scenarioId: string): boolean {
    const valid = this.scenarios.some((s) => s.id === scenarioId);
    if (!valid) {
      logger.warn('isValidScenario: unknown scenario', {
        context: 'IncidentDensityService',
        scenarioId,
      });
    }
    return valid;
  }
}
