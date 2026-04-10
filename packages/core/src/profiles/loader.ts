import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import type { Profile, ProfileRuleOverride, RawProfile } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Candidate directories where profile YAML files may live.
 * The loader walks up from the current file until it finds a `profiles/` directory,
 * so it works both when running from source and from the built dist.
 */
function findProfilesDir(startDir: string): string | undefined {
  let current = startDir;
  // Walk up at most 6 levels.
  for (let i = 0; i < 6; i++) {
    const candidate = join(current, 'profiles');
    if (existsSync(candidate)) return candidate;
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return undefined;
}

function normalize(raw: RawProfile, name: string): Profile {
  return {
    name: raw.name ?? name,
    displayName: raw.display_name ?? raw.name ?? name,
    version: raw.version,
    base: raw.base,
    rules: raw.rules ?? {},
    bestPractices: raw.best_practices ?? [],
  };
}

function mergeOverrides(
  base: ProfileRuleOverride | undefined,
  override: ProfileRuleOverride | undefined,
): ProfileRuleOverride {
  return {
    severity: override?.severity ?? base?.severity,
    weight: override?.weight ?? base?.weight,
    suggestion: override?.suggestion ?? base?.suggestion,
    reference: override?.reference ?? base?.reference,
    enabled: override?.enabled ?? base?.enabled,
  };
}

function mergeProfiles(base: Profile, child: Profile): Profile {
  const ruleIds = new Set<string>([...Object.keys(base.rules), ...Object.keys(child.rules)]);
  const merged: Record<string, ProfileRuleOverride> = {};
  for (const id of ruleIds) {
    merged[id] = mergeOverrides(base.rules[id], child.rules[id]);
  }
  return {
    name: child.name,
    displayName: child.displayName,
    version: child.version ?? base.version,
    base: child.base,
    rules: merged,
    bestPractices: [...base.bestPractices, ...child.bestPractices],
  };
}

export interface ProfileLoaderOptions {
  /** Override the profiles directory. Defaults to auto-discovery. */
  profilesDir?: string;
}

export class ProfileLoader {
  private readonly profilesDir: string;
  private readonly cache = new Map<string, Profile>();

  constructor(options: ProfileLoaderOptions = {}) {
    const found =
      options.profilesDir ?? findProfilesDir(__dirname) ?? findProfilesDir(process.cwd());
    if (!found) {
      throw new Error('Could not locate a `profiles/` directory. Pass `profilesDir` explicitly.');
    }
    this.profilesDir = resolve(found);
  }

  get directory(): string {
    return this.profilesDir;
  }

  async load(name: string): Promise<Profile> {
    if (this.cache.has(name)) {
      return this.cache.get(name)!;
    }
    const filePath = join(this.profilesDir, `${name}.yaml`);
    if (!existsSync(filePath)) {
      throw new Error(`Profile "${name}" not found at ${filePath}`);
    }
    const content = await readFile(filePath, 'utf8');
    const raw = (parseYaml(content) ?? {}) as RawProfile;
    let profile = normalize(raw, name);
    if (profile.base) {
      const base = await this.load(profile.base);
      profile = mergeProfiles(base, profile);
    }
    this.cache.set(name, profile);
    return profile;
  }

  async list(): Promise<string[]> {
    const { readdir } = await import('node:fs/promises');
    const files = await readdir(this.profilesDir);
    return files
      .filter((f) => f.endsWith('.yaml') && !f.startsWith('_'))
      .map((f) => f.replace(/\.yaml$/, ''));
  }
}
