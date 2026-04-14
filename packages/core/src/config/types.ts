export type ConfigReportFormat = 'text' | 'json' | 'markdown';

export type FailOnSeverity = 'error' | 'warning' | 'info' | 'none';

export type PromptScoreLlmProvider = 'openai';

export interface PromptScoreLlmConfig {
  provider?: PromptScoreLlmProvider;
  model?: string;
  apiKeyEnv?: string;
  baseUrl?: string;
}

export interface PromptScoreConfig {
  model?: string;
  format?: ConfigReportFormat;
  rules?: string[];
  includeLlm?: boolean;
  llm?: PromptScoreLlmConfig;
  color?: boolean;
  failOnSeverity?: FailOnSeverity;
  profilesDir?: string;
}

export interface RawPromptScoreLlmConfig {
  provider?: unknown;
  model?: unknown;
  apiKeyEnv?: unknown;
  api_key_env?: unknown;
  baseUrl?: unknown;
  base_url?: unknown;
}

export interface RawPromptScoreConfig {
  model?: unknown;
  format?: unknown;
  rules?: unknown;
  includeLlm?: unknown;
  include_llm?: unknown;
  llm?: unknown;
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
