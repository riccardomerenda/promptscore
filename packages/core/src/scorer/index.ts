import type { PromptAST } from '../parser/types.js';
import type { Profile } from '../profiles/types.js';
import type { Rule, RuleCategory, RuleResult } from '../rules/types.js';

export interface CategoryScore {
  category: RuleCategory;
  score: number;
  rules: RuleResult[];
}

export interface Suggestion {
  ruleId: string;
  severity: RuleResult['severity'];
  message: string;
  suggestion: string;
  reference?: string;
  impact: number;
}

export interface ScoreReport {
  overall: number;
  categories: CategoryScore[];
  summary: string;
  suggestions: Suggestion[];
  results: RuleResult[];
  profileName: string;
}

export interface RunRulesOptions {
  rules: Rule[];
  profile: Profile;
  ast: PromptAST;
  only?: string[];
  includeLlm?: boolean;
}

function isRuleEnabled(rule: Rule, profile: Profile): boolean {
  const override = profile.rules[rule.id];
  if (override?.enabled === false) return false;
  return true;
}

function applyOverride(result: RuleResult, profile: Profile): RuleResult {
  const override = profile.rules[result.ruleId];
  if (!override) return result;
  return {
    ...result,
    severity: override.severity ?? result.severity,
    weight: override.weight ?? result.weight,
    suggestion: override.suggestion ?? result.suggestion,
    reference: override.reference ?? result.reference,
  };
}

export async function runRules(options: RunRulesOptions): Promise<RuleResult[]> {
  const { rules, profile, ast, only, includeLlm } = options;
  const results: RuleResult[] = [];
  for (const rule of rules) {
    if (only && !only.includes(rule.id)) continue;
    if (!isRuleEnabled(rule, profile)) continue;
    if (rule.type === 'llm' && !includeLlm) continue;
    const base = await rule.check({ ast, profile });
    results.push(applyOverride(base, profile));
  }
  return results;
}

function groupByCategory(results: RuleResult[]): Map<RuleCategory, RuleResult[]> {
  const grouped = new Map<RuleCategory, RuleResult[]>();
  for (const result of results) {
    const existing = grouped.get(result.category) ?? [];
    existing.push(result);
    grouped.set(result.category, existing);
  }
  return grouped;
}

function weightedAverage(values: number[], weights: number[]): number {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  if (totalWeight === 0) return 0;
  const sum = values.reduce((acc, v, i) => acc + v * (weights[i] ?? 1), 0);
  return sum / totalWeight;
}

function buildSummary(overall: number, results: RuleResult[]): string {
  const failed = results.filter((r) => !r.passed);
  if (failed.length === 0) return `Score ${Math.round(overall)}/100 — strong prompt.`;
  const errors = failed.filter((r) => r.severity === 'error').length;
  const warnings = failed.filter((r) => r.severity === 'warning').length;
  const pieces: string[] = [];
  if (errors) pieces.push(`${errors} error${errors === 1 ? '' : 's'}`);
  if (warnings) pieces.push(`${warnings} warning${warnings === 1 ? '' : 's'}`);
  const extras = failed.length - errors - warnings;
  if (extras > 0) pieces.push(`${extras} info`);
  return `Score ${Math.round(overall)}/100 — ${pieces.join(', ')}.`;
}

function buildSuggestions(results: RuleResult[]): Suggestion[] {
  const severityRank: Record<RuleResult['severity'], number> = {
    error: 3,
    warning: 2,
    info: 1,
  };
  return results
    .filter((r) => !r.passed && r.suggestion)
    .map<Suggestion>((r) => ({
      ruleId: r.ruleId,
      severity: r.severity,
      message: r.message,
      suggestion: r.suggestion!,
      reference: r.reference,
      impact: (100 - r.score) * r.weight * severityRank[r.severity],
    }))
    .sort((a, b) => b.impact - a.impact);
}

export function buildReport(results: RuleResult[], profile: Profile): ScoreReport {
  const grouped = groupByCategory(results);
  const categories: CategoryScore[] = [];
  for (const [category, rs] of grouped) {
    const score = weightedAverage(
      rs.map((r) => r.score),
      rs.map((r) => r.weight),
    );
    categories.push({ category, score, rules: rs });
  }
  const overall = weightedAverage(
    categories.map((c) => c.score),
    categories.map((c) => c.rules.reduce((a, r) => a + r.weight, 0)),
  );
  return {
    overall,
    categories,
    summary: buildSummary(overall, results),
    suggestions: buildSuggestions(results),
    results,
    profileName: profile.name,
  };
}
