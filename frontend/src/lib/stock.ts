export type StockLevel = "EMPTY" | "LOW" | "OK"

/** Upper limit of an Artikelzeile's Menge and of a Mindestbestand. Mirrors the backend's @Max(1_000_000). */
export const MAX_QUANTITY = 1_000_000

/**
 * Business rule 8: out of stock when quantity == 0, low stock when quantity <= minQuantity.
 * Empty wins over low, so a product with minQuantity 0 and quantity 0 is "EMPTY".
 */
export function getStockLevel(quantity: number, minQuantity: number): StockLevel {
  if (quantity === 0) {
    return "EMPTY"
  }
  return quantity <= minQuantity ? "LOW" : "OK"
}
