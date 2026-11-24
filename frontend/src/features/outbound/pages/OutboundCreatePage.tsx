import { useState } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/PageHeader"
import { OutboundForm } from "@/features/outbound/components/OutboundForm"
import { useCreateOutboundOrder } from "@/features/outbound/queries"
import { emptyOutboundForm } from "@/features/outbound/schema"
import type { OutboundOrderRequest } from "@/features/outbound/types"
import { t } from "@/i18n/de"

const text = t.outbound

export function OutboundCreatePage() {
  const createOrder = useCreateOutboundOrder()
  const navigate = useNavigate()
  // Computed once, so "today" doesn't change while the form is open.
  const [defaultValues] = useState(emptyOutboundForm)

  const save = async (request: OutboundOrderRequest) => {
    const order = await createOrder.mutateAsync(request)
    toast.success(text.saved.created(order.number))
    await navigate(`/warenausgang/${order.id}`)
  }

  return (
    <>
      <PageHeader title={text.create.title} description={text.create.description} />
      <OutboundForm defaultValues={defaultValues} cancelTo="/warenausgang" onSubmit={save} />
    </>
  )
}
