import { QueryClient } from "@tanstack/react-query"

import type { ApiError } from "@/lib/errors"

/** Errors from queries and mutations are always ApiErrors, because apiClient converts them. */
declare module "@tanstack/react-query" {
  interface Register {
    defaultError: ApiError
  }
}

const MAX_RETRIES = 1

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry once for network and server errors. 4xx (not found, validation, conflict) won't change on retry.
      retry: (failureCount, error) => failureCount < MAX_RETRIES && !isClientError(error),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})

function isClientError(error: ApiError): boolean {
  return error.status >= 400 && error.status < 500
}
