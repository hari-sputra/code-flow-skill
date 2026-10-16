# Angular Class Member Hierarchy

Every TypeScript class in the codebase — component, store, service, directive, guard, or helper — orders its members top to bottom in this fixed sequence. This keeps every file predictable.

## Order

1. **Injections** (`inject()`): all dependencies at the very top.
2. **State & local variables**: `signal()` declarations, primitives, object references, class constants.
3. **Store / service bindings**: references bound to external state (in a component).
4. **Computed properties** (`computed()`): reactive derived values.
5. **Constructor / effects** (`constructor()`, `effect()`): initialization.
6. **Lifecycle hooks** (`ngOnInit`, `ngOnDestroy`, …): implement the matching interface.
7. **Public methods**: actions, event handlers, API triggers.
8. **Private helpers**: internal logic, placed last.

## Example — component (thin, no business logic)

```typescript
export class ExampleComponent implements OnInit, OnDestroy {
  private readonly store = inject(ExampleStore);
  private readonly router = inject(Router);

  protected readonly showFilterModal = signal(false);
  protected readonly sortState = signal<SortState>({ key: null, direction: 'ASC' });

  protected readonly columns = this.store.columns;
  protected readonly loading = this.store.loading;

  protected readonly rows = computed(() => this.store.result()?.data ?? []);

  ngOnInit(): void {
    this.store.fetch();
  }

  ngOnDestroy(): void {
    this.store.cleanup();
  }

  protected openFilter(): void {
    this.showFilterModal.set(true);
  }
}
```

## Example — store (owns all logic)

```typescript
@Injectable({ providedIn: 'root' })
export class ExampleStore {
  private readonly api = inject(ExampleApiService);
  private readonly toast = inject(ToastService);

  readonly searchTerm = signal<string>('');
  readonly selectedFilter = signal<string>('');

  readonly columns = EXAMPLE_COLUMNS;

  readonly hasActiveFilter = computed(() => this.selectedFilter() !== '');

  constructor() {
    effect(() => {
      this.searchTerm();
      this.selectedFilter();
      this.fetch();
    });
  }

  fetch(): void {
    // calls this.api, updates signals, handles errors
  }

  setFilter(value: string): void {
    this.selectedFilter.set(value);
  }

  private cleanup(): void {
    // teardown
  }
}
```
