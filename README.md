# code-flow-skill

Install framework house-rule **agent skills** — Angular, React, Vue, plus a knowledge-vault workflow — into Kiro CLI, Claude Code, Codex, and OpenCode with one command. No clone, no build; the skills are fetched from a public GitHub repo at install time.

## Install

```bash
npx code-flow-skill install
```

This fetches the latest released skills and copies them into:

- `~/.kiro/skills/`
- `~/.claude/skills/`
- `~/.agents/skills/` (Codex; also read by OpenCode)

It also writes an always-on pointer to `~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md`, `~/.config/opencode/AGENTS.md`, and `~/.kiro/steering/code-flow-skill.md`, so every agent loads the right skill automatically based on the project's framework.

### Options

```bash
npx code-flow-skill install --ref v1.2.0   # pin a specific release/tag/commit
npx code-flow-skill install --ref main     # track the main branch
npx code-flow-skill install --dry-run      # preview, write nothing
npx code-flow-skill install --force        # overwrite existing unmanaged skill folders
```

Default (no `--ref`) uses the latest GitHub release tag.

## Other commands

```bash
npx code-flow-skill doctor      # show installed skills and their ref
npx code-flow-skill uninstall   # remove installed skills + pointer blocks
npx code-flow-skill help
```

Only skills installed by this tool (marked with a `.code-flow-skill` file) are ever modified or removed. Existing unmanaged folders are never overwritten without `--force`.

## What you get

| Skill | Trigger | Rules |
| --- | --- | --- |
| `angular-skill` | `angular.json`, `@angular/core`, `*.component.ts` | Standalone, Signals > RxJS, logic in stores |
| `react-skill` | `react` in package.json, `*.tsx` | Logic in hooks, Zustand (global) + TanStack Query (server) |
| `vue-skill` | `vue` in package.json, `*.vue` | `<script setup>`, logic in composables, Pinia |
| `vault-workflow` | a `vault/` folder | DevLog, tasks, module-docs-first, Graphify, ADR |

All framework skills enforce: no `any`, small components with zero logic, separate files for models/constants/services/stores, and strict member ordering. These house rules win over other guidance on conflict.

## Requirements

- Node.js 18+ (uses the built-in `fetch`)
- Internet access on first install (skills are fetched from GitHub)

## Releasing (maintainer)

Rilis baru dengan satu command, tag + GitHub Release + npm publish otomatis via CI:

```bash
npm run release -- patch   # bump + commit
git push                   # CI tags, releases, and publishes
```

Panduan CLI lengkap (termasuk cara push bersama tag secara manual) ada di **[RELEASING.md](./RELEASING.md)**. Alur author/publish rules ada di **[PUBLISHING.md](./PUBLISHING.md)**.

## License

MIT
