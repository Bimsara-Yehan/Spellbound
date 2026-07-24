# spellbound

E-commerce platform with POS integration.

## Prerequisites

- JDK 21 (Temurin)
- Node 22
- pnpm 9
- Docker with Compose

## Getting started

```bash
git clone <repo-url> && cd spellbound
cp .env.example .env                              # then fill in JWT_SECRET
docker compose -f docker/docker-compose.yml up -d
pnpm install
pnpm dev                                          # starts api, storefront, admin
```

| Service | URL |
| --- | --- |
| Storefront | http://localhost:3000 |
| Admin panel | http://localhost:3001 |
| API | http://localhost:8080 |
| API docs | http://localhost:8080/swagger-ui.html |
| Mail inbox | http://localhost:8025 |
| Object storage console | http://localhost:9001 |

## Common commands

```bash
pnpm dev              # run everything
pnpm generate:api     # regenerate the TypeScript client from openapi.yaml
pnpm -r test          # frontend tests
pnpm -r lint          # frontend lint
cd apps/api && ./gradlew test     # backend tests
cd apps/api && ./gradlew build    # full backend build
```

## Documentation

- `docs/engineering-handbook.md` — branching, conventions, build order
- `docs/implementation-plan.md` — scope, phases, architecture
- `docs/adr/` — architecture decision records
- `docs/runbook.md` — deployment and incident procedures

## Contributing

Branch from `develop` as `<type>/PROJ-<id>-<description>`. Rebase before opening
a PR. Squash merge. Conventional Commits are enforced by CI.
