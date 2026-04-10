import type { PromptAST } from '../parser/types.js';
import type { Profile } from '../profiles/types.js';

export type RuleCategory =
  | 'clarity'
  | 'structure'
  | 'specificity'
  | 'best-practice'
  | 'model-specific';

export type RuleSeverity = 'error' | 'warning' | 'info';

export type RuleType = 'deterministic' | 'llm';

export interface RuleResult {
  ruleId: string;
  passed: boolean;
  score: number; // 0-100
  message: string;
  suggestion?: string;
  reference?: string;
  severity: RuleSeverity;
  category: RuleCategory;
  weight: number;
}

export interface RuleContext {
  ast: PromptAST;
  profile: Profile;
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  category: RuleCategory;
  defaultSeverity: RuleSeverity;
  type: RuleType;
  models?: string[];
  check: (ctx: RuleContext) => RuleResult | Promise<RuleResult>;
}
