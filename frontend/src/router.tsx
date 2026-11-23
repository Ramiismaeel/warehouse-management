import { createBrowserRouter } from "react-router"

import { AppLayout } from "@/components/layout/AppLayout"
import { NotFoundPage } from "@/components/layout/NotFoundPage"
import { CustomerCreatePage } from "@/features/customers/pages/CustomerCreatePage"
import { CustomerEditPage } from "@/features/customers/pages/CustomerEditPage"
import { CustomerListPage } from "@/features/customers/pages/CustomerListPage"
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage"
import { InboundCreatePage } from "@/features/inbound/pages/InboundCreatePage"
import { InboundDetailPage } from "@/features/inbound/pages/InboundDetailPage"
import { InboundEditPage } from "@/features/inbound/pages/InboundEditPage"
import { InboundListPage } from "@/features/inbound/pages/InboundListPage"
import { OutboundCreatePage } from "@/features/outbound/pages/OutboundCreatePage"
import { OutboundDetailPage } from "@/features/outbound/pages/OutboundDetailPage"
import { OutboundEditPage } from "@/features/outbound/pages/OutboundEditPage"
import { OutboundListPage } from "@/features/outbound/pages/OutboundListPage"
import { ProductCreatePage } from "@/features/products/pages/ProductCreatePage"
import { ProductEditPage } from "@/features/products/pages/ProductEditPage"
import { ProductListPage } from "@/features/products/pages/ProductListPage"

/** All routes of the app (see CLAUDE.md → Frontend architecture → Routes). */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },

      { path: "artikel", element: <ProductListPage /> },
      { path: "artikel/neu", element: <ProductCreatePage /> },
      { path: "artikel/:id/bearbeiten", element: <ProductEditPage /> },

      { path: "kunden", element: <CustomerListPage /> },
      { path: "kunden/neu", element: <CustomerCreatePage /> },
      { path: "kunden/:id/bearbeiten", element: <CustomerEditPage /> },

      { path: "wareneingang", element: <InboundListPage /> },
      { path: "wareneingang/neu", element: <InboundCreatePage /> },
      { path: "wareneingang/:id", element: <InboundDetailPage /> },
      { path: "wareneingang/:id/bearbeiten", element: <InboundEditPage /> },

      { path: "warenausgang", element: <OutboundListPage /> },
      { path: "warenausgang/neu", element: <OutboundCreatePage /> },
      { path: "warenausgang/:id", element: <OutboundDetailPage /> },
      { path: "warenausgang/:id/bearbeiten", element: <OutboundEditPage /> },

      { path: "*", element: <NotFoundPage /> },
    ],
  },
])
