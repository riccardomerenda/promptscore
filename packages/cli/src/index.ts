import { Command } from 'commander';
import {
  analyze,
  buildBatchReport,
  createDefaultRegistry,
  format,
  loadPromptScoreConfig,
  ProfileLoader,
  type FailOnSeverity,
  type ReportFormat,
} from '@promptscore/core';
import {
  getExitCode,
  readPromptFile,
  resolveAnalyzeSource,
  resolveConfigSearchDir,
} from './analyze.js';
import { productVersion } from './version.js';

const program = new Command();

program
  .name('promptscore')
  .description('Static analysis for LLM prompts — ESLint, but for prompts.')
  .version(productVersion);

program
  .command('analyze')
  .description('Analyze a prompt and print a report')
  .argument('[inputs...]', 'file, directory, or glob to analyze')
  .option('-c, --config <path>', 'path to a PromptScore config file')
  .option('-i, --inline <prompt>', 'analyze an inline prompt string')
  .option('-m, --model <model>', 'model profile name (e.g. claude, gpt)', '_base')
  .option('-f, --format <format>', 'output format: text, json, markdown', 'text')
  .option('-r, --rules <rules>', 'comma-separated rule ids to include')
  .option('--fail-on <severity>', 'exit non-zero on error, warning, info, or none', 'error')
  .option('--llm', 'include LLM-powered rules (requires API key)', false)
  .option('--no-color', 'disable colored output')
  .action(async (inputs: string[] | undefined, opts, command: Command) => {
    try {
      const loadedConfig = await loadPromptScoreConfig({
        cwd: opts.config ? process.cwd() : resolveConfigSearchDir(inputs),
        configPath: opts.config,
      });
      const source = await resolveAnalyzeSource(inputs, opts.inline);
      if (!source) {
        process.stderr.write(
          'No prompt provided. Pass a file, directory, glob, or use --inline.\n',
        );
        process.exit(1);
      }

      const model = resolveOption(command, 'model', opts.model, loadedConfig.config.model, '_base');
      const fmt = resolveOption(command, 'format', opts.format, loadedConfig.config.format, 'text');
      const includeLlm = resolveOption(
        command,
        'llm',
        Boolean(opts.llm),
        loadedConfig.config.includeLlm,
        false,
      );
      const color = resolveOption(
        command,
        'color',
        opts.color !== false,
        loadedConfig.config.color,
        true,
      );
      const failOnSeverity = parseFailOnSeverity(
        resolveOption(
          command,
          'failOn',
          String(opts.failOn),
          loadedConfig.config.failOnSeverity,
          'error',
        ),
      );
      const only = optionWasProvided(command, 'rules')
        ? parseRulesOption(opts.rules)
        : loadedConfig.config.rules;

      const analyzeOptions = {
        model,
        only,
        includeLlm,
        profileOptions: loadedConfig.config.profilesDir
          ? { profilesDir: loadedConfig.config.profilesDir }
          : undefined,
      };

      const report =
        source.kind === 'files' && source.files.length > 1
          ? buildBatchReport(await analyzeFiles(source.files, analyzeOptions))
          : await analyzeSingleSource(source, analyzeOptions);

      const output = format(report, normalizeFormat(fmt), { color });
      process.stdout.write(output + '\n');

      process.exit(getExitCode(report, failOnSeverity));
    } catch (err) {
      printError(err);
      process.exit(2);
    }
  });

program
  .command('rules')
  .description('List all available rules')
  .option('-f, --format <format>', 'output format: text, json', 'text')
  .action((opts) => {
    const registry = createDefaultRegistry();
    const rules = registry.all();
    if (opts.format === 'json') {
      process.stdout.write(JSON.stringify(rules.map(stripRuleCheck), null, 2) + '\n');
      return;
    }
    for (const rule of rules) {
      process.stdout.write(`${rule.id}  [${rule.category}, ${rule.defaultSeverity}]\n`);
      process.stdout.write(`  ${rule.description}\n\n`);
    }
  });

program
  .command('profiles')
  .description('List available profiles')
  .option('-c, --config <path>', 'path to a PromptScore config file')
  .action(async (opts) => {
    try {
      const loadedConfig = await loadPromptScoreConfig({
        cwd: process.cwd(),
        configPath: opts.config,
      });
      const loader = new ProfileLoader(
        loadedConfig.config.profilesDir ? { profilesDir: loadedConfig.config.profilesDir } : {},
      );
      const names = await loader.list();
      for (const name of names) {
        const profile = await loader.load(name);
        process.stdout.write(`${profile.name}  ${profile.displayName}\n`);
      }
    } catch (err) {
      printError(err);
      process.exit(2);
    }
  });

function normalizeFormat(input: string): ReportFormat {
  if (input === 'json' || input === 'markdown' || input === 'text') return input;
  return 'text';
}

function resolveOption<T>(
  command: Command,
  optionName: string,
  cliValue: T,
  configValue: T | undefined,
  fallback: T,
): T {
  if (optionWasProvided(command, optionName)) {
    return cliValue;
  }
  return configValue ?? fallback;
}

function optionWasProvided(command: Command, optionName: string): boolean {
  return command.getOptionValueSource(optionName) === 'cli';
}

function parseRulesOption(value: string | undefined): string[] | undefined {
  if (!value) return undefined;
  return String(value)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseFailOnSeverity(value: string): FailOnSeverity {
  if (value === 'error' || value === 'warning' || value === 'info' || value === 'none') {
    return value;
  }
  throw new Error(`Invalid value for --fail-on: ${value}`);
}

function stripRuleCheck<T extends { check: unknown }>(rule: T): Omit<T, 'check'> {
  const { check: _check, ...rest } = rule;
  return rest;
}

function printError(err: unknown): void {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`error: ${msg}\n`);
}

program.parseAsync(process.argv).catch((err) => {
  printError(err);
  process.exit(2);
});

async function analyzeSingleSource(
  source: Awaited<ReturnType<typeof resolveAnalyzeSource>>,
  options: Parameters<typeof analyze>[1],
) {
  if (!source) {
    throw new Error('No prompt provided.');
  }

  if (source.kind === 'files') {
    const [file] = source.files;
    if (!file) {
      throw new Error('No prompt files matched the provided inputs.');
    }
    return analyze(await readPromptFile(file.absolutePath), options);
  }

  return analyze(source.prompt, options);
}

async function analyzeFiles(
  files: Array<{ absolutePath: string; displayPath: string }>,
  options: Parameters<typeof analyze>[1],
) {
  const reports: Array<{ path: string; report: Awaited<ReturnType<typeof analyze>> }> = [];

  for (const file of files) {
    const prompt = await readPromptFile(file.absolutePath);
    reports.push({
      path: file.displayPath,
      report: await analyze(prompt, options),
    });
  }

  return reports;
}
