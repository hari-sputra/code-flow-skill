# Angular Companion Skills & MCP

These official sources enrich the house rules. They fill gaps (idiomatic API details, migrations, latest docs) but never override the five mandatory house rules. On any conflict, the house rules win.

## Companion skills

- **Official Angular skill** (`angular/angular`, `skills/dev-skills/angular-developer`): the Angular team's own agent skill for standalone components, signals, typed forms, and modern control flow. Use it for idiomatic API usage and up-to-date patterns.

## Angular CLI MCP server (`ng mcp`)

If the project has Angular CLI available, the MCP server exposes tools the agent should use when present:

- `get_best_practices`: retrieves the official Angular Best Practices Guide (standalone components, typed forms, modern control flow). Pull this before generating non-trivial Angular code.
- `search_documentation`: live angular.dev documentation lookup.
- Code-generation and workspace-analysis tools from the CLI.

Enable it by adding the MCP server to the tool's config (`npx -y @angular/cli mcp`). The `agent-skills mcp` command prints the exact per-tool config snippet.

## Context7 MCP

For non-Angular library docs that appear in an Angular project (e.g. a charting or markdown library), use Context7 MCP to fetch current documentation instead of relying on memory.

## Precedence recap

1. House rules (the five mandatory rules + folder/member conventions) — always win.
2. Official Angular skill and `ng mcp get_best_practices` — fill idiomatic gaps.
3. Context7 / general docs — reference material only.
