import { createBrowserRouter } from "react-router"

import { AppLayout } from "@/components/layout/AppLayout"
import { NotFoundPage } from "@/components/layout/NotFoundPage"
import { PageLoading } from "@/components/layout/PageLoading"
import { RouteErrorPage } from "@/components/layout/RouteErrorPage"

/**
 * All routes of the app (see CLAUDE.md → Frontend architecture → Routes).
 * The layout is loaded right away; every page is its own chunk, loaded on first visit (route `lazy`).
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    // Only when the layout itself fails. Page errors are caught below, inside the layout.
    errorElement: <RouteErrorPage fullScreen />,
    children: [
      {
        // Pathless: catches errors of every page and shows them inside the layout (sidebar stays usable).
        errorElement: <RouteErrorPage />,
        // Shown inside the layout while the first page's code loads.
        hydrateFallbackElement: <PageLoading />,
        children: [
          {
            index: true,
            lazy: async () => ({
              Component: (await import("@/features/dashboard/pages/DashboardPage")).DashboardPage,
            }),
          },

          {
            path: "artikel",
            lazy: async () => ({
              Component: (await import("@/features/products/pages/ProductListPage"))
                .ProductListPage,
            }),
          },
          {
            path: "artikel/neu",
            lazy: async () => ({
              Component: (await import("@/features/products/pages/ProductCreatePage"))
                .ProductCreatePage,
            }),
          },
          {
            path: "artikel/:id/bearbeiten",
            lazy: async () => ({
              Component: (await import("@/features/products/pages/ProductEditPage"))
                .ProductEditPage,
            }),
          },

          {
            path: "kunden",
            lazy: async () => ({
              Component: (await import("@/features/customers/pages/CustomerListPage"))
                .CustomerListPage,
            }),
          },
          {
            path: "kunden/neu",
            lazy: async () => ({
              Component: (await import("@/features/customers/pages/CustomerCreatePage"))
                .CustomerCreatePage,
            }),
          },
          {
            path: "kunden/:id/bearbeiten",
            lazy: async () => ({
              Component: (await import("@/features/customers/pages/CustomerEditPage"))
                .CustomerEditPage,
            }),
          },

          {
            path: "wareneingang",
            lazy: async () => ({
              Component: (await import("@/features/inbound/pages/InboundListPage")).InboundListPage,
            }),
          },
          {
            path: "wareneingang/neu",
            lazy: async () => ({
              Component: (await import("@/features/inbound/pages/InboundCreatePage"))
                .InboundCreatePage,
            }),
          },
          {
            path: "wareneingang/:id",
            lazy: async () => ({
              Component: (await import("@/features/inbound/pages/InboundDetailPage"))
                .InboundDetailPage,
            }),
          },
          {
            path: "wareneingang/:id/bearbeiten",
            lazy: async () => ({
              Component: (await import("@/features/inbound/pages/InboundEditPage")).InboundEditPage,
            }),
          },

          {
            path: "warenausgang",
            lazy: async () => ({
              Component: (await import("@/features/outbound/pages/OutboundListPage"))
                .OutboundListPage,
            }),
          },
          {
            path: "warenausgang/neu",
            lazy: async () => ({
              Component: (await import("@/features/outbound/pages/OutboundCreatePage"))
                .OutboundCreatePage,
            }),
          },
          {
            path: "warenausgang/:id",
            lazy: async () => ({
              Component: (await import("@/features/outbound/pages/OutboundDetailPage"))
                .OutboundDetailPage,
            }),
          },
          {
            path: "warenausgang/:id/bearbeiten",
            lazy: async () => ({
              Component: (await import("@/features/outbound/pages/OutboundEditPage"))
                .OutboundEditPage,
            }),
          },

          // Dev only: showcase of the shared components. Vite drops this branch from production builds.
          ...(import.meta.env.DEV
            ? [
                {
                  path: "dev/komponenten",
                  lazy: async () => ({
                    Component: (await import("@/dev/ComponentsDemoPage")).ComponentsDemoPage,
                  }),
                },
              ]
            : []),

          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
])
