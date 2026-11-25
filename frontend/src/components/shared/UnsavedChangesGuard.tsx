import { useEffect } from "react"
import { useBlocker } from "react-router"

import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { t } from "@/i18n/de"

const text = t.common.unsavedChanges

interface UnsavedChangesGuardProps {
  /**
   * True while the form has unsaved changes, usually `isDirty && !isSubmitting`.
   * Must be false while saving, so the navigation after a successful save is not blocked.
   */
  when: boolean
}

/**
 * Asks before leaving a form with unsaved changes: in-app navigation (links, sidebar, back button)
 * shows a ConfirmDialog, closing or reloading the tab shows the browser's own prompt.
 *
 * @example
 * <UnsavedChangesGuard when={formState.isDirty && !formState.isSubmitting} />
 */
export function UnsavedChangesGuard({ when }: UnsavedChangesGuardProps) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      when && currentLocation.pathname !== nextLocation.pathname,
  )

  useEffect(() => {
    if (!when) {
      return
    }
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [when])

  return (
    <ConfirmDialog
      open={blocker.state === "blocked"}
      onOpenChange={(open) => {
        if (!open) {
          blocker.reset?.()
        }
      }}
      variant="destructive"
      title={text.title}
      description={text.description}
      confirmLabel={text.discard}
      cancelLabel={text.stay}
      onConfirm={() => blocker.proceed?.()}
    />
  )
}
