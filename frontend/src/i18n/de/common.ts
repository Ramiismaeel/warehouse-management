/** Texts shared by every feature: app shell, navigation, generic actions and errors. */
export const common = {
  appName: "Lagerverwaltung",
  appSubtitle: "Gruppe 3",
  nav: {
    label: "Navigation",
    dashboard: "Dashboard",
    products: "Artikel",
    customers: "Kunden",
    inbound: "Wareneingang",
    outbound: "Warenausgang",
  },
  actions: {
    toggleSidebar: "Seitenleiste ein-/ausblenden",
    backToDashboard: "Zum Dashboard",
    confirm: "Bestätigen",
    cancel: "Abbrechen",
    save: "Speichern",
    retry: "Erneut versuchen",
  },
  table: {
    search: "Suchen …",
    empty: "Keine Einträge vorhanden",
    noResults: (query: string) => `Keine Treffer für „${query}“`,
    entries: (count: number, formatted: string) =>
      `${formatted} ${count === 1 ? "Eintrag" : "Einträge"}`,
    rowsPerPage: "Zeilen pro Seite",
    pageOf: (page: string, pageCount: string) => `Seite ${page} von ${pageCount}`,
    previousPage: "Vorherige Seite",
    nextPage: "Nächste Seite",
    sortBy: (column: string) => `Nach „${column}“ sortieren`,
  },
  datePicker: {
    placeholder: "Datum wählen",
  },
  documentStatus: {
    DRAFT: "Entwurf",
    CONFIRMED: "Bestätigt",
    CANCELLED: "Storniert",
  },
  stockLevel: {
    EMPTY: "Leer",
    LOW: "Niedrig",
    OK: "OK",
  },
  placeholder: {
    text: "Diese Seite wird noch umgesetzt.",
    id: "ID",
  },
  notFound: {
    title: "Seite nicht gefunden",
    description: "Die aufgerufene Adresse existiert nicht.",
  },
  errors: {
    title: "Fehler",
    generic: "Es ist ein Fehler aufgetreten. Bitte erneut versuchen.",
    networkTitle: "Keine Verbindung",
    network: "Der Server ist nicht erreichbar. Bitte später erneut versuchen.",
  },
} as const
