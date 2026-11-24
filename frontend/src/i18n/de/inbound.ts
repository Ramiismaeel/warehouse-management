export const inbound = {
  list: {
    title: "Wareneingänge",
    description: "Lieferungen von Lieferanten in das Lager",
    search: "Nummer oder Lieferant suchen …",
    empty: "Noch keine Wareneingänge",
    emptyDescription: "Erfasse den ersten Wareneingang.",
    emptyFiltered: "Keine Wareneingänge mit diesem Status",
    loadError: "Wareneingänge konnten nicht geladen werden",
  },
  create: {
    title: "Neuer Wareneingang",
    description: "Einen Wareneingang als Entwurf anlegen",
  },
  detail: {
    title: "Wareneingang",
    titleNumbered: (number: string) => `Wareneingang ${number}`,
    description: "Details und Artikelzeilen des Wareneingangs",
    backToList: "Zur Übersicht",
    header: "Kopfdaten",
    items: "Artikelzeilen",
    notFound: "Wareneingang nicht gefunden",
    notFoundDescription: "Diesen Wareneingang gibt es nicht (mehr).",
    loadError: "Wareneingang konnte nicht geladen werden",
    noNote: "Keine Notiz",
    confirmed: (number: string) =>
      `Wareneingang ${number} wurde bestätigt. Der Bestand wurde erhöht.`,
    cancelled: (number: string) =>
      `Wareneingang ${number} wurde storniert. Der Bestand wurde verringert.`,
    deleted: (number: string) => `Entwurf ${number} wurde gelöscht.`,
  },
  edit: {
    title: "Wareneingang bearbeiten",
    description: "Einen Entwurf ändern",
  },
  actions: {
    create: "Neuer Wareneingang",
  },
  fields: {
    number: "Nummer",
    supplierName: "Lieferant",
    deliveryDate: "Lieferdatum",
    status: "Status",
    itemCount: "Artikelzeilen",
    totalQuantity: "Menge",
    note: "Notiz",
  },
} as const
