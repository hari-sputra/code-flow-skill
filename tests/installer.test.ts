import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  installAll,
  uninstallAll,
  installSkillInto,
  listInstalled,
  defaultTargets,
} from '../src/installer.js';
import { MARKER_FILE } from '../src/config.js';
import type { FetchedSkill } from '../src/types.js';

let baseDir: string;

const skills: FetchedSkill[] = [
  {
    name: 'angular-skill',
    files: new Map([
      ['SKILL.md', '---\nname: angular-skill\n---\n# Angular\n'],
      ['references/typescript.md', '# TS\n'],
    ]),
  },
  { name: 'vue-skill', files: new Map([['SKILL.md', '---\nname: vue-skill\n---\n# Vue\n']]) },
];

beforeEach(() => {
  baseDir = mkdtempSync(join(tmpdir(), 'cfs-install-'));
});
afterEach(() => {
  rmSync(baseDir, { recursive: true, force: true });
});

describe('copy installer', () => {
  it('writes skill files + marker into every tool dir', () => {
    const actions = installAll(skills, { baseDir, ref: 'v1.0.0' });
    expect(actions).toHaveLength(skills.length * 3);
    expect(actions.every((a) => a.status === 'installed')).toBe(true);

    for (const target of defaultTargets(baseDir)) {
      const skillDir = join(target.skillsDir, 'angular-skill');
      expect(readFileSync(join(skillDir, 'SKILL.md'), 'utf8')).toContain('name: angular-skill');
      expect(readFileSync(join(skillDir, 'references', 'typescript.md'), 'utf8')).toContain('# TS');
      const marker = JSON.parse(readFileSync(join(skillDir, MARKER_FILE), 'utf8')) as { ref: string };
      expect(marker.ref).toBe('v1.0.0');
    }
  });

  it('reports updated and overwrites a previously managed install', () => {
    installAll(skills, { baseDir, ref: 'v1.0.0' });
    const second = installAll(skills, { baseDir, ref: 'v1.1.0' });
    expect(second.every((a) => a.status === 'updated')).toBe(true);
    const target = defaultTargets(baseDir)[0]!;
    const marker = JSON.parse(readFileSync(join(target.skillsDir, 'angular-skill', MARKER_FILE), 'utf8')) as { ref: string };
    expect(marker.ref).toBe('v1.1.0');
  });

  it('does not overwrite an unmanaged folder without --force', () => {
    const target = defaultTargets(baseDir)[0]!;
    const dir = join(target.skillsDir, 'angular-skill');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'keep.txt'), 'mine', 'utf8');

    const action = installSkillInto(skills[0]!, target, { baseDir });
    expect(action.status).toBe('conflict');
    expect(existsSync(join(dir, 'keep.txt'))).toBe(true);
  });

  it('overwrites an unmanaged folder with --force', () => {
    const target = defaultTargets(baseDir)[0]!;
    const dir = join(target.skillsDir, 'angular-skill');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'keep.txt'), 'mine', 'utf8');

    const action = installSkillInto(skills[0]!, target, { baseDir, force: true });
    expect(action.status).toBe('updated');
    expect(existsSync(join(dir, 'keep.txt'))).toBe(false);
    expect(existsSync(join(dir, MARKER_FILE))).toBe(true);
  });

  it('dry-run writes nothing', () => {
    const actions = installAll(skills, { baseDir, dryRun: true });
    expect(actions.every((a) => a.status === 'would-install')).toBe(true);
    const target = defaultTargets(baseDir)[0]!;
    expect(existsSync(join(target.skillsDir, 'angular-skill'))).toBe(false);
  });

  it('uninstall removes only managed skills and preserves unmanaged folders', () => {
    installAll(skills, { baseDir, ref: 'v1.0.0' });
    const target = defaultTargets(baseDir)[1]!;
    const unmanaged = join(target.skillsDir, 'other-skill');
    mkdirSync(unmanaged, { recursive: true });
    writeFileSync(join(unmanaged, 'x.txt'), 'y', 'utf8');

    const actions = uninstallAll(['angular-skill', 'vue-skill', 'other-skill'], { baseDir });
    expect(actions.filter((a) => a.status === 'removed')).toHaveLength(2 * 3);
    expect(actions.filter((a) => a.skill === 'other-skill').every((a) => a.status === 'skipped-not-managed' || a.status === 'absent')).toBe(true);
    expect(existsSync(join(unmanaged, 'x.txt'))).toBe(true);
    for (const t of defaultTargets(baseDir)) {
      expect(existsSync(join(t.skillsDir, 'angular-skill'))).toBe(false);
    }
  });

  it('listInstalled reports managed skills with their ref', () => {
    installAll(skills, { baseDir, ref: 'v1.2.3' });
    const installed = listInstalled(baseDir, ['angular-skill', 'vue-skill']);
    expect(installed).toHaveLength(2 * 3);
    expect(installed.every((i) => i.ref === 'v1.2.3')).toBe(true);
  });
});
