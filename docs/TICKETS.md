# Tickets – Warehouse Management (Gruppe 3)

Every ticket = one branch = one PR. Jira assigns the real keys (WM-…) on import; the `T`-number in each
summary maps a Jira ticket back to this file. Use the **Jira key** in branch names and commits.

Lanes: **Person 1** Artikel → Wareneingang · **Person 2** Kunden → Warenausgang · **Person 3** shared parts → Dashboard.
Target dates are the day the PR should be merged. Weekend 14.–15.11. is buffer.

## Overview

| ID | Epic | Title | Lane | Target | Depends on |
|----|------|-------|------|--------|------------|
| T01 | Projekt-Setup | Repo & workflow setup | Person 3 | Do 12.11. | – |
| T02 | Projekt-Setup | Backend scaffold (Spring Boot 4, Java 25) | Person 1 | Do 12.11. | T01 |
| T03 | Projekt-Setup | Backend common foundation | Person 1 | Fr 13.11. | T02 |
| T04 | Projekt-Setup | Frontend scaffold (Vite, Tailwind, shadcn) | Person 2 | Do 12.11. | T01 |
| T05 | Projekt-Setup | Frontend app shell (layout, routing, API client) | Person 2 | Fr 13.11. | T04 |
| T06 | Projekt-Setup | Shared UI components | Person 3 | Mo 16.11. | T05 |
| T07 | Projekt-Setup | CI pipeline (optional) | Person 3 | Mo 16.11. | T02, T04 |
| T08 | Artikel | BE: Artikel CRUD API | Person 1 | Mo 16.11. | T03 |
| T09 | Artikel | FE: Artikel list | Person 1 | Di 17.11. | T06, T08 |
| T10 | Artikel | FE: Artikel form (create/edit) | Person 1 | Di 17.11. | T09 |
| T11 | Kunden | BE: Kunden CRUD API | Person 2 | Mo 16.11. | T03 |
| T12 | Kunden | FE: Kunden list + form | Person 2 | Di 17.11. | T06, T11 |
| T13 | Bestand & Belege-Basis | BE: StockService & document foundation | Person 3 | Di 17.11. | T08 |
| T14 | Bestand & Belege-Basis | FE: shared document components | Person 3 | Mi 18.11. | T06, T09 |
| T15 | Wareneingang | BE: Wareneingang drafts API | Person 1 | Mi 18.11. | T08, T13 |
| T16 | Wareneingang | BE: Wareneingang confirm/cancel | Person 1 | Do 19.11. | T15 |
| T17 | Wareneingang | FE: Wareneingang list + detail | Person 1 | Fr 20.11. | T14, T16 |
| T18 | Wareneingang | FE: Wareneingang form | Person 1 | Fr 20.11. | T14, T15 |
| T19 | Warenausgang | BE: Warenausgang drafts API | Person 2 | Mi 18.11. | T08, T11, T13 |
| T20 | Warenausgang | BE: Warenausgang confirm/cancel | Person 2 | Do 19.11. | T19 |
| T21 | Warenausgang | FE: Warenausgang list + detail | Person 2 | Fr 20.11. | T14, T20 |
| T22 | Warenausgang | FE: Warenausgang form | Person 2 | Fr 20.11. | T14, T19 |
| T23 | Dashboard | BE: Dashboard API | Person 3 | Do 19.11. | T15, T19 |
| T24 | Dashboard | FE: Dashboard | Person 3 | Fr 20.11. | T06, T23 |
| T25 | Abschluss & Qualität | Delete protection Artikel/Kunde (BE + FE) | Person 3 | Do 19.11. | T09, T12, T15, T19 |
| T26 | Abschluss & Qualität | Demo data for the presentation | Person 3 | Fr 20.11. | T16, T20 |
| T27 | Abschluss & Qualität | README & feature-freeze check | Person 3 | Sa 21.11. | T17, T18, T21, T22, T24, T25, T26 |

## E1 · Projekt-Setup

Repo, workflow, backend + frontend skeletons, shared foundations.

### T01 · Repo & workflow setup

**Type:** Task · **Lane:** Person 3 · **Target:** Do 12.11. · **Depends on:** –

Create the monorepo and team workflow so everyone can branch off on day 1.

**Tasks**

- [ ] Create GitHub repo with /backend, /frontend, /docs, root README.md (stub)
- [ ] Add .gitignore (Java/Maven, Node, IDE files) and .editorconfig
- [ ] Add CLAUDE.md, docs/PLAN.md, docs/TICKETS.md, .github/pull_request_template.md
- [ ] Branch protection on main: PR required, 1 approval, no direct push, no force push
- [ ] Connect Jira and GitHub (GitHub for Jira app) so branches/PRs with WM-keys link to tickets
- [ ] Enable squash merge and auto-delete of merged branches

**Acceptance criteria**

- Direct push to main is rejected
- A new PR shows the template
- A branch named feature/WM-x-... appears on the Jira ticket
- Quality gates green, PR reviewed by 1 teammate

### T02 · Backend scaffold (Spring Boot 4, Java 25)

**Type:** Task · **Lane:** Person 1 · **Target:** Do 12.11. · **Depends on:** T01

Generate the backend project and configure profiles so the app starts with H2.

**Tasks**

- [ ] start.spring.io: Maven, Java 25, Spring Boot 4.0.x, group de.gruppe3, artifact warehouse, package de.gruppe3.warehouse
- [ ] Dependencies: Spring Web, Spring Data JPA, Validation, H2, PostgreSQL Driver, Lombok, springdoc-openapi (version for Boot 4), MapStruct
- [ ] Annotation processors in pom.xml: lombok, mapstruct-processor, lombok-mapstruct-binding
- [ ] application.yml (common, default profile dev, open-in-view=false), application-dev.yml (H2 jdbc:h2:mem:warehouse;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE, ddl-auto=create-drop, H2 console on), application-prod.yml (Postgres via ${DB_URL}/${DB_USER}/${DB_PASSWORD}, ddl-auto=validate)
- [ ] Check whether H2 console needs an extra module in Boot 4 and add it if so
- [ ] Commit the Maven wrapper

**Acceptance criteria**

- ./mvnw spring-boot:run starts on :8080
- Swagger UI reachable at /swagger-ui.html
- H2 console reachable in dev
- ./mvnw verify is green
- Quality gates green, PR reviewed by 1 teammate

### T03 · Backend common foundation

**Type:** Task · **Lane:** Person 1 · **Target:** Fr 13.11. · **Depends on:** T02

Shared base classes and error handling, so feature tickets never touch these files.

**Tasks**

- [ ] BaseEntity (@MappedSuperclass: Long id IDENTITY, Instant createdAt/updatedAt via @CreationTimestamp/@UpdateTimestamp)
- [ ] Exceptions: NotFoundException, DuplicateValueException, EntityInUseException, InsufficientStockException (with shortages list), InvalidStatusTransitionException
- [ ] GlobalExceptionHandler → ProblemDetail: 400 validation (errors map), 404, 409 for the conflict exceptions + optimistic lock failure, German detail texts
- [ ] CorsConfig allowing http://localhost:5173
- [ ] Seed config: spring.sql.init.data-locations=classpath:data/*.sql (one file per feature), defer-datasource-initialization=true; add empty placeholder files
- [ ] MockMvc test with a test controller: validation error → 400 with errors map, NotFound → 404

**Acceptance criteria**

- Every exception type maps to the documented status and ProblemDetail shape
- Tests green
- Quality gates green, PR reviewed by 1 teammate

### T04 · Frontend scaffold (Vite, Tailwind, shadcn)

**Type:** Task · **Lane:** Person 2 · **Target:** Do 12.11. · **Depends on:** T01

Create the React app with all base tooling.

**Tasks**

- [ ] Vite react-ts template, TypeScript strict
- [ ] Tailwind CSS v4 via @tailwindcss/vite
- [ ] Path alias @/ → src (tsconfig + vite config)
- [ ] shadcn init, add: button, input, textarea, label, select, card, badge, table, dialog, alert-dialog, dropdown-menu, sidebar, separator, skeleton, sonner, popover, command, tooltip, form/field
- [ ] lucide-react, @fontsource-variable/inter (set as font-sans)
- [ ] ESLint + Prettier (+ prettier-plugin-tailwindcss), scripts dev/build/lint/format
- [ ] Vite dev proxy: /api → http://localhost:8080

**Acceptance criteria**

- npm run dev shows a shadcn Button in Inter font
- npm run lint and npm run build are green
- A request to /api/... reaches the backend
- Quality gates green, PR reviewed by 1 teammate

### T05 · Frontend app shell (layout, routing, API client)

**Type:** Task · **Lane:** Person 2 · **Target:** Fr 13.11. · **Depends on:** T04

Navigation, routing and data layer for all features, created once to avoid merge conflicts later.

**Tasks**

- [ ] router.tsx with ALL routes from CLAUDE.md, each pointing to a placeholder page
- [ ] AppLayout with shadcn Sidebar: Dashboard, Artikel, Kunden, Wareneingang, Warenausgang (lucide icons), active item highlighted
- [ ] PageHeader component (title, description, action slot), 404 page
- [ ] api/client.ts: axios instance baseURL /api/v1; lib/errors.ts: ApiError type + toApiError(error)
- [ ] QueryClientProvider (sensible defaults, e.g. retry 1, no refetch on focus), Sonner Toaster
- [ ] i18n/de/ with one file per feature + common.ts + index.ts (typed object)
- [ ] lib/format.ts: formatDate (dd.MM.yyyy), formatNumber (de-DE)

**Acceptance criteria**

- All routes reachable via sidebar
- Unknown route shows 404 page
- toApiError returns status, title, detail, errors
- Quality gates green, PR reviewed by 1 teammate

### T06 · Shared UI components

**Type:** Task · **Lane:** Person 3 · **Target:** Mo 16.11. · **Depends on:** T05

Reusable components every list and form page uses. Start Fr 13.11., merge by Mo 16.11.

**Tasks**

- [ ] DataTable (@tanstack/react-table): columns prop, client-side search, sorting, pagination, loading skeleton, empty state
- [ ] ConfirmDialog (AlertDialog wrapper, destructive variant, loading state)
- [ ] StatusBadge: DRAFT/CONFIRMED/CANCELLED → Entwurf/Bestätigt/Storniert with colors
- [ ] StockBadge: Leer (0) / Niedrig (≤ min) / OK
- [ ] EmptyState, ProductImage (imageUrl → picsum fallback by SKU → Package icon on error)
- [ ] useApiErrorToast() hook: shows ApiError.detail in a toast

**Acceptance criteria**

- Components are typed, documented with a short JSDoc, and used on at least one placeholder page
- Lint/build green
- Quality gates green, PR reviewed by 1 teammate

### T07 · CI pipeline (optional)

**Type:** Task · **Lane:** Person 3 · **Target:** Mo 16.11. · **Depends on:** T02, T04

GitHub Actions run the quality gates on every PR. Optional: do it only if T06 is done.

**Tasks**

- [ ] Workflow on pull_request: backend job (Temurin 25, ./mvnw -B verify), frontend job (npm ci, npm run lint, npm run build)
- [ ] Make both jobs required status checks on main

**Acceptance criteria**

- A PR shows both checks
- A failing test blocks merging
- Quality gates green, PR reviewed by 1 teammate

## E2 · Artikel

Product master data: API, list, form.

### T08 · BE: Artikel CRUD API

**Type:** Story · **Lane:** Person 1 · **Target:** Mo 16.11. · **Depends on:** T03

Product entity and REST API.

**Tasks**

- [ ] Product entity per ERD (sku, name, description, unit, quantity, minQuantity, imageUrl, @Version version)
- [ ] ProductUnit enum: PIECE, KILOGRAM, LITER, METER, BOX
- [ ] ProductRequest (no quantity!), ProductResponse (incl. quantity, lowStock, outOfStock), MapStruct mapper
- [ ] ProductService + ProductController: GET list (?q= on sku/name), GET by id, POST, PUT, DELETE (plain delete for now, protection in T25)
- [ ] SKU trimmed + uppercased, unique → 409 DuplicateValueException
- [ ] New products start with quantity 0
- [ ] Seed data/products.sql: ~15 products, some below minQuantity, no explicit IDs
- [ ] Tests: duplicate SKU, validation errors, not found

**Acceptance criteria**

- All endpoints in Swagger
- quantity cannot be set via the API
- Tests green
- Quality gates green, PR reviewed by 1 teammate

### T09 · FE: Artikel list

**Type:** Story · **Lane:** Person 1 · **Target:** Di 17.11. · **Depends on:** T06, T08

Product overview page.

**Tasks**

- [ ] types.ts, api.ts, queries.ts (productKeys, useProducts, useDeleteProduct)
- [ ] DataTable columns: image, SKU, Name, Einheit, Bestand, Mindestbestand, StockBadge, actions (Bearbeiten, Löschen)
- [ ] Search field, 'Neuer Artikel' button in PageHeader
- [ ] Delete with ConfirmDialog; 409 shows backend message as toast

**Acceptance criteria**

- Seed products visible with images
- Low-stock products show 'Niedrig'
- Delete works and errors show as toast
- Quality gates green, PR reviewed by 1 teammate

### T10 · FE: Artikel form (create/edit)

**Type:** Story · **Lane:** Person 1 · **Target:** Di 17.11. · **Depends on:** T09

Create and edit products.

**Tasks**

- [ ] schema.ts (zod) mirroring backend validation, German messages
- [ ] Form fields: SKU, Name, Beschreibung, Einheit (select), Mindestbestand, Bild-URL with live preview
- [ ] Edit page shows Bestand read-only with hint 'Bestand ändert sich nur über Wareneingang/Warenausgang'
- [ ] 409 duplicate SKU shown on the SKU field; success toast + navigate to list

**Acceptance criteria**

- Create and edit work end-to-end
- Validation errors appear on fields
- Quality gates green, PR reviewed by 1 teammate

## E3 · Kunden

Customer master data: API, list, form.

### T11 · BE: Kunden CRUD API

**Type:** Story · **Lane:** Person 2 · **Target:** Mo 16.11. · **Depends on:** T03

Customer entity and REST API.

**Tasks**

- [ ] Customer entity per ERD (name, email, phone, street, zipCode, city)
- [ ] Request/Response records, mapper, service, controller: GET list (?q= on name/city/email), GET by id, POST, PUT, DELETE
- [ ] Validation: name required, email format if present, zipCode 5 digits if present
- [ ] Seed data/customers.sql: ~8 customers
- [ ] Tests: validation, not found

**Acceptance criteria**

- All endpoints in Swagger
- Tests green
- Quality gates green, PR reviewed by 1 teammate

### T12 · FE: Kunden list + form

**Type:** Story · **Lane:** Person 2 · **Target:** Di 17.11. · **Depends on:** T06, T11

Customer list, create and edit.

**Tasks**

- [ ] types/api/queries/schema for customers
- [ ] List: Name, E-Mail, Telefon, Ort, actions; search; delete with ConfirmDialog
- [ ] Form page for create/edit with zod validation

**Acceptance criteria**

- CRUD works end-to-end
- Errors shown as toast / on fields
- Quality gates green, PR reviewed by 1 teammate

## E4 · Bestand & Belege-Basis

Stock logic and shared document building blocks used by Wareneingang and Warenausgang.

### T13 · BE: StockService & document foundation

**Type:** Story · **Lane:** Person 3 · **Target:** Di 17.11. · **Depends on:** T08

The single place that changes stock, plus shared document logic.

**Tasks**

- [ ] document/DocumentStatus enum (DRAFT, CONFIRMED, CANCELLED) with helpers canEdit(), canConfirm(), canCancel()
- [ ] document/DocumentNumberGenerator: format(prefix, year, id) → WE-2026-0007
- [ ] stock/StockDirection (IN, OUT), stock/StockChange record (productId, quantity)
- [ ] StockService.apply(List<StockChange>, StockDirection): loads products, for OUT checks ALL first and throws InsufficientStockException with every shortage, otherwise applies all; relies on @Version
- [ ] Unit tests: IN increases, OUT decreases, OUT with one shortage changes nothing, quantity ≤ 0 rejected

**Acceptance criteria**

- No other class modifies Product.quantity
- Tests cover all cases above
- Quality gates green, PR reviewed by 1 teammate

### T14 · FE: shared document components

**Type:** Story · **Lane:** Person 3 · **Target:** Mi 18.11. · **Depends on:** T06, T09

Building blocks both document forms and detail pages use.

**Tasks**

- [ ] features/documents/types.ts: DocumentStatus, item types
- [ ] ProductPicker: searchable combobox (shadcn Command + Popover) over products, shows SKU, name, current stock
- [ ] DocumentItemsEditor: react-hook-form useFieldArray rows (product, quantity ≥ 1, remove), add-row button, prevents choosing the same product twice, optional 'show available stock' prop
- [ ] DocumentActions: buttons by status (DRAFT: Bearbeiten, Bestätigen, Löschen; CONFIRMED: Stornieren) with ConfirmDialogs

**Acceptance criteria**

- Components work in a demo form on a placeholder page
- Same product can't be picked twice
- Quality gates green, PR reviewed by 1 teammate

## E5 · Wareneingang

Inbound deliveries: drafts, confirm (+ stock), cancel.

### T15 · BE: Wareneingang drafts API

**Type:** Story · **Lane:** Person 1 · **Target:** Mi 18.11. · **Depends on:** T08, T13

Create, edit, list and delete Wareneingang drafts.

**Tasks**

- [ ] Entities InboundDelivery + InboundDeliveryItem per ERD, repositories
- [ ] InboundDeliveryRequest (supplierName, deliveryDate default today, note, items[] ≥ 1 with productId, quantity ≥ 1); duplicates merged
- [ ] Responses: SummaryResponse (number, supplier, date, status, itemCount, totalQuantity), DetailResponse (+ items with sku, name, unit)
- [ ] Endpoints: GET list (?status=), GET detail (fetch join), POST (DRAFT + number WE-yyyy-nnnn), PUT (DRAFT only), DELETE (DRAFT only)
- [ ] Wrong status → 409 InvalidStatusTransitionException
- [ ] Tests: create, update non-draft rejected, delete non-draft rejected, duplicate merge

**Acceptance criteria**

- Drafts never change stock
- Tests green
- Quality gates green, PR reviewed by 1 teammate

### T16 · BE: Wareneingang confirm/cancel

**Type:** Story · **Lane:** Person 1 · **Target:** Do 19.11. · **Depends on:** T15

Status actions that change stock.

**Tasks**

- [ ] POST /{id}/confirm: DRAFT → CONFIRMED, StockService IN
- [ ] POST /{id}/cancel: CONFIRMED → CANCELLED, StockService OUT (rejected with shortages if stock was already shipped)
- [ ] One @Transactional method per action
- [ ] Tests: confirm increases stock, confirm twice rejected, cancel decreases, cancel with shortage rejected and changes nothing

**Acceptance criteria**

- Stock matches rules in CLAUDE.md
- Tests green
- Quality gates green, PR reviewed by 1 teammate

### T17 · FE: Wareneingang list + detail

**Type:** Story · **Lane:** Person 1 · **Target:** Fr 20.11. · **Depends on:** T14, T16

Overview and detail page with status actions.

**Tasks**

- [ ] types/api/queries for inbound (mutations invalidate inbound, products, dashboard)
- [ ] List: Nummer, Lieferant, Datum, Positionen, Menge, StatusBadge; filter by status; 'Neuer Wareneingang'
- [ ] Detail: header data, items table, DocumentActions; shortages from 409 shown in toast

**Acceptance criteria**

- Confirm/cancel update the stock shown on the Artikel list without reload
- Errors are readable
- Quality gates green, PR reviewed by 1 teammate

### T18 · FE: Wareneingang form

**Type:** Story · **Lane:** Person 1 · **Target:** Fr 20.11. · **Depends on:** T14, T15

Create and edit Wareneingang drafts.

**Tasks**

- [ ] Fields: Lieferant (text), Lieferdatum (default today), Notiz, DocumentItemsEditor
- [ ] zod schema: supplier required, ≥ 1 item, quantity ≥ 1
- [ ] Edit only reachable for DRAFT; after save navigate to detail

**Acceptance criteria**

- Create + edit work end-to-end
- Validation messages in German
- Quality gates green, PR reviewed by 1 teammate

## E6 · Warenausgang

Outbound orders: drafts, confirm (− stock), cancel.

### T19 · BE: Warenausgang drafts API

**Type:** Story · **Lane:** Person 2 · **Target:** Mi 18.11. · **Depends on:** T08, T11, T13

Create, edit, list and delete Warenausgang drafts.

**Tasks**

- [ ] Entities OutboundOrder + OutboundOrderItem per ERD, repositories
- [ ] OutboundOrderRequest (customerId required, orderDate default today, note, items[] ≥ 1); duplicates merged
- [ ] Responses: SummaryResponse (number, customerName, date, status, itemCount, totalQuantity), DetailResponse (+ customer, items)
- [ ] Endpoints like Wareneingang; numbers WA-yyyy-nnnn
- [ ] Tests: create, unknown customer → 404, edit/delete non-draft rejected

**Acceptance criteria**

- Drafts never change stock
- Tests green
- Quality gates green, PR reviewed by 1 teammate

### T20 · BE: Warenausgang confirm/cancel

**Type:** Story · **Lane:** Person 2 · **Target:** Do 19.11. · **Depends on:** T19

Status actions that change stock.

**Tasks**

- [ ] POST /{id}/confirm: DRAFT → CONFIRMED, StockService OUT; any shortage → 409 with shortages list, nothing changes
- [ ] POST /{id}/cancel: CONFIRMED → CANCELLED, StockService IN
- [ ] Tests: confirm decreases, confirm with one shortage changes nothing, cancel restores stock, wrong status rejected

**Acceptance criteria**

- All-or-nothing behavior proven by tests
- Quality gates green, PR reviewed by 1 teammate

### T21 · FE: Warenausgang list + detail

**Type:** Story · **Lane:** Person 2 · **Target:** Fr 20.11. · **Depends on:** T14, T20

Overview and detail page with status actions.

**Tasks**

- [ ] types/api/queries for outbound (mutations invalidate outbound, products, dashboard)
- [ ] List: Nummer, Kunde, Datum, Positionen, Menge, StatusBadge; filter by status
- [ ] Detail with DocumentActions; on 409 list each shortage (Artikel, benötigt, verfügbar)

**Acceptance criteria**

- Shortage message names the affected articles
- Stock updates without reload
- Quality gates green, PR reviewed by 1 teammate

### T22 · FE: Warenausgang form

**Type:** Story · **Lane:** Person 2 · **Target:** Fr 20.11. · **Depends on:** T14, T19

Create and edit Warenausgang drafts.

**Tasks**

- [ ] Fields: Kunde (select/combobox), Datum, Notiz, DocumentItemsEditor with available stock per line
- [ ] Warning hint when a quantity exceeds current stock (saving the draft is still allowed, confirm decides)
- [ ] zod schema: customer required, ≥ 1 item

**Acceptance criteria**

- Create + edit work end-to-end
- Stock hint visible
- Quality gates green, PR reviewed by 1 teammate

## E7 · Dashboard

KPIs, low-stock warnings, recent documents.

### T23 · BE: Dashboard API

**Type:** Story · **Lane:** Person 3 · **Target:** Do 19.11. · **Depends on:** T15, T19

One endpoint with everything the dashboard needs.

**Tasks**

- [ ] GET /api/v1/dashboard → productCount, customerCount, lowStockCount, outOfStockCount, openInboundDrafts, openOutboundDrafts, lowStockProducts (max 10, lowest first), recentInbound (5), recentOutbound (5)
- [ ] Read-only queries, no entity leaves the service
- [ ] Test with seed-like data

**Acceptance criteria**

- Numbers match the database
- Test green
- Quality gates green, PR reviewed by 1 teammate

### T24 · FE: Dashboard

**Type:** Story · **Lane:** Person 3 · **Target:** Fr 20.11. · **Depends on:** T06, T23

Start page of the app.

**Tasks**

- [ ] KPI cards (Artikel, Kunden, Niedriger Bestand, Leer, offene Entwürfe)
- [ ] Low-stock table with StockBadge, row links to the article
- [ ] Recent Wareneingänge / Warenausgänge with StatusBadge, links to detail
- [ ] Loading skeletons, empty states

**Acceptance criteria**

- Dashboard refreshes after confirm/cancel elsewhere
- Quality gates green, PR reviewed by 1 teammate

## E8 · Abschluss & Qualität

Delete protection, demo data, README, freeze.

### T25 · Delete protection Artikel/Kunde (BE + FE)

**Type:** Story · **Lane:** Person 3 · **Target:** Do 19.11. · **Depends on:** T09, T12, T15, T19

Block deleting master data that is used in documents.

**Tasks**

- [ ] ProductService.delete: count inbound + outbound items for the product → EntityInUseException 'Artikel „X“ wird in N Belegen verwendet'
- [ ] CustomerService.delete: count outbound orders → 'Kunde „X“ wird in N Belegen verwendet'
- [ ] Verify FKs have no cascade delete
- [ ] FE: confirm both list pages show the 409 message as toast
- [ ] Tests for both services

**Acceptance criteria**

- Used records can't be deleted, unused ones can
- Tests green
- Quality gates green, PR reviewed by 1 teammate

### T26 · Demo data for the presentation

**Type:** Story · **Lane:** Person 3 · **Target:** Fr 20.11. · **Depends on:** T16, T20

Realistic seed data covering every state.

**Tasks**

- [ ] data/inbound.sql and data/outbound.sql: documents in DRAFT, CONFIRMED and CANCELLED
- [ ] Product quantities in products.sql consistent with the confirmed documents
- [ ] At least 2 low-stock and 1 out-of-stock article
- [ ] FK references via subselects, no explicit IDs

**Acceptance criteria**

- Fresh start shows a meaningful dashboard
- Every status visible in both lists
- Quality gates green, PR reviewed by 1 teammate

### T27 · README & feature-freeze check

**Type:** Task · **Lane:** Person 3 · **Target:** Sa 21.11. · **Depends on:** T17, T18, T21, T22, T24, T25, T26

Make the project runnable for anyone and verify everything before the freeze.

**Tasks**

- [ ] README: what the app does, prerequisites (Java 25, Node), how to run backend + frontend, Swagger/H2 links, screenshots
- [ ] Smoke test checklist run on a clean clone: create article → Wareneingang confirm → Warenausgang confirm → cancel → dashboard
- [ ] Create Bug tickets for everything found

**Acceptance criteria**

- Clean clone runs with the README steps only
- Checklist documented in the PR
- Quality gates green, PR reviewed by 1 teammate
