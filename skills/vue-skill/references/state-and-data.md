# Vue State & Data: Pinia + Composables

## 1. Feature logic → composables

Each feature's fetching, derived values, and actions live in a composable. Components call the composable and render the result.

```typescript
export function useDocumentList() {
  const service = useDocumentService();

  const search = ref('');
  const page = ref(1);
  const result = ref<PagedResult<DocumentRow> | null>(null);
  const isLoading = ref(false);

  const rows = computed(() => result.value?.data ?? []);
  const total = computed(() => result.value?.total ?? 0);

  async function fetch(): Promise<void> {
    isLoading.value = true;
    try {
      result.value = await service.list({ search: search.value, page: page.value });
    } finally {
      isLoading.value = false;
    }
  }

  watch([search, page], fetch, { immediate: true });

  return { rows, total, isLoading, search, page, fetch };
}
```

## 2. Global state → Pinia setup store (sparingly)

Pinia holds only genuinely global, shared state. Use the setup-store style for full TypeScript inference. It is not a place for per-feature logic.

```typescript
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const isAuthenticated = computed(() => user.value !== null);

  function setUser(next: User | null): void {
    user.value = next;
  }

  return { user, isAuthenticated, setUser };
});
```

Destructure reactive state with `storeToRefs` to preserve reactivity:

```typescript
const { user, isAuthenticated } = storeToRefs(useAuthStore());
```

## 3. Service layer (stateless)

```typescript
export function useDocumentService() {
  return {
    list: (params: DocumentListParams): Promise<PagedResult<DocumentRow>> =>
      http.get('/api/documents', { params }).then((r) => r.data),
    create: (input: CreateDocumentRequest): Promise<DocumentRow> =>
      http.post('/api/documents', input).then((r) => r.data),
  };
}
```

Services only perform network calls and return typed data. Composables call services; components call composables.
