import { common } from "./common"
import { customers } from "./customers"
import { dashboard } from "./dashboard"
import { documents } from "./documents"
import { inbound } from "./inbound"
import { outbound } from "./outbound"
import { products } from "./products"

/**
 * All user-facing German texts, one namespace per feature.
 *
 * @example
 * import { t } from "@/i18n/de"
 * <PageHeader title={t.products.list.title} />
 */
export const t = {
  common,
  dashboard,
  products,
  customers,
  documents,
  inbound,
  outbound,
} as const

export type Translations = typeof t
