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
