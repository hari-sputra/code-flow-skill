import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  writePointer,
  removePointer,
  writeAllPointers,
  defaultPointerTargets,
  pointerContent,
} from '../src/pointer.js';
import { POINTER_START, POINTER_END } from '../src/config.js';

let baseDir: string;

beforeEach(() => {
  baseDir = mkdtempSync(join(tmpdir(), 'cfs-pointer-'));
});
afterEach(() => {
  rmSync(baseDir, { recursive: true, force: true });
});

const claude = () => defaultPointerTargets(baseDir).find((t) => t.tool === 'claude')!;
const kiro = () => defaultPointerTargets(baseDir).find((t) => t.tool === 'kiro')!;

describe('writePointer (block mode)', () => {
  it('creates the file with a wrapped block', () => {
    const action = writePointer(claude());
    expect(action.status).toBe('created');
    const c = readFileSync(claude().file, 'utf8');
    expect(c).toContain(POINTER_START);
    expect(c).toContain('angular-skill');
  });

  it('appends to existing content and preserves it', () => {
    const t = claude();
    mkdirSync(join(baseDir, '.claude'), { recursive: true });
    writeFileSync(t.file, '# Mine\n\nkeep this\n', 'utf8');
    const action = writePointer(t);
    expect(action.status).toBe('inserted');
    const c = readFileSync(t.file, 'utf8');
    expect(c).toContain('# Mine');
    expect(c).toContain('keep this');
    expect(c.match(new RegExp(POINTER_START, 'g'))?.length).toBe(1);
  });

  it('replaces an existing block without duplicating', () => {
    const t = claude();
    mkdirSync(join(baseDir, '.claude'), { recursive: true });
    writeFileSync(t.file, `# Rules\n\n${POINTER_START}\nOLD\n${POINTER_END}\n\n# After\n`, 'utf8');
    const action = writePointer(t);
    expect(action.status).toBe('replaced');
    const c = readFileSync(t.file, 'utf8');
    expect(c).not.toContain('OLD');
    expect(c).toContain('# Rules');
    expect(c).toContain('# After');
    expect(c.match(new RegExp(POINTER_START, 'g'))?.length).toBe(1);
  });

  it('backs up before modifying', () => {
    const t = claude();
    mkdirSync(join(baseDir, '.claude'), { recursive: true });
    writeFileSync(t.file, 'orig\n', 'utf8');
    writePointer(t);
    expect(readFileSync(`${t.file}.bak`, 'utf8')).toBe('orig\n');
  });
});

describe('writePointer (file mode / Kiro)', () => {
  it('writes a standalone steering file with no markers', () => {
    const action = writePointer(kiro());
    expect(action.status).toBe('created');
    const c = readFileSync(kiro().file, 'utf8');
    expect(c).toBe(`${pointerContent()}\n`);
    expect(c).not.toContain(POINTER_START);
  });
});

describe('removePointer', () => {
  it('strips the block but keeps surrounding content', () => {
    const t = claude();
    writePointer(t);
    const withExtra = `# Keep\n\n${readFileSync(t.file, 'utf8')}`;
    writeFileSync(t.file, withExtra, 'utf8');
    const action = removePointer(t);
    expect(action.status).toBe('removed');
    const c = readFileSync(t.file, 'utf8');
    expect(c).toContain('# Keep');
    expect(c).not.toContain(POINTER_START);
  });

  it('deletes the standalone Kiro steering file', () => {
    writePointer(kiro());
    const action = removePointer(kiro());
    expect(action.status).toBe('removed');
    expect(existsSync(kiro().file)).toBe(false);
  });

  it('reports absent when nothing exists', () => {
    expect(removePointer(claude()).status).toBe('absent');
  });
});

describe('writeAllPointers', () => {
  it('writes to all four tool targets', () => {
    const actions = writeAllPointers({ baseDir });
    expect(actions.map((a) => a.tool).sort()).toEqual(['claude', 'codex', 'kiro', 'opencode']);
    expect(actions.every((a) => a.status === 'created')).toBe(true);
  });
});
