import { useNavigate } from "react-router"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/PageHeader"
import { CustomerForm } from "@/features/customers/components/CustomerForm"
import { useCreateCustomer } from "@/features/customers/queries"
import { EMPTY_CUSTOMER_FORM } from "@/features/customers/schema"
import type { CustomerRequest } from "@/features/customers/types"
import { t } from "@/i18n/de"

const text = t.customers

export function CustomerCreatePage() {
  const createCustomer = useCreateCustomer()
  const navigate = useNavigate()

  const save = async (request: CustomerRequest) => {
    const customer = await createCustomer.mutateAsync(request)
    toast.success(text.saved.created(customer.name))
    await navigate("/kunden")
  }

  return (
    <>
      <PageHeader title={text.create.title} description={text.create.description} />
      <CustomerForm defaultValues={EMPTY_CUSTOMER_FORM} onSubmit={save} />
    </>
  )
}
