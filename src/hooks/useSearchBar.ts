import * as React from 'react';

type Selector<T> = (item: T) => string;

interface UseSearchBarOptions<T> {
  selector?: Selector<T>;
  debounceMs?: number;
  initialQuery?: string;
}

export default function useSearchBar<T = any>(
  items: T[] | undefined,
  options: UseSearchBarOptions<T> = {}
) {
  const { selector, debounceMs = 150, initialQuery = '' } = options;

  const [query, setQuery] = React.useState<string>(initialQuery);
  const [filteredItems, setFilteredItems] = React.useState<T[]>(Array.isArray(items) ? items : []);

  React.useEffect(() => {
    let active = true;
    const handle = setTimeout(() => {
      if (!active) return;
      const source = Array.isArray(items) ? items : [];
      if (!query) {
        setFilteredItems(source);
        return;
      }
      const q = query.toLowerCase().trim();
      const next = source.filter((item) => {
        const text = selector
          ? selector(item)
          : String((item as any)?.name ?? (item as any)?.title ?? (item as any)?.shift_name ?? '');
        return String(text).toLowerCase().includes(q);
      });
      setFilteredItems(next);
    }, debounceMs);

    return () => {
      active = false;
      clearTimeout(handle);
    };
  }, [items, query, selector, debounceMs]);

  return { query, setQuery, filteredItems } as const;
}


