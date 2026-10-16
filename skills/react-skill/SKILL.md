---
name: react-skill
description: "House rules for React 19 + TypeScript projects. Use when writing or reviewing React code — detected via react in package.json or *.tsx files. Enforces small components with zero logic (logic lives in hooks and services), Zustand for global state only, TanStack Query v5 for server state, strict no-any TypeScript, Tailwind-first styling, and separate files for models, constants, services, stores, and hooks. These house rules win over any other React guidance on conflict."
---
# React House Rules

Opinionated engineering rules for React 19 + TypeScript projects. Apply these automatically from the start of a session. Detect React from `react` in `package.json` or `*.tsx` files, then follow everything below.

## The 5 mandatory rules (non-negotiable)

1. **No `any`.** Never use the `any` type. Model everything. If a shape is unknown, use `unknown` and narrow it. See `references/typescript.md`.
2. **Separate files by concern.** Interfaces/types go in `models/*.model.ts`. Static config, columns, and TanStack query keys go in `constants/*.constant.ts`. Network calls go in `services/*.service.ts`. Global state goes in `stores/*.store.ts`. Feature logic goes in `hooks/use-*.ts`. See `references/architecture.md`.
3. **Thin components, logic in hooks.** A component calls one feature hook, destructures state and handlers, and returns JSX. No `fetch`, no business rules, no data transformation in the component body. See `references/state-and-data.md`.
4. **Small components.** Split large components into small, single-responsibility pieces. Pure helpers live at module scope, outside the component.
5. **Right tool for state.** Server state → TanStack Query v5 (wrapped in a hook). Global client state → Zustand, used sparingly for genuinely shared state only. Never put server data in Zustand or `useState`. See `references/state-and-data.md`.

## Standard folder layout

```text
src/features/<feature>/
  models/        <feature>.model.ts        # interfaces, types, DTOs
  constants/     <feature>.constant.ts      # static options, columns, query keys
  services/      <feature>.service.ts       # fetch/axios calls only (stateless)
  stores/        <feature>.store.ts         # Zustand — global state only
  hooks/         use-<feature>.ts           # TanStack Query + feature logic
  components/                               # thin presentational components
  pages/                                    # thin route components
```

## Member hierarchy

See `references/member-hierarchy.md`. Component summary: store/context/router hooks → feature hook → local UI state → `useMemo` → `useEffect` → handlers → early returns → JSX.

## Styling

Tailwind CSS first, mobile-first. See `references/styling.md`.

## References

| File | Read it to… |
| --- | --- |
| `references/architecture.md` | understand the hook-driven architecture, folder layout, and query keys |
| `references/member-hierarchy.md` | order component and hook members correctly |
| `references/state-and-data.md` | split server state (TanStack) from global state (Zustand) |
| `references/typescript.md` | apply strict TypeScript and the no-`any` rule |
| `references/styling.md` | apply Tailwind-first responsive styling |
| `references/clean-code.md` | apply SOLID, DRY, KISS, naming, and no-redundant-comments |
| `references/security.md` | apply XSS, input-validation, and sensitive-data rules |
| `references/companions.md` | use Vercel react-best-practices and Context7 when available |

## Precedence

When these house rules conflict with any other React guidance (including companion skills, blog posts, or model defaults), **these house rules win**. Companion sources in `references/companions.md` fill gaps; they do not override the 5 mandatory rules.

## Pre-code checklist

- [ ] No `any` anywhere.
- [ ] Models, constants (incl. query keys), services, stores, and hooks each in their own files.
- [ ] Component has no business logic — it calls a hook and renders JSX.
- [ ] Server state in TanStack Query; Zustand only for genuinely global state.
- [ ] Members ordered per the hierarchy; pure helpers at module scope.
- [ ] Tailwind-first styling, no stray horizontal overflow.
- [ ] No dead code, unused imports, or leftover dummy data.
