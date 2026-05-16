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
  const [debouncedQuery, setDebouncedQuery] = React.useState<string>(initialQuery);

  React.useEffect(() => {
    // If query is empty, update debouncedQuery immediately to avoid lag
    if (!query) {
      setDebouncedQuery('');
      return;
    }

    const handle = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => {
      clearTimeout(handle);
    };
  }, [query, debounceMs]);

  const filteredItems = React.useMemo(() => {
    const source = Array.isArray(items) ? items : [];
    if (!debouncedQuery) {
      return source;
    }

    const q = debouncedQuery.toLowerCase().trim();
    return source.filter((item) => {
      const text = selector
        ? selector(item)
        : String((item as any)?.name ?? (item as any)?.title ?? (item as any)?.shift_name ?? '');
      return String(text).toLowerCase().includes(q);
    });
  }, [items, debouncedQuery, selector]);

  return { query, setQuery, filteredItems } as const;
}


