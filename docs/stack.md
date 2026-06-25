# Finance App — Stack & Setup

> Personal expense & finance tracker · Laravel 13 + Inertia + React 19 + Tailwind v4

**Status:** `sail up -d` → PHP 8.4 + PostgreSQL 16 healthy · 53/53 tests passing · Pint / ESLint / tsc all green  
**Branch:** `develop` · **Phase:** All 7 phases complete · MVP done

---

## Stack

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Backend | Laravel | 13.17 | PHP 8.4 required (symfony/http-foundation v8 uses property hooks) |
| Bridge | Inertia.js | 2.x | Server-side routing, no separate REST API |
| Frontend | React | 19 | TypeScript strict, functional components only |
| Styling | Tailwind CSS | 4.x | Via `@tailwindcss/vite` — no postcss config needed |
| Components | shadcn/ui | Nova preset | Radix primitives, Geist font, oklch color tokens |
| Database | PostgreSQL | 16-alpine | `numeric(14,2)` for money, never float |
| Auth | Laravel Breeze | 2.4 | Sanctum under the hood, React/TS/Pest stack |
| Tests | Pest | 4.x | `withoutVite()` in `TestCase::setUp()` |
| DTOs | spatie/laravel-data | 4.23 | Typed data contracts between layers and React |
| Math | brick/math | 0.18 | BigDecimal arithmetic — amounts are strings in DTOs |
| PKs | UUID v7 | ramsey/uuid 4.9 | `App\Concerns\HasUuidV7` trait on all models |
| Runtime | Laravel Sail | 1.63 | Docker only. Host needs Docker + Git, nothing else. |

---

## First-time setup

Host needs **Docker + Git only**. No local PHP, Node, or PostgreSQL required.

### 1 — Clone & configure

```bash
git clone <repo> && cd finance-app
cp .env.example .env
# DB_HOST=pgsql is already set — do not change it
```

### 2 — Install Composer deps (no local PHP needed)

```bash
docker run --rm \
  -v "$(pwd)":/var/www/html \
  -w /var/www/html \
  laravelsail/php84-composer:latest \
  composer install --ignore-platform-reqs
```

> **Warning:** Use `php84-composer`, not `php83-composer`. symfony/http-foundation v8.1 uses PHP 8.4 property hooks and fails to parse on PHP 8.3.

### 3 — Start the stack

```bash
./vendor/bin/sail up -d
# Builds the PHP 8.4 image on first run (~2 min). Subsequent starts are instant.
```

### 4 — Generate key, migrate, install Node deps

```bash
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan migrate
./vendor/bin/sail npm install
# .npmrc sets legacy-peer-deps=true automatically
```

### 5 — Start the frontend dev server

```bash
./vendor/bin/sail npm run dev
# App at http://localhost  |  Vite HMR on :5173
```

---

## Daily usage

### Start / stop

```bash
./vendor/bin/sail up -d
./vendor/bin/sail down
```

### Frontend

```bash
./vendor/bin/sail npm run dev
./vendor/bin/sail npm run build
```

### Database

```bash
./vendor/bin/sail artisan migrate
./vendor/bin/sail artisan migrate:fresh --seed
```

### Tests

```bash
./vendor/bin/sail artisan test
```

### Quality gates (run all three before committing)

```bash
./vendor/bin/sail pint               # PHP format
./vendor/bin/sail npm run lint       # ESLint
./vendor/bin/sail npm run types      # tsc --noEmit
```

### Shell / Tinker

```bash
./vendor/bin/sail shell
./vendor/bin/sail artisan tinker
```

---

## Critical config (`.env`)

> **`DB_HOST` must be `pgsql`** (the Docker service name). Using `localhost` or `127.0.0.1` will fail — from inside the app container those point to the container itself, not to Postgres.

| Key | Value |
|---|---|
| `DB_CONNECTION` | `pgsql` |
| `DB_HOST` | `pgsql` — the Compose service name, never `localhost` |
| `DB_PORT` | `5432` |
| `DB_DATABASE` | `finance` |
| `DB_USERNAME` | `sail` |
| `DB_PASSWORD` | `password` |
| `APP_URL` | `http://localhost` |

---

## Known gotchas

- **`npm install`** — always run through Sail. `.npmrc` sets `legacy-peer-deps=true` to resolve the `laravel-vite-plugin@3.1` ↔ `@vitejs/plugin-react@4.x` peer conflict over Vite 8.
- **Throwaway Composer container** — always use `laravelsail/php84-composer:latest`, not the `php83` variant.
- **Recurring transactions scheduler** — in dev, run `./vendor/bin/sail artisan schedule:work` in a separate terminal. In production, add a cron/scheduler service to `compose.yaml`.

---

## Routes

| Method | URI | Name | Purpose |
|---|---|---|---|
| GET | `/dashboard` | `dashboard` | Dashboard with charts + summaries |
| GET | `/accounts` | `accounts.index` | Account list |
| POST | `/accounts` | `accounts.store` | Create account |
| PUT | `/accounts/{id}` | `accounts.update` | Edit account |
| DELETE | `/accounts/{id}` | `accounts.destroy` | Archive/delete account |
| GET | `/categories` | `categories.index` | Category list |
| POST/PUT/DELETE | `/categories/*` | `categories.*` | CRUD categories |
| GET | `/transactions` | `transactions.index` | Paginated list with filters |
| POST/PUT/DELETE | `/transactions/*` | `transactions.*` | CRUD transactions |
| GET | `/budgets` | `budgets.index` | Budget list by month |
| POST | `/budgets` | `budgets.store` | Set/upsert budget |
| DELETE | `/budgets/{id}` | `budgets.destroy` | Remove budget |
| GET | `/reports` | `reports.index` | Monthly summary + chart |
| GET | `/reports/export` | `reports.export` | CSV download |
| GET | `/profile` | `profile.edit` | Profile (name/email/timezone/currency) |

---

## Recurring transactions (dev)

```bash
# Trigger manually
./vendor/bin/sail artisan transactions:generate-recurring

# Run the scheduler (generates daily at midnight)
./vendor/bin/sail artisan schedule:work
```

---

## Phase progress

| Phase | Description | Status |
|---|---|---|
| 0 | Dockerized scaffolding — Laravel 13 + Sail + Tailwind v4 + shadcn | ✅ done |
| 1 | Authentication & user profile (timezone, default_currency) | ✅ done |
| 2 | Accounts & categories (migrations, models, Actions, UI) | ✅ done |
| 3 | Transactions — income / expense / transfer + filters | ✅ done |
| 4 | Recurring transactions + scheduler | ✅ done |
| 5 | Budgets with visual alerts (ok / at-risk / exceeded) | ✅ done |
| 6 | Dashboard + reports + CSV export | ✅ done |
| 7 | Polish — nav links, empty states, security audit | ✅ done |
