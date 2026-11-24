import { Plus, RotateCw, TriangleAlert, Users } from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/PageHeader"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { DataTable } from "@/components/shared/DataTable"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { createCustomerColumns } from "@/features/customers/components/customerColumns"
import { useCustomers, useDeleteCustomer } from "@/features/customers/queries"
import type { Customer } from "@/features/customers/types"
import { useApiErrorToast } from "@/hooks/use-api-error-toast"
import { t } from "@/i18n/de"

const text = t.customers

export function CustomerListPage() {
  const customers = useCustomers()
  const deleteCustomer = useDeleteCustomer()
  const showApiError = useApiErrorToast()

  // Kept after closing, so the dialog title doesn't go blank during the close animation.
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const columns = useMemo(
    () =>
      createCustomerColumns((customer) => {
        setCustomerToDelete(customer)
        setIsDeleteDialogOpen(true)
      }),
    [],
  )

  const confirmDelete = () => {
    if (!customerToDelete) {
      return
    }
    const { id, name } = customerToDelete
    deleteCustomer.mutate(id, {
      onSuccess: () => {
        toast.success(text.delete.success(name))
        setIsDeleteDialogOpen(false)
      },
      onError: (error) => {
        showApiError(error) // e.g. 409 "Kunde „Bäckerei Weber“ wird in 2 Belegen verwendet."
        setIsDeleteDialogOpen(false)
      },
    })
  }

  return (
    <>
      <PageHeader
        title={text.list.title}
        description={text.list.description}
        actions={
          <Button asChild>
            <Link to="/kunden/neu">
              <Plus />
              {text.actions.create}
            </Link>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={customers.data}
        isLoading={customers.isPending}
        searchColumns={["name", "email", "city"]}
        searchPlaceholder={text.list.search}
        initialSorting={[{ id: "name", desc: false }]}
        emptyState={
          customers.isError ? (
            <EmptyState
              icon={TriangleAlert}
              title={text.list.loadError}
              description={customers.error.detail}
              action={
                <Button variant="outline" size="sm" onClick={() => customers.refetch()}>
                  <RotateCw />
                  {t.common.actions.retry}
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Users}
              title={text.list.empty}
              description={text.list.emptyDescription}
              action={
                <Button size="sm" asChild>
                  <Link to="/kunden/neu">
                    <Plus />
                    {text.actions.create}
                  </Link>
                </Button>
              }
            />
          )
        }
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        variant="destructive"
        title={text.delete.title(customerToDelete?.name ?? "")}
        description={text.delete.description}
        confirmLabel={text.actions.delete}
        isLoading={deleteCustomer.isPending}
        onConfirm={confirmDelete}
      />
    </>
  )
}
