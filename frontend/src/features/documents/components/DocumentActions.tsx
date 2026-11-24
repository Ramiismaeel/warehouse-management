import { Ban, CheckCheck, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { Button } from "@/components/ui/button"
import type { DocumentStatus, StockDirection } from "@/features/documents/types"
import { t } from "@/i18n/de"
import { toApiError, type ApiError } from "@/lib/errors"
import { formatNumber } from "@/lib/format"

const text = t.documents

export type DocumentAction = "confirm" | "cancel" | "delete"

interface DocumentActionsProps {
  status: DocumentStatus
  /** E.g. "WE-2026-0007", shown in the dialog titles. */
  documentNumber: string
  /** IN for Wareneingang, OUT for Warenausgang. Decides whether the dialogs say stock goes up or down. */
  direction: StockDirection
  /** Edit page of this Beleg, e.g. "/wareneingang/7/bearbeiten". */
  editTo: string
  /**
   * Called after the user confirms the dialog. Resolve when done (show the success toast / navigate there);
   * reject with the API error and DocumentActions shows it as a toast (incl. the shortages of a 409).
   */
  onConfirm: () => Promise<unknown>
  onCancel: () => Promise<unknown>
  onDelete: () => Promise<unknown>
  /** Called after the error toast, e.g. to keep a 409's shortages on the page (Warenausgang). */
  onError?: (error: ApiError, action: DocumentAction) => void
}

/**
 * Buttons for a Beleg by status, each behind a ConfirmDialog:
 * Entwurf → Bearbeiten, Löschen, Bestätigen · Bestätigt → Stornieren · Storniert → nothing (read-only).
 */
export function DocumentActions({
  status,
  documentNumber,
  direction,
  editTo,
  onConfirm,
  onCancel,
  onDelete,
  onError,
}: DocumentActionsProps) {
  // Kept after closing, so the dialog texts don't change during the close animation.
  const [action, setAction] = useState<DocumentAction>("confirm")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isRunning, setIsRunning] = useState(false)

  if (status === "CANCELLED") {
    return null
  }

  const open = (nextAction: DocumentAction) => {
    setAction(nextAction)
    setIsDialogOpen(true)
  }

  const run = async () => {
    const handlers: Record<DocumentAction, () => Promise<unknown>> = {
      confirm: onConfirm,
      cancel: onCancel,
      delete: onDelete,
    }
    setIsRunning(true)
    try {
      await handlers[action]()
    } catch (error) {
      const apiError = toApiError(error)
      showActionError(apiError)
      onError?.(apiError, action)
    } finally {
      setIsRunning(false)
      setIsDialogOpen(false)
    }
  }

  const dialogs = {
    confirm: {
      title: text.dialogs.confirmTitle(documentNumber),
      description: direction === "IN" ? text.dialogs.confirmIn : text.dialogs.confirmOut,
      label: text.actions.confirm,
      variant: "default",
    },
    cancel: {
      title: text.dialogs.cancelTitle(documentNumber),
      description: direction === "IN" ? text.dialogs.cancelIn : text.dialogs.cancelOut,
      label: text.actions.cancel,
      variant: "destructive",
    },
    delete: {
      title: text.dialogs.deleteTitle(documentNumber),
      description: text.dialogs.deleteDescription,
      label: text.actions.delete,
      variant: "destructive",
    },
  } as const
  const dialog = dialogs[action]

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {status === "DRAFT" && (
          <>
            <Button variant="outline" asChild>
              <Link to={editTo}>
                <Pencil />
                {text.actions.edit}
              </Link>
            </Button>
            <Button variant="destructive" onClick={() => open("delete")}>
              <Trash2 />
              {text.actions.delete}
            </Button>
            <Button onClick={() => open("confirm")}>
              <CheckCheck />
              {text.actions.confirm}
            </Button>
          </>
        )}
        {status === "CONFIRMED" && (
          <Button variant="destructive" onClick={() => open("cancel")}>
            <Ban />
            {text.actions.cancel}
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        variant={dialog.variant}
        title={dialog.title}
        description={dialog.description}
        confirmLabel={dialog.label}
        isLoading={isRunning}
        onConfirm={() => void run()}
      />
    </>
  )
}

/** Like useApiErrorToast, but a 409 stock conflict also lists every short product. */
function showActionError({ detail, shortages }: ApiError) {
  toast.error(detail, {
    id: detail,
    description:
      shortages.length > 0 ? (
        <ul className="list-disc pl-4">
          {shortages.map((shortage) => (
            <li key={shortage.productId}>
              {text.shortage(
                shortage.sku,
                shortage.name,
                formatNumber(shortage.requested),
                formatNumber(shortage.available),
              )}
            </li>
          ))}
        </ul>
      ) : undefined,
  })
}
