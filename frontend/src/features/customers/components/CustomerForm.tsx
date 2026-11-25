import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { Link } from "react-router"

import { UnsavedChangesGuard } from "@/components/shared/UnsavedChangesGuard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  CUSTOMER_FORM_FIELDS,
  customerFormSchema,
  type CustomerFormValues,
} from "@/features/customers/schema"
import type { CustomerRequest } from "@/features/customers/types"
import { useApiErrorToast } from "@/hooks/use-api-error-toast"
import { t } from "@/i18n/de"
import { applyFieldErrors, toApiError } from "@/lib/errors"

const text = t.customers

interface CustomerFormProps {
  defaultValues: CustomerFormValues
  /** Saves the customer. A rejected promise puts field errors on the fields, other errors in a toast. */
  onSubmit: (request: CustomerRequest) => Promise<void>
}

/** Kunde form for the create and edit pages. */
export function CustomerForm({ defaultValues, onSubmit }: CustomerFormProps) {
  const showApiError = useApiErrorToast()
  const form = useForm<CustomerFormValues, unknown, CustomerRequest>({
    resolver: zodResolver(customerFormSchema),
    defaultValues,
    mode: "onTouched",
  })
  const {
    register,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = form

  const submit = form.handleSubmit(async (request) => {
    try {
      await onSubmit(request)
    } catch (error) {
      // 400 validation errors belong to fields; everything else is a toast.
      if (!applyFieldErrors(toApiError(error), setError, CUSTOMER_FORM_FIELDS)) {
        showApiError(error)
      }
    }
  })

  return (
    <form onSubmit={submit} noValidate className="max-w-3xl">
      <UnsavedChangesGuard when={isDirty && !isSubmitting} />
      <Card>
        <CardHeader>
          <CardDescription>{text.form.optional}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="customer-name">{text.form.name}</FieldLabel>
              <Input
                id="customer-name"
                autoComplete="organization"
                placeholder={text.form.namePlaceholder}
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <div className="grid gap-7 sm:grid-cols-2 sm:gap-4">
              <Field data-invalid={Boolean(errors.email)}>
                <FieldLabel htmlFor="customer-email">{text.form.email}</FieldLabel>
                <Input
                  id="customer-email"
                  type="email"
                  autoComplete="email"
                  placeholder={text.form.emailPlaceholder}
                  aria-invalid={Boolean(errors.email)}
                  {...register("email")}
                />
                <FieldError errors={[errors.email]} />
              </Field>

              <Field data-invalid={Boolean(errors.phone)}>
                <FieldLabel htmlFor="customer-phone">{text.form.phone}</FieldLabel>
                <Input
                  id="customer-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder={text.form.phonePlaceholder}
                  aria-invalid={Boolean(errors.phone)}
                  {...register("phone")}
                />
                <FieldError errors={[errors.phone]} />
              </Field>
            </div>

            <Field data-invalid={Boolean(errors.street)}>
              <FieldLabel htmlFor="customer-street">{text.form.street}</FieldLabel>
              <Input
                id="customer-street"
                autoComplete="street-address"
                placeholder={text.form.streetPlaceholder}
                aria-invalid={Boolean(errors.street)}
                {...register("street")}
              />
              <FieldError errors={[errors.street]} />
            </Field>

            <div className="grid gap-7 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4">
              <Field data-invalid={Boolean(errors.zipCode)}>
                <FieldLabel htmlFor="customer-zip-code">{text.form.zipCode}</FieldLabel>
                <Input
                  id="customer-zip-code"
                  inputMode="numeric"
                  maxLength={5}
                  autoComplete="postal-code"
                  placeholder={text.form.zipCodePlaceholder}
                  aria-invalid={Boolean(errors.zipCode)}
                  {...register("zipCode")}
                />
                <FieldError errors={[errors.zipCode]} />
              </Field>

              <Field data-invalid={Boolean(errors.city)}>
                <FieldLabel htmlFor="customer-city">{text.form.city}</FieldLabel>
                <Input
                  id="customer-city"
                  autoComplete="address-level2"
                  placeholder={text.form.cityPlaceholder}
                  aria-invalid={Boolean(errors.city)}
                  {...register("city")}
                />
                <FieldError errors={[errors.city]} />
              </Field>
            </div>
          </FieldGroup>
        </CardContent>

        <CardFooter className="justify-end gap-2">
          <Button variant="outline" asChild>
            <Link to="/kunden">{t.common.actions.cancel}</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <LoaderCircle className="animate-spin" />}
            {t.common.actions.save}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
