# Angular Architecture & Folder Conventions

Store-driven reactive architecture for Angular 20 projects. The goal is thin, dumb components and a single source of truth per feature living in a store.

## 1. Layers

- **Presentation layer** (`pages/`, `components/`): renders templates, binds store signals, forwards user events. No data fetching, no transformation, no business logic.
- **State layer** (`stores/*.store.ts`): the single source of truth for a feature. Holds signals, computed values, actions, and all business logic.
- **Data-access layer** (`services/*.service.ts`): stateless `HttpClient` calls. Returns typed observables or promises to the store. No state.

Data flows one way: component dispatches an action to the store, the store calls a service, the service hits the backend, the store updates its signals, and the component re-renders from those signals.

## 2. Folder layout per feature

```text
src/app/features/<feature>/
  models/        <feature>.model.ts        # interfaces, types, DTOs, enums
  constants/     <feature>.constant.ts      # static options, table columns, fixed metadata
  services/      <feature>.service.ts       # HttpClient calls only (stateless)
  stores/        <feature>.store.ts         # signals, computed, actions, business logic
  pages/         <feature>-page/            # thin smart components (route targets)
    <feature>-page.ts
    <feature>-page.html
    <feature>-page.css
  components/                               # thin presentational child components
```

File naming follows the angular.dev convention: hyphenated file names that match the TypeScript identifier (`user-profile.ts` for `UserProfile`), with the component's `.ts`, `.html`, and `.css` sharing the same base name. One concept per file.

## 3. Standalone, modern Angular

- Use standalone components. Do not create NgModules for new features.
- Use the built-in control flow: `@if`, `@for` (always with `track`), and `@switch`. Do not use `*ngIf` or `*ngFor` in new code.
- Prefer `inject()` over constructor-parameter injection.
- Use `input()` / `output()` / `model()` signal APIs, marked `readonly`.
- Use `protected` for members only read by the template; keep the public API minimal.
- Set `changeDetection: ChangeDetectionStrategy.OnPush` on every component (natural fit with signals).
- Use typed reactive forms. Never use untyped `FormGroup`.

## 4. Small components

Split large components into small, single-responsibility child components. Avoid complex logic in templates — move it into a `computed()` or a store method with an expressive name. Name event handlers for what they do (`saveUserData()`), not for the triggering event (`handleClick()`).

## 5. Check the source of truth

Always read `package.json` and `angular.json` to confirm the Angular, TypeScript, and Tailwind versions before implementing a feature or adding a dependency.
