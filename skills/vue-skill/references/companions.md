# Vue Companion Skills & MCP

Official sources that enrich the house rules. They fill gaps but never override the house rules. On conflict, the house rules win.

## Companion skills

- **Vue best practices** (`vuejs-ai/skills`, `vue-best-practices`): Vue 3 + Composition API + TypeScript best practices, common gotchas, SSR guidance, and performance. For most reliable triggering, the repo recommends prefixing a prompt with "use vue skill".
- **Pinia best practices** (`vuejs-ai/skills`, `vue-pinia-best-practices`): store setup, reactivity patterns, and state structure for Pinia.

## MCP

- **Context7 MCP**: fetch current docs for Vue 3.5, Pinia, and Vue Router instead of relying on memory. The `agent-skills mcp` command prints the per-tool config snippet.

## Precedence recap

1. House rules (`<script setup>`, small components, logic in composables, Pinia for global state only, no `any`) — always win.
2. vuejs-ai vue-best-practices / vue-pinia-best-practices — idiomatic gaps.
3. Context7 / general docs — reference material only.
