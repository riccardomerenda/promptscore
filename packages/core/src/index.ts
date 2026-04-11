import { parsePrompt } from './parser/index.js';
import { createDefaultRegistry, type RuleRegistry } from './rules/registry.js';
import { ProfileLoader, type ProfileLoaderOptions } from './profiles/loader.js';
import { buildReport, runRules, type ScoreReport } from './scorer/index.js';
import type { Rule } from './rules/types.js';
import type { Profile } from './profiles/types.js';

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

export { loadPromptScoreConfig } from './config/loader.js';
export type { PromptScoreConfigLoaderOptions } from './config/loader.js';
export type {
  ConfigReportFormat,
  FailOnSeverity,
  LoadedPromptScoreConfig,
  PromptScoreConfig,
} from './config/types.js';

export { ProfileLoader } from './profiles/loader.js';
export type { ProfileLoaderOptions } from './profiles/loader.js';
export type { Profile, ProfileRuleOverride } from './profiles/types.js';
export { builtinProfiles, getBuiltinProfile } from './profiles/builtin.js';
export type { BuiltinProfileName } from './profiles/builtin.js';

export { buildBatchReport, countFindings } from './batch/index.js';
export type {
  BatchFileReport,
  BatchReport,
  BatchReportInput,
  BatchSummary,
  BatchWorstFile,
  SeverityCounts,
} from './batch/index.js';

export { runRules, buildReport } from './scorer/index.js';
export type { ScoreReport, CategoryScore, Suggestion, RunRulesOptions } from './scorer/index.js';

export { format, formatText, formatJson, formatMarkdown } from './reporter/index.js';
export type { ReportFormat, TextReporterOptions } from './reporter/index.js';

export { deterministicRules } from './rules/deterministic/index.js';

export interface AnalyzeOptions {
  /** Model profile name (e.g. "claude", "gpt"). Defaults to "_base". */
  model?: string;
  /** Restrict to specific rule IDs. */
  only?: string[];
  /** Run LLM-backed rules. Default: false. */
  includeLlm?: boolean;
  /** Override the rule registry. */
  registry?: RuleRegistry;
  /** Profile loader options. */
  profileOptions?: ProfileLoaderOptions;
  /** Pre-loaded profile. Overrides the profile loader entirely. */
  profile?: Profile;
  /** Additional rules to register before analysis. */
  extraRules?: Rule[];
}

export async function analyze(prompt: string, options: AnalyzeOptions = {}): Promise<ScoreReport> {
  const ast = parsePrompt(prompt);
  const registry = options.registry ?? createDefaultRegistry();
  if (options.extraRules) {
    for (const rule of options.extraRules) {
      if (!registry.has(rule.id)) registry.register(rule);
    }
  }

  let profile: Profile;
  if (options.profile) {
    profile = options.profile;
  } else {
    const loader = new ProfileLoader(options.profileOptions ?? {});
    profile = await loader.load(options.model ?? '_base');
  }

  const results = await runRules({
    rules: registry.all(),
    profile,
    ast,
    only: options.only,
    includeLlm: options.includeLlm,
  });

  return buildReport(results, profile);
}
