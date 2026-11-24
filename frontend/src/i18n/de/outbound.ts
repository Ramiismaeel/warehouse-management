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
    titleNumbered: (number: string) => `Warenausgang ${number} bearbeiten`,
    description: "Einen Entwurf ändern",
    notDraft: "Nur Entwürfe können bearbeitet werden",
    notDraftDescription: (status: string) =>
      `Dieser Warenausgang ist „${status}“ und kann nicht mehr geändert werden.`,
    backToDetail: "Zum Warenausgang",
  },
  form: {
    header: "Kopfdaten",
    items: "Artikelzeilen",
    itemsDescription:
      "Welche Artikel in welcher Menge ausgeliefert werden. Der verfügbare Bestand steht unter jedem Artikel.",
    customer: "Kunde",
    orderDate: "Datum",
    note: "Notiz",
    notePlaceholder: "Optional, z. B. Lieferadresse oder Hinweise",
    draftHint:
      "Wird als Entwurf gespeichert, auch wenn der Bestand noch nicht reicht. Der Bestand ändert sich erst beim Bestätigen.",
  },
  validation: {
    customerRequired: "Bitte einen Kunden wählen.",
    orderDateRequired: "Bitte ein Datum wählen.",
    noteMax: "Die Notiz darf höchstens 255 Zeichen lang sein.",
  },
  saved: {
    created: (number: string) => `Warenausgang ${number} wurde als Entwurf angelegt.`,
    updated: (number: string) => `Warenausgang ${number} wurde gespeichert.`,
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
