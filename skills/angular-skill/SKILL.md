---
name: angular-skill
description: "House rules for Angular 20 projects. Use when writing or reviewing Angular code — detected via angular.json, @angular/core in package.json, or *.component.ts files. Enforces standalone components, Signals over RxJS, strict no-any TypeScript, small components with zero logic (all logic in stores), and separate files for models, constants, services, and stores. These house rules win over any other Angular guidance on conflict."
---
# Angular House Rules

Opinionated engineering rules for Angular 20 projects. Apply these automatically from the start of a session — do not wait to be told to "check the rules". Detect Angular from `angular.json` or `@angular/core` in `package.json`, then follow everything below.

## The 5 mandatory rules (non-negotiable)

1. **No `any`.** Never use the `any` type. Model everything. If a shape is unknown, use `unknown` and narrow it. See `references/typescript.md`.
2. **Separate files by concern.** Interfaces/types/enums go in `models/*.model.ts`. Static config, dropdown options, and table columns go in `constants/*.constant.ts`. HTTP calls go in `services/*.service.ts`. State and business logic go in `stores/*.store.ts`. Never define models or constants inside a component file.
3. **Thin components, logic in stores.** A component is a presentation layer only — it binds store signals to the template and forwards events. All data fetching, transformation, and state mutation live in a store. See `references/state-and-data.md`.
4. **Small components.** Split large components into small, single-responsibility pieces. If a template or class grows complex, extract child components and private methods with expressive names.
5. **Signals over RxJS.** Prefer `signal()`, `computed()`, and `effect()`. Use RxJS only for inherently async streams (HTTP via `HttpClient`, debounced search with `switchMap`/`debounceTime`, real-time streams). See `references/state-and-data.md`.

## Standard folder layout

```text
src/app/features/<feature>/
  models/        <feature>.model.ts        # interfaces, types, DTOs, enums
  constants/     <feature>.constant.ts      # static options, table columns, fixed metadata
  services/      <feature>.service.ts       # HttpClient calls only (stateless)
  stores/        <feature>.store.ts         # signals, computed, actions, business logic
  pages/         <feature>-page/            # thin smart components
  components/                               # thin presentational components
```

## Member hierarchy

Every TypeScript class follows a fixed top-to-bottom member order. See `references/member-hierarchy.md` for the full order and examples. Summary: injections → state signals → store bindings → computed → constructor/effects → lifecycle hooks → public methods → private helpers.

## Styling

Tailwind CSS first, mobile-first, with component CSS used only as a fallback. See `references/styling.md`.

## References

| File | Read it to… |
| --- | --- |
| `references/architecture.md` | understand the layered store-driven architecture and folder conventions |
| `references/member-hierarchy.md` | order class members correctly, with Angular examples |
| `references/state-and-data.md` | choose Signals vs RxJS and structure stores and services |
| `references/typescript.md` | apply strict TypeScript and the no-`any` rule |
| `references/styling.md` | apply Tailwind-first responsive styling |
| `references/clean-code.md` | apply SOLID, DRY, KISS, naming, and no-redundant-comments |
| `references/security.md` | apply XSS, input-validation, and sensitive-data rules |
| `references/companions.md` | use the official Angular skill and `ng mcp` when available |

## Precedence

When these house rules conflict with any other Angular guidance (including the official Angular skill, blog posts, or model defaults), **these house rules win**. Companion sources in `references/companions.md` fill gaps; they do not override the 5 mandatory rules.

## Pre-code checklist

- [ ] No `any` anywhere.
- [ ] Models, constants, services, and stores each in their own files.
- [ ] Component has no business logic — it reads store signals and forwards events.
- [ ] Signals used where possible; RxJS only for async streams.
- [ ] Members ordered per the hierarchy.
- [ ] Tailwind-first styling, no stray horizontal overflow.
- [ ] No dead code, unused imports, or leftover dummy data.
