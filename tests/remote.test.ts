import { describe, it, expect } from 'vitest';
import {
  resolveRef,
  fetchManifest,
  fetchAllSkills,
  manifestUrl,
  skillFileUrl,
} from '../src/remote.js';
import type { Fetcher, FetchResponse, SkillsManifest } from '../src/types.js';

function ok(text: string): FetchResponse {
  return { ok: true, status: 200, text: async () => text };
}
function notFound(): FetchResponse {
  return { ok: false, status: 404, text: async () => 'Not Found' };
}

function routeFetcher(routes: Record<string, FetchResponse | undefined>): Fetcher {
  return async (url) => {
    for (const [key, res] of Object.entries(routes)) {
      if (url.includes(key) && res) return res;
    }
    return notFound();
  };
}

const manifest: SkillsManifest = {
  version: '1.0.0',
  generatedAt: '2026-10-16T00:00:00Z',
  skills: [
    { name: 'angular-skill', files: ['SKILL.md', 'references/typescript.md'] },
    { name: 'vue-skill', files: ['SKILL.md'] },
  ],
};

describe('resolveRef', () => {
  it('uses explicit ref without any network call', async () => {
    const fetcher: Fetcher = async () => {
      throw new Error('should not be called');
    };
    const resolved = await resolveRef('v2.0.0', fetcher);
    expect(resolved).toEqual({ ref: 'v2.0.0', source: 'explicit' });
  });

  it('resolves the latest release tag', async () => {
    const fetcher = routeFetcher({ 'releases/latest': ok(JSON.stringify({ tag_name: 'v1.3.0' })) });
    const resolved = await resolveRef(undefined, fetcher);
    expect(resolved).toEqual({ ref: 'v1.3.0', source: 'release' });
  });

  it('falls back to the first tag when there is no release', async () => {
    const fetcher = routeFetcher({
      'releases/latest': notFound(),
      '/tags': ok(JSON.stringify([{ name: 'v1.2.0' }, { name: 'v1.1.0' }])),
    });
    const resolved = await resolveRef(undefined, fetcher);
    expect(resolved).toEqual({ ref: 'v1.2.0', source: 'tag' });
  });

  it('falls back to main when neither release nor tags exist', async () => {
    const fetcher = routeFetcher({ 'releases/latest': notFound(), '/tags': ok('[]') });
    const resolved = await resolveRef(undefined, fetcher);
    expect(resolved).toEqual({ ref: 'main', source: 'fallback' });
  });
});

describe('fetchManifest', () => {
  it('parses the manifest JSON', async () => {
    const fetcher = routeFetcher({ 'skills/index.json': ok(JSON.stringify(manifest)) });
    const result = await fetchManifest('v1.0.0', fetcher);
    expect(result.skills).toHaveLength(2);
    expect(result.skills[0]?.name).toBe('angular-skill');
  });

  it('throws a helpful error when the manifest is missing', async () => {
    const fetcher = routeFetcher({});
    await expect(fetchManifest('v1.0.0', fetcher)).rejects.toThrow(/Could not fetch skills manifest/);
  });

  it('throws when the manifest is malformed', async () => {
    const fetcher = routeFetcher({ 'skills/index.json': ok(JSON.stringify({ version: '1' })) });
    await expect(fetchManifest('v1.0.0', fetcher)).rejects.toThrow(/malformed/);
  });
});

describe('fetchAllSkills', () => {
  it('fetches every file listed for every skill', async () => {
    const fetcher: Fetcher = async (url) => {
      if (url.endsWith('angular-skill/SKILL.md')) return ok('# Angular');
      if (url.endsWith('angular-skill/references/typescript.md')) return ok('# TS');
      if (url.endsWith('vue-skill/SKILL.md')) return ok('# Vue');
      return notFound();
    };
    const skills = await fetchAllSkills('v1.0.0', manifest, fetcher);
    expect(skills).toHaveLength(2);
    const angular = skills.find((s) => s.name === 'angular-skill')!;
    expect(angular.files.get('SKILL.md')).toBe('# Angular');
    expect(angular.files.get('references/typescript.md')).toBe('# TS');
  });

  it('throws when a listed file is missing', async () => {
    const fetcher = routeFetcher({ 'angular-skill/SKILL.md': ok('# Angular') });
    await expect(fetchAllSkills('v1.0.0', manifest, fetcher)).rejects.toThrow(/Failed to fetch/);
  });
});

describe('url builders', () => {
  it('build raw manifest and skill-file URLs', () => {
    expect(manifestUrl('v1.0.0')).toContain('/v1.0.0/skills/index.json');
    expect(skillFileUrl('v1.0.0', 'vue-skill', 'SKILL.md')).toContain('/v1.0.0/skills/vue-skill/SKILL.md');
  });
});
