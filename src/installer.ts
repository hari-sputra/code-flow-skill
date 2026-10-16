import { existsSync, lstatSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { MARKER_FILE } from './config.js';
import type { FetchedSkill } from './types.js';

export interface InstallTarget {
  readonly tool: string;
  readonly skillsDir: string;
}

export interface CopyOptions {
  readonly baseDir?: string;
  readonly dryRun?: boolean;
  readonly force?: boolean;
  readonly ref?: string;
}

export type CopyStatus = 'installed' | 'updated' | 'conflict' | 'would-install';

export interface CopyAction {
  readonly tool: string;
  readonly skill: string;
  readonly dir: string;
  readonly status: CopyStatus;
  readonly detail?: string;
}

export function defaultTargets(baseDir: string): InstallTarget[] {
  return [
    { tool: 'kiro', skillsDir: join(baseDir, '.kiro', 'skills') },
    { tool: 'claude', skillsDir: join(baseDir, '.claude', 'skills') },
    { tool: 'codex', skillsDir: join(baseDir, '.agents', 'skills') },
  ];
}

function isManaged(skillDir: string): boolean {
  return existsSync(join(skillDir, MARKER_FILE));
}

function isRealDir(path: string): boolean {
  try {
    return lstatSync(path).isDirectory();
  } catch {
    return false;
  }
}

export function installSkillInto(
  skill: FetchedSkill,
  target: InstallTarget,
  options: CopyOptions = {},
): CopyAction {
  const dryRun = options.dryRun ?? false;
  const force = options.force ?? false;
  const skillDir = join(target.skillsDir, skill.name);
  const base = { tool: target.tool, skill: skill.name, dir: skillDir };

  const exists = isRealDir(skillDir);
  if (exists && !isManaged(skillDir) && !force) {
    return {
      ...base,
      status: 'conflict',
      detail: 'a folder with this name exists and is not managed by code-flow-skill; use --force to overwrite',
    };
  }

  const willUpdate = exists;
  if (dryRun) return { ...base, status: 'would-install' };

  rmSync(skillDir, { recursive: true, force: true });
  mkdirSync(skillDir, { recursive: true });
  for (const [file, content] of skill.files) {
    const out = join(skillDir, file);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, content, 'utf8');
  }
  const marker = { installedBy: 'code-flow-skill', ref: options.ref ?? 'unknown', at: new Date().toISOString() };
  writeFileSync(join(skillDir, MARKER_FILE), JSON.stringify(marker, null, 2), 'utf8');

  return { ...base, status: willUpdate ? 'updated' : 'installed' };
}

export function installAll(
  skills: readonly FetchedSkill[],
  options: CopyOptions = {},
): CopyAction[] {
  const baseDir = options.baseDir ?? homedir();
  const actions: CopyAction[] = [];
  for (const target of defaultTargets(baseDir)) {
    for (const skill of skills) {
      actions.push(installSkillInto(skill, target, options));
    }
  }
  return actions;
}

export type RemoveStatus = 'removed' | 'skipped-not-managed' | 'absent' | 'would-remove';

export interface RemoveAction {
  readonly tool: string;
  readonly skill: string;
  readonly dir: string;
  readonly status: RemoveStatus;
}

export function uninstallSkillFrom(
  skillName: string,
  target: InstallTarget,
  options: CopyOptions = {},
): RemoveAction {
  const dryRun = options.dryRun ?? false;
  const skillDir = join(target.skillsDir, skillName);
  const base = { tool: target.tool, skill: skillName, dir: skillDir };

  if (!isRealDir(skillDir)) return { ...base, status: 'absent' };
  if (!isManaged(skillDir)) return { ...base, status: 'skipped-not-managed' };
  if (dryRun) return { ...base, status: 'would-remove' };
  rmSync(skillDir, { recursive: true, force: true });
  return { ...base, status: 'removed' };
}

export function uninstallAll(
  skillNames: readonly string[],
  options: CopyOptions = {},
): RemoveAction[] {
  const baseDir = options.baseDir ?? homedir();
  const actions: RemoveAction[] = [];
  for (const target of defaultTargets(baseDir)) {
    for (const name of skillNames) {
      actions.push(uninstallSkillFrom(name, target, options));
    }
  }
  return actions;
}

export interface InstalledInfo {
  readonly tool: string;
  readonly skill: string;
  readonly ref: string;
}

export function listInstalled(baseDir: string, skillNames: readonly string[]): InstalledInfo[] {
  const out: InstalledInfo[] = [];
  for (const target of defaultTargets(baseDir)) {
    for (const name of skillNames) {
      const markerPath = join(target.skillsDir, name, MARKER_FILE);
      if (existsSync(markerPath)) {
        try {
          const marker = JSON.parse(readFileSync(markerPath, 'utf8')) as { ref?: string };
          out.push({ tool: target.tool, skill: name, ref: marker.ref ?? 'unknown' });
        } catch {
          out.push({ tool: target.tool, skill: name, ref: 'unknown' });
        }
      }
    }
  }
  return out;
}

export function formatCopyAction(a: CopyAction): string {
  const label = `[${a.tool}] ${a.skill}: ${a.status}`;
  return a.detail ? `${label} (${a.detail})` : label;
}

export function formatRemoveAction(a: RemoveAction): string {
  return `[${a.tool}] ${a.skill}: ${a.status}`;
}
