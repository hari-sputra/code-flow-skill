# Releasing & auto-publish

This repo holds both the installer (`src/`) and the skill snapshot (`skills/`). Publishing is automated through GitHub Actions.

## One-command release

```bash
npm run release -- patch     # 0.1.0 -> 0.1.1
npm run release -- minor     # 0.1.0 -> 0.2.0
npm run release -- major     # 0.1.0 -> 1.0.0
npm run release -- 1.4.2     # explicit version
```

This bumps `package.json`, syncs `skills/index.json` to the same version, and commits both (no tag). Then:

```bash
git push
```

GitHub Actions does the rest:

1. **tag-and-release.yml** detects the version change on `main`, creates the tag `vX.Y.Z` and a GitHub Release (auto-generated notes).
2. **release.yml** runs on the published Release: checks out the tag, verifies `package.json` version == tag, runs tests, builds, and `npm publish`.

So: `npm run release -- patch` → `git push` → published to npm automatically.

## Updating the rule content

Rules are authored in the private `agent-skills` project (Obsidian-sourced). To ship new rules:

1. In `agent-skills`: `npm run build` then `npm run publish-skills -- --version vX.Y.Z` (copies `dist/` into this repo's `skills/` and regenerates `skills/index.json`).
2. Commit the updated `skills/` to this repo.
3. `npm run release -- <bump>` here, then `git push`.

Consumers pick up new rules from the latest GitHub Release automatically on `npx code-flow-skill install`.

## One-time setup: npm token for CI

GitHub Actions needs an npm token to publish. Because the npm account uses staged/2FA publishing, create a **Granular Access Token** with publish rights and 2FA bypass, then add it as a repo secret named `NPM_TOKEN`.

See the setup steps in the project chat/README.

## Manual publish (fallback)

If you ever need to publish by hand:

```bash
npm publish --access public --otp=<code>
```
