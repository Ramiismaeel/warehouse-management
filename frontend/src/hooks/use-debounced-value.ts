import { useEffect, useState } from "react"

/**
 * Returns `value` once it hasn't changed for `delayMs`, e.g. to load a preview only after the user stops typing.
 *
 * @example
 * const previewUrl = useDebouncedValue(imageUrl, 400)
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timeout)
  }, [value, delayMs])

  return debounced
}
