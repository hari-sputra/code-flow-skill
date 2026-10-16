# Publishing new skill versions

The skills in `skills/` are a built snapshot generated from the private `agent-skills` project (which reads rules from an Obsidian vault). Consumers install them with `npx code-flow-skill install`.

## Author workflow

1. Edit rules in the Obsidian vault.
2. In the `agent-skills` project:
   ```bash
   npm run build          # vault -> dist/
   npm run publish-skills -- --version v1.2.0
   ```
   This copies `dist/<skill>` into this repo's `skills/` and regenerates `skills/index.json`.
3. Commit and push this repo.
4. Create a GitHub Release with a tag (e.g. `v1.2.0`). The npm package resolves the latest release tag by default, so consumers get this version on their next `install`.

## Consumer workflow

```bash
npx code-flow-skill install              # latest release
npx code-flow-skill install --ref v1.2.0 # specific version
npx code-flow-skill install --ref main   # bleeding edge
```

The npm package (`code-flow-skill`) is a thin installer; the rule content lives here and is fetched at install time, so publishing a new release updates everyone without republishing to npm.
