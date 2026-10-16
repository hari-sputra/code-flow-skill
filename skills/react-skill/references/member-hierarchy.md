# React Component & Hook Member Hierarchy

A consistent top-to-bottom order inside components and custom hooks.

## Component order

1. **Store / context / router hooks**: `useAuthStore()`, `useParams()`, `useContext()`.
2. **Feature hook**: the single `use<Feature>()` that provides state and handlers.
3. **Local UI state**: `useState`, `useRef` (only UI-local concerns like "is dropdown open").
4. **Derived values**: `useMemo` for expensive derivations.
5. **Effects**: `useEffect` only for external synchronization.
6. **Event handlers**: `handleX` / `onX` callbacks (prefer coming from the hook).
7. **Early returns**: loading, error, and empty states.
8. **JSX**: the returned markup.

Pure helper functions live at module scope, outside the component.

```tsx
export function DocumentListPage() {
  const user = useAuthStore((s) => s.user);
  const { rows, total, isLoading, error, setSearch } = useDocumentList();

  const [isFilterOpen, setFilterOpen] = useState(false);

  const summary = useMemo(() => `${total} documents`, [total]);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState error={error} />;

  return (
    <section className="flex flex-col gap-4">
      <DocumentToolbar summary={summary} onFilter={() => setFilterOpen(true)} onSearch={setSearch} />
      <DocumentTable rows={rows} />
      {isFilterOpen && <FilterModal onClose={() => setFilterOpen(false)} />}
    </section>
  );
}
```

## Custom hook order

1. **Dependencies**: stores, params, query client.
2. **Queries / mutations**: `useQuery`, `useMutation`.
3. **Local state**: `useState` for inputs the hook owns (search, page).
4. **Derived values**: `useMemo`.
5. **Callbacks**: `useCallback` handlers returned to the component.
6. **Return object**: a single typed object of state + handlers.
