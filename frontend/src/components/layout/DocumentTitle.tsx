import { t } from "@/i18n/de"

/**
 * Sets the browser tab title to "<title> · Lagerverwaltung". React moves the <title> into <head>.
 * PageHeader renders it, so only pages without a PageHeader need it directly.
 */
export function DocumentTitle({ title }: { title: string }) {
  return <title>{t.common.documentTitle(title)}</title>
}
