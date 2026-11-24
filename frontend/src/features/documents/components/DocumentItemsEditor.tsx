import { Plus, Trash2 } from "lucide-react"
import { useMemo } from "react"
import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { ProductPicker } from "@/features/documents/components/ProductPicker"
import { EMPTY_DOCUMENT_ITEM, type DocumentItemsFormValues } from "@/features/documents/schema"
import { useProducts } from "@/features/products/queries"
import { t } from "@/i18n/de"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

const text = t.documents.items

/** Product | Menge | remove button. Below `sm` the columns stack. */
const ROW_GRID = "grid gap-2 sm:grid-cols-[minmax(0,1fr)_10rem_auto] sm:items-start sm:gap-3"

interface DocumentItemsEditorProps {
  /**
   * Warenausgang: shows each product's Bestand and warns when a quantity is higher.
   * Only a warning: saving a draft still works, the backend checks stock on Bestätigen (business rule 3).
   */
  showAvailableStock?: boolean
}

/**
 * Edits the `items` field of the surrounding form: one row per position (product, quantity ≥ 1),
 * add and remove rows. A product can be picked only once.
 * Must be inside a react-hook-form <FormProvider> whose values extend DocumentItemsFormValues
 * and whose schema uses documentItemsSchema for `items`.
 */
export function DocumentItemsEditor({ showAvailableStock = false }: DocumentItemsEditorProps) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<DocumentItemsFormValues>()
  const { fields, append, remove } = useFieldArray({ control, name: "items" })
  const items = useWatch({ control, name: "items" })
  const products = useProducts()

  const productsById = useMemo(
    () => new Map((products.data ?? []).map((product) => [product.id, product])),
    [products.data],
  )
  const chosenProductIds = items
    .map((item) => item.productId)
    .filter((productId): productId is number => productId !== null)
  const itemsError = errors.items?.root ?? errors.items

  return (
    <div className="flex flex-col gap-4">
      <div className={cn(ROW_GRID, "hidden text-sm font-medium sm:grid")} aria-hidden>
        <span>{text.product}</span>
        <span>{text.quantity}</span>
        <span className="w-9" />
      </div>

      {fields.map((field, index) => {
        const item = items[index]
        const product = item?.productId != null ? productsById.get(item.productId) : undefined
        const itemErrors = errors.items?.[index]
        const unitLabel = product ? t.products.units[product.unit] : ""
        const exceedsStock =
          showAvailableStock &&
          product !== undefined &&
          Number.isFinite(item.quantity) &&
          item.quantity > product.quantity
        const productInputId = `document-item-${field.id}-product`
        const quantityInputId = `document-item-${field.id}-quantity`

        return (
          <div key={field.id} className={ROW_GRID}>
            <Field data-invalid={Boolean(itemErrors?.productId)} className="gap-1.5">
              <FieldLabel htmlFor={productInputId} className="sm:sr-only">
                {text.product}
              </FieldLabel>
              <Controller
                control={control}
                name={`items.${index}.productId`}
                render={({ field: productField, fieldState }) => (
                  <ProductPicker
                    id={productInputId}
                    value={productField.value}
                    onChange={productField.onChange}
                    onBlur={productField.onBlur}
                    invalid={fieldState.invalid}
                    disabledProductIds={chosenProductIds}
                  />
                )}
              />
              <FieldError errors={[itemErrors?.productId]} />
              {showAvailableStock && product && (
                <p
                  className={cn(
                    "text-xs",
                    exceedsStock ? "text-amber-700 dark:text-amber-400" : "text-muted-foreground",
                  )}
                >
                  {exceedsStock
                    ? text.notEnough(formatNumber(product.quantity), unitLabel)
                    : text.available(formatNumber(product.quantity), unitLabel)}
                </p>
              )}
            </Field>

            <Field data-invalid={Boolean(itemErrors?.quantity)} className="gap-1.5">
              <FieldLabel htmlFor={quantityInputId} className="sm:sr-only">
                {text.quantity}
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id={quantityInputId}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  aria-invalid={Boolean(itemErrors?.quantity)}
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                />
                {unitLabel && (
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>{unitLabel}</InputGroupText>
                  </InputGroupAddon>
                )}
              </InputGroup>
              <FieldError errors={[itemErrors?.quantity]} />
            </Field>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="justify-self-end text-muted-foreground hover:text-destructive"
              aria-label={text.removeNamed(index + 1)}
              title={text.remove}
              disabled={fields.length === 1}
              onClick={() => remove(index)}
            >
              <Trash2 />
            </Button>
          </div>
        )
      })}

      <FieldError errors={[itemsError]} />

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => append(EMPTY_DOCUMENT_ITEM)}
      >
        <Plus />
        {text.add}
      </Button>
    </div>
  )
}
