import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const rootPackage = JSON.parse(await readFile(path.join(repoRoot, 'package.json'), 'utf8'));

const args = parseArgs(process.argv.slice(2));

const baseUrl = normalizeBaseUrl(
  args['base-url'] ?? rootPackage.homepage ?? 'https://promptscore.dev',
);
const expectedVersion = args['expected-version'] ?? `v${rootPackage.version}`;
const timeoutMs = parseIntegerOption(args['timeout-ms'], 15 * 60 * 1000, 'timeout-ms');
const intervalMs = parseIntegerOption(args['interval-ms'], 15 * 1000, 'interval-ms');
const statusPaths = ensureArray(args.path);
const versionPaths = ensureArray(args['version-path']);

const checks = [
  ...versionPaths.map((pathValue) => ({
    type: 'content',
    path: normalizePath(pathValue),
    needle: expectedVersion,
    label: `contains ${expectedVersion}`,
  })),
  ...statusPaths.map((pathValue) => ({
    type: 'status',
    path: normalizePath(pathValue),
    label: 'returns HTTP 200',
  })),
];

if (checks.length === 0) {
  checks.push({
    type: 'content',
    path: '/',
    needle: expectedVersion,
    label: `contains ${expectedVersion}`,
  });
}

const deadline = Date.now() + timeoutMs;
let attempt = 0;
let lastFailures = [];

process.stdout.write(`Live site smoke check for ${baseUrl}\n`);
process.stdout.write(`Expected version: ${expectedVersion}\n`);
process.stdout.write(`Checks:\n`);
for (const check of checks) {
  process.stdout.write(`- ${check.path} ${check.label}\n`);
}
process.stdout.write('\n');

while (Date.now() <= deadline) {
  attempt += 1;
  const cache = new Map();
  const failures = [];

  process.stdout.write(`Attempt ${attempt}...\n`);

  for (const check of checks) {
    const result = await fetchPath(cache, baseUrl, check.path);

    if (!result.ok) {
      failures.push(`${check.path} request failed: ${result.error}`);
      continue;
    }

    if (!result.response.ok) {
      failures.push(`${check.path} returned HTTP ${result.response.status}`);
      continue;
    }

    if (check.type === 'content' && !result.body.includes(check.needle)) {
      failures.push(`${check.path} is live but does not yet include "${check.needle}"`);
      continue;
    }

    process.stdout.write(`  OK ${check.path} ${check.label}\n`);
  }

  if (failures.length === 0) {
    process.stdout.write('\nLive site smoke check passed.\n');
    process.exit(0);
  }

  lastFailures = failures;
  for (const failure of failures) {
    process.stdout.write(`  WAIT ${failure}\n`);
  }

  if (Date.now() + intervalMs > deadline) {
    break;
  }

  process.stdout.write(`Sleeping ${intervalMs}ms before retrying...\n\n`);
  await delay(intervalMs);
}

process.stderr.write('\nLive site smoke check failed.\n');
for (const failure of lastFailures) {
  process.stderr.write(`- ${failure}\n`);
}
process.exit(1);

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token?.startsWith('--')) {
      throw new Error(`Unexpected argument: ${token}`);
    }

    const key = token.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for --${key}`);
    }

    if (key in parsed) {
      parsed[key] = [...ensureArray(parsed[key]), value];
    } else {
      parsed[key] = value;
    }

    index += 1;
  }

  return parsed;
}

function ensureArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function parseIntegerOption(value, fallback, optionName) {
  if (!value) return fallback;
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid value for --${optionName}: ${value}`);
  }
  return parsed;
}

function normalizeBaseUrl(value) {
  return new URL(value).toString().replace(/\/$/, '');
}

function normalizePath(value) {
  if (!value.startsWith('/')) {
    return `/${value}`;
  }
  return value;
}

async function fetchPath(cache, baseUrlValue, pathValue) {
  const cacheKey = pathValue;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const url = new URL(`${baseUrlValue}${pathValue}`);
  url.searchParams.set('__smoke', Date.now().toString());

  try {
    const response = await fetch(url, {
      headers: {
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'user-agent': 'promptscore-live-site-smoke/1.0',
      },
      redirect: 'follow',
    });
    const body = await response.text();
    const result = { ok: true, response, body };
    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    const result = {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
    cache.set(cacheKey, result);
    return result;
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
