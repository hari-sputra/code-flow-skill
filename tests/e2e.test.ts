import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { resolveRef, fetchManifest, fetchAllSkills } from '../src/remote.js';
import { installAll, uninstallAll, listInstalled, defaultTargets } from '../src/installer.js';
import { writeAllPointers, removeAllPointers, defaultPointerTargets } from '../src/pointer.js';
import { runUninstall } from '../src/run.js';
import { MARKER_FILE } from '../src/config.js';
import type { Fetcher, FetchResponse, SkillsManifest } from '../src/types.js';

function ok(text: string): FetchResponse {
  return { ok: true, status: 200, text: async () => text };
}

const manifest: SkillsManifest = {
  version: '1.0.0',
  generatedAt: '2026-10-16T00:00:00Z',
  skills: [
    { name: 'angular-skill', files: ['SKILL.md', 'references/typescript.md'] },
    { name: 'vault-workflow', files: ['SKILL.md'] },
  ],
};

const mockFetcher: Fetcher = async (url) => {
  if (url.includes('releases/latest')) return ok(JSON.stringify({ tag_name: 'v1.0.0' }));
  if (url.includes('skills/index.json')) return ok(JSON.stringify(manifest));
  if (url.endsWith('angular-skill/SKILL.md')) return ok('---\nname: angular-skill\n---\n# Angular\n');
  if (url.endsWith('angular-skill/references/typescript.md')) return ok('# TS no any\n');
  if (url.endsWith('vault-workflow/SKILL.md')) return ok('---\nname: vault-workflow\n---\n# Vault\n');
  return { ok: false, status: 404, text: async () => 'nf' };
};

let baseDir: string;
beforeEach(() => {
  baseDir = mkdtempSync(join(tmpdir(), 'cfs-e2e-'));
});
afterEach(() => {
  rmSync(baseDir, { recursive: true, force: true });
});

describe('end-to-end install flow (mocked fetch)', () => {
  it('resolves ref, fetches, installs skills + pointers, then uninstalls', async () => {
    const resolved = await resolveRef(undefined, mockFetcher);
    expect(resolved).toEqual({ ref: 'v1.0.0', source: 'release' });

    const m = await fetchManifest(resolved.ref, mockFetcher);
    const skills = await fetchAllSkills(resolved.ref, m, mockFetcher);
    expect(skills).toHaveLength(2);

    const copyActions = installAll(skills, { baseDir, ref: resolved.ref });
    expect(copyActions.every((a) => a.status === 'installed')).toBe(true);

    const pointerActions = writeAllPointers({ baseDir });
    expect(pointerActions.every((a) => a.status === 'created')).toBe(true);

    for (const t of defaultTargets(baseDir)) {
      const dir = join(t.skillsDir, 'angular-skill');
      expect(readFileSync(join(dir, 'SKILL.md'), 'utf8')).toContain('name: angular-skill');
      expect(readFileSync(join(dir, 'references', 'typescript.md'), 'utf8')).toContain('no any');
      expect(existsSync(join(dir, MARKER_FILE))).toBe(true);
    }
    for (const t of defaultPointerTargets(baseDir)) {
      expect(existsSync(t.file)).toBe(true);
    }

    const installed = listInstalled(baseDir, ['angular-skill', 'vault-workflow']);
    expect(installed.every((i) => i.ref === 'v1.0.0')).toBe(true);

    const removed = uninstallAll(['angular-skill', 'vault-workflow'], { baseDir });
    expect(removed.filter((a) => a.status === 'removed')).toHaveLength(2 * 3);
    const pointerRemoval = removeAllPointers({ baseDir });
    expect(pointerRemoval.every((a) => a.status === 'removed')).toBe(true);

    for (const t of defaultTargets(baseDir)) {
      expect(existsSync(join(t.skillsDir, 'angular-skill'))).toBe(false);
    }
    for (const t of defaultPointerTargets(baseDir)) {
      if (t.mode === 'file') {
        expect(existsSync(t.file)).toBe(false);
      } else {
        expect(readFileSync(t.file, 'utf8')).not.toContain('code-flow-skill:start');
      }
    }
  });

  it('runUninstall is a no-op-safe report when nothing is installed', () => {
    const lines: string[] = [];
    const code = runUninstall({ baseDir, log: (l) => lines.push(l) });
    expect(code).toBe(0);
    expect(lines.join('\n')).toMatch(/absent/);
  });
});
