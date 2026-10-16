# React Companion Skills & MCP

Official sources that enrich the house rules. They fill gaps but never override the house rules. On conflict, the house rules win.

## Companion skills

- **Vercel React Best Practices** (`vercel-labs/agent-skills`, `skills/react-best-practices`): 40+ performance rules across 8 categories for React and Next.js (eliminating waterfalls, reducing bundle size, memoization, data fetching). Use it when optimizing or reviewing performance.

## MCP

- **Context7 MCP**: fetch current docs for React 19, TanStack Query v5, and Zustand instead of relying on memory. Pull the exact API before using an unfamiliar feature. The `agent-skills mcp` command prints the per-tool config snippet.

## Precedence recap

1. House rules (small components, logic in hooks, Zustand for global state only, TanStack for server state, no `any`) — always win.
2. Vercel react-best-practices — performance guidance and idiomatic gaps.
3. Context7 / general docs — reference material only.
