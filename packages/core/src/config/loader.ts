import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { parse as parseYaml } from 'yaml';
import type {
  ConfigReportFormat,
  FailOnSeverity,
  LoadedPromptScoreConfig,
  PromptScoreConfig,
  RawPromptScoreConfig,
} from './types.js';

const CONFIG_FILES = [
  'promptscore.config.json',
  'promptscore.config.yaml',
  'promptscore.config.yml',
  '.promptscorerc',
  '.promptscorerc.json',
  '.promptscorerc.yaml',
  '.promptscorerc.yml',
];

const VALID_FORMATS = new Set<ConfigReportFormat>(['text', 'json', 'markdown']);
const VALID_FAIL_ON_VALUES = new Set<FailOnSeverity>(['error', 'warning', 'info', 'none']);

export interface PromptScoreConfigLoaderOptions {
  configPath?: string;
  cwd?: string;
}

export async function loadPromptScoreConfig(
  options: PromptScoreConfigLoaderOptions = {},
): Promise<LoadedPromptScoreConfig> {
  const cwd = resolve(options.cwd ?? process.cwd());
  const path = options.configPath ? resolve(cwd, options.configPath) : findConfigFile(cwd);

  if (!path) {
    return { config: {} };
  }

  if (!existsSync(path)) {
    throw new Error(`Config file not found: ${path}`);
  }

  const content = await readFile(path, 'utf8');
  const raw = parseConfig(content, path);
  return {
    path,
    config: normalizeConfig(raw, path),
  };
}

function findConfigFile(startDir: string): string | undefined {
  let current = startDir;

  while (true) {
    for (const candidate of CONFIG_FILES) {
      const path = join(current, candidate);
      if (existsSync(path)) {
        return path;
      }
    }

    const parent = dirname(current);
    if (parent === current) {
      return undefined;
    }
    current = parent;
  }
}

function parseConfig(content: string, path: string): RawPromptScoreConfig {
  const parsed = (parseYaml(content) ?? {}) as unknown;
  if (!isRecord(parsed)) {
    throw new Error(`Config file must contain an object: ${path}`);
  }
  return parsed as RawPromptScoreConfig;
}

function normalizeConfig(raw: RawPromptScoreConfig, path: string): PromptScoreConfig {
  const config: PromptScoreConfig = {};

  const model = pick(raw, 'model');
  if (model !== undefined) {
    config.model = expectString(model, 'model', path);
  }

  const format = pick(raw, 'format');
  if (format !== undefined) {
    const normalized = expectString(format, 'format', path) as ConfigReportFormat;
    if (!VALID_FORMATS.has(normalized)) {
      throw new Error(`Invalid config value for "format" in ${path}: ${normalized}`);
    }
    config.format = normalized;
  }

  const rules = pick(raw, 'rules');
  if (rules !== undefined) {
    if (!Array.isArray(rules) || rules.some((rule) => typeof rule !== 'string')) {
      throw new Error(`Config value "rules" must be an array of strings in ${path}`);
    }
    config.rules = rules.map((rule) => rule.trim()).filter(Boolean);
  }

  const includeLlm = pick(raw, 'includeLlm', 'include_llm');
  if (includeLlm !== undefined) {
    config.includeLlm = expectBoolean(includeLlm, 'includeLlm', path);
  }

  const color = pick(raw, 'color');
  if (color !== undefined) {
    config.color = expectBoolean(color, 'color', path);
  }

  const failOnSeverity = pick(raw, 'failOnSeverity', 'fail_on_severity');
  if (failOnSeverity !== undefined) {
    const normalized = expectString(failOnSeverity, 'failOnSeverity', path) as FailOnSeverity;
    if (!VALID_FAIL_ON_VALUES.has(normalized)) {
      throw new Error(`Invalid config value for "failOnSeverity" in ${path}: ${normalized}`);
    }
    config.failOnSeverity = normalized;
  }

  const profilesDir = pick(raw, 'profilesDir', 'profiles_dir');
  if (profilesDir !== undefined) {
    config.profilesDir = resolve(dirname(path), expectString(profilesDir, 'profilesDir', path));
  }

  return config;
}

function pick(raw: RawPromptScoreConfig, ...keys: Array<keyof RawPromptScoreConfig>): unknown {
  for (const key of keys) {
    if (raw[key] !== undefined) {
      return raw[key];
    }
  }
  return undefined;
}

function expectString(value: unknown, field: string, path: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Config value "${field}" must be a non-empty string in ${path}`);
  }
  return value.trim();
}

function expectBoolean(value: unknown, field: string, path: string): boolean {
  if (typeof value !== 'boolean') {
    throw new Error(`Config value "${field}" must be a boolean in ${path}`);
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
