import type { RuleSeverity } from '../rules/types.js';

export interface ProfileRuleOverride {
  severity?: RuleSeverity;
  weight?: number;
  suggestion?: string;
  reference?: string;
  enabled?: boolean;
}

export interface Profile {
  name: string;
  displayName: string;
  version?: string;
  base?: string;
  rules: Record<string, ProfileRuleOverride>;
  bestPractices: string[];
}

export interface RawProfile {
  name?: string;
  display_name?: string;
  version?: string;
  base?: string;
  rules?: Record<string, ProfileRuleOverride>;
  best_practices?: string[];
}
