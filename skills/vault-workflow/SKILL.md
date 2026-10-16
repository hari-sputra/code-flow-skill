---
name: vault-workflow
description: "Project knowledge-vault workflow. Use when a project contains a vault/ folder (DevLogs, tasks, Modules, Decisions). Covers daily DevLog conventions, task checklist discipline, module-docs-first investigation, Graphify-first knowledge-graph lookups, and ADR authoring. Load this whenever you investigate a codebase that keeps an Obsidian-style vault."
---
# Vault Workflow

Conventions for a project that keeps a knowledge vault — a `vault/` folder containing `DevLogs/`, `tasks/`, `Modules/`, and `Decisions/`. Apply these automatically whenever such a folder is present, without being asked.

## The 5 practices

1. **Module docs first.** Before analysing or changing a module, read its guide in `vault/Modules/`. After changing a flow, form dependency, status, or business rule, update that module doc so the recorded flow stays accurate.
2. **Graphify first.** Before raw `grep`/`find`/mass file reads, query the knowledge graph (`graphify query`, `graphify explain`, `graphify path`, or `graphify-out/wiki/index.md`). Fall back to reading code only when Graphify lacks the answer. Run `graphify update .` after code changes. See `references/investigation-workflow.md`.
3. **Daily DevLog.** Keep one file per day at `vault/DevLogs/YYYY-MM-DD.md` (pure ISO date, no module suffix), grouped by module, ending with a Final Status & Verification section. Link it in `Index.md`. See `references/devlog-conventions.md` and `references/devlog-template.md`.
4. **Task discipline.** Read active task docs in `vault/tasks/` before working; tick `[x]` the moment a sub-task is verified; create `vault/tasks/<feature>_tasks.md` for new initiatives.
5. **ADR for decisions.** Record significant architectural decisions in `vault/Decisions/` using `references/adr-template.md`: context, options, decision, consequences, and a status.

## References

| File | Read it to… |
| --- | --- |
| `references/devlog-conventions.md` | follow the daily DevLog naming and structure rules |
| `references/investigation-workflow.md` | apply the Graphify-first investigation standard |
| `references/devlog-template.md` | copy the daily DevLog template |
| `references/adr-template.md` | copy the ADR template |

## Checklist

- [ ] Read the module doc before touching a module; update it after flow changes.
- [ ] Query Graphify before raw scanning; run `graphify update .` after changes.
- [ ] Create or update today's DevLog and link it in `Index.md`.
- [ ] Tick finished task checklist items in `vault/tasks/`.
- [ ] Record architectural decisions as ADRs.
