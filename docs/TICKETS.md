# Tickets – Warehouse Management (Gruppe 3)

Every ticket = one branch = one PR. Jira assigns the real keys (WM-…) on import; the `T`-number in each
summary maps a Jira ticket back to this file. Use the **Jira key** in branch names and commits.

Lanes: **Person 1** Artikel → Wareneingang · **Person 2** Kunden → Warenausgang · **Person 3** shared parts → Dashboard.
Target dates are the day the PR should be merged. Weekend 14.–15.11. is buffer.

**v1.1 (Deployment & Login, T28–T36):** separate track on branch `release/v1.1`, see the end of this file.

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

---

# v1.1 · Deployment & Login (branch `release/v1.1`)

Built by **one developer** in parallel with the group's tickets T01–T27. These tickets already exist in Jira, so
their real keys are known and listed here. Every ticket branches from `release/v1.1` and its PR targets
`release/v1.1`, never `main` (workflow: `CLAUDE.md` → *v1.1 – Deployment & Login*).

**Deployment approach (decision 24.11.):** like in the Spring Boot course. The React build is copied into Spring
Boot's `static` folder, so **one jar = one Docker image = one Render service** serves the frontend and the API.

| ID | Jira | Epic | Title | Status | Depends on |
|----|------|------|-------|--------|------------|
| – | WM-40 | E9 Login (v1) | Epic | On hold | – |
| T28 | WM-41 | E9 Login (v1) | BE: Session login with fixed user | On hold | T31 |
| T29 | WM-42 | E9 Login (v1) | FE: Login page & protected routes | On hold | T28 |
| – | WM-43 | E10 Deployment | Epic | Active | – |
| T30 | WM-44 | E10 Deployment | BE: Neon Postgres + Flyway | Done | – |
| T31 | WM-45 | E10 Deployment | Deployment: one Docker image + GitHub Actions + Render | Active | T30 |
| T36 | WM-50 | E10 Deployment | Docs: deployment, login & env vars | On hold | T31, T28, T29 |

T32–T35 (WM-46 to WM-49: nginx, separate images, two Render services, docker-compose) are **obsolete**. Everything
still needed from them is part of T31.

**Order:** T30 ✓ → T31. After the group is done: T28 → T29 → T36.

## E9 · Login (v1) · WM-40 · on hold

Protect the app with a login page. v1 has exactly **one fixed user**: no registration, no user table, no roles.
Session cookie via Spring Security. Credentials only from env vars `APP_USERNAME` / `APP_PASSWORD`.
Same origin everywhere (Vite proxy in dev, Spring Boot serves the frontend in prod), so no CORS and no cross-site cookies.

Out of scope: registration, multiple users, roles, password reset, "remember me".

### T28 · BE: Session login with fixed user · WM-41

**Type:** Story · **Owner:** solo (`release/v1.1`) · **Status:** On hold · **Depends on:** T31

Spring Security with one in-memory user. All API endpoints require login, except login itself. The frontend files
stay public, so the login page can load.

**Tasks**

- [ ] Add `spring-boot-starter-security` (+ `spring-security-test` for tests)
- [ ] `SecurityConfig`: `InMemoryUserDetailsManager` with one user from `app.auth.username` / `app.auth.password`
  (env `APP_USERNAME` / `APP_PASSWORD`), password BCrypt-encoded at startup
- [ ] `dev` profile: defaults `admin` / `admin` in `application-dev.properties`. `prod`: **no defaults**, startup must fail if missing
- [ ] `POST /api/v1/auth/login` (JSON `{username, password}`) → 200 `{username}`, creates the session. Save the
  security context explicitly via `HttpSessionSecurityContextRepository` (not automatic for a custom endpoint)
- [ ] `POST /api/v1/auth/logout` → 204 · `GET /api/v1/auth/me` → 200 `{username}` or 401
- [ ] Authorization: `POST /api/v1/auth/login` permitAll → everything else under `/api/**` authenticated →
  **all other requests permitAll** (React files, SPA routes like `/artikel/5`, Swagger UI, H2 console in dev)
- [ ] Disable `formLogin` and `httpBasic`. Unauthenticated API request → 401 German ProblemDetail
  "Bitte melden Sie sich an." (no redirect, no browser popup). Wrong credentials → 401 "Benutzername oder Passwort falsch."
- [ ] CSRF on with `CookieCsrfTokenRepository.withHttpOnlyFalse()` + SPA request handler (axios sends `X-XSRF-TOKEN` automatically)
- [ ] Session cookie `HttpOnly`, `SameSite=Lax`, `Secure` in `prod`
- [ ] Tests: login OK, wrong password → 401, protected endpoint without session → 401, `/me` after login → 200,
  logout → `/me` 401, `/` and `/artikel` reachable without login. Existing controller tests get `@WithMockUser`
- [ ] Render: add `APP_USERNAME` / `APP_PASSWORD` to the environment
- [ ] Optional, decide in this ticket: disable Swagger in `prod` (`springdoc.api-docs.enabled=false`, `springdoc.swagger-ui.enabled=false`)

**Acceptance criteria**

- `GET /api/v1/products` without login → 401 with a German message; after login → 200 via the session cookie
- The deployed app shows the login page instead of data
- Starting `prod` without `APP_USERNAME` / `APP_PASSWORD` fails with a clear error
- No production credentials in the repo; `./mvnw verify` green

Note: sessions live in memory. A Render restart or wake-up means logging in again (fine for v1).

### T29 · FE: Login page & protected routes · WM-42

**Type:** Story · **Owner:** solo (`release/v1.1`) · **Status:** On hold · **Depends on:** T28

German login page; every other page requires login. The axios client already uses the relative `/api/v1`, Vite
proxies `/api` in dev and Spring Boot serves the frontend in prod, so the session cookie works without extra setup.

**Tasks**

- [ ] Route `/login`: shadcn `Card` + form, "Benutzername", "Passwort", button "Anmelden",
  error "Benutzername oder Passwort falsch." Texts in `i18n/de/auth.ts`
- [ ] `features/auth/`: `api.ts`, `queries.ts` (`useAuth` via `GET /auth/me`, login/logout mutations), `types.ts`, `schema.ts`
- [ ] `ProtectedRoute` around all existing routes → redirect to `/login`, afterwards back to the requested page
- [ ] axios response interceptor: on 401 (except `/auth/me`, `/auth/login`) clear the query cache, go to `/login`
- [ ] `AppLayout` header: username + "Abmelden" button
- [ ] Loading state while `/auth/me` is pending (no login-page flash)

**Acceptance criteria**

- Any page without a session shows the login page (locally and on Render)
- Correct credentials → requested page; wrong ones → German error
- "Abmelden" ends the session; the back button shows no protected data
- Reload while logged in keeps the session
- `npm run lint` and `npm run build` green

## E10 · Deployment · WM-43 · active

Every merge into the deploy branch builds the app, pushes **one** Docker image to Docker Hub and deploys it on Render.
Production data lives in Postgres on Neon.

```
Browser → Render web service (Spring Boot, profile prod: React files + /api/v1) → Neon Postgres (Frankfurt)
GitHub push → deploy.yml: build frontend → build backend (incl. frontend) → push image → Render deploy hook
```

Free-tier limits: Render sleeps after ~15 min idle (first request then takes ~1 min). Neon scales to zero
(first connection takes a few seconds). Until T28/T29 are live, the deployed app has **no login**. Don't share the URL.

### T30 · BE: Neon Postgres + Flyway · WM-44 · done

**Type:** Story · **Owner:** solo (`release/v1.1`) · **Status:** Done · **Depends on:** –

Profile `prod` runs on Neon. Flyway creates the schema, Hibernate only validates it.

**Tasks**

- [x] Neon project, region **EU Frankfurt**, database `warehouse`, direct connection (no pooler). Credentials only in a password manager
- [x] Dependencies: `spring-boot-starter-flyway` (Boot 4 needs the starter) and `org.flywaydb:flyway-database-postgresql`
- [x] `application.properties`: `spring.flyway.enabled=false`. `application-prod.properties`: `spring.flyway.enabled=true`
- [x] `db/migration/V1__init.sql` based on `schema.sql` (without `IF NOT EXISTS`)
- [x] `prod`: `ddl-auto=validate`, `spring.sql.init.mode=never`, datasource from `DB_URL`, `DB_USER`, `DB_PASSWORD`
  (no defaults), Hikari `maximum-pool-size=5`, `connection-timeout=30000`
- [x] `DB_URL=jdbc:postgresql://<neon-host>/warehouse?sslmode=require&channelBinding=require`, user and password separate
- [x] `dev` (H2) and `postgres` (local) profiles unchanged

**Notes**

- Demo data in Neon was loaded once by hand: seed files `data/01`–`04` in the Neon SQL Editor, in order.
  Whether production gets a `V2__demo_data.sql` migration is still a team decision.
- Rule from now on: schema changes only through a **new** `V<n>__*.sql`; never edit an applied migration.

### T31 · Deployment: one Docker image + GitHub Actions + Render · WM-45

**Type:** Story · **Owner:** solo (`release/v1.1`) · **Depends on:** T30

Same approach as in the Spring Boot course. Replaces T32–T35.

**Tasks: app**

- [ ] `backend/pom.xml`: `<finalName>app</finalName>` under `<build>` → the jar is always `backend/target/app.jar`
- [ ] `application.properties`: `server.port=${PORT:8080}` (Render can set `PORT`)
- [ ] `config/SpaConfig` (`WebMvcConfigurer`): resource handler `/**` → `classpath:/static/` with a
  `PathResourceResolver` that returns the requested file if it exists, otherwise `index.html`; paths starting
  with `api/` return nothing (stay 404). So reloading `/artikel/5` works. Use the resolver, not a regex
  controller, so Swagger UI and the H2 console keep working
- [ ] `.gitignore`: `backend/src/main/resources/static/` and `backend-target/` (build output, never committed)

**Tasks: `Dockerfile` (repo root)**

```dockerfile
FROM eclipse-temurin:25-jre
EXPOSE 8080
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75"
ADD backend-target/app.jar /app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

`MaxRAMPercentage`: Render free has 512 MB; without it Java uses only 25 % of it for the heap.

**Tasks: `.github/workflows/deploy.yml`**

Triggers: `push` to `release/v1.1` and `workflow_dispatch` (the final release PR switches it to `main`).
Four jobs, each `needs` the previous one:

- [ ] `build-frontend`: `actions/checkout@v4`, `actions/setup-node@v4` (Node 22, npm cache), in `frontend`:
  `npm ci`, `npm run lint`, `npm run build` → `actions/upload-artifact@v4` name `frontend-build`, path `frontend/dist`
- [ ] `build-backend`: checkout, `actions/download-artifact@v4` `frontend-build` → `backend/src/main/resources/static`,
  `actions/setup-java@v4` (Java **25**, temurin, maven cache), `mvn -B package --file backend/pom.xml`
  (runs the tests) → upload `backend/target/app.jar` as `app-jar`
- [ ] `push-to-docker-hub`: checkout, download `app-jar` → `backend-target`, `docker/login-action@v3`
  (`DOCKERHUB_USERNAME`, `DOCKERHUB_PASSWORD`), `docker/build-push-action@v6` with `context: .`,
  `push: true`, `tags: ${{ secrets.DOCKERHUB_TAG }}`
- [ ] `deploy`: `curl -fsS "${{ secrets.RENDER_DEPLOY_HOOK }}"`

**Tasks: Docker Hub, GitHub, Render**

- [ ] Docker Hub: public repo, e.g. `<user>/warehouse-management` (the image contains no secrets), and an **access token**
- [ ] GitHub → Settings → Secrets and variables → Actions: `DOCKERHUB_USERNAME`, `DOCKERHUB_PASSWORD` (the access
  token), `DOCKERHUB_TAG` (e.g. `<user>/warehouse-management:latest`), `RENDER_DEPLOY_HOOK`
- [ ] Render: New Web Service → "Deploy an existing image from a registry" →
  `docker.io/<user>/warehouse-management:latest`, instance type **Free**, region **Frankfurt**
- [ ] Render environment: `SPRING_PROFILES_ACTIVE=prod`, `DB_URL`, `DB_USER`, `DB_PASSWORD`
- [ ] Render Settings → Deploy Hook → GitHub secret `RENDER_DEPLOY_HOOK`

**Local test (optional, before the first push)**

```powershell
cd frontend; npm run build; cd ..
New-Item -ItemType Directory -Force backend\src\main\resources\static | Out-Null
Copy-Item -Recurse -Force frontend\dist\* backend\src\main\resources\static\
cd backend; .\mvnw.cmd -B package; cd ..
New-Item -ItemType Directory -Force backend-target | Out-Null
Copy-Item backend\target\app.jar backend-target\app.jar
docker build -t warehouse-management .
docker run --rm -p 8080:8080 -e SPRING_PROFILES_ACTIVE=prod -e DB_URL=... -e DB_USER=... -e DB_PASSWORD=... warehouse-management
```

Then http://localhost:8080 shows the app from the container.

**Acceptance criteria**

- A merge into `release/v1.1` runs all four jobs green, pushes a new image to Docker Hub, and Render starts it (Events/Logs tabs)
- The Render URL shows the app; all pages work, reloading a deep link like `/artikel/5` works, data comes from Neon
- Locally nothing changes: `npm run dev` + `./mvnw spring-boot:run` work as before, `./mvnw verify` green
- No secrets in the repo, the image or the workflow file

### T36 · Docs: deployment, login & env vars · WM-50

**Type:** Task · **Owner:** solo (`release/v1.1`) · **Status:** On hold · **Depends on:** T31, T28, T29

Last v1.1 ticket. Done after the group's README (T27) is merged, to avoid conflicts.

**Tasks**

- [ ] README: Login (dev credentials, prod via env vars), Deployment (flow, live URL, merge triggers deploy,
  `workflow_dispatch` for manual redeploy, cold start), env var table
- [ ] `CLAUDE.md`: fold the *v1.1* section into the regular sections (auth rules, profiles, Git workflow back to
  `main`), remove the items from *Not now*
- [ ] `docs/PLAN.md`: mark section 10 as done
- [ ] `deploy.yml` trigger `release/v1.1` → `main` (in the final release PR)

**Acceptance criteria**

- A teammate can deploy and find every variable using only the README
- `CLAUDE.md` describes the final state, no "on hold" notes left