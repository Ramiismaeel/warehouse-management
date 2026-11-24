/**
 * DEV ONLY (route /dev/komponenten, not in production builds): shows every shared component with mock data.
 * Not user-facing, so its texts are inline instead of in i18n/de.
 */
import { zodResolver } from "@hookform/resolvers/zod"
import { PackageOpen, Plus } from "lucide-react"
import { useState, type ReactNode } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { PageHeader } from "@/components/layout/PageHeader"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { DataTable } from "@/components/shared/DataTable"
import { createDataTableColumnHelper } from "@/components/shared/dataTableFeatures"
import { EmptyState } from "@/components/shared/EmptyState"
import { ProductImage } from "@/components/shared/ProductImage"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { StockBadge } from "@/components/shared/StockBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DocumentActions } from "@/features/documents/components/DocumentActions"
import { DocumentItemsEditor } from "@/features/documents/components/DocumentItemsEditor"
import {
  documentItemsSchema,
  EMPTY_DOCUMENT_ITEM,
  type DocumentItemsFormValues,
} from "@/features/documents/schema"
import type {
  DocumentItemRequest,
  DocumentStatus,
  StockDirection,
} from "@/features/documents/types"
import { useApiErrorToast } from "@/hooks/use-api-error-toast"
import { ApiError } from "@/lib/errors"
import { formatNumber } from "@/lib/format"

interface DemoProduct {
  sku: string
  name: string
  quantity: number
  minQuantity: number
}

const NAMES = [
  "Schraube M4",
  "Mutter M4",
  "Dübel 6 mm",
  "Kabelbinder 200 mm",
  "Klebeband",
  "Versandkarton S",
  "Ölfilter",
  "Zahnriemen",
]

const DEMO_PRODUCTS: DemoProduct[] = Array.from({ length: 27 }, (_, index) => ({
  sku: `ART-${String(index + 1).padStart(4, "0")}`,
  name: `${NAMES[index % NAMES.length]} (${index + 1})`,
  quantity: [0, 3, 8, 15, 40, 120, 1500][index % 7],
  minQuantity: [0, 5, 10, 20][index % 4],
}))

const column = createDataTableColumnHelper<DemoProduct>()

const COLUMNS = column.columns([
  column.display({
    id: "image",
    header: "",
    cell: ({ row }) => <ProductImage sku={row.original.sku} alt={row.original.name} />,
  }),
  column.accessor("sku", { header: "SKU" }),
  column.accessor("name", { header: "Name" }),
  column.accessor("quantity", {
    header: "Bestand",
    cell: ({ getValue }) => formatNumber(getValue()),
    meta: { className: "text-right" },
  }),
  column.accessor("minQuantity", {
    header: "Mindestbestand",
    cell: ({ getValue }) => formatNumber(getValue()),
    meta: { className: "text-right" },
  }),
  column.display({
    id: "stock",
    header: "Status",
    cell: ({ row }) => (
      <StockBadge quantity={row.original.quantity} minQuantity={row.original.minQuantity} />
    ),
  }),
])

export function ComponentsDemoPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isEmpty, setIsEmpty] = useState(false)
  const [dialog, setDialog] = useState<"default" | "destructive" | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)
  const showApiError = useApiErrorToast()

  const confirm = () => {
    setIsConfirming(true)
    window.setTimeout(() => {
      setIsConfirming(false)
      setDialog(null)
      toast.success("Aktion ausgeführt")
    }, 1500)
  }

  return (
    <>
      <PageHeader
        title="Komponenten (Dev)"
        description="Alle Shared Components mit Beispieldaten. Nur im Dev-Server erreichbar."
      />

      <Section title="DataTable (Suche: SKU + Name)">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsLoading((value) => !value)}>
            Ladezustand {isLoading ? "aus" : "an"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsEmpty((value) => !value)}>
            Leere Liste {isEmpty ? "aus" : "an"}
          </Button>
        </div>
        <DataTable
          columns={COLUMNS}
          data={isEmpty ? [] : DEMO_PRODUCTS}
          isLoading={isLoading}
          searchColumns={["sku", "name"]}
          searchPlaceholder="SKU oder Name suchen …"
          emptyState={
            <EmptyState
              icon={PackageOpen}
              title="Noch keine Artikel"
              description="Lege den ersten Artikel an."
              action={
                <Button size="sm">
                  <Plus /> Neuer Artikel
                </Button>
              }
            />
          }
        />
      </Section>

      <Section title="StatusBadge">
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="DRAFT" />
          <StatusBadge status="CONFIRMED" />
          <StatusBadge status="CANCELLED" />
        </div>
      </Section>

      <Section title="StockBadge">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <Labeled label="0 / min 5">
            <StockBadge quantity={0} minQuantity={5} />
          </Labeled>
          <Labeled label="5 / min 5">
            <StockBadge quantity={5} minQuantity={5} />
          </Labeled>
          <Labeled label="6 / min 5">
            <StockBadge quantity={6} minQuantity={5} />
          </Labeled>
          <Labeled label="0 / min 0">
            <StockBadge quantity={0} minQuantity={0} />
          </Labeled>
        </div>
      </Section>

      <Section title="ProductImage">
        <div className="flex flex-wrap items-end gap-6 text-sm">
          <Labeled label="imageUrl gesetzt">
            <ProductImage
              sku="A"
              imageUrl="https://picsum.photos/id/1/400/400"
              alt="Mit imageUrl"
              className="size-24"
            />
          </Labeled>
          <Labeled label="ohne imageUrl → picsum">
            <ProductImage sku="ART-0001" alt="Picsum-Fallback" className="size-24" />
          </Labeled>
          <Labeled label="kaputte imageUrl → picsum">
            <ProductImage
              sku="ART-0002"
              imageUrl="https://invalid.example/x.png"
              alt="Kaputte URL"
              className="size-24"
            />
          </Labeled>
        </div>
        <p className="text-xs text-muted-foreground">
          Das Package-Icon erscheint, wenn auch picsum nicht lädt (z. B. offline in den DevTools
          testen).
        </p>
      </Section>

      <Section title="EmptyState">
        <EmptyState
          title="Keine Belege"
          description="Es wurden noch keine Wareneingänge erfasst."
        />
      </Section>

      <Section title="ConfirmDialog">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setDialog("default")}>
            Standard
          </Button>
          <Button variant="destructive" onClick={() => setDialog("destructive")}>
            Destruktiv
          </Button>
        </div>
        <ConfirmDialog
          open={dialog !== null}
          onOpenChange={(open) => !open && setDialog(null)}
          variant={dialog ?? "default"}
          title={
            dialog === "destructive" ? "Artikel „Schraube M4“ löschen?" : "Wareneingang bestätigen?"
          }
          description={
            dialog === "destructive"
              ? "Das kann nicht rückgängig gemacht werden."
              : "Der Bestand aller Positionen wird erhöht."
          }
          confirmLabel={dialog === "destructive" ? "Löschen" : "Bestätigen"}
          isLoading={isConfirming}
          onConfirm={confirm}
        />
      </Section>

      <Section title="useApiErrorToast">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() =>
              showApiError(
                new ApiError({
                  status: 409,
                  title: "Conflict",
                  detail: "Nicht genügend Bestand für „Schraube M4“: benötigt 20, verfügbar 5.",
                }),
              )
            }
          >
            409 Bestand
          </Button>
          <Button variant="outline" onClick={() => showApiError(new Error("not an API error"))}>
            Unbekannter Fehler
          </Button>
        </div>
      </Section>

      <Section title="DocumentItemsEditor + ProductPicker (echte Artikel aus der API)">
        <DocumentItemsDemo />
      </Section>

      <Section title="DocumentActions">
        <DocumentActionsDemo />
      </Section>
    </>
  )
}

const demoDocumentSchema = z.object({ items: documentItemsSchema })

/** A minimal document form: just the positions. "Prüfen" validates and shows the request body. */
function DocumentItemsDemo() {
  const [showAvailableStock, setShowAvailableStock] = useState(true)
  const form = useForm<DocumentItemsFormValues, unknown, { items: DocumentItemRequest[] }>({
    resolver: zodResolver(demoDocumentSchema),
    defaultValues: { items: [EMPTY_DOCUMENT_ITEM] },
  })

  return (
    <FormProvider {...form}>
      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(({ items }) =>
          toast.success("Positionen gültig", { description: JSON.stringify(items) }),
        )}
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => setShowAvailableStock((value) => !value)}
        >
          showAvailableStock: {String(showAvailableStock)}
        </Button>
        <DocumentItemsEditor showAvailableStock={showAvailableStock} />
        <div className="flex gap-2">
          <Button type="submit">Prüfen</Button>
          <Button type="button" variant="ghost" onClick={() => form.reset()}>
            Zurücksetzen
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

/** Fake callbacks: each takes 1 s. With "409 simulieren", Bestätigen fails with two shortages. */
function DocumentActionsDemo() {
  const [status, setStatus] = useState<DocumentStatus>("DRAFT")
  const [direction, setDirection] = useState<StockDirection>("IN")
  const [failConfirm, setFailConfirm] = useState(false)

  const wait = () => new Promise((resolve) => window.setTimeout(resolve, 1000))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["DRAFT", "CONFIRMED", "CANCELLED"] as const).map((option) => (
          <Button
            key={option}
            size="sm"
            variant={status === option ? "default" : "outline"}
            onClick={() => setStatus(option)}
          >
            {option}
          </Button>
        ))}
        <Button
          size="sm"
          variant="outline"
          onClick={() => setDirection((value) => (value === "IN" ? "OUT" : "IN"))}
        >
          direction: {direction}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setFailConfirm((value) => !value)}>
          409 simulieren: {String(failConfirm)}
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge status={status} />
        <DocumentActions
          status={status}
          documentNumber={direction === "IN" ? "WE-2026-0007" : "WA-2026-0003"}
          direction={direction}
          editTo="/dev/komponenten"
          onConfirm={async () => {
            await wait()
            if (failConfirm) {
              throw new ApiError({
                status: 409,
                title: "Nicht genügend Bestand",
                detail: "Nicht genügend Bestand für 2 Artikel.",
                shortages: [
                  { productId: 1, sku: "A-1001", name: "Schraube M4", requested: 20, available: 5 },
                  { productId: 2, sku: "A-1002", name: "Mutter M4", requested: 8, available: 0 },
                ],
              })
            }
            setStatus("CONFIRMED")
            toast.success("Beleg bestätigt")
          }}
          onCancel={async () => {
            await wait()
            setStatus("CANCELLED")
            toast.success("Beleg storniert")
          }}
          onDelete={async () => {
            await wait()
            toast.success("Entwurf gelöscht (Demo: Status bleibt)")
          }}
        />
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  )
}

function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      {children}
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
