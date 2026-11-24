import { useState } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/PageHeader"
import { InboundForm } from "@/features/inbound/components/InboundForm"
import { useCreateInboundDelivery } from "@/features/inbound/queries"
import { emptyInboundForm } from "@/features/inbound/schema"
import type { InboundDeliveryRequest } from "@/features/inbound/types"
import { t } from "@/i18n/de"

const text = t.inbound

export function InboundCreatePage() {
  const createDelivery = useCreateInboundDelivery()
  const navigate = useNavigate()
  // Computed once, so "today" doesn't change while the form is open.
  const [defaultValues] = useState(emptyInboundForm)

  const save = async (request: InboundDeliveryRequest) => {
    const delivery = await createDelivery.mutateAsync(request)
    toast.success(text.saved.created(delivery.number))
    await navigate(`/wareneingang/${delivery.id}`)
  }

  return (
    <>
      <PageHeader title={text.create.title} description={text.create.description} />
      <InboundForm defaultValues={defaultValues} cancelTo="/wareneingang" onSubmit={save} />
    </>
  )
}
