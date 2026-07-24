# Getting Started

Welcome to Spellbound. This page is your entry point — read it top to bottom, then get moving. It is a map to the full documentation, not a replacement for it: when this page and a linked doc disagree, the linked doc wins.

---

## 1. Before you write any feature code

- [ ] Complete [`docs/developer-setup-guide.md`](docs/developer-setup-guide.md) end to end — stack installed, containers running, all six local URLs responding
- [ ] Read [`docs/team-charter.md`](docs/team-charter.md) — how we work together
- [ ] Read [`docs/implementation-plan.md`](docs/implementation-plan.md) — what we're building, in what order, and why
- [ ] Read [`docs/engineering-handbook.md`](docs/engineering-handbook.md) — how the system is structured
- [ ] Read [`AGENTS.md`](AGENTS.md) and point your coding agent at it before your first agent-assisted task
- [ ] Confirm you can push a branch and open a PR
- [ ] Deliberately write a badly formatted commit message once, and watch the hook reject it
- [ ] Post one question in the team channel — anything, just to break the silence early

---

## 2. Find your section

Ownership is by *directory*, not by branch — mechanically enforced by [`.github/CODEOWNERS`](.github/CODEOWNERS). If you need a change in someone else's directory, ask or open a PR and tag them; don't edit it silently.

| Member | Role | Owns | Review required from |
| --- | --- | --- | --- |
| **Bimsara** | Tech lead | `apps/api/.../shared/`, `.../pos/`, `.../outbox/` · all DB migrations · `.github/`, `docker/`, deploy config · architecture, security, POS integration, release management | Bimsara |
| **Deeghayu** | Backend — Catalogue | `apps/api/.../catalogue/`, `.../inventory/`, `.../reporting/` | Deeghayu |
| **Malindu** | Backend — Commerce | `apps/api/.../ordering/`, `.../payment/`, `.../customer/` | Malindu |
| **Rashmika** | Frontend — Admin | `apps/admin/` (all 14 screens) — moves onto storefront screens under Shanuka's direction once admin screens 1–8 ship (~Week 6) | Rashmika |
| **Shanuka** | Frontend — Design & storefront | `packages/ui/` (sole owner, no exceptions), `apps/storefront/` | Shanuka |

Three files are shared and have their own rules — see `docs/team-charter.md` §3:

- **`apps/api/src/main/resources/openapi.yaml`** — dedicated PR only, backend + frontend owner both review
- **Flyway migrations** — never edit an existing one; always add a new one; Bimsara reviews every migration regardless of author
- **`packages/ui/`** — only Shanuka merges here; open an issue for a new component variant rather than adding a one-off

---

## 3. Start working

```bash
# 1. Always start from current develop
git checkout develop
git pull --rebase origin develop
git checkout -b feat/PROJ-<id>-<short-kebab-description>

# 2. Work. Commit small and often.
git add -p
git commit -m "feat(admin): add variant option editor"

# 3. Before opening the PR, replay your work on top of current develop.
git fetch origin
git rebase origin/develop
git push --force-with-lease origin feat/PROJ-<id>-<short-kebab-description>

# 4. Open the PR against develop. Fill in the template. Tag your code owner.
# 5. Squash merge once approved and green. The branch deletes itself.
```

- **Branch types:** `feat` · `fix` · `refactor` · `chore` · `docs` · `test` · `spike`
- **Commit format:** `<type>(<scope>): <subject>` — imperative, lower case, no full stop, under 72 characters. Scopes: `api` · `storefront` · `admin` · `ui` · `client` · `infra` · `deps`. Enforced by a commit hook and re-checked in CI.
- **`spike/*` branches are never merged** — investigate, write the finding in the ticket, delete the branch.
- Use `--force-with-lease`, never plain `--force` — it refuses the push if the remote branch moved since your last fetch, so you can't silently destroy a colleague's commits.
- **Rebase conflict you're not confident about? Stop.** `git rebase --abort` and ask in the team channel. Two minutes lost beats a day lost to a bad resolution.

### Daily standup — async, written, three lines

```
Yesterday: PROJ-41 variant editor — form done, image upload in progress
Today:     PROJ-41 finish upload, open PR
Blocked:   need the variant endpoint from PROJ-38 (Deeghayu) to test properly
```

The Blocked line is the one that matters. Flag it the same morning — blocked more than two hours with no path forward? Post it; nobody is expected to be stuck alone all day.

---

## 4. Working with AI agents

Everyone on this team uses coding agents — that's expected. The non-negotiables, in full in `docs/team-charter.md` §7:

1. You own every line you open a PR for — "the agent wrote it" is not a review defence
2. Review the diff, not the agent's summary of the diff
3. Never paste secrets, `.env` contents, or real customer data into a prompt
4. Agents don't add dependencies, write migrations unsupervised, or touch `shared/`, auth, payment, or CI config — propose the change, the owner implements it
5. Agent-written tests are suspect by default — check each one would actually fail if the feature were broken

---

## 5. Definition of done

- [ ] Acceptance criteria met, tests passing (unit for logic, integration for endpoints)
- [ ] No new lint or type errors
- [ ] Loading, empty, and error states handled — not just the happy path
- [ ] OpenAPI spec updated if the API surface changed
- [ ] Self-reviewed as a diff before requesting review
- [ ] Approved by the code owner, CI green
- [ ] Merged to `develop`, verified on staging

Full detail: `docs/team-charter.md` §12.

---

Everything above is a summary. The source of truth is `docs/team-charter.md`, `docs/implementation-plan.md`, and `docs/engineering-handbook.md` — read this page in five minutes, then go read those.
