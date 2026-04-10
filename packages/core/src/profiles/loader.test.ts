import { describe, expect, it } from 'vitest';
import { ProfileLoader } from './loader.js';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const profilesDir = resolve(here, '../../../../profiles');

describe('ProfileLoader', () => {
  it('loads the _base profile', async () => {
    const loader = new ProfileLoader({ profilesDir });
    const profile = await loader.load('_base');
    expect(profile.name).toBe('_base');
    expect(profile.rules).toBeDefined();
  });

  it('merges a child profile with its base', async () => {
    const loader = new ProfileLoader({ profilesDir });
    const claude = await loader.load('claude');
    expect(claude.name).toBe('claude');
    // Should contain rules that come from _base as well
    expect(Object.keys(claude.rules).length).toBeGreaterThan(0);
  });

  it('lists non-underscore profiles', async () => {
    const loader = new ProfileLoader({ profilesDir });
    const names = await loader.list();
    expect(names).toContain('claude');
    expect(names).not.toContain('_base');
  });
});
