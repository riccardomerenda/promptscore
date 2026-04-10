import { describe, expect, it } from 'vitest';
import { getBuiltinProfile } from './builtin.js';
import { ProfileLoader } from './loader.js';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const profilesDir = resolve(here, '../../../../profiles');

describe('builtin profiles', () => {
  it('matches the merged _base yaml profile', async () => {
    const loader = new ProfileLoader({ profilesDir });
    expect(getBuiltinProfile('_base')).toEqual(await loader.load('_base'));
  });

  it('matches the merged claude yaml profile', async () => {
    const loader = new ProfileLoader({ profilesDir });
    expect(getBuiltinProfile('claude')).toEqual(await loader.load('claude'));
  });

  it('matches the merged gpt yaml profile', async () => {
    const loader = new ProfileLoader({ profilesDir });
    expect(getBuiltinProfile('gpt')).toEqual(await loader.load('gpt'));
  });
});
