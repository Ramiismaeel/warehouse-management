import { useSearchParams } from "react-router"

import type { DocumentStatus } from "@/features/documents/types"

const STATUSES: readonly DocumentStatus[] = ["DRAFT", "CONFIRMED", "CANCELLED"]

/**
 * The status filter of a Beleg list, kept in the URL (?status=DRAFT), so it survives
 * opening a detail page and going back. null = all statuses; an unknown value counts as null.
 */
export function useDocumentStatusParam() {
  const [searchParams, setSearchParams] = useSearchParams()
  const param = searchParams.get("status")
  const status = STATUSES.find((candidate) => candidate === param) ?? null

  const setStatus = (next: DocumentStatus | null) => {
    setSearchParams(
      (current) => {
        const updated = new URLSearchParams(current)
        if (next) {
          updated.set("status", next)
        } else {
          updated.delete("status")
        }
        return updated
      },
      { replace: true },
    )
  }

  return [status, setStatus] as const
}
