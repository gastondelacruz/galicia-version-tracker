---
name: component-hook-split
description: >
  Mandatory pattern: every new component must have all its logic in a dedicated custom hook (useXxx).
  Trigger: When creating a new component or refactoring an existing one that contains logic mixed with JSX.
license: Apache-2.0
metadata:
  author: Galicia Version Tracker
  version: "1.0"
  scope: [ui]
  auto_invoke: "Creating a new component or refactoring a component with mixed logic and JSX"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, Task
---

## Rule

> **Every component that contains logic MUST delegate it entirely to a `useXxx` custom hook.**
> The component file is JSX only. The hook file is logic only. No exceptions.

---

## When to Apply

- Creating **any** new component with state, handlers, derived data, or side effects
- Refactoring an existing component that mixes logic with JSX

---

## File Structure

```
src/features/{name}/
├── components/
│   └── ProductList.tsx          ← JSX only
└── hooks/
    └── use-product-list.ts      ← all logic lives here
```

For shared components:

```
src/shared/
├── components/ui-custom/
│   └── SearchBar.tsx
└── hooks/
    └── use-search-bar.ts
```

---

## Naming Convention

| Component file          | Hook file                        | Hook function          |
| ----------------------- | -------------------------------- | ---------------------- |
| `ProductList.tsx`       | `use-product-list.ts`            | `useProductList`       |
| `AddArtifactDialog.tsx` | `use-add-artifact-dialog.ts`     | `useAddArtifactDialog` |
| `KanbanBoard.tsx`       | `use-kanban-board.ts`            | `useKanbanBoard`       |
| `VersionFilter.tsx`     | `use-version-filter.ts`          | `useVersionFilter`     |

Rules:
- Hook **always** starts with `use` (React convention — required for hook detection)
- Hook name mirrors the component name exactly
- Hook file uses kebab-case with `use-` prefix

---

## Critical Patterns

### Component: JSX only

```typescript
// ✅ CORRECT
export function ProductList(): JSX.Element {
  const { products, isLoading, handleSelect } = useProductList();

  if (isLoading) return <Spinner />;

  return (
    <ul>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onSelect={handleSelect} />
      ))}
    </ul>
  );
}

// ❌ WRONG — logic inside the component
export function ProductList(): JSX.Element {
  const [selected, setSelected] = useState<string | null>(null);
  const { data: products = [], isLoading } = useQuery({ queryKey: ['products'], queryFn: fetchProducts });

  const handleSelect = (id: string) => {
    setSelected(id);
    toast({ title: 'Selected', description: id });
  };

  return (
    <ul>
      {products.map((p) => (
        <li key={p.id} onClick={() => handleSelect(p.id)}>{p.name}</li>
      ))}
    </ul>
  );
}
```

### Hook: logic only, explicit return type

```typescript
// ✅ CORRECT
type UseProductListReturn = {
  readonly products: Product[];
  readonly isLoading: boolean;
  readonly selectedId: string | null;
  readonly handleSelect: (id: string) => void;
};

export function useProductList(): UseProductListReturn {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const handleSelect = (id: string): void => {
    setSelectedId(id);
    toast({ title: 'Selected', description: id });
  };

  return { products, isLoading, selectedId, handleSelect };
}
```

---

## What Goes Where

| Belongs in Hook (`useXxx`)              | Belongs in Component (JSX)              |
| --------------------------------------- | --------------------------------------- |
| `useState`                              | JSX markup and structure                |
| `useEffect`                             | Tailwind / CSS classes                  |
| `useQuery` / `useMutation`              | Conditional rendering (`isLoading && …`) |
| Derived / filtered data                 | `key` props on lists                    |
| Event handlers (`handleXxx`)            | `ref` for DOM focus/scroll              |
| Validation logic                        | Accessibility attributes (`aria-*`)     |
| `toast()` calls                         |                                         |
| Reset logic                             |                                         |
| Any `if/else` or computation            |                                         |

---

## Return Type Rules

- Always declare an explicit `UseXxxReturn` type
- All fields must be `readonly`
- Never expose internal helpers — keep them private inside the hook
- Return a flat object (no nested objects unless naturally grouped)

```typescript
// ✅ CORRECT
type UseSearchBarReturn = {
  readonly query: string;
  readonly setQuery: (v: string) => void;
  readonly handleSearch: () => void;
};

// ❌ WRONG — no explicit type, no readonly
export function useSearchBar() {
  const [query, setQuery] = useState('');
  return { query, setQuery };
}
```

---

## Decision Tree

```
Creating a new component?
  ├─ Does it have state, handlers, queries, or derived data?
  │  └─ YES → create useXxx hook in hooks/ → component gets JSX only
  │
  └─ Is it purely presentational (only props → JSX)?
     └─ YES → no hook needed, component receives everything via props
```

---

## Common Mistakes

❌ `useXxx` name does not match the component name — use the exact same name  
❌ Starting the hook with anything other than `use` — React will not recognize it as a hook  
❌ Keeping `useState` in the component "because it's just one field" — if it's used in a handler, it belongs in the hook  
❌ Returning private helpers from the hook — keep validation helpers (`nameExists`, etc.) internal  
❌ One hook shared by multiple unrelated components — one hook per component  
❌ Missing `UseXxxReturn` type — always declare an explicit return type with `readonly` fields
