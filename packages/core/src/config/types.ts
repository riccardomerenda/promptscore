export type ConfigReportFormat = 'text' | 'json' | 'markdown';

export type FailOnSeverity = 'error' | 'warning' | 'info' | 'none';

export interface PromptScoreConfig {
  model?: string;
  format?: ConfigReportFormat;
  rules?: string[];
  includeLlm?: boolean;
  color?: boolean;
  failOnSeverity?: FailOnSeverity;
  profilesDir?: string;
}

export interface RawPromptScoreConfig {
  model?: unknown;
  format?: unknown;
  rules?: unknown;
  includeLlm?: unknown;
  include_llm?: unknown;
  color?: unknown;
  failOnSeverity?: unknown;
  fail_on_severity?: unknown;
  profilesDir?: unknown;
  profiles_dir?: unknown;
}

export interface LoadedPromptScoreConfig {
  path?: string;
  config: PromptScoreConfig;
}
