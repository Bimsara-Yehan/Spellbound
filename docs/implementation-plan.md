# E-Commerce Platform with POS Integration
## Technical Implementation Plan

**Document status:** Draft v1.0 — internal
**Prepared by:** Spellbound
**Audience:** internal engineering (sections 1–11), client-facing summary (sections 2, 7, 12)

---

## 1. Executive summary

We are building a customer-facing online store and a staff-facing administration panel for a retail business that already operates a Point-of-Sale (POS) system. The web platform maintains its own database as the authoritative source for online operations, and reconciles product, stock, and sales data with the POS through a dedicated, swappable integration layer.

**The single defining constraint of this project is that the POS integration surface is currently unknown.** The architecture below is designed so that this unknown is isolated behind one interface, allowing all customer-facing and administrative work to proceed to completion in parallel with the integration investigation.

**Recommended delivery window:** 12–14 weeks to production launch, in five phases with a client demo at the end of each.

---

## 2. Scope

### 2.1 In scope — Phase 1 delivery

**Storefront**
- Product catalogue with categories, search, and filtering
- Product detail pages with variants (size / colour / etc.) and image galleries
- Cart and guest checkout
- Registered customer accounts with order history
- Online payment and Cash-on-Delivery
- Delivery address capture and shipping fee calculation
- Order confirmation and status notifications (email + SMS)
- Mobile-first responsive design
- SEO fundamentals: server-rendered pages, structured data, sitemap

**Admin panel**
- Role-based authentication (Owner, Manager, Staff)
- Product CRUD: create, edit, archive, image upload, category assignment, pricing
- Variant and SKU management
- Stock view with manual override and adjustment audit log
- Order management: list, detail, status transitions, refunds/cancellations
- Customer list and order history
- Sales dashboard: revenue by period, order volume, average order value, top products, low-stock alerts
- Discount codes and basic promotions
- POS sync monitor: last sync time, failed items, manual re-sync trigger

**Integration**
- POS adapter with catalogue pull, stock pull, and order push
- Automated reconciliation with failure alerting

### 2.2 Explicitly out of scope for Phase 1

Documenting exclusions is not pessimism — it is what prevents scope creep from destroying the margin on a fixed-price first project. Each of the following is a legitimate Phase 2 conversation:

- Multi-branch / multi-warehouse inventory
- Loyalty points and gift cards
- Marketplace or multi-vendor functionality
- Mobile applications (the storefront is a responsive web app)
- Advanced marketing automation (abandoned cart sequences, segmentation)
- Multi-currency and international shipping
- Migration of historical POS sales data into the web platform
- Accounting-system integration

### 2.3 Client dependencies

The project cannot complete without these, and each should be assigned an owner and a due date in writing:

| Dependency | Owner | Needed by |
| --- | --- | --- |
| POS vendor technical contact and API documentation | Client | Week 1 |
| Product data export (SKUs, names, prices, categories) | Client | Week 3 |
| Product photography | Client | Week 6 |
| Payment gateway merchant account approval | Client | Week 6 |
| Domain name and DNS access | Client | Week 8 |
| Delivery partner rates and coverage areas | Client | Week 5 |
| Business registration documents (required for gateway KYC) | Client | Week 4 |

---

## 3. Technology stack

Every choice below is justified against three criteria: **maturity** (proven at production scale), **maintainability** (we or a successor can support it in three years), and **appropriateness** (it fits a single-branch retail business, not a hypothetical unicorn).

### 3.1 Backend

| Component | Choice | Rationale |
| --- | --- | --- |
| Language / runtime | Java 21 (LTS) | Long-term support through 2031; virtual threads reduce the cost of blocking POS calls |
| Framework | Spring Boot 3.x | Industry standard, extensive ecosystem, strong security defaults |
| Persistence | Spring Data JPA + Hibernate | Mature ORM with a clear escape hatch to native SQL for reporting queries |
| Migrations | Flyway | Versioned, reviewable schema changes; non-negotiable for a system that syncs with an external source |
| Validation | Jakarta Bean Validation | Declarative request validation at the controller boundary |
| Mapping | MapStruct | Compile-time DTO mapping; avoids reflection overhead and runtime surprises |
| API documentation | springdoc-openapi | Generates the OpenAPI spec both frontends consume |
| Observability | Spring Boot Actuator + Micrometer | Health, metrics, and readiness endpoints out of the box |

### 3.2 Data layer

| Component | Choice | Rationale |
| --- | --- | --- |
| Primary database | PostgreSQL 16 | ACID guarantees for inventory and orders; JSONB for flexible product attributes; full-text search removes the need for a separate search engine at this scale |
| Cache / ephemeral state | Redis 7 | Stock reservations with native TTL expiry, rate limiting, session storage |
| Object storage | Cloudflare R2 or AWS S3 | Product images served via CDN; never store binaries in the database |

**Deliberately excluded:** Kafka, RabbitMQ, and any microservice split. A single-branch retailer does not generate the volume that justifies the operational burden. Asynchronous work is handled by the transactional outbox pattern (§6.4) with a scheduled worker — the same reliability guarantees at a fraction of the complexity. Introducing a message broker here would be resume-driven design, and it would be the thing that breaks at 2am when nobody remembers how it was configured.

### 3.3 Storefront

| Component | Choice | Rationale |
| --- | --- | --- |
| Framework | Next.js 15 (App Router) | **Server-side rendering is mandatory, not optional.** An e-commerce site that cannot be indexed by Google has no customers. A client-rendered SPA fails this outright |
| Language | TypeScript (strict mode) | Compile-time safety across the API boundary |
| Styling | Tailwind CSS | Consistent design tokens, no CSS specificity wars |
| Components | shadcn/ui | Accessible primitives we own the source of, not an opaque dependency |
| Server state | TanStack Query | Caching, deduplication, background refetch |
| Client state | Zustand | Cart state only; deliberately minimal |
| Forms | React Hook Form + Zod | Schema shared between client and server validation |

### 3.4 Admin panel

| Component | Choice | Rationale |
| --- | --- | --- |
| Framework | React 19 + Vite | SEO is irrelevant behind a login; an SPA gives faster interaction and simpler deployment |
| Data grid | TanStack Table | Sorting, pagination, and column control without a commercial licence |
| Charts | Recharts | Sufficient for dashboard visualisation, lightweight |
| Everything else | Same as §3.3 | One design system, one set of conventions, one thing to learn |

### 3.5 Third-party services

| Concern | Choice | Notes |
| --- | --- | --- |
| Payments | PayHere | Established Sri Lankan gateway; supports local cards, bank transfer, and mobile wallets |
| Transactional email | Brevo or Resend | Order confirmations, password resets |
| SMS | Text.lk or Dialog enterprise SMS | Materially higher engagement than email in the local market; budget for per-message cost |
| Error tracking | Sentry | Frontend and backend, with release tagging |
| Uptime monitoring | Better Stack or UptimeRobot | External check, alerting to phone |

### 3.6 Infrastructure and CI/CD

| Concern | Choice | Rationale |
| --- | --- | --- |
| Containerisation | Docker + Docker Compose | Reproducible environments; identical local and production topology |
| Hosting — application | VPS (Hetzner / DigitalOcean, 4 vCPU / 8 GB) | Predictable monthly cost; sufficient headroom for this workload |
| Hosting — storefront | Vercel or the same VPS | Vercel simplifies Next.js deployment; self-host if data residency is raised |
| Database hosting | Neon or managed PostgreSQL | Managed backups and point-in-time recovery. **Do not self-manage the production database on a first client project** |
| Reverse proxy / TLS | Caddy or Nginx + Let's Encrypt | Automatic certificate renewal |
| CI/CD | GitHub Actions | Build, test, security scan, deploy on merge to `main` |
| Secrets | Environment variables via Docker secrets; GitHub Actions secrets in CI | Never in the repository, never in the client's inbox |

---

## 4. System architecture

```
                        ┌────────────────────────┐
   Customers  ────────▶ │  Storefront (Next.js)  │ ─────┐
                        └────────────────────────┘      │
                                                        │  HTTPS / REST
                        ┌────────────────────────┐      │  (OpenAPI contract)
   Staff      ────────▶ │  Admin SPA (React)     │ ─────┤
                        └────────────────────────┘      │
                                                        ▼
                                        ┌───────────────────────────────┐
                                        │   API — Spring Boot           │
                                        │  ┌─────────────────────────┐  │
                                        │  │ Catalogue │ Orders      │  │
                                        │  │ Inventory │ Reporting   │  │
                                        │  │ Auth      │ Payments    │  │
                                        │  └─────────────────────────┘  │
                                        └───────┬───────────────┬───────┘
                                                │               │
                          ┌─────────────────────┴──┐    ┌───────┴────────┐
                          │  PostgreSQL            │    │  Redis         │
                          │  (source of truth      │    │  (reservations,│
                          │   for online commerce) │    │   rate limits) │
                          └─────────────────────┬──┘    └────────────────┘
                                                │
                                     ┌──────────┴───────────┐
                                     │  Sync Worker         │
                                     │  (scheduled + outbox)│
                                     └──────────┬───────────┘
                                                │
                                     ┌──────────┴───────────┐
                                     │  PosAdapter          │  ◀── the only
                                     │  «interface»         │      POS-aware
                                     └──────────┬───────────┘      code
                                                │
                    ┌───────────────┬───────────┴──────┬──────────────────┐
                    ▼               ▼                  ▼                  ▼
              MockPosAdapter  RestPosAdapter   DatabasePosAdapter  FileImportPosAdapter
              (development)   (POS has API)    (direct DB access)  (CSV / XML export)
```

**Architectural principles**

1. **The web platform is never dependent on POS availability for customer-facing operations.** If the POS is offline, customers can still browse, order, and pay.
2. **All POS-specific knowledge lives behind `PosAdapter`.** No POS type, field name, or quirk appears anywhere else in the codebase.
3. **All external side effects go through the outbox.** Order pushes, emails, and SMS are recorded in the same database transaction as the business change, then dispatched by a worker with retry.
4. **Modular monolith, not microservices.** Package-by-feature with enforced boundaries. Extraction remains possible later; premature distribution is not reversible cheaply.

---

## 5. Data model

Core entities, with the fields that specifically matter for POS reconciliation highlighted.

```sql
-- Every entity that mirrors POS data carries these three columns.
-- They are the difference between a debuggable sync and a mystery.
--   pos_external_id : the identifier the POS uses, nullable for web-only records
--   last_synced_at  : when we last successfully reconciled this row
--   sync_status     : SYNCED | PENDING | FAILED | WEB_ONLY

CREATE TABLE product (
    id                UUID PRIMARY KEY,
    slug              VARCHAR(255) NOT NULL UNIQUE,   -- SEO-stable URL segment
    name              VARCHAR(255) NOT NULL,
    description       TEXT,
    category_id       UUID REFERENCES category(id),
    status            VARCHAR(20)  NOT NULL,          -- DRAFT | ACTIVE | ARCHIVED
    attributes        JSONB,                          -- flexible, POS-specific extras
    pos_external_id   VARCHAR(100),
    last_synced_at    TIMESTAMPTZ,
    sync_status       VARCHAR(20)  NOT NULL DEFAULT 'WEB_ONLY',
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE product_variant (
    id                UUID PRIMARY KEY,
    product_id        UUID NOT NULL REFERENCES product(id),
    sku               VARCHAR(100) NOT NULL UNIQUE,   -- the join key against the POS
    option_values     JSONB        NOT NULL,          -- {"size":"M","colour":"Navy"}
    price_cents       BIGINT       NOT NULL,          -- integer minor units; never FLOAT
    compare_at_cents  BIGINT,
    pos_external_id   VARCHAR(100),
    UNIQUE (product_id, option_values)
);

CREATE TABLE inventory (
    variant_id        UUID PRIMARY KEY REFERENCES product_variant(id),
    quantity_on_hand  INTEGER NOT NULL,               -- last known POS figure
    quantity_reserved INTEGER NOT NULL DEFAULT 0,     -- held by in-flight checkouts
    safety_buffer     INTEGER NOT NULL DEFAULT 0,     -- withheld from online sale
    last_synced_at    TIMESTAMPTZ,
    CONSTRAINT quantity_non_negative CHECK (quantity_on_hand >= 0)
);
-- Sellable online = quantity_on_hand - quantity_reserved - safety_buffer

CREATE TABLE customer_order (
    id                UUID PRIMARY KEY,
    order_number      VARCHAR(20)  NOT NULL UNIQUE,   -- human-readable, e.g. WC-2026-00417
    customer_id       UUID REFERENCES customer(id),   -- nullable: guest checkout
    status            VARCHAR(30)  NOT NULL,          -- see state machine below
    subtotal_cents    BIGINT       NOT NULL,
    shipping_cents    BIGINT       NOT NULL,
    discount_cents    BIGINT       NOT NULL DEFAULT 0,
    total_cents       BIGINT       NOT NULL,
    currency          CHAR(3)      NOT NULL DEFAULT 'LKR',
    pos_transaction_ref VARCHAR(100),                 -- set once pushed to the POS
    pos_push_status   VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    placed_at         TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Order line items snapshot price and name at the time of purchase.
-- Never join to the live product table for historical orders: prices change,
-- products get archived, and an invoice must remain reproducible years later.
CREATE TABLE order_line (
    id                UUID PRIMARY KEY,
    order_id          UUID NOT NULL REFERENCES customer_order(id),
    variant_id        UUID REFERENCES product_variant(id),
    sku_snapshot      VARCHAR(100) NOT NULL,
    name_snapshot     VARCHAR(255) NOT NULL,
    unit_price_cents  BIGINT NOT NULL,
    quantity          INTEGER NOT NULL CHECK (quantity > 0)
);
```

**Two rules that are not negotiable:**

- **Money is stored as an integer in minor units (cents), never as a floating-point type.** Floating-point arithmetic on currency produces rounding errors that surface as a client accusing you of losing their money.
- **Order lines snapshot their data.** An order is a historical record, not a live view.

### 5.1 Order state machine

```
PENDING_PAYMENT ──▶ PAID ──▶ PROCESSING ──▶ SHIPPED ──▶ DELIVERED
       │                │           │
       ▼                ▼           ▼
    EXPIRED         REFUNDED    CANCELLED
```

Transitions are enforced in the service layer, not left to whatever the admin UI happens to send. Every transition writes an audit row recording the actor, timestamp, and reason.

---

## 6. POS integration strategy

### 6.1 Discovery — Week 1, before any integration code is written

Obtain written answers to the following. This questionnaire goes to the POS vendor, not to the client, because the client will not know:

1. Is there a documented HTTP API? Provide the specification and sandbox credentials.
2. What authentication does it use, and what are the rate limits?
3. Is direct database access possible, and if so read-only or read-write?
4. Does the system emit webhooks or events on sale and stock change?
5. What scheduled export formats are supported, and to where?
6. Is the POS cloud-hosted or installed on-premise? If on-premise, what is the network topology and is there a static IP?
7. What is the canonical product identifier, and is it stable across edits?
8. Does the POS support inbound sales records from an external channel?
9. What is the vendor's support SLA, and who pays for integration assistance?

**Whichever answers come back, the adapter interface does not change.** Only the implementation does.

### 6.2 Integration tiers

The answers place the project in one of four tiers. Each has a different cost and a different risk profile, and this table is the basis for the integration line item in the quotation:

| Tier | POS capability | Sync latency | Effort | Risk |
| --- | --- | --- | --- | --- |
| A | Documented REST API with webhooks | Near real-time | ~1 week | Low |
| B | Documented REST API, polling only | 2–5 minutes | ~2 weeks | Low–Medium |
| C | Direct database read access | 5–15 minutes | ~3 weeks | Medium — schema is undocumented and may change on POS upgrade |
| D | Scheduled file export only | 30–60 minutes | ~3–4 weeks | High — larger safety buffers required; overselling risk is real |

**Tier D is the case to plan for financially.** If the quotation assumes Tier A and the reality is Tier D, the project loses money. Quote the integration as a separate, tier-dependent line item, or price the whole engagement on the assumption of Tier C.

### 6.3 The adapter contract

```java
/**
 * Abstraction over the client's Point-of-Sale system.
 *
 * <p>Implementations encapsulate every POS-specific concern — transport,
 * authentication, field naming, and vendor quirks. No POS-native type may
 * cross this boundary; callers work exclusively with our own domain models.
 *
 * <p>Implementations must be idempotent and safe to retry: the sync worker
 * will re-invoke any operation that fails or times out.
 */
public interface PosAdapter {

    /**
     * Retrieves the product catalogue from the POS.
     *
     * @param modifiedSince restricts results to items changed after this instant;
     *                      {@code null} requests a full catalogue snapshot
     * @return catalogue entries in our domain model; empty list if none, never {@code null}
     * @throws PosUnavailableException if the POS cannot be reached
     */
    List<PosProduct> fetchProducts(@Nullable Instant modifiedSince);

    /**
     * Retrieves current stock levels for the given SKUs.
     *
     * <p>Separated from {@link #fetchProducts} because stock changes orders of
     * magnitude more frequently than product metadata and runs on a tighter
     * polling schedule.
     *
     * @param skus SKUs to query; implementations should batch according to the
     *             POS rate limit rather than issuing one request per SKU
     * @return map of SKU to quantity on hand; SKUs unknown to the POS are omitted
     */
    Map<String, Integer> fetchStockLevels(Collection<String> skus);

    /**
     * Pushes a confirmed web order into the POS so that it appears in the
     * client's normal sales reporting and decrements POS-side stock.
     *
     * <p>Callers must never fail a customer transaction because this method
     * throws. The order is already paid and persisted; a push failure is an
     * operational issue to be retried, not a customer-facing error.
     *
     * @return the POS-side transaction reference, retained for reconciliation
     * @throws PosUnavailableException if the POS cannot be reached
     * @throws PosRejectedException    if the POS refuses the order outright,
     *                                 which requires manual intervention
     */
    String pushOrder(Order order);

    /**
     * @return a lightweight health probe result, surfaced on the admin sync monitor
     */
    PosHealth checkHealth();
}
```

Four implementations are planned. `MockPosAdapter` is built first and is not throwaway code — it remains the fixture for the entire automated test suite for the life of the project.

### 6.4 Reliability: the transactional outbox

Order push must not be a naive HTTP call inside the checkout request. The pattern:

```java
/**
 * Places a customer order.
 *
 * <p>The order record and its outbox entry are written in a single database
 * transaction. This guarantees that we can never end up in a state where the
 * customer has been charged but no attempt to notify the POS was recorded —
 * the classic dual-write failure.
 *
 * <p>Actual delivery to the POS is performed asynchronously by
 * {@code OutboxDispatcher}, with exponential backoff and a dead-letter state
 * that raises an alert on the admin sync monitor.
 */
@Transactional
public Order placeOrder(CheckoutCommand command) {
    Order order = orderFactory.create(command);
    orderRepository.save(order);

    outboxRepository.save(OutboxEvent.of(
            OutboxEventType.POS_ORDER_PUSH,
            order.getId(),
            payloadSerializer.serialize(order)));

    return order;
}
```

### 6.5 Overselling prevention

Overselling is the failure mode that costs the client real money and real customer trust. It is the risk most likely to end a first client relationship badly, and it is controlled by four mechanisms in combination:

1. **Reservation on checkout initiation.** Stock is held in Redis with a 15-minute TTL when the customer enters checkout, released automatically on expiry or abandonment.
2. **Safety buffer per variant.** A configurable quantity withheld from online sale, sized according to the integration tier. Tier D warrants an aggressive buffer.
3. **Optimistic locking on inventory rows.** Concurrent checkouts on the last unit cannot both succeed.
4. **Reconciliation job.** A nightly comparison of web stock against POS stock, with a discrepancy report delivered to the admin dashboard.

Additionally: **the client must be told, in writing and before launch, that no integration is instantaneous and that occasional discrepancies are inherent to selling the same inventory through two channels.** Set that expectation during the proposal, not during the first incident.

---

## 7. Delivery phases

Each phase ends with a working demonstration on a staging environment. Nothing is "done" because it is written; it is done when the client has seen it running.

### Phase 0 — Foundations (Week 1–2)

- Repository structure, branch strategy, commit conventions
- Docker Compose local environment (API, Postgres, Redis)
- CI pipeline: build, test, lint, dependency vulnerability scan
- Staging environment provisioned and reachable
- Flyway baseline schema
- Authentication and role model
- **POS discovery questionnaire issued and chased**

*Exit criteria:* a developer clones the repository and has a running system in one command; a commit to `main` deploys to staging automatically.

### Phase 1 — Catalogue and admin core (Week 3–5)

- Product, variant, category, and inventory domain and API
- `MockPosAdapter` with realistic seed data
- Admin panel shell: layout, navigation, authentication flow
- Product CRUD with image upload
- Stock view with manual adjustment and audit log

*Exit criteria:* the client can log into staging and enter their real product catalogue by hand. This matters more than it sounds — from this point onward every demonstration uses their data, not placeholders.

### Phase 2 — Storefront and checkout (Week 6–8)

- Catalogue browsing, search, filtering, product detail pages
- Cart with persistence across sessions
- Guest and registered checkout flows
- Payment gateway integration in sandbox
- Order confirmation, email and SMS notification
- Customer accounts and order history

*Exit criteria:* an end-to-end purchase completes on staging using sandbox payment credentials.

### Phase 3 — POS integration (Week 9–11)

- Real adapter implementation for the confirmed tier
- Sync worker: catalogue pull, stock pull, order push
- Outbox dispatcher with retry and dead-lettering
- Admin sync monitor and reconciliation report
- Integration testing against the POS sandbox or a staging copy

*Exit criteria:* a product edited in the POS appears online within the agreed latency, and a web order appears in the POS.

**This phase carries the schedule risk.** If POS discovery in Phase 0 returns Tier D or the vendor is unresponsive, this phase expands. Phases 1 and 2 are deliberately sequenced first so that a saleable product exists even if integration is delayed.

### Phase 4 — Dashboard, hardening, launch (Week 12–14)

- Sales dashboard with aggregation views
- Discount codes
- Performance tuning and load testing
- Security review against the checklist in §8
- Accessibility pass
- Production environment, DNS cutover, TLS
- Payment gateway moved to live credentials
- Staff training session and handover documentation
- Soft launch: live but unadvertised, monitored for one week

*Exit criteria:* §14 definition of done is fully satisfied.

---

## 8. Security

Non-negotiable controls, verified before launch:

**Authentication and session management**
- Passwords hashed with BCrypt (work factor 12) or Argon2id
- Short-lived JWT access tokens with refresh tokens in `HttpOnly`, `Secure`, `SameSite=Strict` cookies
- Rate limiting on login, registration, and password reset
- Account lockout with exponential backoff after repeated failures
- Mandatory role check on every admin endpoint — enforced by default-deny configuration, not by remembering to annotate

**Application**
- Parameterised queries throughout; no string-concatenated SQL anywhere
- Server-side authorisation on every request; the UI hiding a button is not access control
- Input validation at the controller boundary using Bean Validation
- Output encoding and a restrictive Content-Security-Policy header
- CSRF protection on cookie-authenticated endpoints
- File upload restrictions: type allowlist, size cap, content-type verification, randomised storage filenames, served from a separate origin

**Payments**
- **Card data never touches our servers or database.** The gateway's hosted checkout handles it. This is not a preference; handling card data directly triggers PCI-DSS obligations that a small studio cannot meet.
- Payment webhooks verified by signature before the order status is changed
- Order totals recalculated server-side at payment initiation; never trust a client-supplied amount

**Infrastructure and data**
- TLS 1.3 enforced, HTTP redirected, HSTS enabled
- Secrets in environment variables or a secret manager, never in the repository
- Database not exposed to the public internet
- Automated daily backups with **a documented restore that has actually been performed and timed at least once**
- Dependency scanning in CI, with a defined patching cadence
- Audit logging on all administrative actions

**Privacy**
- Collect only what is needed; document what is collected and why
- Publish a privacy policy and terms of service before launch
- Implement customer data export and deletion capability
- Encrypt personal data at rest

---

## 9. Quality assurance

| Layer | Tooling | Target |
| --- | --- | --- |
| Unit — backend | JUnit 5, AssertJ, Mockito | 80% coverage on service and domain layers |
| Integration — backend | Testcontainers (real PostgreSQL and Redis) | All repositories and adapters |
| Contract | OpenAPI schema validation in CI | Zero drift between spec and implementation |
| Unit — frontend | Vitest, React Testing Library | Critical components and hooks |
| End-to-end | Playwright | Browse → cart → checkout → payment → confirmation; full admin product lifecycle |
| Load | k6 | 200 concurrent users, p95 response under 500 ms |
| Security | OWASP Dependency-Check, npm audit, Trivy image scan | No high or critical findings at launch |
| Accessibility | axe-core in the Playwright suite | WCAG 2.1 AA on customer-facing pages |

**Concurrency test cases that must exist**, because these are where money is lost:

- Two customers checking out the last unit simultaneously
- Payment webhook arriving before the checkout response is returned
- Duplicate payment webhook delivery (gateways retry)
- POS unavailable at the moment of order push
- POS returning a stock figure lower than active web reservations
- Customer closing the browser mid-payment

Every defect found in production gets a regression test before the fix is deployed. That practice is what stops a first client project from degrading into a permanent support burden.

---

## 10. Operations

**Environments:** local (Docker Compose) → staging (production-equivalent, sanitised data) → production. No manual changes to production, ever.

**Deployment:** merge to `main` triggers build, test, image publication, and deploy to staging. Production deployment is a manual approval step from the same pipeline.

**Monitoring and alerting:**
- Uptime check every minute, alerting to phone
- Sentry error alerts routed to the on-call developer
- Sync failure alerts on the admin dashboard and by email
- Payment webhook failure alerts — highest priority
- Weekly automated summary: orders, revenue, error rate, sync health

**Backups:** automated daily database backup with 30-day retention and point-in-time recovery. Restore drill performed and documented in Phase 4, and repeated quarterly.

**Support model:** define and price this before launch. A reasonable structure is a 30-day post-launch warranty covering defects, followed by a monthly retainer covering hosting, monitoring, security patching, and a defined number of change-request hours. Agree the response times in writing.

---

## 11. Risk register

| # | Risk | Impact | Likelihood | Mitigation |
| --- | --- | --- | --- | --- |
| R1 | POS has no usable integration surface (Tier D) | High | Medium | Adapter abstraction; file-import implementation; tier-based pricing agreed in the contract |
| R2 | POS vendor unresponsive or charges for integration support | High | Medium | Escalate through the client in Week 1; the client owns the vendor relationship and the cost |
| R3 | Overselling due to sync latency | High | Medium | Reservations, safety buffers, reconciliation job, expectations set in writing pre-launch |
| R4 | Scope creep from informal client requests | High | **High** | Written scope (§2); all additions go through a change-request form with cost and schedule impact |
| R5 | Client delays on product data and photography | Medium | High | Dependencies table with owners and dates (§2.3); schedule slips by the delay, communicated immediately |
| R6 | Payment gateway approval delayed by KYC | Medium | Medium | Initiate merchant account application in Week 1, not Week 6 |
| R7 | POS schema changes after a vendor upgrade (Tier C) | High | Medium | Contract tests against the POS schema in CI; alert on unexpected shape |
| R8 | Performance degradation as order volume grows | Medium | Low | Aggregation views for reporting from day one; load testing in Phase 4 |
| R9 | Key-person dependency — single developer | High | Medium | Documentation as a deliverable, not an afterthought; conventional structure any Spring developer can pick up |
| R10 | Fixed price quoted against unknown integration effort | High | **High** | Quote integration separately by tier, or price on a Tier C assumption |

R4 and R10 are the two most likely to damage a first engagement, and neither is a technical problem. Both are solved with paperwork before the first line of code.

---

## 12. Commercial safeguards

Written into the contract before work starts:

1. **Payment schedule tied to phase completion** — for example 25% on signing, then 20/20/20/15 on phase acceptance. Never a single payment on delivery.
2. **Integration priced as a separate tier-dependent line item**, with the tier determined by the Phase 0 discovery outcome.
3. **A change-request process.** Every addition outside §2.1 is quoted in cost and schedule before it is built. Verbal agreement to build something extra "quickly" is how first projects become unprofitable.
4. **Client dependency dates**, with an explicit statement that client delay shifts the delivery date by the same duration.
5. **Third-party costs passed through and named**: hosting, domain, SMS credits, gateway transaction fees, any POS vendor charges. The client should never be surprised by a recurring bill.
6. **Acceptance criteria defined per phase** so "done" is a shared definition rather than an argument.
7. **Intellectual property and source-code ownership** stated explicitly.
8. **Post-launch support terms and rates**, with the warranty period distinguished from paid maintenance.

---

## 13. Handover

Delivered at the end of Phase 4:

- Staff operations manual with screenshots, in both English and Sinhala if the client requests it
- A recorded training session on adding products, processing orders, and reading the dashboard
- Technical documentation: architecture, deployment runbook, environment variable reference, backup and restore procedure
- Credential handover through a password manager, with an inventory of every account created
- A documented incident escalation path
- A named list of known limitations and deferred items — deliver this proactively; discovering a limitation later feels like concealment even when it was always understood

---

## 14. Definition of done

Launch proceeds only when every item is verified:

- [ ] End-to-end purchase completed on production with a real payment and a real refund
- [ ] Order appears correctly in the POS
- [ ] Stock decrements correctly in both systems
- [ ] Full test suite green in CI
- [ ] Load test meets the p95 target
- [ ] Zero high or critical security findings
- [ ] Lighthouse performance and SEO scores above 90 on the storefront
- [ ] Accessibility scan clean at WCAG 2.1 AA
- [ ] Backup restore performed and timed
- [ ] Monitoring and alerting confirmed by triggering a test alert
- [ ] Privacy policy and terms published
- [ ] Client staff trained and documentation delivered
- [ ] Rollback procedure documented and tested

---

## Appendix A — Immediate next actions

| # | Action | Owner | Due |
| --- | --- | --- | --- |
| 1 | Issue the POS discovery questionnaire (§6.1) | Spellbound | Day 1 |
| 2 | Confirm the client's POS product name and version | Client | Day 2 |
| 3 | Begin payment gateway merchant application | Client | Day 3 |
| 4 | Finalise scope document and obtain written sign-off | Both | Day 5 |
| 5 | Provision repository, CI, and staging environment | Spellbound | Week 1 |
| 6 | Agree the phase-linked payment schedule | Both | Before Phase 1 |
