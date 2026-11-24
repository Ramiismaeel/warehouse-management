import { FileQuestion, RotateCw, TriangleAlert } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CustomerForm } from "@/features/customers/components/CustomerForm"
import { isValidCustomerId, useCustomer, useUpdateCustomer } from "@/features/customers/queries"
import { toCustomerFormValues } from "@/features/customers/schema"
import type { CustomerRequest } from "@/features/customers/types"
import { t } from "@/i18n/de"

const text = t.customers

export function CustomerEditPage() {
  const id = Number(useParams().id)
  const customer = useCustomer(id)
  const updateCustomer = useUpdateCustomer()
  const navigate = useNavigate()

  const save = async (request: CustomerRequest) => {
    const saved = await updateCustomer.mutateAsync({ id, request })
    toast.success(text.saved.updated(saved.name))
    await navigate("/kunden")
  }

  let content
  if (!isValidCustomerId(id) || customer.error?.status === 404) {
    content = (
      <EmptyState
        icon={FileQuestion}
        title={text.edit.notFound}
        description={text.edit.notFoundDescription}
        action={
          <Button variant="outline" size="sm" asChild>
            <Link to="/kunden">{text.edit.backToList}</Link>
          </Button>
        }
      />
    )
  } else if (customer.isError) {
    content = (
      <EmptyState
        icon={TriangleAlert}
        title={text.edit.loadError}
        description={customer.error.detail}
        action={
          <Button variant="outline" size="sm" onClick={() => customer.refetch()}>
            <RotateCw />
            {t.common.actions.retry}
          </Button>
        }
      />
    )
  } else if (customer.isPending) {
    content = <Skeleton className="h-[30rem] max-w-3xl rounded-4xl" />
  } else {
    content = (
      <CustomerForm
        // A fresh form per customer, so the default values always belong to the loaded customer.
        key={customer.data.id}
        defaultValues={toCustomerFormValues(customer.data)}
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
