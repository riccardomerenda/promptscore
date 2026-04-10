import { parsePrompt } from './parser/index.js';
import { getBuiltinProfile, type BuiltinProfileName } from './profiles/builtin.js';
import type { Profile } from './profiles/types.js';
import { createDefaultRegistry, type RuleRegistry } from './rules/registry.js';
import type { Rule } from './rules/types.js';
import { buildReport, runRules, type ScoreReport } from './scorer/index.js';

export { parsePrompt } from './parser/index.js';
export type { PromptAST, PromptComponents, PromptMetadata, Example } from './parser/types.js';

export { RuleRegistry, createDefaultRegistry } from './rules/registry.js';
export type {
  Rule,
  RuleCategory,
  RuleContext,
  RuleResult,
  RuleSeverity,
  RuleType,
} from './rules/types.js';

export { builtinProfiles, getBuiltinProfile } from './profiles/builtin.js';
export type { BuiltinProfileName } from './profiles/builtin.js';
export type { Profile, ProfileRuleOverride } from './profiles/types.js';

export { runRules, buildReport } from './scorer/index.js';
export type { ScoreReport, CategoryScore, Suggestion, RunRulesOptions } from './scorer/index.js';

export { format, formatText, formatJson, formatMarkdown } from './reporter/index.js';
export type { ReportFormat, TextReporterOptions } from './reporter/index.js';

export { deterministicRules } from './rules/deterministic/index.js';

export interface AnalyzeBrowserOptions {
  profile?: Profile;
  profileName?: BuiltinProfileName;
  only?: string[];
  includeLlm?: boolean;
  registry?: RuleRegistry;
  extraRules?: Rule[];
}

export async function analyzeWithProfile(
  prompt: string,
  options: AnalyzeBrowserOptions = {},
): Promise<ScoreReport> {
  const ast = parsePrompt(prompt);
  const registry = options.registry ?? createDefaultRegistry();

  if (options.extraRules) {
    for (const rule of options.extraRules) {
      if (!registry.has(rule.id)) registry.register(rule);
    }
  }

  const profile = options.profile ?? getBuiltinProfile(options.profileName ?? '_base');
  const results = await runRules({
    rules: registry.all(),
    profile,
    ast,
    only: options.only,
    includeLlm: options.includeLlm,
  });

  return buildReport(results, profile);
}
