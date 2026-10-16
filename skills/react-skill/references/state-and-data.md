# React State & Data: Zustand + TanStack Query

Two distinct concerns, two distinct tools. Do not mix them.

## 1. Server state → TanStack Query v5

All data from the backend is server state. Never store it in Zustand or `useState`. Wrap queries in a custom hook so components never touch the query client directly.

```typescript
export function useDocumentList() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: documentKeys.list({ search, page }),
    queryFn: () => documentService.list({ search, page }),
    placeholderData: keepPreviousData,
  });

  return {
    rows: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    error: query.error,
    setSearch,
    setPage,
  };
}
```

Mutations invalidate the relevant keys:

```typescript
export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDocumentRequest) => documentService.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: documentKeys.all }),
  });
}
```

## 2. Global client state → Zustand (sparingly)

Zustand holds only genuinely global, synchronous client state — auth, theme, feature flags, a cross-page cart. It is NOT a dumping ground for feature logic or server data.

```typescript
interface AuthState {
  readonly user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```

Select narrow slices to avoid needless re-renders: `useAuthStore((s) => s.user)`.

## 3. Service layer (stateless)

```typescript
export const documentService = {
  list: (params: DocumentListParams): Promise<PagedResult<DocumentRow>> =>
    http.get('/api/documents', { params }).then((r) => r.data),
  create: (input: CreateDocumentRequest): Promise<DocumentRow> =>
    http.post('/api/documents', input).then((r) => r.data),
};
```

The service only performs network calls and returns typed data. Hooks call services; components call hooks.
