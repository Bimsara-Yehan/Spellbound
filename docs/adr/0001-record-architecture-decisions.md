# ADR 0001 — Record architecture decisions

**Status:** Accepted
**Date:** 2026-07-23

## Context

Six months from now, someone — possibly you — will look at a structural
choice in this codebase and be unable to reconstruct why it was made. Without
that reasoning, the choice gets either cargo-culted forever or reversed
without understanding what it was protecting against.

## Decision

Record every significant architectural decision as a short, numbered,
immutable document in `docs/adr/`.

An ADR is warranted when a decision is expensive to reverse, affects more than
one part of the system, or rejects an option a reasonable engineer would have
chosen. Routine choices do not need one.

## Format

Context, Decision, Consequences. Half a page. An ADR nobody reads because it
runs to eight pages is worse than no ADR.

## Consequences

- New team members can read the ADR log and understand the system's shape
- Superseded decisions are marked `Superseded by ADR-NNNN`, never edited or
  deleted — the history is the point
- A small amount of writing overhead per significant decision

## ADRs to write first

- 0002 — Monorepo over multiple repositories
- 0003 — Modular monolith over microservices
- 0004 — Transactional outbox over a message broker
- 0005 — Web platform database as the source of truth for online commerce
- 0006 — Money stored as integer minor units
