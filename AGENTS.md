# AGENTS.md

Context for AI coding agents working in this repository. Point your agent at
this file before starting a task. Human contributors: see `docs/team-charter.md`.

## Project

E-commerce platform for a Sri Lankan retailer that already operates a POS
system. Monorepo. The web platform owns its own database as the source of
truth for online commerce and reconciles with the POS through a swappable
adapter.

## Stack

- **Backend** — Java 21, Spring Boot 3.4, Spring Data JPA, Flyway, MapStruct,
  Lombok, springdoc-openapi
- **Database** — PostgreSQL 16; Redis 7 for stock reservations and rate limits
- **Storefront** — Next.js 15 App Router, React 19, TypeScript strict
- **Admin** — React 19, Vite, TypeScript strict
- **Styling** — Tailwind CSS with tokens from `packages/ui`
- **Data** — TanStack Query; React Hook Form + Zod
- **Testing** — JUnit 5, Testcontainers, Vitest, React Testing Library, MSW,
  Playwright

## Layout

```
apps/api          Spring Boot, packaged by feature
apps/storefront   Next.js
apps/admin        React + Vite
packages/ui       Design system — shared components and tokens
packages/api-client  Generated from openapi.yaml — never hand-edit
```

Backend packages are organised by feature (`catalogue`, `inventory`,
`ordering`, `payment`, `customer`, `reporting`, `pos`, `outbox`, `shared`),
not by layer. A feature is reached only through its `api` package or its
top-level service — never by touching another feature's repositories.

## Conventions

- **Money is a `long` of minor units (cents).** Never `double`, never `float`.
- **Order lines snapshot name, SKU, and price.** Historical orders never join
  to live product data.
- Every entity mirroring POS data carries `pos_external_id`,
  `last_synced_at`, `sync_status`.
- Commits follow Conventional Commits:
  `type(scope): subject`, scopes `api|storefront|admin|ui|client|infra|deps`.
- Migrations are timestamp-prefixed: `V20260723143000__description.sql`.
  **Never edit an existing migration — always add a new one.**
- Tailwind classes only; no inline styles, no CSS-in-JS.
- Mobile-first. Base styles are the mobile styles.
- All UI needs loading, empty, and error states — not just the happy path.

## Hard boundaries — do not modify without the owner's involvement

- `apps/api/.../shared/` — auth, security, config, exceptions, money types
- `apps/api/.../pos/` and `.../outbox/` — integration and reliability core
- `apps/api/src/main/resources/db/migration/` — every migration is human-reviewed
- `apps/api/src/main/resources/openapi.yaml` — changed only in its own PR
- `packages/ui/` — single-owner design system
- `.github/` and `docker/` — CI and deployment

## Rules

1. Do not add dependencies. Propose them; a human approves.
2. Do not write database migrations unsupervised.
3. Never emit real credentials, keys, or customer data — not in code, not in
   tests, not in fixtures. Use obviously fake values.
4. Do not disable a linter rule or a type check to make something pass.
5. Do not weaken a test to make it green.
6. Tests must assert behaviour, not restate the implementation. A test that
   passes when the feature is broken is worse than no test.
7. Prefer editing an existing file over creating a new one.
8. Keep changes scoped to the task. Unrelated "improvements" make review
   harder and get the whole PR rejected.

## Commands

```bash
pnpm dev                              # run all three apps
pnpm generate:api                     # regenerate client + mocks from the spec
pnpm -r test                          # frontend tests
pnpm -r lint                          # frontend lint
cd apps/api && ./gradlew test         # backend tests
cd apps/api && ./gradlew build        # full backend build
docker compose -f docker/docker-compose.yml up -d
```

## Areas where agent output needs extra human scrutiny

Concurrency around stock reservations · money arithmetic and rounding · the
POS adapter, since the real POS behaviour is unknown · security configuration
· database schema design. Draft here if asked, but flag clearly that a human
must verify.
