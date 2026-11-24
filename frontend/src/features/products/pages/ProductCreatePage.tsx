import { useNavigate } from "react-router"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/PageHeader"
import { ProductForm } from "@/features/products/components/ProductForm"
import { useCreateProduct } from "@/features/products/queries"
import { EMPTY_PRODUCT_FORM } from "@/features/products/schema"
import type { ProductRequest } from "@/features/products/types"
import { t } from "@/i18n/de"

const text = t.products

export function ProductCreatePage() {
  const createProduct = useCreateProduct()
  const navigate = useNavigate()

  const save = async (request: ProductRequest) => {
    const product = await createProduct.mutateAsync(request)
    toast.success(text.saved.created(product.name))
    await navigate("/artikel")
  }

  return (
    <>
      <PageHeader title={text.create.title} description={text.create.description} />
      <ProductForm defaultValues={EMPTY_PRODUCT_FORM} onSubmit={save} />
    </>
  )
}
