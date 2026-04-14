import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const checkMode = process.argv.includes('--check');

const rootPackagePath = path.join(repoRoot, 'package.json');
const productDocsPath = path.join(repoRoot, 'config', 'product-docs.json');
const readmePath = path.join(repoRoot, 'README.md');
const roadmapPath = path.join(repoRoot, 'ROADMAP.md');
const cliVersionModulePath = path.join(repoRoot, 'packages', 'cli', 'src', 'version.ts');
const webVersionModulePath = path.join(repoRoot, 'packages', 'web', 'src', 'lib', 'version.ts');

const rootPackage = JSON.parse(await readFile(rootPackagePath, 'utf8'));
const productDocs = JSON.parse(await readFile(productDocsPath, 'utf8'));

const version = rootPackage.version;
const versionLabel = `v${version}`;

const expectedReadme = applyReadmeTransforms(await readFile(readmePath, 'utf8'));
const expectedRoadmap = applyRoadmapTransforms(await readFile(roadmapPath, 'utf8'));

const expectedCliVersionModule = createVersionModule(version);
const expectedWebVersionModule = createVersionModule(version);

const checks = [
  { filePath: readmePath, actual: await readFile(readmePath, 'utf8'), expected: expectedReadme },
  { filePath: roadmapPath, actual: await readFile(roadmapPath, 'utf8'), expected: expectedRoadmap },
  {
    filePath: cliVersionModulePath,
    actual: await readFile(cliVersionModulePath, 'utf8'),
    expected: expectedCliVersionModule,
  },
  {
    filePath: webVersionModulePath,
    actual: await readFile(webVersionModulePath, 'utf8'),
    expected: expectedWebVersionModule,
  },
];

if (checkMode) {
  const mismatches = checks.filter((check) => check.actual !== check.expected);

  if (mismatches.length > 0) {
    process.stderr.write('Docs/version sync check failed for:\n');
    for (const mismatch of mismatches) {
      process.stderr.write(`- ${path.relative(repoRoot, mismatch.filePath)}\n`);
    }
    process.stderr.write(
      'Run `npm run sync:docs` and, if version files are out of date, `npm run sync-release-version`.\n',
    );
    process.exit(1);
  }

  process.stdout.write('Docs/version sync check passed.\n');
  process.exit(0);
}

await Promise.all(
  checks
    .filter((check) => check.actual !== check.expected)
    .map((check) => writeTextFile(check.filePath, check.expected)),
);

process.stdout.write('Synced product docs and version modules.\n');

function applyReadmeTransforms(source) {
  let next = source;
  next = next.replace(/^## Rules .*$/m, '## Rules in the current public release');
  next = replaceGeneratedBlock(next, 'product-status', renderReadmeStatus());
  return next;
}

function applyRoadmapTransforms(source) {
  let next = source;
  next = next.replace(/^## Current Baseline.*$/m, '## Current Baseline');
  next = replaceGeneratedBlock(next, 'roadmap-baseline', renderRoadmapBaseline());
  next = replaceGeneratedBlock(next, 'roadmap-release-plan', renderRoadmapReleasePlan());
  next = replaceGeneratedBlock(next, 'roadmap-release-meaning', renderRoadmapReleaseMeaning());
  next = replaceGeneratedBlock(next, 'roadmap-next-moves', renderRoadmapNextMoves());
  return next;
}

function renderReadmeStatus() {
  return [
    `PromptScore is in ${productDocs.status.phase} and the current shipped version is **${versionLabel}**.`,
    `The ${joinList(productDocs.status.availableToday)} are available today.`,
    `${joinList(productDocs.status.roadmapItems)} are still on the roadmap.`,
  ].join(' ');
}

function renderRoadmapBaseline() {
  const lines = [
    `As of ${formatDate(productDocs.baseline.releaseDate)}, PromptScore ${versionLabel} includes:`,
    '',
    ...productDocs.baseline.includes.map((item) => `- ${item}`),
    '',
    productDocs.baseline.summary,
  ];

  return lines.join('\n');
}

function renderRoadmapReleasePlan() {
  const header = [
    '| Version | Window | Theme | Planned deliverables |',
    '| --- | --- | --- | --- |',
  ];
  const rows = productDocs.releasePlan.map(
    (row) => `| \`${row.version}\` | ${row.window} | ${row.theme} | ${row.deliverables} |`,
  );

  return [...header, ...rows].join('\n');
}

function renderRoadmapReleaseMeaning() {
  return productDocs.releaseMeaning
    .map((item) => `- \`${item.version}\` ${item.summary}`)
    .join('\n');
}

function renderRoadmapNextMoves() {
  return productDocs.immediateNextMoves.map((item) => `- ${item}`).join('\n');
}

function replaceGeneratedBlock(source, blockName, content) {
  const startMarker = `<!-- generated:${blockName}:start -->`;
  const endMarker = `<!-- generated:${blockName}:end -->`;
  const pattern = new RegExp(
    `${escapeRegExp(startMarker)}[\\s\\S]*?${escapeRegExp(endMarker)}`,
    'm',
  );

  if (!pattern.test(source)) {
    throw new Error(`Missing generated block markers for ${blockName}.`);
  }

  return source.replace(pattern, `${startMarker}\n${content}\n${endMarker}`);
}

function escapeRegExp(value) {
  return value.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
}

function joinList(items) {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items.at(-1)}`;
}

function formatDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function createVersionModule(nextVersion) {
  return [
    '// This file is generated by scripts/sync-release-version.mjs.',
    '// Do not edit by hand.',
    '',
    `export const productVersion = '${nextVersion}';`,
    `export const productVersionLabel = 'v${nextVersion}';`,
    '',
  ].join('\n');
}

async function writeTextFile(filePath, value) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await writeFile(filePath, value, 'utf8');
      return;
    } catch (error) {
      if ((error.code === 'EBUSY' || error.code === 'EPERM') && attempt < 4) {
        await new Promise((resolve) => setTimeout(resolve, 150 * (attempt + 1)));
        continue;
      }
      throw error;
    }
  }
}
