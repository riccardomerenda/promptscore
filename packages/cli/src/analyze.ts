import { existsSync, statSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, extname, isAbsolute, join, parse, relative, resolve } from 'node:path';
import type { BatchReport, FailOnSeverity, ScoreReport } from '@promptscore/core';

const DISCOVERED_FILE_EXTENSIONS = new Set(['.txt', '.md', '.markdown', '.prompt']);
const IGNORED_DIRECTORY_NAMES = new Set([
  '.git',
  '.next',
  '.turbo',
  'build',
  'coverage',
  'dist',
  'node_modules',
]);

export interface AnalyzeFileTarget {
  absolutePath: string;
  displayPath: string;
}

export type AnalyzeSource =
  | {
      kind: 'inline' | 'stdin';
      prompt: string;
    }
  | {
      kind: 'files';
      files: AnalyzeFileTarget[];
    };

export async function resolveAnalyzeSource(
  inputs: string[] | undefined,
  inline: string | undefined,
  cwd = process.cwd(),
): Promise<AnalyzeSource | undefined> {
  const normalizedInputs = inputs?.filter(Boolean) ?? [];

  if (inline) {
    if (normalizedInputs.length > 0) {
      throw new Error('Cannot combine --inline with file, directory, or glob inputs.');
    }
    return { kind: 'inline', prompt: inline };
  }

  if (normalizedInputs.length > 0) {
    const files = await expandAnalyzeTargets(normalizedInputs, cwd);
    if (files.length === 0) {
      throw new Error('No prompt files matched the provided inputs.');
    }
    return { kind: 'files', files };
  }

  if (!process.stdin.isTTY) {
    return { kind: 'stdin', prompt: await readStdin() };
  }

  return undefined;
}

export async function readPromptFile(path: string): Promise<string> {
  return readFile(path, 'utf8');
}

export function resolveConfigSearchDir(inputs: string[] | undefined, cwd = process.cwd()): string {
  const normalizedInputs = inputs?.filter(Boolean) ?? [];
  if (normalizedInputs.length !== 1) {
    return cwd;
  }

  const input = normalizedInputs[0]!;
  const absoluteInput = resolve(cwd, input);
  if (existsSync(absoluteInput)) {
    return statSync(absoluteInput).isDirectory() ? absoluteInput : dirname(absoluteInput);
  }

  if (looksLikeGlob(input)) {
    return resolveGlobBaseDir(input, cwd);
  }

  return dirname(absoluteInput);
}

export function getExitCode(
  report: ScoreReport | BatchReport,
  failOnSeverity: FailOnSeverity,
): number {
  if (failOnSeverity === 'none') {
    return 0;
  }

  const counts =
    'kind' in report && report.kind === 'batch'
      ? report.summary.findings
      : countSingleReportFindings(report as ScoreReport);

  if (failOnSeverity === 'error') {
    return counts.error > 0 ? 1 : 0;
  }
  if (failOnSeverity === 'warning') {
    return counts.error > 0 || counts.warning > 0 ? 1 : 0;
  }
  return counts.total > 0 ? 1 : 0;
}

async function expandAnalyzeTargets(inputs: string[], cwd: string): Promise<AnalyzeFileTarget[]> {
  const files = new Map<string, AnalyzeFileTarget>();

  for (const input of inputs) {
    const absoluteInput = resolve(cwd, input);

    if (existsSync(absoluteInput)) {
      const stat = statSync(absoluteInput);
      if (stat.isDirectory()) {
        const discovered = await collectDirectoryFiles(absoluteInput);
        for (const path of discovered) {
          files.set(path, { absolutePath: path, displayPath: toDisplayPath(path, cwd) });
        }
      } else if (stat.isFile()) {
        files.set(absoluteInput, {
          absolutePath: absoluteInput,
          displayPath: toDisplayPath(absoluteInput, cwd),
        });
      }
      continue;
    }

    if (looksLikeGlob(input)) {
      const matched = await expandGlobPattern(input, cwd);
      for (const path of matched) {
        files.set(path, { absolutePath: path, displayPath: toDisplayPath(path, cwd) });
      }
      continue;
    }

    throw new Error(`Input not found: ${input}`);
  }

  return [...files.values()].sort((a, b) => a.displayPath.localeCompare(b.displayPath));
}

async function collectDirectoryFiles(rootDir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(rootDir, { withFileTypes: true });

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const absolutePath = join(rootDir, entry.name);
    if (entry.isSymbolicLink()) {
      continue;
    }
    if (entry.isDirectory()) {
      if (IGNORED_DIRECTORY_NAMES.has(entry.name)) {
        continue;
      }
      files.push(...(await collectDirectoryFiles(absolutePath)));
      continue;
    }
    if (entry.isFile() && DISCOVERED_FILE_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
      files.push(absolutePath);
    }
  }

  return files;
}

async function expandGlobPattern(pattern: string, cwd: string): Promise<string[]> {
  const baseDir = resolveGlobBaseDir(pattern, cwd);
  if (!existsSync(baseDir) || !statSync(baseDir).isDirectory()) {
    return [];
  }

  const candidates = await collectAllFiles(baseDir);
  const absolutePattern = resolve(cwd, pattern);
  const relativePattern = normalizePath(relative(baseDir, absolutePattern));
  const matchers = expandBraces(relativePattern).map((value) => globToRegExp(value));

  return candidates.filter((path) => {
    const relativePath = normalizePath(relative(baseDir, path));
    return matchers.some((matcher) => matcher.test(relativePath));
  });
}

async function collectAllFiles(rootDir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(rootDir, { withFileTypes: true });

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const absolutePath = join(rootDir, entry.name);
    if (entry.isSymbolicLink()) {
      continue;
    }
    if (entry.isDirectory()) {
      if (IGNORED_DIRECTORY_NAMES.has(entry.name)) {
        continue;
      }
      files.push(...(await collectAllFiles(absolutePath)));
      continue;
    }
    if (entry.isFile()) {
      files.push(absolutePath);
    }
  }

  return files;
}

function resolveGlobBaseDir(pattern: string, cwd: string): string {
  const absolutePattern = resolve(cwd, pattern);
  const { root } = parse(absolutePattern);
  const withoutRoot = absolutePattern.slice(root.length).replaceAll('\\', '/');
  const segments = withoutRoot.split('/').filter(Boolean);
  const staticSegments: string[] = [];

  for (const segment of segments) {
    if (looksLikeGlob(segment)) {
      break;
    }
    staticSegments.push(segment);
  }

  if (root) {
    return staticSegments.length > 0 ? join(root, ...staticSegments) : root;
  }

  return staticSegments.length > 0 ? join(...staticSegments) : cwd;
}

function looksLikeGlob(value: string): boolean {
  return /[*?[\]{}]/.test(value);
}

function expandBraces(pattern: string): string[] {
  const start = pattern.indexOf('{');
  if (start === -1) return [pattern];

  let depth = 0;
  let end = -1;
  for (let index = start; index < pattern.length; index += 1) {
    const char = pattern[index];
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        end = index;
        break;
      }
    }
  }

  if (end === -1) return [pattern];

  const prefix = pattern.slice(0, start);
  const suffix = pattern.slice(end + 1);
  const options = splitBraceOptions(pattern.slice(start + 1, end));

  return options.flatMap((option) => expandBraces(`${prefix}${option}${suffix}`));
}

function splitBraceOptions(value: string): string[] {
  const options: string[] = [];
  let depth = 0;
  let current = '';

  for (const char of value) {
    if (char === ',' && depth === 0) {
      options.push(current);
      current = '';
      continue;
    }
    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;
    current += char;
  }

  options.push(current);
  return options;
}

function globToRegExp(pattern: string): RegExp {
  let regex = '^';

  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index];
    if (char === undefined) {
      continue;
    }

    if (char === '*') {
      if (pattern[index + 1] === '*') {
        if (pattern[index + 2] === '/') {
          regex += '(?:[^/]+/)*';
          index += 2;
        } else {
          regex += '.*';
          index += 1;
        }
      } else {
        regex += '[^/]*';
      }
      continue;
    }

    if (char === '?') {
      regex += '[^/]';
      continue;
    }

    if (char === '[') {
      const closingIndex = pattern.indexOf(']', index + 1);
      if (closingIndex !== -1) {
        regex += pattern.slice(index, closingIndex + 1);
        index = closingIndex;
        continue;
      }
    }

    regex += escapeRegExp(char);
  }

  regex += '$';
  return new RegExp(regex);
}

function escapeRegExp(value: string): string {
  return value.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
}

function normalizePath(path: string): string {
  return path.replaceAll('\\', '/');
}

function toDisplayPath(absolutePath: string, cwd: string): string {
  const relativePath = relative(cwd, absolutePath);
  if (relativePath && !relativePath.startsWith('..') && !isAbsolute(relativePath)) {
    return normalizePath(relativePath);
  }
  return normalizePath(absolutePath);
}

function countSingleReportFindings(report: ScoreReport): {
  error: number;
  warning: number;
  total: number;
} {
  let error = 0;
  let warning = 0;
  let total = 0;

  for (const result of report.results) {
    if (result.passed) continue;
    total += 1;
    if (result.severity === 'error') {
      error += 1;
    } else if (result.severity === 'warning') {
      warning += 1;
    }
  }

  return { error, warning, total };
}

async function readStdin(): Promise<string> {
  return new Promise((resolvePromise, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => resolvePromise(data));
    process.stdin.on('error', reject);
  });
}
