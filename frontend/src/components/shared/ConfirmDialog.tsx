import { Loader2, TriangleAlert } from "lucide-react"
import type { MouseEvent, ReactNode } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { t } from "@/i18n/de"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: ReactNode
  /** Defaults to "Bestätigen". */
  confirmLabel?: string
  /** Defaults to "Abbrechen". */
  cancelLabel?: string
  /** "destructive" for delete / cancel actions: red button and warning icon. */
  variant?: "default" | "destructive"
  /** While true, both buttons are disabled, the confirm button spins and the dialog can't be closed. */
  isLoading?: boolean
  onConfirm: () => void
}

/**
 * Asks the user to confirm an action. Controlled: clicking confirm does NOT close the dialog,
 * the parent closes it (e.g. in the mutation's onSuccess), so it stays open while loading and on error.
 *
 * @example
 * <ConfirmDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   variant="destructive"
 *   title="Artikel löschen?"
 *   confirmLabel="Löschen"
 *   isLoading={deleteProduct.isPending}
 *   onConfirm={() => deleteProduct.mutate(id, { onSuccess: () => setOpen(false) })}
 * />
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = t.common.actions.confirm,
  cancelLabel = t.common.actions.cancel,
  variant = "default",
  isLoading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const handleOpenChange = (nextOpen: boolean) => {
    if (!isLoading) {
      onOpenChange(nextOpen)
    }
  }

  const handleConfirm = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault() // AlertDialogAction would close the dialog itself
    onConfirm()
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          {variant === "destructive" && (
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <TriangleAlert />
            </AlertDialogMedia>
          )}
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            variant={variant === "destructive" ? "destructive" : "default"}
            disabled={isLoading}
            aria-busy={isLoading}
            onClick={handleConfirm}
          >
            {isLoading && <Loader2 className="animate-spin" />}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
