export const dashboard = {
  title: "Dashboard",
  description: "Überblick über Bestand und Belege",
  loadError: "Dashboard konnte nicht geladen werden",
  kpis: {
    products: "Artikel",
    customers: "Kunden",
    lowStock: "Niedriger Bestand",
    lowStockHint: "Bestand ≤ Mindestbestand, nicht leer",
    outOfStock: "Leer",
    outOfStockHint: "Bestand 0",
    openDrafts: "Offene Entwürfe",
    openDraftsHint: (inbound: string, outbound: string) => `${inbound} WE · ${outbound} WA`,
  },
  lowStock: {
    title: "Niedriger Bestand",
    description: (shown: string, total: string) =>
      shown === total
        ? `${total} Artikel nachbestellen`
        : `${shown} von ${total} Artikeln, wenigsten Bestand zuerst`,
    empty: "Alles im grünen Bereich",
    emptyDescription: "Alle Artikel haben mehr Bestand als ihren Mindestbestand.",
    product: "Artikel",
    quantity: "Bestand",
    minQuantity: "Mindestbestand",
    status: "Status",
    showAll: "Alle Artikel",
  },
  recent: {
    inboundTitle: "Letzte Wareneingänge",
    outboundTitle: "Letzte Warenausgänge",
    inboundEmpty: "Noch keine Wareneingänge",
    outboundEmpty: "Noch keine Warenausgänge",
    showAll: "Alle anzeigen",
    itemCount: (count: number) => (count === 1 ? "1 Artikelzeile" : `${count} Artikelzeilen`),
  },
} as const
