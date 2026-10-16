# TypeScript Standards

Strict, model-driven TypeScript for every framework (Angular, React, Vue).

## 1. No `any`

- Never use the `any` type. It disables type checking and defeats the purpose of TypeScript.
- When a shape is genuinely unknown, use `unknown` and narrow it with type guards before use.
- Enable strict mode in `tsconfig.json`: `"strict": true`, plus `"noUncheckedIndexedAccess": true`.
- Recommended lint rule: `@typescript-eslint/no-explicit-any: "error"`.

## 2. Models in their own files

- Every interface, type alias, enum, and DTO goes in a dedicated file under `models/` (e.g. `*.model.ts`).
- Never declare a model inside a component, store, or service file.
- Name request/response DTOs after the endpoint they describe (`DocumentListResponse`, `CreateUserRequest`).

```typescript
export interface DocumentRow {
  readonly id: string;
  readonly title: string;
  readonly status: DocumentStatus;
  readonly updatedAt: string;
}

export type DocumentStatus = 'draft' | 'in_review' | 'approved';

export interface PagedResult<T> {
  readonly data: readonly T[];
  readonly total: number;
  readonly page: number;
}
```

## 3. Constants in their own files

- Static config, dropdown options, table columns, and fixed metadata go in `constants/` (e.g. `*.constant.ts`).
- Never inline constant arrays or config objects inside a component.
- Remove unused constants — especially dummy/mock data once a real endpoint is integrated.

## 4. Prefer precise types

- Use `readonly` for data that should not be mutated after creation.
- Prefer union literal types over loose `string` where values are known.
- Avoid type assertions (`as X`) unless narrowing is impossible; prefer type guards.
- Type function parameters and return values explicitly at module boundaries.

## 5. Cleanliness

- No unused imports in any file.
- No dead code, obsolete functions, or debug `console.log` before commit.
