/** Texts of the building blocks shared by Wareneingang and Warenausgang (features/documents). */
export const documents = {
  picker: {
    placeholder: "Artikel wählen …",
    search: "SKU oder Name suchen …",
    noResults: "Kein Artikel gefunden",
    loading: "Artikel werden geladen …",
    loadError: "Artikel konnten nicht geladen werden",
    stock: (quantity: string, unit: string) => `Bestand: ${quantity} ${unit}`,
    alreadyAdded: "Bereits im Beleg",
  },
  items: {
    product: "Artikel",
    quantity: "Menge",
    remove: "Position entfernen",
    removeNamed: (position: number) => `Position ${position} entfernen`,
    add: "Position hinzufügen",
    available: (quantity: string, unit: string) => `Verfügbar: ${quantity} ${unit}`,
    notEnough: (quantity: string, unit: string) =>
      `Nur ${quantity} ${unit} verfügbar. Bestätigen ist erst mit genug Bestand möglich.`,
  },
  actions: {
    edit: "Bearbeiten",
    confirm: "Bestätigen",
    delete: "Löschen",
    cancel: "Stornieren",
  },
  dialogs: {
    confirmTitle: (number: string) => `Beleg „${number}“ bestätigen?`,
    confirmIn:
      "Der Bestand aller Positionen wird erhöht. Danach kann der Beleg nicht mehr bearbeitet werden.",
    confirmOut:
      "Der Bestand aller Positionen wird verringert. Danach kann der Beleg nicht mehr bearbeitet werden.",
    cancelTitle: (number: string) => `Beleg „${number}“ stornieren?`,
    cancelIn:
      "Der Bestand aller Positionen wird wieder verringert. Ein stornierter Beleg kann nicht mehr geändert werden.",
    cancelOut:
      "Der Bestand aller Positionen wird wieder erhöht. Ein stornierter Beleg kann nicht mehr geändert werden.",
    deleteTitle: (number: string) => `Entwurf „${number}“ löschen?`,
    deleteDescription:
      "Der Entwurf wird endgültig gelöscht. Das kann nicht rückgängig gemacht werden. Der Bestand ändert sich nicht.",
  },
  shortage: (sku: string, name: string, requested: string, available: string) =>
    `${sku} ${name}: benötigt ${requested}, verfügbar ${available}`,
  validation: {
    productRequired: "Bitte einen Artikel wählen.",
    quantityRequired: "Bitte eine Menge angeben.",
    quantityInteger: "Die Menge muss eine ganze Zahl sein.",
    quantityMin: "Die Menge muss mindestens 1 sein.",
    itemsMin: "Der Beleg braucht mindestens eine Position.",
    duplicateProduct: "Dieser Artikel ist bereits im Beleg.",
  },
} as const
