import type { PromptAST } from '../parser/types.js';
import type { Profile } from '../profiles/types.js';
import type { LlmClient } from '../llm/types.js';

export type RuleCategory =
  | 'clarity'
  | 'structure'
  | 'specificity'
  | 'best-practice'
  | 'model-specific';

export type RuleSeverity = 'error' | 'warning' | 'info';

export type RuleType = 'deterministic' | 'llm';

export type RewritePlacement = 'prepend' | 'append';

export interface PromptRewrite {
  title: string;
  snippet: string;
  placement: RewritePlacement;
}

export interface RuleResult {
  ruleId: string;
  passed: boolean;
  score: number; // 0-100
  message: string;
  suggestion?: string;
  reference?: string;
  rewrite?: PromptRewrite;
  severity: RuleSeverity;
  category: RuleCategory;
  weight: number;
}

export interface RuleContext {
  ast: PromptAST;
  profile: Profile;
}

export interface LlmRuleContext extends RuleContext {
  llm: LlmClient;
}

interface BaseRule {
  id: string;
  name: string;
  description: string;
  category: RuleCategory;
  defaultSeverity: RuleSeverity;
  models?: string[];
}

export interface DeterministicRule extends BaseRule {
  type: 'deterministic';
  check: (ctx: RuleContext) => RuleResult | Promise<RuleResult>;
}

export interface LlmRule extends BaseRule {
  type: 'llm';
  check: (ctx: LlmRuleContext) => RuleResult | Promise<RuleResult>;
}

export type Rule = DeterministicRule | LlmRule;
