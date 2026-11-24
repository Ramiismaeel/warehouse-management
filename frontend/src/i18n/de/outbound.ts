export const outbound = {
  list: {
    title: "Warenausgänge",
    description: "Auslieferungen aus dem Lager an Kunden",
    search: "Nummer oder Kunde suchen …",
    empty: "Noch keine Warenausgänge",
    emptyDescription: "Erfasse den ersten Warenausgang.",
    emptyFiltered: "Keine Warenausgänge mit diesem Status",
    loadError: "Warenausgänge konnten nicht geladen werden",
  },
  create: {
    title: "Neuer Warenausgang",
    description: "Einen Warenausgang als Entwurf anlegen",
  },
  detail: {
    title: "Warenausgang",
    titleNumbered: (number: string) => `Warenausgang ${number}`,
    description: "Details und Artikelzeilen des Warenausgangs",
    backToList: "Zur Übersicht",
    header: "Kopfdaten",
    customer: "Kunde",
    items: "Artikelzeilen",
    notFound: "Warenausgang nicht gefunden",
    notFoundDescription: "Diesen Warenausgang gibt es nicht (mehr).",
    loadError: "Warenausgang konnte nicht geladen werden",
    noNote: "Keine Notiz",
    noContact: "Keine Kontaktdaten",
    confirmed: (number: string) =>
      `Warenausgang ${number} wurde bestätigt. Der Bestand wurde verringert.`,
    cancelled: (number: string) =>
      `Warenausgang ${number} wurde storniert. Der Bestand wurde wieder erhöht.`,
    deleted: (number: string) => `Entwurf ${number} wurde gelöscht.`,
  },
  edit: {
    title: "Warenausgang bearbeiten",
    description: "Einen Entwurf ändern",
  },
  actions: {
    create: "Neuer Warenausgang",
  },
  fields: {
    number: "Nummer",
    customerName: "Kunde",
    orderDate: "Datum",
    status: "Status",
    itemCount: "Artikelzeilen",
    totalQuantity: "Menge",
    note: "Notiz",
  },
} as const
