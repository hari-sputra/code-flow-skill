# Vue Architecture & Folder Conventions

Composable-driven architecture for Vue 3.5 + TypeScript. Components stay thin; logic lives in composables; Pinia holds only global state. Mirrors the Angular/React house rules with Vue-idiomatic primitives.

## 1. Where logic lives (important)

- **Global / cross-component state** → Pinia setup store (`stores/*.store.ts`). Only truly shared state (auth, theme, cross-page cart). Keep stores small.
- **Feature logic** (fetching, derived values, event handlers) → a composable `composables/use-<feature>.ts`.
- **Component (SFC)** → presentation only. It calls one composable and renders the template. No fetch, no business rules, no transformation in the component.

## 2. Folder layout per feature

```text
src/features/<feature>/
  models/        <feature>.model.ts        # interfaces, types, DTOs, enums
  constants/     <feature>.constant.ts      # static options, columns, metadata
  services/      <feature>.service.ts       # fetch/axios calls only (stateless)
  stores/        <feature>.store.ts         # Pinia setup store — global state only
  composables/   use-<feature>.ts           # feature logic + data fetching
  components/     <feature>-card.vue         # thin presentational SFCs
  pages/          <feature>-page.vue         # thin route SFCs
```

## 3. Modern Vue — `<script setup lang="ts">`

- Always use `<script setup lang="ts">` SFCs. Use the Composition API, never the Options API in new code.
- Use the macros `defineProps`, `defineEmits`, `defineModel` with typed generics.
- Prefer `ref`/`computed` for reactive state; use `reactive` sparingly for grouped object state.
- Prefer typed props via `defineProps<Props>()` with a separate `Props` interface from `models/`.

```vue
<script setup lang="ts">
const props = defineProps<DocumentCardProps>();
const emit = defineEmits<{ open: [id: string] }>();
const label = computed(() => `${props.document.title} (${props.document.status})`);
</script>

<template>
  <button class="flex items-center gap-2 p-4" @click="emit('open', props.document.id)">
    {{ label }}
  </button>
</template>
```

## 4. Small components

Split large SFCs into small, single-responsibility child components. Keep templates simple — move complex expressions into `computed` or composable functions. Avoid logic-heavy templates.
