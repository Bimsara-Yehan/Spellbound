#!/usr/bin/env bash
# ===========================================================================
# GitHub repository bootstrap — Spellbound
#
# Creates the repository, pushes the scaffold, configures branch protection,
# and seeds labels, milestones, collaborators, and Sprint 1 issues.
#
# Run this yourself: it authenticates as you and creates things under your
# account. Read it before running — it makes real, visible changes.
#
# Prerequisites
#   1. git and the GitHub CLI (gh) installed
#        macOS   : brew install gh
#        Windows : winget install --id GitHub.cli -e
#        Linux   : see https://cli.github.com
#   2. Authenticated with project scope:
#        gh auth login
#        gh auth refresh -s project,read:project,repo,admin:org
#   3. GitHub Pro or Team on the owning account, otherwise branch
#      protection on a PRIVATE repo is accepted by the API but NOT enforced.
#
# Usage
#   chmod +x bootstrap-github.sh
#   ./bootstrap-github.sh
# ===========================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration — edit these before running
# ---------------------------------------------------------------------------

REPO_OWNER="Bimsara-Yehan"
REPO_NAME="Spellbound"
REPO_VISIBILITY="private"            # private | public
SCAFFOLD_DIR="./scaffold"            # unzipped starter scaffold

# GitHub usernames, in the order used by CODEOWNERS.
# Left empty deliberately - teammate handles not confirmed yet. Fill these in
# and re-run just the "Inviting collaborators" step once you have them.
COLLABORATORS=()

# ---------------------------------------------------------------------------
# Preflight — fail early and loudly rather than half-creating things
# ---------------------------------------------------------------------------

echo "==> Preflight checks"

command -v git >/dev/null || { echo "ERROR: git not found"; exit 1; }
command -v gh  >/dev/null || { echo "ERROR: gh CLI not found"; exit 1; }

gh auth status >/dev/null 2>&1 || {
  echo "ERROR: not authenticated. Run: gh auth login"
  exit 1
}

[ -d "$SCAFFOLD_DIR" ] || {
  echo "ERROR: scaffold directory '$SCAFFOLD_DIR' not found."
  echo "       Unzip spellbound-starter.zip next to this script."
  exit 1
}

# Warn about the free-plan protection trap rather than failing — the user may
# legitimately be creating a public repo, where protection works on Free.
ACCOUNT_PLAN=$(gh api "users/${REPO_OWNER}" --jq '.plan.name' 2>/dev/null || echo "unknown")
if [ "$REPO_VISIBILITY" = "private" ] && [ "$ACCOUNT_PLAN" = "free" ]; then
  echo ""
  echo "  WARNING: '${REPO_OWNER}' appears to be on the Free plan."
  echo "  Branch protection on a PRIVATE repo will be accepted by the API but"
  echo "  will NOT be enforced. Upgrade to Pro (GitHub Student Developer Pack"
  echo "  is free) before relying on it."
  echo ""
  read -rp "  Continue anyway? [y/N] " reply
  [[ "$reply" =~ ^[Yy]$ ]] || exit 1
fi

echo "    OK"

# ---------------------------------------------------------------------------
# 1. Create the repository
#
# --disable-wiki: we use docs/ in the repo, so a wiki is a second place for
# documentation to rot. One source of truth.
# ---------------------------------------------------------------------------

echo "==> Creating repository ${REPO_OWNER}/${REPO_NAME}"

gh repo create "${REPO_OWNER}/${REPO_NAME}" \
  --"${REPO_VISIBILITY}" \
  --description "E-commerce platform with POS integration" \
  --disable-wiki

# ---------------------------------------------------------------------------
# 2. Push the scaffold as the initial commit on main
# ---------------------------------------------------------------------------

echo "==> Pushing scaffold to main"

cd "$SCAFFOLD_DIR"
git init -b main
git add .
git commit -m "chore(infra): initial project scaffold

Adds CI pipeline, local development environment, code ownership,
commit conventions, agent guidelines, and project documentation."

git remote add origin "https://github.com/${REPO_OWNER}/${REPO_NAME}.git"
git push -u origin main

# ---------------------------------------------------------------------------
# 3. Create develop and make it the default branch
#
# Feature branches target develop, so it must be the default — otherwise
# every PR opens against main by mistake and someone merges one eventually.
# ---------------------------------------------------------------------------

echo "==> Creating develop branch"

git checkout -b develop
git push -u origin develop

gh api -X PATCH "repos/${REPO_OWNER}/${REPO_NAME}" \
  -f default_branch=develop >/dev/null

# ---------------------------------------------------------------------------
# 4. Repository merge settings
#
# Squash-only. Allowing merge commits alongside squash means someone will
# eventually pick the wrong one and the linear history is gone.
# ---------------------------------------------------------------------------

echo "==> Configuring merge settings"

gh api -X PATCH "repos/${REPO_OWNER}/${REPO_NAME}" \
  -F allow_squash_merge=true \
  -F allow_merge_commit=false \
  -F allow_rebase_merge=false \
  -F delete_branch_on_merge=true \
  -f squash_merge_commit_title=PR_TITLE \
  -f squash_merge_commit_message=PR_BODY >/dev/null

# ---------------------------------------------------------------------------
# 5. Branch protection
#
# Status check contexts must match the `name:` values in ci.yml exactly.
# A typo here produces a check that never reports, which blocks every PR
# forever with no explanation.
#
# strict=true requires the branch to be up to date before merging.
# ---------------------------------------------------------------------------

echo "==> Applying branch protection"

protect_branch() {
  local branch="$1"
  local required_reviews="$2"

  gh api -X PUT "repos/${REPO_OWNER}/${REPO_NAME}/branches/${branch}/protection" \
    --input - <<JSON >/dev/null
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "Commit convention",
      "API - build and test",
      "Web - lint, test, build",
      "Security scan"
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": ${required_reviews},
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
JSON
  echo "    protected: ${branch}"
}

protect_branch "develop" 1
protect_branch "main" 1

# ---------------------------------------------------------------------------
# 6. Labels
#
# Deletes GitHub's defaults first. "good first issue" and "wontfix" are noise
# on a client project and dilute the labels that carry real meaning.
# ---------------------------------------------------------------------------

echo "==> Creating labels"

for stale in "bug" "documentation" "duplicate" "enhancement" \
             "good first issue" "help wanted" "invalid" "question" "wontfix"; do
  gh label delete "$stale" --repo "${REPO_OWNER}/${REPO_NAME}" --yes 2>/dev/null || true
done

create_label() {
  gh label create "$1" --color "$2" --description "$3" \
    --repo "${REPO_OWNER}/${REPO_NAME}" --force >/dev/null
}

# Work type
create_label "type:feat"      "0E8A16" "New user-facing capability"
create_label "type:fix"       "D73A4A" "Defect repair"
create_label "type:refactor"  "5319E7" "Behaviour-preserving internal change"
create_label "type:chore"     "BFD4F2" "Build, dependencies, tooling"
create_label "type:docs"      "0075CA" "Documentation only"
create_label "type:test"      "FBCA04" "Tests only"
create_label "type:spike"     "D4C5F9" "Timeboxed investigation - never merged"

# Area — mirrors the ownership map in the team charter
create_label "area:api"        "1D76DB" "Spring Boot backend"
create_label "area:storefront" "C2E0C6" "Customer-facing Next.js app"
create_label "area:admin"      "FEF2C0" "Admin panel"
create_label "area:ui"         "F9D0C4" "Design system (packages/ui)"
create_label "area:infra"      "C5DEF5" "CI, Docker, deployment"
create_label "area:pos"        "E99695" "POS integration and sync"

# Priority
create_label "priority:high"   "B60205" "Blocks other work or the schedule"
create_label "priority:medium" "FBCA04" "Normal"
create_label "priority:low"    "0E8A16" "Nice to have"

# Workflow signals
create_label "blocked"         "000000" "Waiting on something external"
create_label "needs-review"    "7057FF" "Awaiting code review"
create_label "agent-assisted"  "8B4789" "Substantially AI-generated - review with extra care"

# ---------------------------------------------------------------------------
# 7. Milestones — one per delivery phase
# ---------------------------------------------------------------------------

echo "==> Creating milestones"

create_milestone() {
  gh api -X POST "repos/${REPO_OWNER}/${REPO_NAME}/milestones" \
    -f title="$1" -f due_on="$2" -f description="$3" >/dev/null 2>&1 \
    || echo "    (milestone '$1' already exists, skipping)"
}

create_milestone "Phase 0 - Foundations"       "2026-08-07T23:59:59Z" "Repo, CI, staging, auth, design tokens"
create_milestone "Phase 1 - Catalogue & Admin" "2026-08-28T23:59:59Z" "Product CRUD, inventory, admin core"
create_milestone "Phase 2 - Storefront"        "2026-09-18T23:59:59Z" "Catalogue browsing, cart, checkout, payment"
create_milestone "Phase 3 - POS Integration"   "2026-10-09T23:59:59Z" "Real adapter, sync worker, reconciliation"
create_milestone "Phase 4 - Hardening & Launch" "2026-10-30T23:59:59Z" "Dashboard, security, load test, go live"

# ---------------------------------------------------------------------------
# 8. Collaborators
#
# push permission, not admin. Only the lead should be able to change branch
# protection or delete the repository.
# ---------------------------------------------------------------------------

echo "==> Inviting collaborators"

for user in "${COLLABORATORS[@]}"; do
  if gh api -X PUT "repos/${REPO_OWNER}/${REPO_NAME}/collaborators/${user}" \
       -f permission=push >/dev/null 2>&1; then
    echo "    invited: ${user}"
  else
    echo "    FAILED:  ${user}  (check the username is correct)"
  fi
done

# ---------------------------------------------------------------------------
# 9. Sprint 1 issues
#
# Format: "title|labels|milestone|assignee"
# Assignees are left blank so they can be set during sprint planning rather
# than assumed here.
# ---------------------------------------------------------------------------

echo "==> Creating Sprint 1 issues"

MILESTONE="Phase 0 - Foundations"

ISSUES=(
  "Send POS discovery questionnaire to vendor|type:chore,area:pos,priority:high"
  "Create monorepo structure with pnpm workspace and three app skeletons|type:chore,area:infra,priority:high"
  "Configure branch protection and PR template|type:chore,area:infra,priority:high"
  "Docker Compose local environment: Postgres, Redis, Mailpit, MinIO|type:chore,area:infra,priority:high"
  "CI pipeline: build, test, lint, dependency scan|type:chore,area:infra,priority:high"
  "Flyway baseline schema: catalogue, inventory, orders|type:feat,area:api,priority:high"
  "OpenAPI spec v0.1: catalogue and auth endpoints|type:docs,area:api,priority:high"
  "Client design session and two visual directions|type:chore,area:ui,priority:high"
  "Provision staging environment and verify auto-deploy|type:chore,area:infra,priority:high"
  "Spring Security config: JWT issue and refresh, role model|type:feat,area:api,priority:high"
  "Auth endpoints with Testcontainers integration tests|type:feat,area:api,priority:high"
  "Finalize design tokens in packages/ui|type:feat,area:ui,priority:high"
  "Tier 1 components: Button, Input, Select, Checkbox, Label, FormField, Card, Badge|type:feat,area:ui,priority:high"
  "Generated API client and MSW mock setup|type:chore,area:infra,priority:high"
  "Admin app shell with route guards|type:feat,area:admin,priority:high"
  "Admin login screen wired to auth API|type:feat,area:admin,priority:high"
)

for entry in "${ISSUES[@]}"; do
  title="${entry%%|*}"
  labels="${entry#*|}"

  gh issue create \
    --repo "${REPO_OWNER}/${REPO_NAME}" \
    --title "$title" \
    --label "$labels" \
    --milestone "$MILESTONE" \
    --body "See docs/engineering-handbook.md section 10 for context.

## Acceptance criteria
- [ ] TODO: fill in during sprint planning

## Definition of done
See docs/team-charter.md section 12." >/dev/null

  echo "    created: ${title}"
done

# ---------------------------------------------------------------------------
# 10. Project board
#
# Requires the 'project' scope. If this step fails, run:
#   gh auth refresh -s project,read:project
# ---------------------------------------------------------------------------

echo "==> Creating project board"

if gh project create --owner "${REPO_OWNER}" --title "Spellbound" >/dev/null 2>&1; then
  echo "    created. Link issues and add Status/Sprint fields in the web UI."
else
  echo "    SKIPPED: missing 'project' scope."
  echo "    Run: gh auth refresh -s project,read:project  then create it manually."
fi

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------

cat <<DONE

===========================================================================
Bootstrap complete.

  Repository : https://github.com/${REPO_OWNER}/${REPO_NAME}
  Default    : develop
  Issues     : ${#ISSUES[@]} created under "${MILESTONE}"

Remaining manual steps
  1. Edit .github/CODEOWNERS and replace the placeholder handles with real
     GitHub usernames, then commit. Until you do, review routing will not
     work and the ownership map is decorative.
  2. Confirm each collaborator has accepted their invitation.
  3. Add repository secrets for the deploy pipeline:
       Settings > Secrets and variables > Actions
  4. Open a throwaway PR and confirm every required status check appears.
     If a check never reports, the context name in this script does not
     match the job name in ci.yml.
  5. Share the repo URL and docs/developer-setup-guide.md with the team.
===========================================================================
DONE
