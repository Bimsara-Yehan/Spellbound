# Engineering Handbook
## E-Commerce Platform with POS Integration

**Status:** Decisions finalized — this document is the source of truth for how we work.
**Owner:** Spellbound
**Revision:** 1.0

---

## 1. What we can start today

The POS integration is the only genuinely blocked work. Everything else is ready to begin.

| Work | Status | Blocked by |
| --- | --- | --- |
| Repository, CI, branch protection | **Start today** | — |
| Docker Compose local environment | **Start today** | — |
| Database schema and migrations | **Start today** | — |
| OpenAPI contract | **Start today** | — |
| Design system and tokens | **Start today** | Brand direction (§8) — a half-day conversation, not a blocker |
| Admin panel UI | **Start today** | — |
| Storefront UI | **Start today** | — |
| Catalogue, inventory, order APIs | **Start today** | — |
| `MockPosAdapter` | **Start today** | — |
| Payment integration | Week 6 | Client's PayHere merchant approval (2–3 weeks of KYC) |
| Real POS adapter | Week 9 | POS vendor questionnaire response |
| Production deployment | Week 12 | Domain, DNS, live gateway credentials |

**The one thing to do before writing any code:** send the POS discovery questionnaire. It has a multi-week latency and everything downstream of Week 9 depends on it. Send it today, then start building.

---

## 2. Repository strategy — decided

**One monorepo.** `spellbound`.

Three separate repositories would mean that a single change to a field name requires three PRs, merged in the right order, with a window in between where the system is broken. For a team of one to three people shipping against a shared API contract, that overhead buys nothing.

The monorepo means one PR can change the OpenAPI spec, the Spring Boot controller, the generated client, and both frontends atomically — and CI verifies the whole thing together.

```
spellbound/
├── apps/
│   ├── api/                  # Spring Boot 3 · Java 21 · Gradle
│   ├── storefront/           # Next.js 15 · App Router
│   └── admin/                # React 19 · Vite
├── packages/
│   ├── api-client/           # TypeScript client generated from the OpenAPI spec
│   ├── ui/                   # Shared design system: tokens + primitives
│   └── config/               # Shared ESLint, TypeScript, Tailwind config
├── docs/
│   ├── engineering-handbook.md
│   ├── implementation-plan.md
│   ├── adr/                  # Architecture Decision Records, numbered
│   └── runbook.md
├── docker/
│   ├── docker-compose.yml    # postgres · redis · mailpit · minio
│   └── Dockerfile.api
├── .github/
│   ├── workflows/ci.yml
│   └── pull_request_template.md
├── package.json              # pnpm workspace root
└── pnpm-workspace.yaml
```

Java tooling (Gradle) and JavaScript tooling (pnpm) coexist without conflict — they simply ignore each other's directories. CI runs them as separate jobs.

### API package layout

Package by **feature**, not by layer. `controller/`, `service/`, `repository/` at the top level scatters one feature across three folders and makes boundaries impossible to enforce.

```
com.spellbound
├── catalogue/          # Product, Variant, Category
│   ├── api/            # Controllers + DTOs — the only public surface
│   ├── domain/         # Entities + domain logic
│   ├── persistence/    # Repositories
│   └── CatalogueService.java
├── inventory/
├── ordering/
├── payment/
├── customer/
├── reporting/
├── pos/                # PosAdapter interface + all implementations
├── outbox/             # Transactional outbox + dispatcher
└── shared/             # Cross-cutting: auth, config, exceptions, money
```

**Rule:** a feature package may only be called through its `api` package or its top-level service. No cross-package repository access. This is what keeps a modular monolith modular.

---

## 3. Branching model — decided

**Trunk-based development with short-lived feature branches.** Not GitFlow.

GitFlow's `develop` / `release` / `hotfix` branch structure exists to coordinate infrequent, manually-QA'd releases across large teams. We deploy on merge. Adopting it here would add three long-lived branches and a merge-conflict tax in exchange for nothing.

```
main ────●────●────●────●────●────●────●────●──▶  always deployable
          \        /      \        /      \
           ●──●──●         ●──●──●         ●──●
        feat/PROJ-14    fix/PROJ-22     feat/PROJ-31
        (≤ 3 days)      (hours)         (≤ 3 days)

Tags on main mark production releases:   v0.1.0 ──▶ v0.2.0 ──▶ v1.0.0
```

### Rules

| Rule | Value |
| --- | --- |
| Long-lived branches | `main` only |
| Branch lifetime | 3 days maximum. Longer means the work was not broken down enough |
| Integration | Rebase onto `main` before opening a PR; never merge `main` into a feature branch |
| Merge strategy | **Squash merge.** One commit per PR on `main`, linear history |
| Deletion | Branch deleted automatically on merge |
| Staging deploy | Automatic on every merge to `main` |
| Production deploy | Manual approval, triggered by an annotated tag on `main` |

### Branch naming

```
<type>/<ticket-id>-<short-kebab-description>
```

| Type | Use for |
| --- | --- |
| `feat` | New user-facing capability |
| `fix` | Defect repair |
| `refactor` | Behaviour-preserving internal change |
| `chore` | Build, dependencies, tooling, config |
| `docs` | Documentation only |
| `test` | Tests only |
| `spike` | Timeboxed investigation — **never merged**, always deleted |

```bash
# Correct
feat/PROJ-14-product-variant-editor
fix/PROJ-22-cart-total-rounding
chore/PROJ-30-upgrade-spring-boot

# Wrong
bimsara-work          # who, not what
new-feature           # what feature?
fix                   # fix of what?
```

### Branch protection on `main`

Configure these in GitHub settings on day one, before the first commit. Retrofitting protection after bad habits form does not work.

- [ ] Direct pushes blocked, including for administrators
- [ ] Pull request required before merging
- [ ] One approving review required (see solo-developer note below)
- [ ] All CI status checks must pass
- [ ] Branches must be up to date before merging
- [ ] Linear history required
- [ ] Force pushes and deletions blocked
- [ ] Conversation resolution required before merge

**Working solo?** Keep every rule except the approval requirement. Instead, self-review your own PR in the GitHub diff view before merging, working through the PR checklist. Reading your own diff as a diff — rather than as the editor buffer you just wrote it in — catches a surprising amount. When a second developer joins, turn the approval requirement back on the same day.

### Daily commands

```bash
# Start work
git checkout main
git pull --rebase origin main
git checkout -b feat/PROJ-14-product-variant-editor

# During work — commit often, locally
git add -p                                  # stage in reviewable chunks
git commit -m "feat(admin): add variant option editor"

# Before opening the PR — replay your work on top of current main
git fetch origin
git rebase origin/main
git push --force-with-lease origin feat/PROJ-14-product-variant-editor
```

`--force-with-lease` rather than `--force`: it refuses the push if someone else has updated the remote branch since your last fetch. On a shared branch this is the difference between a safe rewrite and destroying a colleague's work.

---

## 4. Commit convention — decided

**Conventional Commits**, enforced by commitlint in a git hook and re-checked in CI.

```
<type>(<scope>): <subject>

[optional body — the why, never the what]

[optional footer: BREAKING CHANGE, Refs: PROJ-14]
```

**Types:** `feat` · `fix` · `refactor` · `perf` · `test` · `docs` · `chore` · `build` · `ci`
**Scopes:** `api` · `storefront` · `admin` · `ui` · `client` · `infra` · `deps`

```bash
feat(admin): add stock adjustment with audit trail
fix(api): prevent negative inventory on concurrent checkout
refactor(storefront): extract cart total calculation into a hook
chore(deps): upgrade Spring Boot to 3.4.2
```

Subject in the imperative mood, lower case, no trailing period, under 72 characters. The body explains *why* — the diff already shows *what*.

This is not bureaucracy for its own sake. Because we squash-merge, the PR title becomes the commit on `main`, which means the commit history is directly readable as a changelog and `git log --grep="^fix(api)"` becomes a genuinely useful query when something breaks in production six months from now.

---

## 5. Environments

| Environment | Trigger | Database | Payment gateway | Purpose |
| --- | --- | --- | --- | --- |
| **Local** | `docker compose up` | Ephemeral Postgres container | Sandbox | Development |
| **Staging** | Auto-deploy on merge to `main` | Persistent, sanitised data | Sandbox | Client demos, QA, E2E suite |
| **Production** | Manual approval on a version tag | Managed Postgres with PITR | Live | Real customers |

Three absolute rules:

1. **Never test on production.** Not "just this once", not for a five-minute check.
2. **Never copy production data to staging unmasked.** Real customer names, phone numbers, and addresses do not belong in a demo environment.
3. **Never make a manual change to production.** Every production change arrives through the pipeline. A hand-edited config that nobody documented is the incident you cannot diagnose at 2am.

---

## 6. The contract-first workflow

This is what lets UI work proceed at full speed while the backend is still being built.

```
  1. Write / update the OpenAPI spec          apps/api/src/main/resources/openapi.yaml
                    │
                    ├──▶ 2. Generate TypeScript client        packages/api-client
                    │
                    ├──▶ 3. Generate MSW mock handlers        packages/api-client/mocks
                    │
                    └──▶ 4. Spring Boot implements the spec   apps/api
                                    │
                    5. CI fails the build if the running API drifts from the spec
```

`pnpm generate:api` regenerates the client and mocks. Run it whenever the spec changes.

With Mock Service Worker intercepting requests at the network layer, both frontends run against realistic, spec-accurate responses **before a single controller exists**. The same mocks power the component tests. When the real endpoint lands, you delete one line from the MSW setup and nothing else changes.

**The rule that makes this work:** the spec is written first and reviewed as its own PR. A backend that ships an endpoint the spec does not describe, or a frontend that consumes a field the spec does not declare, is a bug — caught by CI, not by a person.

---

## 7. Design system — decide this week

UI work stalls when developers make one-off styling decisions per screen. Two weeks in you have five shades of grey, four button sizes, and no way to change any of it. Fix the tokens first.

### Decide now (structural — independent of brand)

```css
/* packages/ui/src/tokens.css */

/* Spacing — 4px base unit. Every margin and padding is a multiple. */
--space-1:  0.25rem;   /*  4px */
--space-2:  0.5rem;    /*  8px */
--space-3:  0.75rem;   /* 12px */
--space-4:  1rem;      /* 16px */
--space-6:  1.5rem;    /* 24px */
--space-8:  2rem;      /* 32px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */

/* Type scale — 1.25 ratio (major third). Restrained enough for
   commerce, where product names and prices matter more than display type. */
--text-xs:   0.75rem;
--text-sm:   0.875rem;
--text-base: 1rem;
--text-lg:   1.25rem;
--text-xl:   1.563rem;
--text-2xl:  1.953rem;
--text-3xl:  2.441rem;

/* Breakpoints — mobile-first. Sri Lankan e-commerce traffic is
   predominantly mobile, so the base styles ARE the mobile styles. */
--bp-sm:  640px;
--bp-md:  768px;
--bp-lg:  1024px;
--bp-xl:  1280px;
```

Also fix now, before any component is written: border radius scale, shadow scale, focus ring style, transition durations, and the container max-width.

### Decide with the client (brand — do not guess)

Palette, display typeface, body typeface, photography treatment, and logo application all depend on what the shop actually sells and what identity they already have offline. **Do not invent these.** A jewellery boutique, a hardware supplier, and a children's clothing shop need three genuinely different visual languages, and picking one before you know which is how you end up rebuilding the storefront in Week 10.

Book a one-hour session with the client covering:

- Existing brand assets — logo files, colours in use, printed material, shopfront signage
- Their three favourite competitor or aspirational sites, and specifically *what* they like about each
- Who buys from them, and on what device
- Whether the site should feel like an extension of the physical shop or something distinct

Produce two directions, not five. Five options means the client picks by committee and you build a compromise.

### Component inventory — build in this order

Every one of these is used by both applications, so they live in `packages/ui` and get built once.

**Tier 1 (blocks everything):** Button · Input · Select · Checkbox · Radio · Label · FormField · Card · Badge
**Tier 2 (blocks most screens):** Table · Modal · Drawer · Toast · Tabs · Dropdown · Pagination · Skeleton · EmptyState
**Tier 3 (feature-specific):** ImageUploader · PriceInput · QuantityStepper · StatusPill · DateRangePicker

Build Tier 1 completely before starting any screen. It is roughly two days and it saves a fortnight.

---

## 8. Admin panel — UI build order

Admin comes before storefront. Not because it is more important, but because **admin is what gets real data into the system**, and every storefront demo after that point shows the client their own products instead of placeholder text. That single fact changes how client meetings go for the rest of the project.

Build in this order — each item depends on the ones above it.

| # | Screen | Notes |
| --- | --- | --- |
| 1 | App shell | Sidebar, topbar, breadcrumbs, responsive collapse, route guard |
| 2 | Login | Plus forgot-password and session expiry handling |
| 3 | Category management | List, create, edit, reorder. Products need somewhere to go |
| 4 | Product list | Table with search, filter, pagination, bulk select |
| 5 | Product create/edit — core fields | Name, slug, description, category, status |
| 6 | Image upload and gallery | Drag-reorder, set primary, delete. The fiddliest screen in the admin panel — budget accordingly |
| 7 | Variant editor | Option types, generated combinations, per-variant SKU and price |
| 8 | Inventory list | Stock levels, low-stock highlight, manual adjustment with mandatory reason |
| 9 | Order list | Filter by status and date, search by order number |
| 10 | Order detail | Line items, customer, addresses, payment state, status transitions |
| 11 | Dashboard | Build last. Its aggregation queries need real orders to be meaningful |
| 12 | Discount codes | Create, set constraints, view usage |
| 13 | POS sync monitor | Last sync, failures, manual re-sync. Needed before integration testing |
| 14 | Staff and roles | Invite, assign role, deactivate |

**Milestone after #8:** hand the client staging credentials and ask them to enter their real catalogue. Everything after that is demonstrated with their own data.

---

## 9. Storefront — UI build order

| # | Screen | Notes |
| --- | --- | --- |
| 1 | Layout shell | Header, mobile nav, footer, cart indicator. Server components where possible |
| 2 | Home | Featured categories, promoted products, hero |
| 3 | Category listing (PLP) | Grid, filters, sort, pagination. **Server-rendered — this is the page Google indexes** |
| 4 | Product detail (PDP) | Gallery, variant selector, stock state, add to cart, structured data markup |
| 5 | Cart | Drawer plus a full page. Quantity edit, remove, totals |
| 6 | Checkout — address | Guest and authenticated paths, saved addresses |
| 7 | Checkout — delivery | Method selection, fee calculation |
| 8 | Checkout — payment | Online or cash on delivery, order summary, gateway handoff |
| 9 | Payment return | Success, failure, and pending states. **Handle all three** — customers close the tab mid-payment |
| 10 | Order confirmation | Order number, summary, what happens next |
| 11 | Auth | Register, login, forgot password, reset |
| 12 | Account | Order history, order detail, saved addresses, profile |
| 13 | Search results | Postgres full-text, with a considered empty state |
| 14 | Static pages | About, contact, delivery policy, returns policy, privacy policy, terms |

**Do not leave #14 to the end.** The payment gateway's merchant approval process requires published terms, privacy, and refund policies. Missing pages will delay gateway approval, which delays launch.

---

## 10. Sprint 1 — the next two weeks

Two-week sprints. Sprint 1 is Phase 0 plus the start of Phase 1.

### Week 1 — foundations

| Ticket | Task | Est. |
| --- | --- | --- |
| PROJ-1 | Send the POS discovery questionnaire to the vendor | 1h |
| PROJ-2 | Create the monorepo, pnpm workspace, three app skeletons | 4h |
| PROJ-3 | Configure branch protection and the PR template | 1h |
| PROJ-4 | Docker Compose: Postgres, Redis, Mailpit, MinIO | 3h |
| PROJ-5 | CI pipeline: build, test, lint, dependency scan | 6h |
| PROJ-6 | Flyway baseline schema — catalogue, inventory, orders | 8h |
| PROJ-7 | OpenAPI spec v0.1 — catalogue and auth endpoints | 6h |
| PROJ-8 | Client design session; produce two visual directions | 6h |
| PROJ-9 | Provision the staging environment; verify auto-deploy | 6h |

### Week 2 — auth and design system

| Ticket | Task | Est. |
| --- | --- | --- |
| PROJ-10 | Spring Security config, JWT issue and refresh, role model | 10h |
| PROJ-11 | Auth endpoints plus integration tests with Testcontainers | 6h |
| PROJ-12 | Design tokens finalized in `packages/ui` | 4h |
| PROJ-13 | Tier 1 components: Button, Input, Select, Checkbox, Label, FormField, Card, Badge | 12h |
| PROJ-14 | Generated API client and MSW mock setup | 4h |
| PROJ-15 | Admin app shell with route guards | 6h |
| PROJ-16 | Admin login screen wired to the real auth API | 4h |

**Sprint 1 exit criteria:** a developer clones the repo and has a running system in one command; a merge to `main` deploys to staging automatically; you can log into the admin panel on staging with a real account.

That last item matters more than it looks. It proves the entire chain — repo, CI, deploy, database, backend, frontend, auth — works end to end. Everything after it is filling in features on a proven spine.

---

## 11. Definition of ready / done

A ticket is **ready** to start when it has: a clear title, acceptance criteria, a design reference if it is UI work, an API contract reference if it consumes data, and an estimate.

A ticket is **done** when:

- [ ] Acceptance criteria met
- [ ] Tests written and passing — unit for logic, integration for endpoints
- [ ] No new linter or type errors
- [ ] Responsive from 360px upward, if it is UI
- [ ] Keyboard navigable with a visible focus state, if it is UI
- [ ] Loading, empty, and error states handled — not just the happy path
- [ ] Self-reviewed as a diff in the GitHub UI
- [ ] CI green
- [ ] Merged and verified on staging

The loading/empty/error line is the one most often skipped and most often reported as a bug. A screen that only handles the success case is roughly half-finished.

---

## 12. What NOT to build yet

Discipline here is what protects the schedule. Each of these is a real feature that a reasonable person will ask for. Write them down, quote them separately, build them later.

- Wishlists and product reviews
- Multi-language interface (Sinhala or Tamil) — architect for it, do not build it
- Abandoned-cart email sequences
- Loyalty points, store credit, gift cards
- Advanced faceted search or a dedicated search engine
- Product recommendations
- Any admin analytics beyond the Phase 1 dashboard
- Mobile applications
- Multi-branch inventory
- Bulk CSV product import — unless POS discovery returns Tier D, in which case it becomes core

When one of these is requested mid-sprint, the answer is never "no." It is: "yes — that's outside the agreed scope, so let me price it and we can schedule it." Written down, quoted, scheduled. Every time, including the small ones, and including with a client you like.
