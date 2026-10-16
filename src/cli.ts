#!/usr/bin/env node
import { argv, exit } from 'node:process';
import { runInstall, runUninstall, runDoctor } from './run.js';

function printUsage(): void {
  console.log(
    [
      'code-flow-skill <command> [options]',
      '',
      'Commands:',
      '  install          Fetch skills from GitHub and install into all agents',
      '  uninstall        Remove installed skills and pointer blocks',
      '  doctor           Show which skills are installed and their ref',
      '  help             Show this help',
      '',
      'Options (install):',
      '  --ref <tag|sha|main>   Use a specific ref instead of the latest release',
      '  --dry-run              Show what would change without writing',
      '  --force                Overwrite existing unmanaged skill folders',
    ].join('\n'),
  );
}

function flag(name: string): boolean {
  return argv.includes(`--${name}`);
}

function option(name: string): string | undefined {
  const i = argv.indexOf(`--${name}`);
  if (i >= 0 && i + 1 < argv.length) {
    const val = argv[i + 1];
    if (val && !val.startsWith('--')) return val;
  }
  return undefined;
}

async function main(): Promise<void> {
  const command = argv[2];
  switch (command) {
    case 'install': {
      const code = await runInstall({ ref: option('ref'), dryRun: flag('dry-run'), force: flag('force') });
      exit(code);
      break;
    }
    case 'uninstall': {
      exit(runUninstall({ dryRun: flag('dry-run') }));
      break;
    }
    case 'doctor': {
      exit(runDoctor());
      break;
    }
    case undefined:
    case 'help':
    case '--help':
    case '-h':
      printUsage();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      printUsage();
      exit(2);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  exit(1);
});
