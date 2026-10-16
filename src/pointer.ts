import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { POINTER_START, POINTER_END } from './config.js';

export interface PointerTarget {
  readonly tool: string;
  readonly file: string;
  readonly mode: 'block' | 'file';
}

export interface PointerOptions {
  readonly baseDir?: string;
  readonly dryRun?: boolean;
}

export type PointerStatus = 'created' | 'inserted' | 'replaced' | 'unchanged' | 'would-write';
export type PointerRemoveStatus = 'removed' | 'absent' | 'no-block' | 'would-remove';

export interface PointerAction {
  readonly tool: string;
  readonly file: string;
  readonly status: PointerStatus | PointerRemoveStatus;
}

export function pointerContent(): string {
  return [
    '# Code Flow Skill — framework house rules',
    '',
    'Before writing or reviewing code, detect the project framework and load the matching skill:',
    '',
    '- Angular (`angular.json` or `@angular/core` in `package.json`) → load `angular-skill`.',
    '- React (`react` in `package.json` or `*.tsx` files) → load `react-skill`.',
    '- Vue (`vue` in `package.json` or `*.vue` files) → load `vue-skill`.',
    '',
    'If the project contains a `vault/` folder (DevLogs, tasks, Modules, Decisions), also load `vault-workflow`.',
    '',
    'These skills carry mandatory house rules (no `any`, small components with logic out of the view layer, separate files for models/constants/services/stores, strict member ordering). On any conflict, the house rules in the skill win.',
  ].join('\n');
}

function wrappedBlock(): string {
  return `${POINTER_START}\n${pointerContent()}\n${POINTER_END}`;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const BLOCK_RE = new RegExp(`\\n*${escapeRegExp(POINTER_START)}[\\s\\S]*?${escapeRegExp(POINTER_END)}\\n*`);

export function defaultPointerTargets(baseDir: string): PointerTarget[] {
  return [
    { tool: 'claude', file: join(baseDir, '.claude', 'CLAUDE.md'), mode: 'block' },
    { tool: 'codex', file: join(baseDir, '.codex', 'AGENTS.md'), mode: 'block' },
    { tool: 'opencode', file: join(baseDir, '.config', 'opencode', 'AGENTS.md'), mode: 'block' },
    { tool: 'kiro', file: join(baseDir, '.kiro', 'steering', 'code-flow-skill.md'), mode: 'file' },
  ];
}

function backupOnce(file: string): void {
  const bak = `${file}.bak`;
  if (existsSync(file) && !existsSync(bak)) copyFileSync(file, bak);
}

export function writePointer(target: PointerTarget, options: PointerOptions = {}): PointerAction {
  const dryRun = options.dryRun ?? false;
  const base = { tool: target.tool, file: target.file };

  if (target.mode === 'file') {
    const desired = `${pointerContent()}\n`;
    if (existsSync(target.file)) {
      if (readFileSync(target.file, 'utf8') === desired) return { ...base, status: 'unchanged' };
      if (dryRun) return { ...base, status: 'would-write' };
      backupOnce(target.file);
      writeFileSync(target.file, desired, 'utf8');
      return { ...base, status: 'replaced' };
    }
    if (dryRun) return { ...base, status: 'would-write' };
    mkdirSync(dirname(target.file), { recursive: true });
    writeFileSync(target.file, desired, 'utf8');
    return { ...base, status: 'created' };
  }

  const block = wrappedBlock();
  if (!existsSync(target.file)) {
    if (dryRun) return { ...base, status: 'would-write' };
    mkdirSync(dirname(target.file), { recursive: true });
    writeFileSync(target.file, `${block}\n`, 'utf8');
    return { ...base, status: 'created' };
  }

  const current = readFileSync(target.file, 'utf8');
  if (BLOCK_RE.test(current)) {
    const next = current.replace(BLOCK_RE, `\n\n${block}\n`);
    if (next === current) return { ...base, status: 'unchanged' };
    if (dryRun) return { ...base, status: 'would-write' };
    backupOnce(target.file);
    writeFileSync(target.file, next, 'utf8');
    return { ...base, status: 'replaced' };
  }

  if (dryRun) return { ...base, status: 'would-write' };
  backupOnce(target.file);
  const separator = current.endsWith('\n') ? '\n' : '\n\n';
  writeFileSync(target.file, `${current}${separator}${block}\n`, 'utf8');
  return { ...base, status: 'inserted' };
}

export function removePointer(target: PointerTarget, options: PointerOptions = {}): PointerAction {
  const dryRun = options.dryRun ?? false;
  const base = { tool: target.tool, file: target.file };
  if (!existsSync(target.file)) return { ...base, status: 'absent' };

  if (target.mode === 'file') {
    if (dryRun) return { ...base, status: 'would-remove' };
    backupOnce(target.file);
    rmSync(target.file, { force: true });
    return { ...base, status: 'removed' };
  }

  const current = readFileSync(target.file, 'utf8');
  if (!BLOCK_RE.test(current)) return { ...base, status: 'no-block' };
  if (dryRun) return { ...base, status: 'would-remove' };
  backupOnce(target.file);
  const next = current.replace(BLOCK_RE, '\n').replace(/\n{3,}/g, '\n\n').replace(/^\n+/, '');
  writeFileSync(target.file, next, 'utf8');
  return { ...base, status: 'removed' };
}

export function writeAllPointers(options: PointerOptions = {}): PointerAction[] {
  const baseDir = options.baseDir ?? homedir();
  return defaultPointerTargets(baseDir).map((t) => writePointer(t, options));
}

export function removeAllPointers(options: PointerOptions = {}): PointerAction[] {
  const baseDir = options.baseDir ?? homedir();
  return defaultPointerTargets(baseDir).map((t) => removePointer(t, options));
}

export function formatPointerAction(a: PointerAction): string {
  return `[${a.tool}] ${a.file}: ${a.status}`;
}
