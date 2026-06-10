import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, duration: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, duration);

    return () => clearTimeout(timeoutId);
  }, [value, duration]);

  return debouncedValue;
}
