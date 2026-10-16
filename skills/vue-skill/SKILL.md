---
name: vue-skill
description: "House rules for Vue 3.5 + TypeScript projects. Use when writing or reviewing Vue code — detected via vue in package.json or *.vue files. Enforces <script setup lang=\"ts\"> SFCs, small components with zero logic (logic lives in composables), Pinia setup stores for global state only, strict no-any TypeScript, Tailwind-first styling, and separate files for models, constants, services, stores, and composables. These house rules win over any other Vue guidance on conflict."
---
# Vue House Rules

Opinionated engineering rules for Vue 3.5 + TypeScript projects. Apply these automatically from the start of a session. Detect Vue from `vue` in `package.json` or `*.vue` files, then follow everything below.

## The 5 mandatory rules (non-negotiable)

1. **No `any`.** Never use the `any` type. Model everything. If a shape is unknown, use `unknown` and narrow it. See `references/typescript.md`.
2. **Separate files by concern.** Interfaces/types go in `models/*.model.ts`. Static config and columns go in `constants/*.constant.ts`. Network calls go in `services/*.service.ts`. Global state goes in `stores/*.store.ts` (Pinia). Feature logic goes in `composables/use-*.ts`. See `references/architecture.md`.
3. **Thin components, logic in composables.** An SFC calls one composable and renders the template. No fetch, no business rules, no transformation in the component. See `references/state-and-data.md`.
4. **Small components.** Split large SFCs into small, single-responsibility child components. Move complex template expressions into `computed` or composable functions.
5. **`<script setup lang="ts">` + Pinia setup stores.** Always use `<script setup lang="ts">` with the Composition API. Pinia setup stores hold only genuinely global state, used sparingly. See `references/state-and-data.md`.

## Standard folder layout

```text
src/features/<feature>/
  models/        <feature>.model.ts        # interfaces, types, DTOs
  constants/     <feature>.constant.ts      # static options, columns, metadata
  services/      <feature>.service.ts       # fetch/axios calls only (stateless)
  stores/        <feature>.store.ts         # Pinia setup store — global state only
  composables/   use-<feature>.ts           # feature logic + data fetching
  components/     <feature>-card.vue         # thin presentational SFCs
  pages/          <feature>-page.vue         # thin route SFCs
```

## Member hierarchy

See `references/member-hierarchy.md`. `<script setup>` summary: props/emits/model → stores & composables → reactive state → computed → watchers → lifecycle hooks → functions.

## Styling

Tailwind CSS first, mobile-first. See `references/styling.md`.

## References

| File | Read it to… |
| --- | --- |
| `references/architecture.md` | understand the composable-driven architecture and folder layout |
| `references/member-hierarchy.md` | order `<script setup>` and composable members correctly |
| `references/state-and-data.md` | structure composables and Pinia setup stores |
| `references/typescript.md` | apply strict TypeScript and the no-`any` rule |
| `references/styling.md` | apply Tailwind-first responsive styling |
| `references/clean-code.md` | apply SOLID, DRY, KISS, naming, and no-redundant-comments |
| `references/security.md` | apply XSS, input-validation, and sensitive-data rules |
| `references/companions.md` | use vuejs-ai vue/pinia skills and Context7 when available |

## Precedence

When these house rules conflict with any other Vue guidance (including companion skills, blog posts, or model defaults), **these house rules win**. Companion sources in `references/companions.md` fill gaps; they do not override the 5 mandatory rules.

## Pre-code checklist

- [ ] No `any` anywhere.
- [ ] Models, constants, services, stores, and composables each in their own files.
- [ ] Component has no business logic — it calls a composable and renders the template.
- [ ] `<script setup lang="ts">` with typed `defineProps`/`defineEmits`.
- [ ] Pinia setup stores only for genuinely global state.
- [ ] Members ordered per the hierarchy.
- [ ] Tailwind-first styling, no stray horizontal overflow.
- [ ] No dead code, unused imports, or leftover dummy data.
