import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle, Package } from "lucide-react"
import { Controller, useForm, useWatch, type Control } from "react-hook-form"
import { Link } from "react-router"

import { ProductImage } from "@/components/shared/ProductImage"
import { StockBadge } from "@/components/shared/StockBadge"
import { UnsavedChangesGuard } from "@/components/shared/UnsavedChangesGuard"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  isHttpUrl,
  PRODUCT_FORM_FIELDS,
  productFormSchema,
  type ProductFormValues,
} from "@/features/products/schema"
import { PRODUCT_UNITS, type ProductRequest } from "@/features/products/types"
import { useApiErrorToast } from "@/hooks/use-api-error-toast"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { t } from "@/i18n/de"
import { applyFieldErrors, toApiError } from "@/lib/errors"
import { formatNumber } from "@/lib/format"
import { MAX_QUANTITY } from "@/lib/stock"
import { cn } from "@/lib/utils"

const text = t.products

/** Wait until the user stops typing before loading a new preview image. */
const PREVIEW_DELAY_MS = 400

interface ProductFormProps {
  defaultValues: ProductFormValues
  /** Edit only: the current Bestand, shown read-only next to the preview. */
  quantity?: number
  /** Saves the product. A rejected promise puts field errors on the fields, other errors in a toast. */
  onSubmit: (request: ProductRequest) => Promise<void>
}

/** Artikel form for the create and edit pages: fields on the left, live image preview on the right. */
export function ProductForm({ defaultValues, quantity, onSubmit }: ProductFormProps) {
  const showApiError = useApiErrorToast()
  const form = useForm<ProductFormValues, unknown, ProductRequest>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
    mode: "onTouched",
  })
  const {
    control,
    register,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = form

  const submit = form.handleSubmit(async (request) => {
    try {
      await onSubmit(request)
    } catch (error) {
      // 400 validation errors and 409 "SKU bereits vergeben" belong to fields; everything else is a toast.
      if (!applyFieldErrors(toApiError(error), setError, PRODUCT_FORM_FIELDS)) {
        showApiError(error)
      }
    }
  })

  return (
    <form
      onSubmit={submit}
      noValidate
      className="grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start"
    >
      <UnsavedChangesGuard when={isDirty && !isSubmitting} />
      <Card>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={Boolean(errors.sku)}>
              <FieldLabel htmlFor="product-sku">{text.form.sku}</FieldLabel>
              <Input
                id="product-sku"
                autoComplete="off"
                placeholder={text.form.skuPlaceholder}
                aria-invalid={Boolean(errors.sku)}
                {...register("sku")}
              />
              <FieldDescription>{text.form.skuDescription}</FieldDescription>
              <FieldError errors={[errors.sku]} />
            </Field>

            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="product-name">{text.form.name}</FieldLabel>
              <Input
                id="product-name"
                autoComplete="off"
                placeholder={text.form.namePlaceholder}
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={Boolean(errors.description)}>
              <FieldLabel htmlFor="product-description">{text.form.description}</FieldLabel>
              <Textarea
                id="product-description"
                rows={3}
                placeholder={text.form.descriptionPlaceholder}
                aria-invalid={Boolean(errors.description)}
                {...register("description")}
              />
              <FieldError errors={[errors.description]} />
            </Field>

            <Controller
              name="unit"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="product-unit">{text.form.unit}</FieldLabel>
                  <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="product-unit"
                      ref={field.ref}
                      onBlur={field.onBlur}
                      aria-invalid={fieldState.invalid}
                      className="w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_UNITS.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {text.units[unit]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Field data-invalid={Boolean(errors.minQuantity)}>
              <FieldLabel htmlFor="product-min-quantity">{text.form.minQuantity}</FieldLabel>
              <Input
                id="product-min-quantity"
                type="number"
                inputMode="numeric"
                min={0}
                max={MAX_QUANTITY}
                step={1}
                aria-invalid={Boolean(errors.minQuantity)}
                {...register("minQuantity", { valueAsNumber: true })}
              />
              <FieldDescription>{text.form.minQuantityDescription}</FieldDescription>
              <FieldError errors={[errors.minQuantity]} />
            </Field>

            <Field data-invalid={Boolean(errors.imageUrl)}>
              <FieldLabel htmlFor="product-image-url">{text.form.imageUrl}</FieldLabel>
              <Input
                id="product-image-url"
                type="url"
                autoComplete="off"
                placeholder={text.form.imageUrlPlaceholder}
                aria-invalid={Boolean(errors.imageUrl)}
                {...register("imageUrl")}
              />
              <FieldDescription>{text.form.imageUrlDescription}</FieldDescription>
              <FieldError errors={[errors.imageUrl]} />
            </Field>
          </FieldGroup>
        </CardContent>

        <CardFooter className="justify-end gap-2">
          <Button variant="outline" asChild>
            <Link to="/artikel">{t.common.actions.cancel}</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <LoaderCircle className="animate-spin" />}
            {t.common.actions.save}
          </Button>
        </CardFooter>
      </Card>

      <ProductPreview
        control={form.control}
        quantity={quantity}
        savedMinQuantity={defaultValues.minQuantity}
      />
    </form>
  )
}

interface ProductPreviewProps {
  control: Control<ProductFormValues, unknown, ProductRequest>
  quantity?: number
  /** Used for the stock badge while the Mindestbestand field is empty. */
  savedMinQuantity: number
}

/** Image as it will appear in the list, plus the read-only Bestand on the edit page. */
function ProductPreview({ control, quantity, savedMinQuantity }: ProductPreviewProps) {
  const [sku, name, unit, minQuantity, imageUrl] = useWatch({
    control,
    name: ["sku", "name", "unit", "minQuantity", "imageUrl"],
  })
  // The backend stores the SKU in upper case, and the list's placeholder image is seeded by it.
  const previewSku = useDebouncedValue(sku.trim().toUpperCase(), PREVIEW_DELAY_MS)
  const previewUrl = useDebouncedValue(imageUrl.trim(), PREVIEW_DELAY_MS)
  const validUrl = isHttpUrl(previewUrl) ? previewUrl : null
  const imageClasses = "aspect-square size-auto w-full rounded-2xl"

  return (
    <Card>
      <CardHeader>
        <CardTitle>{text.form.preview}</CardTitle>
        <CardDescription>{text.form.previewDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {previewSku || validUrl ? (
          <ProductImage
            sku={previewSku}
            imageUrl={validUrl}
            alt={name.trim() || text.form.previewAlt}
            className={imageClasses}
          />
        ) : (
          // Nothing to show yet: same icon ProductImage uses when no image loads.
          <div
            role="img"
            aria-label={text.form.previewAlt}
            className={cn(
              "flex items-center justify-center bg-muted text-muted-foreground",
              imageClasses,
            )}
          >
            <Package className="size-1/3" />
          </div>
        )}

        {quantity !== undefined && (
          <div className="space-y-1.5 border-t pt-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">{text.form.quantity}</span>
              <div className="flex items-center gap-2">
                <span className="font-medium tabular-nums">
                  {formatNumber(quantity)} {text.units[unit]}
                </span>
                <StockBadge
                  quantity={quantity}
                  minQuantity={Number.isFinite(minQuantity) ? minQuantity : savedMinQuantity}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{text.form.quantityHint}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
