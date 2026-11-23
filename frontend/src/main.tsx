import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "react-router/dom"
import "@fontsource-variable/inter"
import "./index.css"

import { queryClient } from "@/api/queryClient"
import { Toaster } from "@/components/ui/sonner"
import { router } from "@/router"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="top-right" closeButton />
    </QueryClientProvider>
  </StrictMode>,
)
