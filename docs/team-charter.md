# Team Charter
## E-Commerce Platform with POS Integration — Spellbound

**Audience:** all five team members
**Status:** Active. This document governs how we work. Read it fully before your first commit.
**Revision:** 1.0 — 23 July 2026

---

## 1. How to use this document

Read sections 2 through 4 today. They tell you what you own and how code gets from your machine into the product. The rest is reference — come back to it when you need it.

If something here conflicts with what you were told verbally, this document wins. If this document is wrong, raise it and we change it here, so everyone gets the correction at once.

Three documents make up the full picture:

| Document | What it answers |
| --- | --- |
| `implementation-plan.md` | What we are building, in what order, and why |
| `engineering-handbook.md` | How the system is structured; conventions and build order |
| **This document** | Who does what, and how we work together |
| `developer-setup-guide.md` | How to get your machine running |

---

## 2. The team

| Member | Role | Owns |
| --- | --- | --- |
| **Bimsara** | Tech lead | Architecture, security and authentication, POS integration layer, outbox and sync worker, infrastructure and CI/CD, release management, client communication, final review on every PR |
| **Deeghayu** | Backend engineer — Catalogue | Product, variant, category, and inventory domains; stock reservation logic; reporting and dashboard APIs |
| **Malindu** | Backend engineer — Commerce | Ordering, checkout, payment gateway integration, customer accounts, notifications (email and SMS) |
| **Rashmika** | Frontend engineer — Admin | The entire admin panel: 14 screens, data tables, forms, dashboard |
| **Shanuka** | Frontend engineer — Design & storefront | The design system (`packages/ui`), visual direction, and the customer-facing storefront |

### Why the split falls this way

The two backend domains are separated along the boundary where they interact least. Catalogue and inventory are read-heavy and change slowly. Ordering and payment are write-heavy, transactional, and touch money. Splitting there means Deeghayu and Malindu rarely edit the same file.

Shanuka owns the design system *and* the storefront because visual quality is one person's judgement or it is nobody's. Splitting the storefront between two people produces a site that looks like it was built by two people. The design system work front-loads into roughly two days, then feeds both applications.

**A planned rebalance:** the storefront is heavier than the admin panel in Weeks 6–8. Once the admin core (screens 1–8) is complete, Rashmika moves onto storefront screens under Shanuka's direction on visual decisions. This is not a demotion or a scope change — it is in the plan from the start, and it is written here so nobody is surprised by it.

---

## 3. Ownership map — the thing that stops us colliding

**This is the most important section in the document.** Ownership is by *directory*, not by branch. If you need a change in someone else's directory, you do not silently edit it — you ask, or you open a PR and tag them as reviewer.

| Path | Owner | Review required from |
| --- | --- | --- |
| `apps/api/.../shared/` | Bimsara | Bimsara |
| `apps/api/.../pos/` | Bimsara | Bimsara |
| `apps/api/.../outbox/` | Bimsara | Bimsara |
| `apps/api/.../catalogue/` | Deeghayu | Deeghayu |
| `apps/api/.../inventory/` | Deeghayu | Deeghayu |
| `apps/api/.../reporting/` | Deeghayu | Deeghayu |
| `apps/api/.../ordering/` | Malindu | Malindu |
| `apps/api/.../payment/` | Malindu | Malindu |
| `apps/api/.../customer/` | Malindu | Malindu |
| `apps/api/src/main/resources/db/migration/` | Deeghayu + Malindu | **Bimsara — always** |
| `apps/api/src/main/resources/openapi.yaml` | shared | **Bimsara + the consuming frontend owner** |
| `apps/admin/` | Rashmika | Rashmika |
| `apps/storefront/` | Shanuka | Shanuka |
| `packages/ui/` | Shanuka | **Shanuka — always** |
| `packages/api-client/` | generated | do not hand-edit |
| `.github/`, `docker/`, deployment config | Bimsara | Bimsara |
| `docs/` | shared | any one reviewer |

This map is enforced mechanically by the `CODEOWNERS` file in the repository. GitHub will automatically request review from the right person.

### The three shared files, and the rules for them

These are the only places where five people genuinely contend for the same lines. Each has a rule.

**`openapi.yaml`** — Changed only in a dedicated PR that changes nothing else. The PR title is `docs(api): add <endpoint>`. Backend and frontend owners both review before anyone builds against it. This spec is a contract, and a contract that one party edits unilaterally is not a contract.

**Flyway migrations** — Never edit an existing migration file, ever, even one you wrote this morning, even if it has not been merged. Always add a new one. Migration filenames use a timestamp prefix (`V20260723143000__add_variant_table.sql`) rather than a sequence number, which removes the merge conflict entirely when two people write migrations the same day.

**`packages/ui`** — Only Shanuka merges changes here. If you need a component variant that does not exist, open an issue rather than adding a one-off style in your own app. Five people each adding "just one" button variant is how a design system dies in three weeks.

---

## 4. Branching model — finalized

```
main ─────────●───────────────●───────────────●──────▶   production, tagged releases only
              ↑               ↑               ↑
          v0.1.0          v0.2.0          v1.0.0
              │               │               │
develop ──●───●───●───●───●───●───●───●───●───●──────▶   integration, auto-deploys to staging
           \     /     \   /     \       /
            ●──●        ●─●       ●─────●
      feat/PROJ-14  fix/PROJ-22  feat/PROJ-31
      (Deeghayu)    (Malindu)    (Rashmika)
        ≤ 3 days      hours        ≤ 3 days
```

| Branch | Protected | Deploys to | Merge into it via |
| --- | --- | --- | --- |
| `main` | Yes | Production (manual approval) | PR from `develop` only, at a release point |
| `develop` | Yes | Staging (automatic) | PR from a feature branch, squash merge |
| `feat/*`, `fix/*`, `chore/*` | No | — | — |

### Why there is no personal branch per member

You asked for a branch per member. I want to be direct about why that will cause the exact problem you are trying to prevent.

A long-lived personal branch means each person accumulates days of work in isolation. Everyone drifts from everyone else. When five of those branches finally meet, the conflicts are not one-line disagreements — they are structural, because two people have independently reorganised the same shared code. The pain scales with how long the branches lived, and personal branches live forever by definition. This failure mode has a name in the industry: merge hell. It is the specific thing trunk-based and GitFlow-style workflows were both invented to avoid.

The problem you are actually solving is **"how do we stop people stepping on each other's toes."** Branches do not solve that. Ownership does — which is why §3 exists. Two people working on clearly separated directories can share a branch namespace without ever conflicting. Two people working on the same directory will conflict no matter how many branches you give them.

So: branches are named after **work**, not **people**. They live three days at most. Ownership of *code* is permanent and belongs to a person; ownership of a *branch* is temporary and belongs to a ticket.

If you want visibility into who is doing what — which is a completely fair thing to want — the branch name carries the ticket ID, the ticket is assigned to a person on the board, and `git branch -r` shows every open branch with its ticket. That gives you the visibility without the merge cost.

### Branch naming

```
<type>/PROJ-<id>-<short-kebab-description>
```

Types: `feat` · `fix` · `refactor` · `chore` · `docs` · `test` · `spike`

```
feat/PROJ-41-product-variant-editor
fix/PROJ-58-cart-total-rounding
chore/PROJ-63-upgrade-spring-boot
```

`spike/*` branches are timeboxed investigations. They are **never merged** — you learn something, you write it in the ticket, you delete the branch.

### Protection rules

**On `develop`:** PR required · 1 approving review · CI must pass · branch must be up to date · no force push.

**On `main`:** PR required · **approval from Bimsara** · CI must pass · linear history · no force push · no deletion.

---

## 5. Your daily workflow

```bash
# 1. Start from current develop — always. Never branch from a stale local copy.
git checkout develop
git pull --rebase origin develop
git checkout -b feat/PROJ-41-product-variant-editor

# 2. Work. Commit small and often, locally.
git add -p                    # stage in reviewable chunks, not everything at once
git commit -m "feat(admin): add variant option editor"

# 3. Before opening the PR, replay your work on top of current develop.
git fetch origin
git rebase origin/develop
git push --force-with-lease origin feat/PROJ-41-product-variant-editor

# 4. Open the PR against develop. Fill in the template. Tag the code owner.
# 5. Squash merge once approved and green. The branch deletes itself.
```

`--force-with-lease` instead of `--force`: it refuses the push if the remote branch changed since your last fetch. Plain `--force` will silently destroy a colleague's commits if they ever pushed to your branch. Use the safe one, always.

**If a rebase conflicts and you are not confident, stop.** Run `git rebase --abort` and ask in the team channel. An aborted rebase costs two minutes. A badly resolved one costs a day and usually loses work.

### Commit format

```
<type>(<scope>): <subject>
```

Scopes: `api` · `storefront` · `admin` · `ui` · `client` · `infra` · `deps`

Imperative mood, lower case, no full stop, under 72 characters. Enforced by a git hook and re-checked in CI, so a malformed message fails before it reaches review.

---

## 6. Code review

With five people and AI assistance, the constraint on this project will not be writing code. It will be **reviewing** it. These rules exist to keep that from becoming the bottleneck.

| Rule | Value |
| --- | --- |
| PR size | Target under 400 changed lines. Over 800, split it |
| Review turnaround | Same working day. If you cannot, say so in the channel within an hour |
| Reviewers | 1 code owner. Bimsara additionally on anything touching auth, payment, migrations, or CI |
| Blocking vs non-blocking | Prefix non-blocking comments with `nit:` — the author may merge without addressing them |
| Author merges | Yes, once approved and green. Do not merge someone else's PR |

**A large PR does not get a better review; it gets a worse one.** Reviewers read a 200-line diff carefully and skim a 2,000-line one. If your work does not fit in 400 lines, that is a signal the ticket was too big, not that the limit is wrong.

### What a reviewer is actually checking

Not style — the linter does style. Look for:

- Does this do what the ticket says, and only that?
- Are the error, loading, and empty paths handled, or only the happy path?
- Would this break if two requests arrived at once?
- Is anything here reaching into another owner's module directly?
- Are the tests testing behaviour, or just re-stating the implementation?
- Is there a credential, key, or real customer datum in this diff?

---

## 7. Working with AI agents

Everyone on this team will use coding agents. That is fine and expected. These rules make it safe.

The repository contains an `AGENTS.md` at its root describing our conventions, stack, and boundaries. Point your agent at it before you start a task — an agent without that context will invent its own conventions and you will spend the review cycle undoing them.

### Non-negotiable

1. **You own every line you open a PR for.** "The agent wrote it" is not a review defence. If you cannot explain why a line is there, delete it before you push.
2. **Read the diff, not the summary.** The agent's description of what it did and what it actually did are different artefacts. Review the second one.
3. **Never paste secrets, `.env` contents, credentials, or real customer data into an agent prompt.** Not to debug, not once.
4. **Agents do not add dependencies.** A new library is a supply-chain and licensing decision. Propose it in the channel; Bimsara approves.
5. **Agents do not write database migrations unsupervised.** A generated migration that drops a column looks exactly like one that renames it. Bimsara reviews every migration regardless of who or what wrote it.
6. **Agents do not touch `apps/api/.../shared/`, auth, payment, or CI config.** Propose the change; the owner implements it.
7. **Agent-generated tests are suspect by default.** They frequently assert the implementation rather than the behaviour, which means they pass while the feature is broken. Check that each test would actually fail if the feature were wrong.

### Where agents genuinely help here

Scaffolding repetitive CRUD screens against an existing pattern · writing the first draft of tests you then correct · generating DTO and mapper boilerplate · translating the OpenAPI spec into client code · explaining unfamiliar parts of the codebase · reviewing your own diff before a human sees it.

### Where they will hurt you on this project

Concurrency logic around stock reservations · anything touching money arithmetic · the POS adapter, because the agent has no idea what the real POS does · security configuration · schema design decisions. Write these yourself and have them reviewed by a person.

---

## 8. Communication and cadence

| When | What | Duration |
| --- | --- | --- |
| Daily, 9:00 | Async standup in the team channel | 5 min to write |
| Monday | Sprint planning — assign tickets, agree the sprint goal | 60 min |
| Friday | Demo on staging + retrospective | 45 min |
| End of each phase | Client demo | 45 min |

**Standup format** — three lines, written, not spoken:

```
Yesterday: PROJ-41 variant editor — form done, image upload in progress
Today:     PROJ-41 finish upload, open PR
Blocked:   need the variant endpoint from PROJ-38 (Deeghayu) to test properly
```

The blocked line is the only one that matters. If you are blocked, say so the same morning. A blocker raised on Wednesday that started on Monday cost the project two days that nobody could have recovered.

### Where things go

| Channel | Use for |
| --- | --- |
| Team chat — general | Standups, blockers, quick questions |
| Team chat — PRs | Automated PR and CI notifications |
| Issue tracker | Every piece of work. If it is not a ticket, it does not exist |
| ADRs in `docs/adr/` | Decisions that outlive the conversation that produced them |

**Do not make technical decisions in a chat thread and leave them there.** A choice everyone agreed to on a Tuesday afternoon is invisible to the person who joins in Week 8 and to you in November. Write an ADR — half a page, Context / Decision / Consequences.

---

## 9. Scope control

This is a fixed-scope, fixed-price engagement for our first client. Scope creep is the single most likely way it becomes unprofitable.

### The rule

**Only Bimsara accepts scope.** If the client, or anyone else, asks any of you directly for something that is not in the ticket you are working on, the answer is:

> "That sounds useful — let me get it added to the backlog so it gets scheduled properly."

Then post it in the team channel. Do not say no. Do not say yes. Do not build it because it is only twenty minutes. Twenty minutes, twenty times, is a week nobody planned for and nobody is paying for.

### What is explicitly out of scope for Phase 1

Wishlists · product reviews · multi-language interface · abandoned-cart emails · loyalty points, store credit, gift cards · dedicated search engine · product recommendations · analytics beyond the Phase 1 dashboard · mobile apps · multi-branch inventory.

Each of these is a legitimate future conversation and a legitimate future invoice. None of them is built now.

### Change requests

New scope goes through a written change request with an estimate and a schedule impact, approved by the client before work starts. No exceptions, including for small things, including when we like the client.

---

## 10. Phase assignments

| Phase | Weeks | Bimsara | Deeghayu | Malindu | Rashmika | Shanuka |
| --- | --- | --- | --- | --- | --- | --- |
| **0 — Foundations** | 1–2 | Repo, CI, staging, branch protection, auth, POS questionnaire | Baseline schema, catalogue entities | Order and customer entities | Admin shell, routing, login | Design tokens, Tier 1 components |
| **1 — Catalogue & admin** | 3–5 | `MockPosAdapter`, review, client liaison | Catalogue + inventory APIs | Auth endpoints, customer API | Product CRUD, images, variants, inventory screens | Tier 2 components, storefront shell |
| **2 — Storefront & checkout** | 6–8 | Outbox, notifications infra, review | Search, filtering, category APIs | Cart, checkout, PayHere, order state machine | **Storefront support** (PLP, PDP, cart) | Storefront: home, PDP, checkout UI |
| **3 — POS integration** | 9–11 | **Real POS adapter, sync worker, reconciliation** | Stock reconciliation logic | Order push, retry handling | Sync monitor screen, order screens | Storefront polish, accessibility |
| **4 — Hardening & launch** | 12–14 | Production infra, security review, load test, handover | Dashboard aggregation queries | Payment edge cases, refunds | Dashboard UI, discounts | Performance, SEO, responsive audit, static pages |

Phase 3 is the schedule risk. It depends entirely on what the POS vendor comes back with. Phases 1 and 2 are sequenced first deliberately, so that a saleable product exists even if integration slips.

---

## 11. Decision rights

| Decision | Who decides |
| --- | --- |
| Architecture, stack, new dependencies | Bimsara |
| Database schema changes | Deeghayu or Malindu propose; Bimsara approves |
| API contract changes | Proposing backend owner + affected frontend owner + Bimsara |
| Visual design, component API in `packages/ui` | Shanuka |
| Admin UX patterns | Rashmika, within Shanuka's design system |
| Scope, deadlines, client commitments | Bimsara |
| How to implement a ticket in your own module | You |

That last row matters. Within your own directory, and within the agreed contract and design system, you do not need permission. Ask when you are crossing a boundary, not when you are working inside one.

### Escalation

Blocked more than **two hours** on something you cannot resolve? Post it. Nobody on this team is expected to be stuck alone all day. Two hours is not a failure — it is the point at which asking is cheaper than continuing.

---

## 12. Definition of done

A ticket is done when **all** of these are true:

- [ ] Acceptance criteria met
- [ ] Tests written and passing — unit for logic, integration for endpoints
- [ ] No new lint or type errors
- [ ] UI: responsive from 360px, keyboard navigable, visible focus states
- [ ] UI: loading, empty, and error states handled — not just the happy path
- [ ] OpenAPI spec updated if the API surface changed
- [ ] Self-reviewed as a diff in the GitHub UI before requesting review
- [ ] Approved by the code owner
- [ ] CI green
- [ ] Merged to `develop` and verified working on staging

The loading / empty / error line is the one most often skipped and most often filed back as a bug two weeks later. A screen that only handles success is about half finished.

---

## 13. First-week checklist

Every member, before writing any feature code:

- [ ] Read this charter, the implementation plan, and the engineering handbook
- [ ] Complete `developer-setup-guide.md` end to end
- [ ] Run the stack locally and open the storefront, admin, and API docs
- [ ] Confirm you can push a branch and open a PR
- [ ] Confirm the commit hook rejects a badly formatted message (try one on purpose)
- [ ] Read `AGENTS.md` and configure your agent with it
- [ ] Find your section of the ownership map and read the existing code there
- [ ] Post one question in the team channel — anything. Breaking the silence early is worth more than the answer

Bimsara additionally: send the POS discovery questionnaire, set branch protection, invite everyone to the repo and issue tracker, provision staging.

---

## 14. What we are optimising for

Not speed. A first client project is won or lost on **predictability** — the client knowing what they will get and when, and getting it.

Five people with agents can produce an enormous volume of code very quickly. That is not the constraint and it is not the goal. The constraint is how much of that code can be reviewed, understood, and safely deployed. Everything in this document — small PRs, clear ownership, written decisions, controlled scope — exists to keep that number high.

Write less, review properly, ship on schedule.
