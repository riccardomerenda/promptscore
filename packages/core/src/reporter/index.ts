import type { ScoreReport } from '../scorer/index.js';
import type { RuleResult } from '../rules/types.js';

export type ReportFormat = 'text' | 'json' | 'markdown';

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function c(color: keyof typeof COLORS, text: string, enabled: boolean): string {
  if (!enabled) return text;
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

function severityColor(sev: RuleResult['severity']): keyof typeof COLORS {
  if (sev === 'error') return 'red';
  if (sev === 'warning') return 'yellow';
  return 'blue';
}

function severityLabel(sev: RuleResult['severity']): string {
  if (sev === 'error') return 'error';
  if (sev === 'warning') return 'warn ';
  return 'info ';
}

function scoreColor(score: number): keyof typeof COLORS {
  if (score >= 80) return 'green';
  if (score >= 50) return 'yellow';
  return 'red';
}

export interface TextReporterOptions {
  color?: boolean;
}

export function formatText(report: ScoreReport, options: TextReporterOptions = {}): string {
  const color = options.color ?? true;
  const out: string[] = [];
  const overallRounded = Math.round(report.overall);
  const bar = buildBar(overallRounded, 30);

  out.push(c('bold', `PromptScore — profile: ${report.profileName}`, color));
  out.push('');
  out.push(
    `${c('bold', 'Overall', color)}  ${c(scoreColor(overallRounded), `${overallRounded}/100`, color)}  ${bar}`,
  );
  out.push(c('dim', report.summary, color));
  out.push('');

  out.push(c('bold', 'Categories', color));
  for (const category of report.categories) {
    const s = Math.round(category.score);
    out.push(
      `  ${category.category.padEnd(16)} ${c(scoreColor(s), `${String(s).padStart(3)}/100`, color)} ${c('dim', `(${category.rules.length} rules)`, color)}`,
    );
  }
  out.push('');

  const failed = report.results.filter((r) => !r.passed);
  if (failed.length > 0) {
    out.push(c('bold', 'Findings', color));
    for (const result of failed) {
      const label = c(severityColor(result.severity), severityLabel(result.severity), color);
      out.push(`  ${label}  ${c('bold', result.ruleId, color)}  ${result.message}`);
      if (result.suggestion) {
        out.push(c('dim', `         → ${result.suggestion}`, color));
      }
      if (result.reference) {
        out.push(c('dim', `         see: ${result.reference}`, color));
      }
    }
    out.push('');
  }

  const passed = report.results.filter((r) => r.passed);
  if (passed.length > 0) {
    out.push(c('dim', `${passed.length} rule${passed.length === 1 ? '' : 's'} passed.`, color));
  }

  return out.join('\n');
}

function buildBar(score: number, width: number): string {
  const filled = Math.round((score / 100) * width);
  const empty = width - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
}

export function formatJson(report: ScoreReport, pretty = true): string {
  return JSON.stringify(report, null, pretty ? 2 : 0);
}

export function formatMarkdown(report: ScoreReport): string {
  const out: string[] = [];
  out.push(`# PromptScore — ${report.profileName}`);
  out.push('');
  out.push(`**Overall:** ${Math.round(report.overall)}/100`);
  out.push('');
  out.push(`> ${report.summary}`);
  out.push('');
  out.push('## Categories');
  out.push('');
  out.push('| Category | Score | Rules |');
  out.push('| --- | --- | --- |');
  for (const category of report.categories) {
    out.push(
      `| ${category.category} | ${Math.round(category.score)}/100 | ${category.rules.length} |`,
    );
  }
  out.push('');

  const failed = report.results.filter((r) => !r.passed);
  if (failed.length > 0) {
    out.push('## Findings');
    out.push('');
    for (const result of failed) {
      out.push(`### \`${result.ruleId}\` — ${result.severity}`);
      out.push('');
      out.push(result.message);
      if (result.suggestion) {
        out.push('');
        out.push(`**Suggestion:** ${result.suggestion}`);
      }
      if (result.reference) {
        out.push('');
        out.push(`**Reference:** ${result.reference}`);
      }
      out.push('');
    }
  }
  return out.join('\n');
}

export function format(
  report: ScoreReport,
  fmt: ReportFormat,
  options: TextReporterOptions = {},
): string {
  if (fmt === 'json') return formatJson(report);
  if (fmt === 'markdown') return formatMarkdown(report);
  return formatText(report, options);
}
