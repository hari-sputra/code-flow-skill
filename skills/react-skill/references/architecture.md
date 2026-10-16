# React Architecture & Folder Conventions

Hook-driven architecture for React 19 + TypeScript projects. Components stay thin and dumb; all logic lives in custom hooks and services. This mirrors the Angular house rules but uses React-idiomatic primitives.

## 1. Where logic lives (important)

React differs from Angular here. Do NOT push all logic into a global store.

- **Global / cross-component state** → Zustand store (`stores/*.store.ts`). Only truly shared state (auth user, theme, cart). Keep stores small.
- **Server state** (fetching, caching, mutations) → TanStack Query v5, wrapped in a custom hook under `hooks/`.
- **Feature logic** (orchestration, derived values, event handlers) → a custom hook `hooks/use-<feature>.ts`.
- **Component** → presentation only. It calls one feature hook and renders JSX. No `fetch`, no business rules, no data transformation inside the component body.

A component should read like: call hook → destructure state and handlers → return JSX.

## 2. Folder layout per feature

```text
src/features/<feature>/
  models/        <feature>.model.ts        # interfaces, types, DTOs, enums
  constants/     <feature>.constant.ts      # static options, columns, AND query keys
  services/      <feature>.service.ts       # fetch/axios calls only (stateless)
  stores/        <feature>.store.ts         # Zustand — global state only
  hooks/         use-<feature>.ts           # TanStack Query + feature logic
  components/     <feature>-card.tsx         # thin presentational components
  pages/          <feature>-page.tsx         # thin route components
```

Query keys live in `constants/` so they are shared and never duplicated:

```typescript
export const documentKeys = {
  all: ['documents'] as const,
  list: (params: DocumentListParams) => ['documents', 'list', params] as const,
  detail: (id: string) => ['documents', 'detail', id] as const,
};
```

## 3. Modern React

- Function components only. No class components.
- Use the `use` hook and Suspense where it fits; prefer Server Components in Next.js when applicable.
- Avoid unnecessary `useEffect`. Derive during render, use event handlers for user actions, and reserve effects for external synchronization.
- Keep the dependency arrays correct; do not disable the exhaustive-deps lint rule.

## 4. Small components

Split large components into small, single-responsibility pieces. Extract pure helpers to module scope (outside the component) or to `models`/utility files. Avoid deeply nested JSX — compose child components instead.
