import { GITHUB_USER, SKILL_NAMES } from './config.js';
import { homedir } from 'node:os';
import { resolveRef, fetchManifest, fetchAllSkills, githubConfigured, nodeFetcher } from './remote.js';
import {
  installAll,
  uninstallAll,
  listInstalled,
  formatCopyAction,
  formatRemoveAction,
} from './installer.js';
import {
  writeAllPointers,
  removeAllPointers,
  formatPointerAction,
} from './pointer.js';
import type { Fetcher } from './types.js';

export interface RunOptions {
  readonly ref?: string;
  readonly dryRun?: boolean;
  readonly force?: boolean;
  readonly baseDir?: string;
  readonly fetcher?: Fetcher;
  readonly log?: (line: string) => void;
}

function guardConfigured(log: (line: string) => void): boolean {
  if (githubConfigured()) return true;
  log('error: this build has no GitHub user configured (still __GH_USER__).');
  log('The package author must set GITHUB_USER in src/config.ts before publishing.');
  return false;
}

export async function runInstall(options: RunOptions = {}): Promise<number> {
  const log = options.log ?? console.log;
  const fetcher = options.fetcher ?? nodeFetcher;
  if (!guardConfigured(log)) return 1;

  const resolved = await resolveRef(options.ref, fetcher);
  log(`Using ref: ${resolved.ref} (${resolved.source})`);

  const manifest = await fetchManifest(resolved.ref, fetcher);
  log(`Manifest lists ${manifest.skills.length} skill(s).`);

  const skills = await fetchAllSkills(resolved.ref, manifest, fetcher);

  const actions = installAll(skills, {
    baseDir: options.baseDir,
    dryRun: options.dryRun,
    force: options.force,
    ref: resolved.ref,
  });
  for (const a of actions) log(formatCopyAction(a));

  log('\nPointers:');
  for (const p of writeAllPointers({ baseDir: options.baseDir, dryRun: options.dryRun })) {
    log(formatPointerAction(p));
  }

  const conflicts = actions.filter((a) => a.status === 'conflict');
  if (conflicts.length > 0) {
    log(`\n${conflicts.length} conflict(s): existing unmanaged folders were not overwritten. Re-run with --force to replace them.`);
    return 1;
  }
  return 0;
}

export function runUninstall(options: RunOptions = {}): number {
  const log = options.log ?? console.log;
  for (const a of uninstallAll([...SKILL_NAMES], { baseDir: options.baseDir, dryRun: options.dryRun })) {
    log(formatRemoveAction(a));
  }
  log('\nPointers:');
  for (const p of removeAllPointers({ baseDir: options.baseDir, dryRun: options.dryRun })) {
    log(formatPointerAction(p));
  }
  return 0;
}

export function runDoctor(options: RunOptions = {}): number {
  const log = options.log ?? console.log;
  const baseDir = options.baseDir ?? homedir();
  return doctorWithBase(baseDir, log);
}

export function doctorWithBase(baseDir: string, log: (line: string) => void): number {
  log(`GitHub source: ${GITHUB_USER}/code-flow-skill`);
  const installed = listInstalled(baseDir, [...SKILL_NAMES]);
  if (installed.length === 0) {
    log('No code-flow-skill skills installed. Run: code-flow-skill install');
    return 0;
  }
  for (const i of installed) {
    log(`[${i.tool}] ${i.skill} @ ${i.ref}`);
  }
  return 0;
}
