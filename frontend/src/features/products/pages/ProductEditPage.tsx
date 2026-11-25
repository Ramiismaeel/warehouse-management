import { FileQuestion, RotateCw, TriangleAlert } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductForm } from "@/features/products/components/ProductForm"
import { useProduct, useUpdateProduct } from "@/features/products/queries"
import { toProductFormValues } from "@/features/products/schema"
import type { ProductRequest } from "@/features/products/types"
import { t } from "@/i18n/de"
import { isValidId, parseIdParam } from "@/lib/ids"

const text = t.products

export function ProductEditPage() {
  const id = parseIdParam(useParams().id)
  const product = useProduct(id)
  const updateProduct = useUpdateProduct()
  const navigate = useNavigate()

  const save = async (request: ProductRequest) => {
    const saved = await updateProduct.mutateAsync({ id, request })
    toast.success(text.saved.updated(saved.name))
    await navigate("/artikel")
  }

  const backToList = (
    <Button variant="outline" size="sm" asChild>
      <Link to="/artikel">{text.edit.backToList}</Link>
    </Button>
  )

  let content
  if (!isValidId(id) || product.error?.status === 404) {
    content = (
      <EmptyState
        icon={FileQuestion}
        title={text.edit.notFound}
        description={text.edit.notFoundDescription}
        action={backToList}
      />
    )
  } else if (product.isError) {
    content = (
      <EmptyState
        icon={TriangleAlert}
        title={text.edit.loadError}
        description={product.error.detail}
        action={
          <Button variant="outline" size="sm" onClick={() => product.refetch()}>
            <RotateCw />
            {t.common.actions.retry}
          </Button>
        }
      />
    )
  } else if (product.isPending) {
    content = (
      <div className="grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Skeleton className="h-[36rem] rounded-4xl" />
        <Skeleton className="h-80 rounded-4xl" />
      </div>
    )
  } else {
    content = (
      <ProductForm
        // A fresh form per product, so the default values always belong to the loaded product.
        key={product.data.id}
        defaultValues={toProductFormValues(product.data)}
        quantity={product.data.quantity}
        onSubmit={save}
      />
    )
  }

  return (
    <>
      <PageHeader title={text.edit.title} description={text.edit.description} />
      {content}
    </>
  )
}
