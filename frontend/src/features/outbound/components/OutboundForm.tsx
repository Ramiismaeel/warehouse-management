import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { Link } from "react-router"

import { DatePicker } from "@/components/shared/DatePicker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { CustomerPicker } from "@/features/customers/components/CustomerPicker"
import { DocumentItemsEditor } from "@/features/documents/components/DocumentItemsEditor"
import {
  OUTBOUND_FORM_FIELDS,
  outboundFormSchema,
  type OutboundFormValues,
} from "@/features/outbound/schema"
import type { OutboundOrderRequest } from "@/features/outbound/types"
import { useApiErrorToast } from "@/hooks/use-api-error-toast"
import { t } from "@/i18n/de"
import { applyFieldErrors, toApiError } from "@/lib/errors"

const text = t.outbound.form

interface OutboundFormProps {
  defaultValues: OutboundFormValues
  /** Where "Abbrechen" goes: the list when creating, the detail page when editing. */
  cancelTo: string
  /** Saves the draft. A rejected promise puts field errors on the fields, other errors in a toast. */
  onSubmit: (request: OutboundOrderRequest) => Promise<void>
}

/** Warenausgang draft form for the create and edit pages: Kopfdaten + Artikelzeilen with available stock. */
export function OutboundForm({ defaultValues, cancelTo, onSubmit }: OutboundFormProps) {
  const showApiError = useApiErrorToast()
  const form = useForm<OutboundFormValues, unknown, OutboundOrderRequest>({
    resolver: zodResolver(outboundFormSchema),
    defaultValues,
    mode: "onTouched",
  })
  const {
    control,
    register,
    setError,
    formState: { errors, isSubmitting },
  } = form

  const submit = form.handleSubmit(async (request) => {
    try {
      await onSubmit(request)
    } catch (error) {
      // 400 validation errors belong to fields; everything else (404 customer/product, 409 no draft) is a toast.
      if (!applyFieldErrors(toApiError(error), setError, OUTBOUND_FORM_FIELDS)) {
        showApiError(error)
      }
    }
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={submit} noValidate className="flex max-w-4xl flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{text.header}</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid gap-7 sm:grid-cols-[minmax(0,1fr)_14rem] sm:gap-4">
                <Controller
                  name="customerId"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="outbound-customer">{text.customer}</FieldLabel>
                      <CustomerPicker
                        id="outbound-customer"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        invalid={fieldState.invalid}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />

                <Controller
                  name="orderDate"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="outbound-order-date">{text.orderDate}</FieldLabel>
                      <DatePicker
                        id="outbound-order-date"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        invalid={fieldState.invalid}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
              </div>

              <Field data-invalid={Boolean(errors.note)}>
                <FieldLabel htmlFor="outbound-note">{text.note}</FieldLabel>
                <Textarea
                  id="outbound-note"
                  rows={2}
                  placeholder={text.notePlaceholder}
                  aria-invalid={Boolean(errors.note)}
                  {...register("note")}
                />
                <FieldError errors={[errors.note]} />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{text.items}</CardTitle>
            <CardDescription>{text.itemsDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Shows "Verfügbar: …" per line and an amber hint when a quantity is higher (T22). */}
            <DocumentItemsEditor showAvailableStock />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">{text.draftHint}</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" asChild>
              <Link to={cancelTo}>{t.common.actions.cancel}</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <LoaderCircle className="animate-spin" />}
              {t.common.actions.save}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
