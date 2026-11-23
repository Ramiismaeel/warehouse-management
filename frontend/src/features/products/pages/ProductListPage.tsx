import { PackageOpen, Plus, RotateCw, TriangleAlert } from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/PageHeader"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { DataTable } from "@/components/shared/DataTable"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { createProductColumns } from "@/features/products/components/productColumns"
import { useDeleteProduct, useProducts } from "@/features/products/queries"
import type { Product } from "@/features/products/types"
import { useApiErrorToast } from "@/hooks/use-api-error-toast"
import { t } from "@/i18n/de"

const text = t.products

export function ProductListPage() {
  const products = useProducts()
  const deleteProduct = useDeleteProduct()
  const showApiError = useApiErrorToast()

  // Kept after closing, so the dialog title doesn't go blank during the close animation.
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const columns = useMemo(
    () =>
      createProductColumns((product) => {
        setProductToDelete(product)
        setIsDeleteDialogOpen(true)
      }),
    [],
  )

  const confirmDelete = () => {
    if (!productToDelete) {
      return
    }
    const { id, name } = productToDelete
    deleteProduct.mutate(id, {
      onSuccess: () => {
        toast.success(text.delete.success(name))
        setIsDeleteDialogOpen(false)
      },
      onError: (error) => {
        showApiError(error) // e.g. 409 "Artikel „Schrauben M6“ wird in 3 Belegen verwendet."
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
            <Link to="/artikel/neu">
              <Plus />
              {text.actions.create}
            </Link>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={products.data}
        isLoading={products.isPending}
        searchColumns={["sku", "name"]}
        searchPlaceholder={text.list.search}
        initialSorting={[{ id: "sku", desc: false }]}
        emptyState={
          products.isError ? (
            <EmptyState
              icon={TriangleAlert}
              title={text.list.loadError}
              description={products.error.detail}
              action={
                <Button variant="outline" size="sm" onClick={() => products.refetch()}>
                  <RotateCw />
                  {t.common.actions.retry}
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={PackageOpen}
              title={text.list.empty}
              description={text.list.emptyDescription}
              action={
                <Button size="sm" asChild>
                  <Link to="/artikel/neu">
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
        title={text.delete.title(productToDelete?.name ?? "")}
        description={text.delete.description}
        confirmLabel={text.actions.delete}
        isLoading={deleteProduct.isPending}
        onConfirm={confirmDelete}
      />
    </>
  )
}
