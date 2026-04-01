---
name: react
description: >
  React functional component patterns, hooks, and separation of concerns.
  Trigger: When writing or refactoring React components, custom hooks, or managing local/shared UI state.
license: Apache-2.0
metadata:
  author: Galicia Version Tracker
  version: "1.0"
  scope: [ui]
  auto_invoke: "Writing React components or custom hooks"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, Task
---

## When to Use

Use this skill when:

- Writing new React components (UI or container)
- Creating custom hooks
- Refactoring components that mix UI and business logic
- Deciding where to place state (local vs shared)
- Typing component props

---

## Critical Patterns

### Pattern 1: UI Component (Presentation Only)

```typescript
// ✅ CORRECT - Pure presentation, no business logic
type ProductCardProps = {
  readonly name: string;
  readonly price: number;
  readonly onSelect: (name: string) => void;
};

export function ProductCard({ name, price, onSelect }: ProductCardProps): JSX.Element {
  return (
    <div onClick={() => onSelect(name)}>
      <span>{name}</span>
      <span>{price}</span>
    </div>
  );
}

// ❌ WRONG - Logic inside UI component
export function ProductCard(): JSX.Element {
  const [data, setData] = useState<Product[]>([]);
  useEffect(() => {
    fetch('/api/products').then((r) => r.json()).then(setData);
  }, []);
  return <div>{data.map((p) => <span key={p.id}>{p.name}</span>)}</div>;
}
```

### Pattern 2: Custom Hook (Business Logic)

```typescript
// ✅ CORRECT - Logic extracted to a hook, component stays clean
export function useProductData(): { products: Product[]; isLoading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
  return { products: data ?? [], isLoading };
}

// Usage in component
export function ProductList(): JSX.Element {
  const { products, isLoading } = useProductData();
  if (isLoading) return <Spinner />;
  return <ul>{products.map((p) => <ProductCard key={p.id} {...p} />)}</ul>;
}
```

### Pattern 3: Local State (UI Only)

```typescript
// ✅ CORRECT - State that is purely visual
export function SearchBar({ onSearch }: SearchBarProps): JSX.Element {
  const [query, setQuery] = useState('');

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && onSearch(query)}
    />
  );
}

// ❌ WRONG - Duplicated derived state
const [user, setUser] = useState<User>();
const [userName, setUserName] = useState<string>(); // Derive from user instead
```

### Pattern 4: Complex State with useReducer

```typescript
// ✅ CORRECT - useReducer for multi-field state transitions
type FilterState = {
  readonly query: string;
  readonly minPrice: number;
  readonly maxPrice: number;
};

type FilterAction =
  | { type: "SET_QUERY"; payload: string }
  | { type: "SET_PRICE_RANGE"; payload: { min: number; max: number } }
  | { type: "RESET" };

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case "SET_QUERY":
      return { ...state, query: action.payload };
    case "SET_PRICE_RANGE":
      return {
        ...state,
        minPrice: action.payload.min,
        maxPrice: action.payload.max,
      };
    case "RESET":
      return initialFilterState;
  }
}
```

### Pattern 5: Prop Typing

```typescript
// ✅ CORRECT - Use type, readonly, explicit return type
type ButtonProps = {
  readonly label: string;
  readonly variant?: 'primary' | 'secondary';
  readonly onClick: () => void;
  readonly disabled?: boolean;
};

export function Button({ label, variant = 'primary', onClick, disabled = false }: ButtonProps): JSX.Element {
  return <button disabled={disabled} onClick={onClick} className={variant}>{label}</button>;
}

// ❌ WRONG - Untyped props, class component
export class Button extends React.Component<any> { ... }
```

---

## Decision Tree

```
Creating a new file?
  ├─ Does it render JSX?
  │  ├─ Does it fetch data or contain business logic?
  │  │  └─ Extract logic to useXxx() hook → component stays presentation only
  │  └─ Pure rendering from props?
  │     └─ UI Component → src/features/X/components/ or src/shared/components/
  │
  └─ Does it contain logic but no JSX?
     └─ Custom Hook → src/features/X/hooks/ or src/shared/hooks/

Is state needed?
  ├─ Only affects rendering (open/close, input value)?
  │  └─ useState
  ├─ Multiple related fields that transition together?
  │  └─ useReducer
  └─ Shared across multiple components?
     └─ React Context or custom hook with shared state
```

---

## Rules Summary

| Rule             | ✅ DO                         | ❌ DON'T                             |
| ---------------- | ----------------------------- | ------------------------------------ |
| Component type   | Functional only               | Class components                     |
| Responsibility   | One per component             | Mixed UI + logic                     |
| Props            | Typed with `type`, `readonly` | Untyped or `any`                     |
| Logic            | Custom hooks / services       | Inside JSX components                |
| State            | Local UI state only           | Duplicate/derived state              |
| State complexity | `useReducer` for multi-field  | Multiple `useState` for related data |

---

## Best Practices

✅ **One component = one responsibility**
✅ **Extract ALL data fetching to custom hooks**
✅ **Type ALL props explicitly** — no implicit `children`, no `any`
✅ **Return type always explicit** for exported components
✅ **Prefer composition over prop drilling** — use Context or compound components
✅ **Keep JSX shallow** — extract sub-sections to named components

---

## Common Mistakes

❌ Fetching data directly inside a component with `useEffect + fetch`
❌ Storing derived data in state (e.g. `fullName` when you have `firstName + lastName`)
❌ Class components
❌ Using `interface` for props (use `type`)
❌ Missing `key` prop in lists
❌ Inline arrow functions creating new references on every render for stable callbacks

---

## File Placement

```
src/
├── shared/components/
│   ├── ui/           # shadcn/ui primitives (never modify directly)
│   ├── ui-custom/    # Custom reusable components (used by 2+ features)
│   └── layout/       # Layout, Navbar
│
└── features/{name}/
    ├── components/   # Feature-specific UI components
    └── hooks/        # Feature-specific custom hooks
```

---

## Resources

- [React Docs — Thinking in React](https://react.dev/learn/thinking-in-react)
- [React Docs — Hooks](https://react.dev/reference/react)
- [Patterns.dev — React Patterns](https://www.patterns.dev/)
