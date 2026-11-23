export const products = {
  list: {
    title: "Artikel",
    description: "Stammdaten und Bestand aller Lagerartikel",
    search: "SKU oder Name suchen …",
    empty: "Noch keine Artikel",
    emptyDescription: "Lege den ersten Artikel an.",
    loadError: "Artikel konnten nicht geladen werden",
  },
  create: {
    title: "Neuer Artikel",
    description: "Einen neuen Artikel anlegen",
  },
  edit: {
    title: "Artikel bearbeiten",
    description: "Stammdaten eines Artikels ändern",
  },
  columns: {
    image: "Bild",
    sku: "SKU",
    name: "Name",
    unit: "Einheit",
    quantity: "Bestand",
    minQuantity: "Mindestbestand",
    stock: "Status",
    actions: "Aktionen",
  },
  units: {
    PIECE: "Stück",
    KILOGRAM: "Kilogramm",
    LITER: "Liter",
    METER: "Meter",
    BOX: "Karton",
  },
  actions: {
    create: "Neuer Artikel",
    edit: "Bearbeiten",
    delete: "Löschen",
    editNamed: (name: string) => `Artikel „${name}“ bearbeiten`,
    deleteNamed: (name: string) => `Artikel „${name}“ löschen`,
  },
  delete: {
    title: (name: string) => `Artikel „${name}“ löschen?`,
    description: "Der Artikel wird endgültig gelöscht. Das kann nicht rückgängig gemacht werden.",
    success: (name: string) => `Artikel „${name}“ wurde gelöscht.`,
  },
} as const
