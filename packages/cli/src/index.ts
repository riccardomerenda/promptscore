import { Command } from 'commander';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import {
  analyze,
  createDefaultRegistry,
  format,
  ProfileLoader,
  type ReportFormat,
} from '@promptscore/core';

const program = new Command();

program
  .name('promptscore')
  .description('Static analysis for LLM prompts — ESLint, but for prompts.')
  .version('0.1.1');

program
  .command('analyze')
  .description('Analyze a prompt and print a report')
  .argument('[file]', 'path to a prompt file')
  .option('-i, --inline <prompt>', 'analyze an inline prompt string')
  .option('-m, --model <model>', 'model profile name (e.g. claude, gpt)', '_base')
  .option('-f, --format <format>', 'output format: text, json, markdown', 'text')
  .option('-r, --rules <rules>', 'comma-separated rule ids to include')
  .option('--llm', 'include LLM-powered rules (requires API key)', false)
  .option('--no-color', 'disable colored output')
  .action(async (file: string | undefined, opts) => {
    try {
      const prompt = await resolvePromptInput(file, opts.inline);
      if (!prompt) {
        process.stderr.write('No prompt provided. Pass a file path or use --inline.\n');
        process.exit(1);
      }

      const only = opts.rules
        ? String(opts.rules)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

      const report = await analyze(prompt, {
        model: opts.model,
        only,
        includeLlm: Boolean(opts.llm),
      });

      const fmt = normalizeFormat(opts.format);
      const output = format(report, fmt, { color: opts.color !== false });
      process.stdout.write(output + '\n');

      const hasErrors = report.results.some((r) => !r.passed && r.severity === 'error');
      process.exit(hasErrors ? 1 : 0);
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
  .action(async () => {
    try {
      const loader = new ProfileLoader();
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

async function resolvePromptInput(
  file: string | undefined,
  inline: string | undefined,
): Promise<string | undefined> {
  if (inline) return inline;
  if (file) {
    if (!existsSync(file)) {
      throw new Error(`File not found: ${file}`);
    }
    return readFile(file, 'utf8');
  }
  // Try reading from stdin if piped
  if (!process.stdin.isTTY) {
    return readStdin();
  }
  return undefined;
}

async function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

function normalizeFormat(input: string): ReportFormat {
  if (input === 'json' || input === 'markdown' || input === 'text') return input;
  return 'text';
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
