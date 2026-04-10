import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { loadPromptScoreConfig } from './loader.js';

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map(async (dir) => {
      await rm(dir, { recursive: true, force: true });
    }),
  );
});

describe('loadPromptScoreConfig', () => {
  it('returns an empty config when no file is found', async () => {
    const dir = await createTempDir();
    const loaded = await loadPromptScoreConfig({ cwd: dir });

    expect(loaded.path).toBeUndefined();
    expect(loaded.config).toEqual({});
  });

  it('loads and normalizes yaml config values', async () => {
    const dir = await createTempDir();
    const configPath = join(dir, 'promptscore.config.yaml');

    await writeFile(
      configPath,
      [
        'model: claude',
        'format: markdown',
        'rules:',
        '  - missing-task',
        '  - no-output-format',
        'include_llm: true',
        'color: false',
        'fail_on_severity: warning',
        'profiles_dir: ./custom-profiles',
        '',
      ].join('\n'),
      'utf8',
    );

    const loaded = await loadPromptScoreConfig({ cwd: dir });

    expect(loaded.path).toBe(configPath);
    expect(loaded.config).toEqual({
      model: 'claude',
      format: 'markdown',
      rules: ['missing-task', 'no-output-format'],
      includeLlm: true,
      color: false,
      failOnSeverity: 'warning',
      profilesDir: join(dir, 'custom-profiles'),
    });
  });

  it('discovers config files while walking up parent directories', async () => {
    const dir = await createTempDir();
    const nested = join(dir, 'sub', 'project');
    const configPath = join(dir, '.promptscorerc.json');

    await writeFile(configPath, JSON.stringify({ model: 'gpt' }, null, 2), 'utf8');
    await writeFile(join(dir, 'sub', '.gitkeep'), '', 'utf8');
    await writeFile(join(nested, '.gitkeep'), '', 'utf8');

    const loaded = await loadPromptScoreConfig({ cwd: nested });

    expect(loaded.path).toBe(configPath);
    expect(loaded.config.model).toBe('gpt');
  });

  it('prefers an explicit config path over discovery', async () => {
    const dir = await createTempDir();
    const explicit = join(dir, 'configs', 'team.yaml');
    const nested = join(dir, 'workspace');

    await writeFile(join(dir, 'promptscore.config.yaml'), 'model: claude\n', 'utf8');
    await writeFile(explicit, 'model: gpt\n', 'utf8');
    await ensureDir(nested);
    await writeFile(join(nested, '.gitkeep'), '', 'utf8');

    const loaded = await loadPromptScoreConfig({
      cwd: nested,
      configPath: '../configs/team.yaml',
    });

    expect(loaded.path).toBe(explicit);
    expect(loaded.config.model).toBe('gpt');
  });

  it('throws a helpful error for invalid config values', async () => {
    const dir = await createTempDir();
    const configPath = join(dir, 'promptscore.config.yaml');

    await writeFile(configPath, 'fail_on_severity: severe\n', 'utf8');

    await expect(loadPromptScoreConfig({ cwd: dir })).rejects.toThrow(
      'Invalid config value for "failOnSeverity"',
    );
  });
});

async function createTempDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'promptscore-config-'));
  tempDirs.push(dir);
  await ensureDir(join(dir, 'sub'));
  await ensureDir(join(dir, 'sub', 'project'));
  await ensureDir(join(dir, 'configs'));
  return dir;
}

async function ensureDir(path: string): Promise<void> {
  const { mkdir } = await import('node:fs/promises');
  await mkdir(path, { recursive: true });
}
