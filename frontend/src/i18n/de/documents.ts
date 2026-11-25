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
    productNamed: (position: number) => `Artikel (Zeile ${position})`,
    quantityNamed: (position: number) => `Menge (Zeile ${position})`,
    remove: "Artikelzeile entfernen",
    removeNamed: (position: number) => `Artikelzeile ${position} entfernen`,
    add: "Artikelzeile hinzufügen",
    available: (quantity: string, unit: string) => `Verfügbar: ${quantity} ${unit}`,
    notEnough: (quantity: string, unit: string) =>
      `Nur ${quantity} ${unit} verfügbar. Bestätigen ist erst mit genug Bestand möglich.`,
  },
  statusFilter: {
    label: "Nach Status filtern",
    all: "Alle",
  },
  itemsTable: {
    position: "Nr.",
    sku: "SKU",
    product: "Artikel",
    quantity: "Menge",
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
      "Der Bestand aller Artikel in diesem Beleg wird erhöht. Danach kann der Beleg nicht mehr bearbeitet werden.",
    confirmOut:
      "Der Bestand aller Artikel in diesem Beleg wird verringert. Danach kann der Beleg nicht mehr bearbeitet werden.",
    cancelTitle: (number: string) => `Beleg „${number}“ stornieren?`,
    cancelIn:
      "Der Bestand aller Artikel in diesem Beleg wird wieder verringert. Ein stornierter Beleg kann nicht mehr geändert werden.",
    cancelOut:
      "Der Bestand aller Artikel in diesem Beleg wird wieder erhöht. Ein stornierter Beleg kann nicht mehr geändert werden.",
    deleteTitle: (number: string) => `Entwurf „${number}“ löschen?`,
    deleteDescription:
      "Der Entwurf wird endgültig gelöscht. Das kann nicht rückgängig gemacht werden. Der Bestand ändert sich nicht.",
  },
  shortage: (sku: string, name: string, requested: string, available: string) =>
    `${sku} ${name}: benötigt ${requested}, verfügbar ${available}`,
  shortageAlert: {
    precheckTitle: (count: number) =>
      count === 1
        ? "Für 1 Artikel reicht der Bestand nicht"
        : `Für ${count} Artikel reicht der Bestand nicht`,
    precheckDescription:
      "Bestätigen ist erst möglich, wenn genug Bestand da ist, z. B. nach einem Wareneingang. Stand: aktueller Bestand.",
    failedConfirmOutDescription:
      "Der Warenausgang wurde nicht bestätigt. Der Bestand ist unverändert.",
    failedCancelInDescription:
      "Der Wareneingang wurde nicht storniert. Ein Teil der gelieferten Ware ist nicht mehr im Lager. Der Bestand ist unverändert.",
    dismiss: "Ausblenden",
  },
  validation: {
    productRequired: "Bitte einen Artikel wählen.",
    quantityRequired: "Bitte eine Menge angeben.",
    quantityInteger: "Die Menge muss eine ganze Zahl sein.",
    quantityMin: "Die Menge muss mindestens 1 sein.",
    quantityMax: "Die Menge darf höchstens 1.000.000 sein.",
    itemsMin: "Der Beleg braucht mindestens eine Artikelzeile.",
    duplicateProduct: "Dieser Artikel ist bereits im Beleg.",
  },
} as const
