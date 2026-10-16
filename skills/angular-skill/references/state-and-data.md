# Angular State & Data: Signals over RxJS

All state and business logic live in a store. Components never fetch, transform, or mutate state.

## 1. Signal-first reactivity

Prefer Angular Signals over RxJS wherever signals can handle the need:

- `signal()` for synchronous, local, or feature state.
- `computed()` for derived state and data transformation.
- `effect()` for reactive side-effects.

Avoid `BehaviorSubject` / `Subject` for state that a `signal()` or `computed()` can hold.

## 2. When RxJS is still correct

Use RxJS only for inherently asynchronous or streaming work:

1. HTTP requests via `HttpClient`.
2. Debounced / race-safe search and filter via `switchMap`, `debounceTime`, `catchError`.
3. Continuous real-time streams: WebSocket, SSE, interval pollers.

Convert incoming streams to signals at the store boundary (e.g. `toSignal`) so components only ever read signals.

## 3. Store pattern

```typescript
@Injectable({ providedIn: 'root' })
export class DocumentListStore {
  private readonly api = inject(DocumentApiService);

  readonly search = signal<string>('');
  readonly page = signal<number>(1);
  readonly loading = signal<boolean>(false);
  readonly result = signal<PagedResult<DocumentRow> | null>(null);

  readonly rows = computed(() => this.result()?.data ?? []);
  readonly total = computed(() => this.result()?.total ?? 0);

  fetch(): void {
    this.loading.set(true);
    this.api
      .list({ search: this.search(), page: this.page() })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => this.result.set(res),
        error: (err) => this.handleError(err),
      });
  }

  private handleError(err: unknown): void {
    // user-friendly feedback, no silent failure
  }
}
```

## 4. Service pattern (stateless)

```typescript
@Injectable({ providedIn: 'root' })
export class DocumentApiService {
  private readonly http = inject(HttpClient);

  list(params: DocumentListParams): Observable<PagedResult<DocumentRow>> {
    return this.http.get<PagedResult<DocumentRow>>('/api/documents', { params: toHttpParams(params) });
  }
}
```

The service only talks to the network and returns typed data. It holds no state and performs no business logic.
