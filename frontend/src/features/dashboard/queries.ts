/**
 * Query keys of the dashboard. Defined before the dashboard itself (T24), so confirming or cancelling
 * a Beleg can already invalidate it. T24 adds its hooks to this file.
 */
export const dashboardKeys = {
  all: ["dashboard"] as const,
}
