# Technical Plan — Finance App

The **HOW**. Architecture, design patterns, folder structure, and technical decisions with
their rationale. Implements what `spec.md` asks while respecting `constitution.md`.
Version 1.0.

---

## 1. Stack and versions

| Layer | Technology | Version | Why |
|-------|-----------|---------|-----|
| Backend language | PHP | 8.3+ | required by Laravel 13; enums, readonly props, types |
| Framework | Laravel | 13.x | latest major; stable AI SDK, passkeys, DX improvements |
| Front-back bridge | Inertia.js | 2.x | real React without building a separate REST API |
| UI | React | 19.x | latest stable; Actions, compiler, modern patterns |
| Front typing | TypeScript | 5.x | end-to-end data contracts |
| Styling | Tailwind CSS | 4.x | tokens, utilities, modern theming |
| Components | shadcn/ui | current | accessible, headless, copy-paste, no lock-in |
| Data | PostgreSQL | 16+ | exact `numeric`, native enums, partial indexes |
| Auth | Laravel starter kit | — | login/register/profile ready (Sanctum underneath) |
| Tests | Pest | 3.x | readable feature tests over the real logic |
| Formatting/quality | Pint + ESLint + TS | — | consistent, automated style |
| Runtime | Docker + Laravel Sail | — | fully containerized; host needs only Docker |

### Why Inertia instead of a separate REST API?

The system is single-user-per-session and single-deployment. Inertia gives **real React**
(components, hooks, TS) while letting Laravel handle routing, auth, and validation without
duplicating logic across two projects or inventing an HTTP contract. Less surface, fewer bugs,
same modern result. If a public API or mobile app is needed later, add a `routes/api.php` layer
reusing the same Actions and DTOs (that's why the logic lives there and not in controllers).

---

## 2. Layered architecture

```
HTTP Request
   │
   ▼
[Route] ──► [Form Request]  validates + authorizes input
   │              │
   │              ▼
[Controller]  delegates, doesn't decide
   │
   ▼
[Action]  ◄── receives a DTO ── single use case, testable
   │
   ├──► [Service]      (only if logic is shared across Actions)
   ├──► [Model/Eloquent]  persistence
   └──► [Policy]       domain authorization
   │
   ▼
[Resource / Inertia props]  typed output shape
   │
   ▼
[React + TS]  components, hooks, Tailwind, shadcn/ui
```

### Responsibility of each layer

- **Form Request** (`app/Http/Requests`): validation rules + `authorize()`. Turns raw input
  into trusted data.
- **Controller** (`app/Http/Controllers`): thin. Takes the Request, builds the DTO, calls the
  Action, returns `Inertia::render(...)` or a redirect. Zero business logic.
- **DTO** (`app/Data`, with spatie/laravel-data): immutable, typed object traveling between
  layers. Also used to type the props sent to React.
- **Action** (`app/Actions`): one class = one use case (`CreateTransaction`,
  `TransferBetweenAccounts`, `CalculateBudgetUsage`). `handle()` or `__invoke()` method.
  Business logic lives here. This is what gets tested most carefully.
- **Service** (`app/Services`): only when several Actions share non-trivial logic
  (e.g. `BalanceCalculator`). We don't create a Service "just in case".
- **Model** (`app/Models`): relations, casts, scopes, enums. No heavy business logic.
- **Policy** (`app/Policies`): `view`, `update`, `delete` per entity. Every action on user data
  goes through here.
- **Enum** (`app/Enums`): `TransactionType`, `AccountType`, `BudgetStatus`, etc.

---

## 3. Design patterns applied (and where)

| Pattern | Where | Problem it solves |
|---------|-------|-------------------|
| **Action** | `app/Actions/**` | encapsulates use cases, makes them testable and reusable (web today, API tomorrow) |
| **DTO** | `app/Data/**` | explicit, immutable data contract between layers and toward React |
| **Form Request** | `app/Http/Requests/**` | centralizes input validation and authorization |
| **Policy / Gate** | `app/Policies/**` | declarative domain authorization |
| **Backed Enum** | `app/Enums/**` | closed, type-safe states/types |
| **Repository** | `app/Repositories/**` | **only** for complex reused queries (e.g. reports); not for simple CRUD |
| **Observer** | `app/Observers/**` | side effects on save (e.g. recompute cached balance) |
| **Factory + Seeder** | `database/**` | test data and default categories |
| **Service Provider** | `app/Providers/**` | interface binding (e.g. Repository) and Policy registration |

> **Constitution rule (Article IV):** a pattern without a problem to solve is debt.
> The Repository is NOT applied to everything; Eloquent is already a decent repository for CRUD.

---

## 4. Target folder structure

```
app/
├── Actions/
│   ├── Accounts/        CreateAccount, UpdateAccount, ArchiveAccount
│   ├── Categories/      CreateCategory, ...
│   ├── Transactions/    CreateTransaction, UpdateTransaction, TransferBetweenAccounts,
│   │                    GenerateRecurringTransactions
│   └── Budgets/         SetBudget, CalculateBudgetUsage
├── Data/                AccountData, CategoryData, TransactionData, BudgetData,
│                        DashboardData  (DTOs)
├── Enums/               TransactionType, AccountType, CategoryType, BudgetStatus, RecurrenceInterval
├── Http/
│   ├── Controllers/     AccountController, CategoryController, TransactionController,
│   │                    BudgetController, DashboardController, ReportController
│   └── Requests/        StoreTransactionRequest, UpdateTransactionRequest, ...
├── Models/              User, Account, Category, Transaction, Budget, RecurringTransaction
├── Policies/            AccountPolicy, CategoryPolicy, TransactionPolicy, BudgetPolicy
├── Repositories/        ReportRepository (complex aggregate queries)
├── Services/            BalanceCalculator, NetWorthCalculator
└── Observers/           TransactionObserver

database/
├── migrations/
├── factories/
└── seeders/             DatabaseSeeder, DefaultCategoriesSeeder

resources/
├── js/
│   ├── Pages/           Dashboard, Accounts/*, Categories/*, Transactions/*, Budgets/*, Reports/*
│   ├── Components/       ui/ (shadcn), charts/, forms/, layout/
│   ├── Layouts/          AppLayout, AuthLayout
│   ├── hooks/            useCurrency, useFilters
│   ├── lib/              utils, formatMoney, api types
│   └── types/            TS types mirroring the DTOs
└── css/                  app.css (Tailwind v4)

routes/
├── web.php              Inertia routes
└── console.php          recurring transactions schedule

tests/
├── Feature/             one file per Action and per flow
└── Unit/                pure calculations (BalanceCalculator, etc.)
```

---

## 5. Data contracts (DTO ↔ TypeScript)

The backend defines DTOs with spatie/laravel-data. The front has TS types mirroring those DTOs.
Keeping them in sync is mandatory (Article V).

Conceptual example:

```php
// app/Data/TransactionData.php
final class TransactionData extends Data {
    public function __construct(
        public string $id,
        public TransactionType $type,
        public string $amount,        // decimal as string to avoid precision loss
        public string $currency,
        public CarbonImmutable $date,
        public ?string $description,
        public string $accountId,
        public ?string $categoryId,
    ) {}
}
```

```ts
// resources/js/types/transaction.ts
export type TransactionType = 'income' | 'expense' | 'transfer';
export interface Transaction {
  id: string;
  type: TransactionType;
  amount: string;        // exact decimal as string
  currency: string;
  date: string;          // ISO 8601
  description: string | null;
  accountId: string;
  categoryId: string | null;
}
```

> Recommended option: use spatie's `typescript-transformer` to auto-generate the `.ts` files
> from the DTOs, so a change in PHP breaks the TS build if the front isn't updated.

---

## 6. Money handling

- `numeric(14,2)` columns in PostgreSQL.
- In PHP, transported as a **string** inside DTOs to avoid precision loss, and operated on with
  `brick/math` (BigDecimal) or `bcmath`. Never `float`.
- In React, formatted only for display (`Intl.NumberFormat`), never operated on as `number` for
  sensitive totals.

---

## 7. Balance calculation (decision)

An account balance = initial balance + sum of movements. Two options:

- **A) Always compute on the fly** with an aggregate query. Simple, always correct.
- **B) Keep a cached balance** updated by a `TransactionObserver` on every change. Faster for
  large lists, but consistency must be guarded.

**v1 decision:** option A (on-the-fly via `BalanceCalculator`), encapsulated in a Service so we
can migrate to B without touching the rest of the code if volume demands it.

---

## 8. Recurring transactions

- `RecurringTransaction` model with `interval` (enum) and `next_run_at`.
- `php artisan transactions:generate-recurring` command scheduled in `routes/console.php`
  (Laravel Scheduler, runs daily).
- The `GenerateRecurringTransactions` Action creates the due instances and advances `next_run_at`.

---

## 9. Security

- Every query starts from `auth()->user()->...` or a global scope by `user_id`.
- Policies registered and checked in every controller (`$this->authorize(...)`).
- Soft deletes on sensitive entities.
- CSRF and Form Request validation on all input.
- Sensitive variables only in `.env` (never committed).

---

## 10. Development environment — Docker (official path)

This project runs **fully dockerized via Laravel Sail**. Sail is the official Docker setup that
ships with Laravel: a `docker-compose.yml` with PHP 8.3, PostgreSQL 16, and Node baked in. The
host machine only needs **Docker Desktop** (or Docker Engine) and Git. No local PHP, Composer,
Node, or PostgreSQL required.

### Services in `docker-compose.yml`

| Service | Image | Purpose |
|---------|-------|---------|
| `laravel.test` | Sail PHP 8.3 | app + Vite |
| `pgsql` | postgres:16 | database |
| (optional) `redis` | redis | cache / queue, if needed later |

### First-time setup

```bash
# 1. Install Composer deps using a throwaway container (no local PHP needed)
docker run --rm -v "$(pwd)":/var/www/html -w /var/www/html \
  laravelsail/php83-composer:latest \
  composer install --ignore-platform-reqs

# 2. Configure env: set DB_HOST=pgsql and the Sail Postgres credentials
cp .env.example .env

# 3. Bring the stack up
./vendor/bin/sail up -d

# 4. App key, migrations, seed, front-end deps
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan migrate --seed
./vendor/bin/sail npm install
./vendor/bin/sail npm run dev
```

App available at `http://localhost`. Vite dev server is proxied by Sail.

### `.env` keys that matter for Docker

```
APP_URL=http://localhost
DB_CONNECTION=pgsql
DB_HOST=pgsql            # the service name in docker-compose, NOT 127.0.0.1
DB_PORT=5432
DB_DATABASE=finance
DB_USERNAME=sail
DB_PASSWORD=password
```

> Key gotcha: inside Docker, `DB_HOST` is the **service name** (`pgsql`), not `localhost`.
> `localhost` from the app container points to the container itself, not to Postgres.

### Everyday commands (everything runs through Sail)

```bash
./vendor/bin/sail up -d                       # start
./vendor/bin/sail down                        # stop
./vendor/bin/sail artisan migrate:fresh --seed
./vendor/bin/sail artisan test                # or: sail pest
./vendor/bin/sail pint                         # PHP formatting
./vendor/bin/sail npm run dev / lint / types   # front-end
./vendor/bin/sail shell                        # shell into the app container
./vendor/bin/sail artisan tinker
```

> Tip: alias `sail='./vendor/bin/sail'` to shorten every command.

### Scheduler (recurring transactions) in Docker

The Laravel Scheduler needs a cron driver. For dev, run the scheduler worker:
`./vendor/bin/sail artisan schedule:work`. For production, add a dedicated cron/queue service to
compose (documented in PHASE 4 / the deploy notes).

---

## 11. Technical "definition of done"

- Code formatted (Pint), no ESLint errors, no TS type errors.
- Each Action with its feature test green.
- Migrations with both `up()` and `down()`.
- No cross-user access (a test proves it).
