import { useCallback } from "react"
import { toast } from "sonner"

import { toApiError } from "@/lib/errors"

/**
 * Returns a function that shows an API error's German `detail` in an error toast.
 * Accepts anything (ApiError, axios error, unknown) and converts it with toApiError().
 * The same message is shown only once at a time.
 *
 * @example
 * const showApiError = useApiErrorToast()
 * deleteProduct.mutate(id, { onError: showApiError })
 */
export function useApiErrorToast() {
  return useCallback((error: unknown) => {
    const { detail } = toApiError(error)
    toast.error(detail, { id: detail })
  }, [])
}
