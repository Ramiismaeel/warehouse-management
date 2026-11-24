import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { Link } from "react-router"

import { DatePicker } from "@/components/shared/DatePicker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DocumentItemsEditor } from "@/features/documents/components/DocumentItemsEditor"
import {
  INBOUND_FORM_FIELDS,
  inboundFormSchema,
  type InboundFormValues,
} from "@/features/inbound/schema"
import type { InboundDeliveryRequest } from "@/features/inbound/types"
import { useApiErrorToast } from "@/hooks/use-api-error-toast"
import { t } from "@/i18n/de"
import { applyFieldErrors, toApiError } from "@/lib/errors"

const text = t.inbound.form

interface InboundFormProps {
  defaultValues: InboundFormValues
  /** Where "Abbrechen" goes: the list when creating, the detail page when editing. */
  cancelTo: string
  /** Saves the draft. A rejected promise puts field errors on the fields, other errors in a toast. */
  onSubmit: (request: InboundDeliveryRequest) => Promise<void>
}

/** Wareneingang draft form for the create and edit pages: Kopfdaten + Artikelzeilen. */
export function InboundForm({ defaultValues, cancelTo, onSubmit }: InboundFormProps) {
  const showApiError = useApiErrorToast()
  const form = useForm<InboundFormValues, unknown, InboundDeliveryRequest>({
    resolver: zodResolver(inboundFormSchema),
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
      // 400 validation errors belong to fields; everything else (404 product, 409 no draft) is a toast.
      if (!applyFieldErrors(toApiError(error), setError, INBOUND_FORM_FIELDS)) {
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
                <Field data-invalid={Boolean(errors.supplierName)}>
                  <FieldLabel htmlFor="inbound-supplier-name">{text.supplierName}</FieldLabel>
                  <Input
                    id="inbound-supplier-name"
                    autoComplete="organization"
                    placeholder={text.supplierNamePlaceholder}
                    aria-invalid={Boolean(errors.supplierName)}
                    {...register("supplierName")}
                  />
                  <FieldError errors={[errors.supplierName]} />
                </Field>

                <Controller
                  name="deliveryDate"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="inbound-delivery-date">{text.deliveryDate}</FieldLabel>
                      <DatePicker
                        id="inbound-delivery-date"
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
                <FieldLabel htmlFor="inbound-note">{text.note}</FieldLabel>
                <Textarea
                  id="inbound-note"
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
            <DocumentItemsEditor />
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
