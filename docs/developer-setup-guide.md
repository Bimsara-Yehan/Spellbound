# Developer Setup Guide
## Get your machine running in about 45 minutes

**Do this before your first day of feature work.** Follow it top to bottom — the order matters. If a step fails, check §9 before asking, then ask in the team channel.

---

## 1. The stack — final versions

These versions are locked. Do not install "the latest" — a version mismatch produces build failures that look like code bugs and waste an afternoon.

### Required on every machine

| Tool | Version | Why this one |
| --- | --- | --- |
| **Git** | 2.40+ | — |
| **JDK — Eclipse Temurin** | **21 (LTS)** | Supported to 2031. Virtual threads matter for our POS calls |
| **Node.js** | **22 LTS** | Required by Next.js 15 |
| **pnpm** | **9.x** | Workspace support; far faster and smaller on disk than npm |
| **Docker Desktop** | latest | Runs Postgres, Redis, Mailpit, MinIO locally |

### IDEs

| Role | Recommended |
| --- | --- |
| Backend — tech lead (Bimsara) | Visual Studio Code |
| Backend (Deeghayu, Malindu) | IntelliJ IDEA Community Edition |
| Frontend (Rashmika, Shanuka) | Visual Studio Code |

Use whichever you prefer — but the shared formatter and linter configuration in the repo is authoritative. Your editor must not reformat files on its own terms.

### What the project itself uses (installed automatically — no action needed)

| Layer | Technology |
| --- | --- |
| Backend framework | Spring Boot 3.4 · Spring Web, Security, Data JPA, Validation, Actuator |
| Migrations | Flyway |
| Mapping / boilerplate | MapStruct · Lombok |
| API documentation | springdoc-openapi |
| Database | PostgreSQL 16 |
| Cache / reservations | Redis 7 |
| Storefront | Next.js 15 (App Router) · React 19 · TypeScript strict |
| Admin | React 19 · Vite · TypeScript strict |
| Styling | Tailwind CSS · shadcn/ui primitives |
| Data fetching | TanStack Query |
| Tables / charts | TanStack Table · Recharts |
| Forms / validation | React Hook Form · Zod |
| Backend testing | JUnit 5 · AssertJ · Mockito · Testcontainers |
| Frontend testing | Vitest · React Testing Library · MSW |
| End-to-end testing | Playwright |
| Payments | PayHere |
| Build / CI | Gradle · pnpm · GitHub Actions · Docker |

---

## 2. Install — Windows

Use **winget** from PowerShell. It handles PATH correctly, which manual installers frequently do not.

```powershell
winget install --id Git.Git -e
winget install --id EclipseAdoptium.Temurin.21.JDK -e
winget install --id OpenJS.NodeJS.LTS -e
winget install --id Docker.DockerDesktop -e
winget install --id JetBrains.IntelliJIDEA.Community -e   # backend
winget install --id Microsoft.VisualStudioCode -e         # frontend
```

Close and reopen PowerShell, then:

```powershell
npm install -g pnpm@9
```

**Docker Desktop on Windows needs WSL 2.** If the installer prompts you, accept. If it fails afterwards, run PowerShell as Administrator:

```powershell
wsl --install
wsl --set-default-version 2
```

Restart, then start Docker Desktop and wait for the whale icon to stop animating.

---

## 3. Install — macOS

```bash
# Homebrew, if you do not have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

brew install git
brew install --cask temurin@21
brew install node@22
brew install --cask docker
brew install --cask intellij-idea-ce      # backend
brew install --cask visual-studio-code    # frontend

npm install -g pnpm@9
```

Open Docker Desktop once from Applications so it can install its helper components.

---

## 4. Install — Linux (Ubuntu / Debian)

```bash
sudo apt update && sudo apt install -y git curl

# JDK 21
sudo apt install -y wget apt-transport-https
sudo mkdir -p /etc/apt/keyrings
wget -O - https://packages.adoptium.net/artifactory/api/gpg/key/public \
  | sudo tee /etc/apt/keyrings/adoptium.asc
echo "deb [signed-by=/etc/apt/keyrings/adoptium.asc] https://packages.adoptium.net/artifactory/deb $(awk -F= '/^VERSION_CODENAME/{print$2}' /etc/os-release) main" \
  | sudo tee /etc/apt/sources.list.d/adoptium.list
sudo apt update && sudo apt install -y temurin-21-jdk

# Node 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

sudo npm install -g pnpm@9
```

Install Docker Engine and the Compose plugin from Docker's official repository, then add yourself to the docker group so you do not need `sudo` for every command:

```bash
sudo usermod -aG docker $USER
# Log out and back in for this to take effect.
```

---

## 5. Verify before continuing

Run all five. **Every one must match.** If any is wrong, fix it now — a wrong version here surfaces later as a build error that looks like a code problem.

```bash
git --version      # 2.40 or higher
java -version      # openjdk version "21.x.x"
node --version     # v22.x.x
pnpm --version     # 9.x.x
docker --version   # any recent version
```

```bash
docker run --rm hello-world     # must print "Hello from Docker!"
```

If `java -version` reports something other than 21, you have another JDK earlier on your PATH. On Windows check *Environment Variables* → `JAVA_HOME`; on macOS and Linux run `which -a java`.

---

## 6. Configure Git

Do this once. The first two lines determine what appears in the commit history forever.

```bash
git config --global user.name "Your Full Name"
git config --global user.email "your.email@example.com"   # the same address as your GitHub account

# Rebase rather than merge when pulling. Keeps history linear and avoids
# pointless "Merge branch 'develop'" commits polluting the log.
git config --global pull.rebase true

# Push only the current branch by default.
git config --global push.default current

# Remember conflict resolutions, so a repeated rebase does not make you
# resolve the same conflict twice.
git config --global rerere.enabled true
```

**Windows only — line endings.** Skip this and every file you touch will appear 100% changed in the diff, making review impossible:

```bash
git config --global core.autocrlf true
```

(macOS and Linux: `git config --global core.autocrlf input`)

---

## 7. Clone and run

```bash
git clone <repository-url>
cd spellbound

# 1. Environment configuration
cp .env.example .env
```

Open `.env` and set `JWT_SECRET`. Generate one:

```bash
# macOS / Linux / Git Bash
openssl rand -base64 64

# Windows PowerShell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Max 256 }))
```

Leave everything else at its default for local development. `POS_ADAPTER=mock` is correct until the real integration exists.

```bash
# 2. Start the infrastructure containers
docker compose -f docker/docker-compose.yml up -d

# 3. Wait for them to become healthy (about 20 seconds), then confirm
docker compose -f docker/docker-compose.yml ps

# 4. Install JavaScript dependencies
pnpm install

# 5. Start everything
pnpm dev
```

### Confirm it works

| Service | URL | Expected |
| --- | --- | --- |
| Storefront | http://localhost:3000 | Home page renders |
| Admin panel | http://localhost:3001 | Login screen |
| API health | http://localhost:8080/actuator/health | `{"status":"UP"}` |
| API docs | http://localhost:8080/swagger-ui.html | Swagger UI |
| Mail inbox | http://localhost:8025 | Empty inbox |
| Object storage | http://localhost:9001 | Login: `localdev` / `localdev123` |

All six working means your environment is correct. Stop here and tell the team channel you are set up.

---

## 8. IDE configuration

### IntelliJ IDEA (backend)

1. Open the `apps/api` directory as a Gradle project — not the repository root.
2. **Settings → Build Tools → Gradle → Gradle JVM** → set to Temurin 21.
3. **Settings → Build, Execution, Deployment → Compiler → Annotation Processors** → enable. Lombok and MapStruct generate code at compile time and will not work without this.
4. Install the **Lombok** plugin.
5. Enable *Reformat code* and *Optimize imports* on save.

### VS Code (frontend, and backend if that's your preference)

Open the repository root. VS Code will prompt to install the recommended extensions from `.vscode/extensions.json` — accept.

| Extension | Purpose |
| --- | --- |
| ESLint | Linting |
| Prettier | Formatting |
| Tailwind CSS IntelliSense | Class autocomplete and hover previews |
| Vitest | Test runner integration |
| Playwright | E2E test support |
| GitLens | Blame and history inline |
| Extension Pack for Java | Language server, debugger, test runner, project explorer |
| Gradle for Java | Runs and imports the `apps/api` Gradle build |
| Spring Boot Extension Pack | Spring Boot dashboard, initializr, config-file support |
| Lombok Annotations Support | Required — without it, Lombok-generated getters/setters show as errors |

Add to your workspace settings (`.vscode/settings.json` is gitignored except for `extensions.json`, so this stays local to you):

```jsonc
{
  // The repo's Prettier config is authoritative. Never let a personal
  // formatter setting reformat a file — it produces enormous diffs and
  // makes review impossible.
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" },
  "typescript.tsdk": "node_modules/typescript/lib",

  // Only needed if you're doing backend work in VS Code instead of IntelliJ.
  // The machine has both 17 and 21 installed - pin the project to 21 explicitly
  // rather than relying on whichever JAVA_HOME happens to be active.
  "java.configuration.runtimes": [
    { "name": "JavaSE-17", "path": "<path to your JDK 17 install>" },
    { "name": "JavaSE-21", "path": "<path to your JDK 21 install>", "default": true }
  ],
  "java.import.gradle.java.home": "<path to your JDK 21 install>"
}
```

Open `apps/api` (or the repo root — the Gradle extension will find it) and confirm the bottom-right Java/Gradle status shows 21, not 17.

---

## 9. Troubleshooting

**`port is already allocated`** — Something else is using 5432, 6379, 3000, 3001, or 8080. Find it (`lsof -i :5432` on macOS/Linux, `netstat -ano | findstr :5432` on Windows) and stop it. A locally installed PostgreSQL is the usual culprit.

**`connection refused` from the API to Postgres** — The container is up but not yet healthy. Wait 20 seconds. Confirm with `docker compose -f docker/docker-compose.yml ps` that the state reads `healthy`, not just `running`.

**Gradle build fails with an unsupported class file version** — You are compiling with the wrong JDK. Check `java -version` and IntelliJ's Gradle JVM setting; both must be 21.

**`pnpm install` fails with `ERR_PNPM_UNSUPPORTED_ENGINE`** — Node version mismatch. You need 22.

**Lombok getters "cannot be resolved" in IntelliJ** — Annotation processing is off. See §8, step 3.

**Every file shows as fully modified in the diff (Windows)** — Line endings. Set `core.autocrlf` as in §6, then `git rm --cached -r . && git reset --hard`.

**Docker Desktop will not start (Windows)** — WSL 2 is missing or virtualisation is disabled in the BIOS. Run `wsl --status`; if it errors, follow §2.

**The commit hook rejects your message** — That is it working. Your message must be `type(scope): subject` — for example `feat(admin): add product filter`. See the team charter §5.

---

## 10. Day-one checklist

- [ ] All five version checks in §5 pass
- [ ] `docker run --rm hello-world` succeeds
- [ ] Git configured with your real name and GitHub email
- [ ] Line-ending setting applied (Windows)
- [ ] Repository cloned, `.env` created, `JWT_SECRET` set
- [ ] Containers running and healthy
- [ ] All six URLs in §7 respond correctly
- [ ] IDE configured; formatter and linter active
- [ ] You have pushed a throwaway branch and opened a draft PR to confirm access
- [ ] You have deliberately written a bad commit message and watched the hook reject it
- [ ] Read: team charter, implementation plan, engineering handbook, `AGENTS.md`

When all of these are ticked, post "setup complete" in the team channel.
