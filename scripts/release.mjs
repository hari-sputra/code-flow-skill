#!/usr/bin/env node
// One-command release helper for code-flow-skill.
//
// Usage:
//   npm run release -- patch     (0.1.0 -> 0.1.1)
//   npm run release -- minor     (0.1.0 -> 0.2.0)
//   npm run release -- major     (0.1.0 -> 1.0.0)
//   npm run release -- 1.4.2     (explicit version)
//
// What it does (locally, no tag):
//   1. bumps package.json version (no git commit, no git tag)
//   2. stamps skills/index.json version to match
//   3. commits both files on the current branch
//
// Then you just:  git push
// GitHub Actions creates the tag + Release, which triggers npm publish.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const arg = process.argv[2];
if (!arg) {
  console.error('Usage: npm run release -- <patch|minor|major|x.y.z>');
  process.exit(1);
}

const isWindows = process.platform === 'win32';
function run(cmd, args) {
  // Only npm needs shell resolution on Windows (npm.cmd); git runs directly so
  // commit messages with spaces/colons pass through as a single argv entry.
  if (cmd === 'npm') {
    const file = isWindows ? 'npm.cmd' : 'npm';
    return execFileSync(file, args, { stdio: ['ignore', 'pipe', 'inherit'], shell: isWindows })
      .toString()
      .trim();
  }
  return execFileSync(cmd, args, { stdio: ['ignore', 'pipe', 'inherit'] }).toString().trim();
}

// 1. bump version in package.json only (no commit, no tag)
const newVersion = run('npm', ['version', arg, '--no-git-tag-version']).replace(/^v/, '');
const tag = `v${newVersion}`;

// 2. sync skills/index.json
const indexPath = resolve('skills', 'index.json');
const index = JSON.parse(readFileSync(indexPath, 'utf8'));
index.version = tag;
writeFileSync(indexPath, JSON.stringify(index, null, 2) + '\n', 'utf8');

// 3. commit both
run('git', ['add', 'package.json', 'package-lock.json', 'skills/index.json', 'scripts/release.mjs']);
run('git', ['commit', '-m', `release: ${tag}`]);

console.log(`\nCommitted release ${tag}.`);
console.log('Next: git push   (CI will tag, create the Release, and publish to npm)');
