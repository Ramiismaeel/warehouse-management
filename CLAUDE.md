# Warehouse Management – Gruppe 3

Web app for warehouse stock management. Users manage **Artikel** (products) and **Kunden** (customers),
record **Wareneingänge** (goods in, stock ↑) and **Warenausgänge** (goods out, stock ↓). Stock adjusts
automatically when a document is confirmed. A dashboard warns about low stock.

- Team: 3 developers · Feature freeze: **21.11.2026** · Deadline: **23.11.2026**
- Plan, decisions, diagrams: `docs/PLAN.md` · Tickets: `docs/TICKETS.md`

---

## Working rules for Claude

- **Ask before big decisions. Do not decide alone.** This includes: adding a dependency, changing entities/schema
  beyond the ticket, changing architecture or conventions in this file, renaming API endpoints, changing a
  business rule. Present options with a recommendation and wait for the answer.
- Stay inside the current ticket's scope. **One ticket = one branch = one PR.** Mention out-of-scope findings
  instead of fixing them.
- Use the glossary names below exactly. Never invent synonyms.
- Never push to `main`. Never force-push a branch someone else works on.
- Before saying a task is done, run the quality gates and report the result.

---

## Tech stack

**Backend:** Java 25 · Spring Boot 4.0.x · Maven (wrapper `./mvnw`) · Spring Web MVC · Spring Data JPA (Hibernate)
· Bean Validation · H2 (dev) · PostgreSQL driver (prod profile, later) · Lombok · MapStruct · springdoc-openapi
· JUnit 5, Mockito, MockMvc

**Frontend:** React + TypeScript (strict) + Vite · Tailwind CSS v4 · shadcn/ui (Radix) · lucide-react (icons)
· TanStack Query v5 · axios · React Router · react-hook-form + zod · @tanstack/react-table · sonner (toasts)
· @fontsource-variable/inter (font)

---

## Repository layout

```
/
├─ CLAUDE.md
├─ README.md
├─ .github/pull_request_template.md
├─ docs/                 PLAN.md, TICKETS.md, jira-import.csv
├─ backend/              Spring Boot app (Maven)
└─ frontend/             React app (Vite)
```

## Commands

Backend (`cd backend`):
- `./mvnw spring-boot:run` → http://localhost:8080 (profile `dev` is the default)
- `./mvnw verify` → compile + all tests
- Swagger UI: http://localhost:8080/swagger-ui.html
- H2 console (dev): http://localhost:8080/h2-console · JDBC URL `jdbc:h2:mem:warehouse` · user `sa` · no password

Frontend (`cd frontend`):
- `npm install` · `npm run dev` → http://localhost:5173 (Vite proxies `/api` → `http://localhost:8080`)
- `npm run lint` · `npm run build` · `npm run format`
- Add a shadcn component: `npx shadcn@latest add <name>`

**Quality gates (must be green before a PR):** backend `./mvnw verify` · frontend `npm run lint` and `npm run build`.

---

## Domain glossary (use exactly these names)

| UI (German)            | Code                  | Table                   | Meaning                                         |
|------------------------|-----------------------|-------------------------|-------------------------------------------------|
| Artikel                | `Product`             | `product`               | Master data of a stock item                     |
| Kunde                  | `Customer`            | `customer`              | Master data of a customer                       |
| Wareneingang           | `InboundDelivery`     | `inbound_delivery`      | Goods from a supplier INTO the warehouse (+)    |
| Wareneingangsposition  | `InboundDeliveryItem` | `inbound_delivery_item` | One product line of a Wareneingang              |
| Warenausgang           | `OutboundOrder`       | `outbound_order`        | Goods FROM the warehouse to a customer (−)      |
| Warenausgangsposition  | `OutboundOrderItem`   | `outbound_order_item`   | One product line of a Warenausgang              |
| Beleg                  | "document"            | –                       | Generic word for Wareneingang or Warenausgang   |
| Bestand                | `Product.quantity`    | `quantity`              | Current stock                                   |
| Mindestbestand         | `Product.minQuantity` | `min_quantity`          | Threshold for the low-stock warning             |
| Lieferant              | `supplierName`        | `supplier_name`         | Free text on Wareneingang (no entity in MVP)    |
| Entwurf / Bestätigt / Storniert | `DocumentStatus.DRAFT / CONFIRMED / CANCELLED` | `status` | Document status |

- Never use bare `Order`, `Delivery` or `Item` as class names. The direction must be in the name.
- Never name a table `order`, `user` or another SQL reserved word.

---

## Business rules (never break these)

| Action     | Allowed when | Wareneingang effect           | Warenausgang effect            |
|------------|--------------|-------------------------------|--------------------------------|
| Create     | –            | new `DRAFT`, no stock effect  | new `DRAFT`, no stock effect   |
| Edit       | `DRAFT`      | no stock effect               | no stock effect                |
| Delete     | `DRAFT`      | no stock effect               | no stock effect                |
| Confirm    | `DRAFT`      | stock **+** → `CONFIRMED`     | stock **−** → `CONFIRMED`      |
| Cancel     | `CONFIRMED`  | stock **−** → `CANCELLED`     | stock **+** → `CANCELLED`      |

1. **`Product.quantity` is changed ONLY by `StockService`.** No other class may modify it. Product create/update
   requests never contain `quantity`. New products start with quantity `0`.
2. Item quantities are always positive integers (≥ 1). The direction (`IN`/`OUT`) decides the sign.
3. Any stock decrease that would make a product negative is rejected for the **whole** operation (all-or-nothing).
   The 409 response lists every shortage. This applies to confirming a Warenausgang and cancelling a Wareneingang.
4. Status change and stock change happen in **one** `@Transactional` service method.
5. `CANCELLED` documents are read-only. Only `DRAFT` documents can be edited or deleted.
6. A document has at least 1 item. A product appears at most once per document; duplicates in a request are
   merged (quantities summed). A Warenausgang always has a customer.
7. An Artikel or Kunde used in any document (any status, including `DRAFT`) cannot be deleted
   → 409, e.g. `Artikel „Schraube M4“ wird in 3 Belegen verwendet`. DB foreign keys have no cascade delete.
8. Low stock: `quantity <= minQuantity`. Out of stock: `quantity == 0`.
9. Document numbers are generated by the backend: `WE-<year>-<id 4 digits>` / `WA-<year>-<id 4 digits>`,
   e.g. `WE-2026-0007`. Users see numbers, not database IDs.
10. `Product` has `@Version` (optimistic locking). A conflict → 409 "Der Bestand wurde gleichzeitig geändert.
    Bitte erneut versuchen."

---

## Backend architecture

Package-by-feature, layered inside each feature. Base package `de.gruppe3.warehouse`.

```
backend/src/main/java/de/gruppe3/warehouse/
├─ WarehouseApplication.java
├─ common/
│  ├─ entity/      BaseEntity (id, createdAt, updatedAt)
│  ├─ exception/   GlobalExceptionHandler, NotFoundException, DuplicateValueException, EntityInUseException,
│  │               InsufficientStockException, InvalidStatusTransitionException
│  └─ config/      CorsConfig, OpenApiConfig
├─ document/       DocumentStatus, DocumentNumberGenerator      (shared by inbound + outbound)
├─ stock/          StockService, StockDirection, StockChange    (the ONLY place that changes stock)
├─ product/        Product, ProductUnit, ProductRepository, ProductService, ProductController, ProductMapper, dto/
├─ customer/       Customer, CustomerRepository, CustomerService, CustomerController, CustomerMapper, dto/
├─ inbound/        InboundDelivery, InboundDeliveryItem, *Repository, InboundDeliveryService,
│                  InboundDeliveryController, InboundDeliveryMapper, dto/
├─ outbound/       OutboundOrder, OutboundOrderItem, *Repository, OutboundOrderService,
│                  OutboundOrderController, OutboundOrderMapper, dto/
└─ dashboard/      DashboardController, DashboardService, dto/
backend/src/main/resources/
├─ application.yml · application-dev.yml · application-prod.yml
└─ data/           products.sql, customers.sql, inbound.sql, outbound.sql   (one seed file per feature)
backend/src/test/java/de/gruppe3/warehouse/   mirrors main
```

**Layer rules**
- **Controller:** HTTP only. Accepts/returns DTOs, `@Valid` on request bodies. No business logic, no repositories.
- **Service:** all business logic, `@Transactional`. Writes to another feature's data only through that feature's
  service. Read-only use of another feature's repository (lookups, counts) is allowed to avoid circular services.
- **Repository:** Spring Data JPA interfaces. Derived queries or JPQL `@Query`. **No native SQL** (portability).
- **Entity:** JPA + Lombok `@Getter @Setter @NoArgsConstructor(access = PROTECTED)`. **Never `@Data` or
  `@EqualsAndHashCode` on entities.** Entities never leave the service layer.
- **DTO:** Java `record`s in `dto/`: `XxxRequest`, `XxxResponse`, `XxxSummaryResponse` (list rows),
  `XxxDetailResponse`. Validation annotations on request records.
- **Mapper:** MapStruct, `@Mapper(componentModel = "spring")`.
- **Errors:** throw the exceptions from `common.exception`. `GlobalExceptionHandler` turns them into `ProblemDetail`.
  Controllers never build error responses themselves. User-facing messages in German, logs in English.

**JPA conventions**
- `Long id` with `GenerationType.IDENTITY` · `@Enumerated(EnumType.STRING)` · `@ManyToOne(fetch = LAZY)`
- Document items: `@OneToMany(mappedBy = ..., cascade = ALL, orphanRemoval = true)`. Updating a draft replaces its items.
- `spring.jpa.open-in-view=false` → map entities to DTOs inside transactional service methods.
- Use `@EntityGraph` or `join fetch` for detail queries to avoid N+1.
- `LocalDate` for business dates (`deliveryDate`, `orderDate`), `Instant` for `createdAt`/`updatedAt`.
- Explicit `@Table(name = "...")` with the singular snake_case names from the glossary.

**Database & profiles**
- `dev` (default): H2 in-memory, PostgreSQL mode, `ddl-auto=create-drop`, seeds from `data/*.sql`
  (`spring.sql.init.data-locations`, `spring.jpa.defer-datasource-initialization=true`). Data resets on restart.
- `prod` (later): PostgreSQL via env vars `DB_URL`, `DB_USER`, `DB_PASSWORD`, `ddl-auto=validate`, Flyway added
  when we switch.
- **Portability rules for seed SQL:** standard SQL only, explicit column lists, **no explicit IDs** in INSERTs
  (identity sequences would collide), reference foreign keys via subselects (`(SELECT id FROM product WHERE sku = 'A-1001')`).
- Configuration via env vars with defaults (`${DB_URL:...}`). No secrets in the repo.

---

## API conventions

- Base path `/api/v1`, plural kebab-case resources, JSON in camelCase, dates as ISO `yyyy-MM-dd`.
- Status codes: `200` GET/PUT/actions · `201` POST (+ `Location`) · `204` DELETE · `400` validation · `404` not found
  · `409` business conflict (duplicate SKU, in use, wrong status, insufficient stock, optimistic lock).
- Errors are RFC 9457 `ProblemDetail`. `detail` is a German, user-readable message the frontend shows as-is.
  Extra properties: `errors` (field → message) for validation, `shortages`
  (`[{productId, sku, name, requested, available}]`) for stock conflicts.
- Lists return full arrays (no server paging in the MVP) with an optional `q` search parameter.
  The frontend sorts/filters/pages client-side.

| Method | Path                                         | Purpose                         |
|--------|----------------------------------------------|---------------------------------|
| GET    | `/api/v1/products?q=`                        | List (search SKU/name)          |
| GET    | `/api/v1/products/{id}`                      | Detail                          |
| POST   | `/api/v1/products`                           | Create                          |
| PUT    | `/api/v1/products/{id}`                      | Update (no quantity)            |
| DELETE | `/api/v1/products/{id}`                      | Delete (409 if in use)          |
| …      | `/api/v1/customers` (same 5 endpoints)       | Kunden                          |
| GET    | `/api/v1/inbound-deliveries?status=`         | List                            |
| GET    | `/api/v1/inbound-deliveries/{id}`            | Detail incl. items              |
| POST   | `/api/v1/inbound-deliveries`                 | Create draft                    |
| PUT    | `/api/v1/inbound-deliveries/{id}`            | Update draft                    |
| DELETE | `/api/v1/inbound-deliveries/{id}`            | Delete draft                    |
| POST   | `/api/v1/inbound-deliveries/{id}/confirm`    | DRAFT → CONFIRMED (stock +)     |
| POST   | `/api/v1/inbound-deliveries/{id}/cancel`     | CONFIRMED → CANCELLED (stock −) |
| …      | `/api/v1/outbound-orders` (same 7 endpoints) | Warenausgänge (signs reversed)  |
| GET    | `/api/v1/dashboard`                          | KPIs, low stock, recent docs    |

---

## Frontend architecture

```
frontend/src/
├─ main.tsx              providers: QueryClient, Router, Toaster; font import
├─ router.tsx            all routes
├─ index.css             Tailwind + shadcn theme
├─ api/                  client.ts (axios instance, baseURL /api/v1, ApiError), queryClient.ts
├─ components/
│  ├─ ui/                shadcn components (generated via CLI)
│  ├─ layout/            AppLayout, AppSidebar, PageHeader
│  └─ shared/            DataTable, ConfirmDialog, StatusBadge, StockBadge, EmptyState, ProductImage
├─ features/
│  ├─ products/          api.ts, queries.ts, types.ts, schema.ts, pages/, components/
│  ├─ customers/         (same shape)
│  ├─ documents/         shared by inbound + outbound: DocumentItemsEditor, ProductPicker, DocumentActions, types
│  ├─ inbound/           (same shape)
│  ├─ outbound/          (same shape)
│  └─ dashboard/
├─ i18n/de/              common.ts, products.ts, customers.ts, inbound.ts, outbound.ts, dashboard.ts, index.ts
└─ lib/                  utils.ts (cn), format.ts (de-DE dates/numbers), errors.ts
```

**Routes:** `/` Dashboard · `/artikel`, `/artikel/neu`, `/artikel/:id/bearbeiten` · `/kunden`, `/kunden/neu`,
`/kunden/:id/bearbeiten` · `/wareneingang`, `/wareneingang/neu`, `/wareneingang/:id`, `/wareneingang/:id/bearbeiten`
· `/warenausgang` (same as Wareneingang)

**Rules**
- Each feature owns `api.ts` (axios calls), `queries.ts` (TanStack hooks + query keys), `types.ts` (mirror the
  backend DTOs), `schema.ts` (zod). Components never call axios directly, only feature hooks.
- Query keys per feature, e.g. `productKeys.all / list(q) / detail(id)`. Mutations invalidate affected keys.
  **Confirming or cancelling a document also invalidates products and dashboard.**
- `components/ui` is generated by shadcn. Add components via the CLI and keep edits minimal. App-specific
  components go into `components/shared` or the feature folder.
- Reuse shared components (DataTable, ConfirmDialog, StatusBadge, StockBadge, PageHeader, EmptyState,
  DocumentItemsEditor, ProductPicker) before creating new ones.
- Forms: react-hook-form + `zodResolver`. Schemas mirror backend validation, with German messages.
- API errors: `lib/errors.ts` turns axios errors into `ApiError`. Show `detail` in a sonner toast; map `errors` to
  form fields.
- **All user-facing text is German and lives in `src/i18n/de/<feature>.ts`.** Code, identifiers and comments are English.
- Dates and numbers only via `lib/format.ts` (de-DE, e.g. `12.11.2026`).
- Styling: Tailwind utilities only, `cn()` for conditional classes, no extra CSS files. Icons only from lucide-react.
- Product images: `imageUrl` or fallback `https://picsum.photos/seed/<sku>/400/400`. On load error show the
  lucide `Package` icon (`ProductImage` component).
- TypeScript strict, no `any` (use `unknown` + narrowing).

---

## Git & PR workflow

- `main` is protected: PR required, ≥ 1 approval, no direct push.
- Branch from the latest `main`: `feature/WM-<jira-number>-<short-kebab-desc>`, e.g. `feature/WM-12-article-crud`.
- Commits: `WM-12: add product list page` (Jira key first, imperative, English).
- PR title: `WM-12 Article list page`. Fill in the PR template. One ticket per PR. Screenshots for UI changes.
- Before opening a PR: update from `main`, run the quality gates.
- Merge with **squash merge**, then delete the branch.
- Reviewers check: acceptance criteria met, layer rules, glossary names, business rules, no unrelated changes.

---

## Testing

- **Backend (required):** unit tests for `StockService` and every status transition (success + rejection),
  MockMvc tests for validation / 404 / 409 per controller, `@DataJpaTest` for custom queries.
- Test names: `confirm_whenStockInsufficient_rejectsAndChangesNothing`.
- **Frontend:** no automated tests in the MVP. Write manual test steps in the PR.

---

## Not now (keep the door open, do not build without a team decision)

Docker / docker-compose · Spring Security · PostgreSQL + Flyway · CI/CD deployment · i18n library ·
server-side paging · OpenAPI → TypeScript type generation · Supplier entity · stock movement history.
