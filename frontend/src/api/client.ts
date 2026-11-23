import axios from "axios"

import { toApiError } from "@/lib/errors"

/**
 * The only axios instance of the app. Feature `api.ts` files use it; components never call axios directly.
 * Every failed request is rejected with an ApiError (see lib/errors.ts).
 */
export const apiClient = axios.create({
  baseURL: "/api/v1",
  headers: { "Content-Type": "application/json" },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
)
