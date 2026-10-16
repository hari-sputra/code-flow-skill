# Vue SFC & Composable Member Hierarchy

Consistent ordering inside `<script setup>` and composables.

## `<script setup>` order

1. **Props / emits / model**: `defineProps`, `defineEmits`, `defineModel`.
2. **Stores & composables**: `useAuthStore()`, `useDocumentList()`.
3. **Reactive state**: `ref`, `reactive` the component owns (UI-local).
4. **Computed**: derived values.
5. **Watchers**: `watch`, `watchEffect` for side effects.
6. **Lifecycle hooks**: `onMounted`, `onUnmounted`.
7. **Functions**: event handlers and local helpers.

```vue
<script setup lang="ts">
const props = defineProps<DocumentListProps>();
const emit = defineEmits<{ select: [id: string] }>();

const store = useAuthStore();
const { rows, total, isLoading, setSearch } = useDocumentList();

const isFilterOpen = ref(false);

const summary = computed(() => `${total.value} documents`);

watch(
  () => props.scopeId,
  () => setSearch(''),
);

onMounted(() => {
  // one-time setup only
});

function openFilter() {
  isFilterOpen.value = true;
}
</script>
```

## Composable order

1. **Dependencies**: stores, route, injected services.
2. **Reactive state**: `ref` the composable owns (search, page).
3. **Data fetching**: fetch logic, loading/error refs.
4. **Computed**: derived values.
5. **Watchers**: refetch on dependency change.
6. **Functions**: actions returned to the component.
7. **Return object**: typed object of refs + functions (return `readonly` refs where possible).
