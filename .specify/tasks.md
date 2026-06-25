# Implementation Tasks — Finance App

Ordered, verifiable breakdown. **Run one phase at a time** and review before continuing.
Each task is atomic and has a done criterion. Mark `[x]` when complete.

Convention: `[ ]` pending · `[~]` in progress · `[x]` done.

---

## PHASE 0 — Project scaffolding (dockerized)

> Everything runs through Laravel Sail. Host needs only Docker + Git. See `plan.md` §10.

- [ ] **0.1** Create the Laravel 13 project with the React + Inertia + TypeScript starter kit.
      Since there's no local PHP, use the throwaway Composer container or `laravel.build`:
      `curl -s "https://laravel.build/finance-app?with=pgsql" | bash` (or `laravel new` choosing
      React/TS, then add Sail). Ensure PostgreSQL is the selected Sail service.
      *Done when:* the project exists with a `docker-compose.yml` containing `laravel.test` + `pgsql`.
- [ ] **0.2** Configure `.env` for Docker: `DB_CONNECTION=pgsql`, **`DB_HOST=pgsql`** (service name,
      not localhost), `DB_PORT=5432`, plus Sail's `DB_DATABASE/USERNAME/PASSWORD`. Set `APP_URL=http://localhost`.
      *Done when:* `./vendor/bin/sail up -d` starts both containers and `sail artisan migrate` runs clean.
- [ ] **0.3** Install base dependencies through Sail: `spatie/laravel-data`, `brick/math`, Pest.
      Optional: `spatie/typescript-transformer`. (`./vendor/bin/sail composer require ...`)
      *Done when:* `./vendor/bin/sail artisan test` runs the example test.
- [ ] **0.4** Configure Tailwind v4 + shadcn/ui via Sail (`./vendor/bin/sail npm ...`). Initialize
      theme tokens (colors, radii).
      *Done when:* a shadcn component (Button) renders styled at `http://localhost`.
- [ ] **0.5** Configure Pint, ESLint, and type checking, all run through Sail
      (`sail pint`, `sail npm run lint`, `sail npm run types`).
      *Done when:* all three pass clean inside the container.
- [ ] **0.6** Set UUID v7 as the default PK and `timestamptz`/`date` in migrations.
      *Done when:* a test migration creates a table with a `uuid` pk in Postgres.
- [ ] **0.7** Commit a complete `.env.example` (with `DB_HOST=pgsql`) and a `.gitignore`.
      *Done when:* a fresh clone can `cp .env.example .env` and boot with documented steps only.

> **Checkpoint 0:** `sail up -d` brings the stack up, DB connected, quality tools green, app loads at localhost.

---

## PHASE 1 — Authentication and user (F1)

- [ ] **1.1** Verify the starter kit's register/login/logout flows.
- [ ] **1.2** Extend `users` with `timezone` and `default_currency` (migration + editable profile).
- [ ] **1.3** Profile screen: edit name, email, timezone, currency; change password.
- [ ] **1.4** Middleware: all data routes require auth; redirect to login.
- [ ] **1.5** Tests: an unauthenticated user cannot reach `/dashboard` or any resource.

> **Checkpoint 1:** I can register, sign in, edit my profile, and sign out.

---

## PHASE 2 — Accounts and categories (F2, F3)

- [ ] **2.1** `accounts` and `categories` migrations per `data-model.md`.
- [ ] **2.2** `Account` and `Category` models with relations, casts, enums, soft deletes, per-user scope.
- [ ] **2.3** `AccountType` and `CategoryType` enums.
- [ ] **2.4** `AccountData` and `CategoryData` DTOs.
- [ ] **2.5** `AccountPolicy` and `CategoryPolicy` (everything filters by `user_id`).
- [ ] **2.6** Store/update Form Requests for both.
- [ ] **2.7** Actions: `CreateAccount`, `UpdateAccount`, `ArchiveAccount`; category equivalents.
- [ ] **2.8** `BalanceCalculator` service (initial balance + movements, on the fly).
- [ ] **2.9** Controllers + React pages: list, create/edit (modal or page), archive.
- [ ] **2.10** `DefaultCategoriesSeeder` and trigger on user registration.
- [ ] **2.11** Tests: create account with initial balance; archive instead of delete when it has
      movements; an expense category cannot be used as income.

> **Checkpoint 2:** I manage accounts and categories; I see computed balances; I have default categories.

---

## PHASE 3 — Transactions (F4)

- [ ] **3.1** `transactions` migration with CHECKs (`amount > 0`, transfer rule) and indexes.
- [ ] **3.2** `Transaction` model with relations, `TransactionType` enum, soft delete, filter scopes.
- [ ] **3.3** `TransactionData` DTO (amount as decimal string).
- [ ] **3.4** `TransactionPolicy`.
- [ ] **3.5** Form Requests `StoreTransactionRequest`, `UpdateTransactionRequest`
      (validate type↔category, transfer with two distinct accounts, amount > 0).
- [ ] **3.6** Actions: `CreateTransaction`, `UpdateTransaction`, `DeleteTransaction`,
      `TransferBetweenAccounts`.
- [ ] **3.7** `TransactionObserver` (hook to invalidate caches / recompute if option B is chosen).
- [ ] **3.8** Controller + React pages: paginated list with search and filters
      (date, account, category, type, amount); create/edit form.
- [ ] **3.9** Tests: invalid amount rejected; transfer neutral in reports; transfer requires two
      accounts; cross-user isolation.

> **Checkpoint 3:** I record income, expenses, and transfers; I filter and search; balances update correctly.

---

## PHASE 4 — Recurring transactions (F4 recurrence)

- [ ] **4.1** `recurring_transactions` migration + `RecurrenceInterval` enum.
- [ ] **4.2** Model + DTO + Policy.
- [ ] **4.3** `GenerateRecurringTransactions` Action (generate due items, advance `next_run_at`, respect `ends_at`).
- [ ] **4.4** `transactions:generate-recurring` command scheduled in `routes/console.php`.
      In Docker, run the scheduler worker for dev (`./vendor/bin/sail artisan schedule:work`);
      for prod, add a dedicated cron/scheduler service to `docker-compose`.
- [ ] **4.5** UI: mark a transaction as recurring; list/edit/pause recurring templates.
- [ ] **4.6** Tests: a monthly one generates an instance when due; no duplicates; respects end date.

> **Checkpoint 4:** a recurring transaction materializes on its own on its date.

---

## PHASE 5 — Budgets (F5)

- [ ] **5.1** `budgets` migration with uniqueness `(user_id, category_id, period_month)`.
- [ ] **5.2** Model + `BudgetData` DTO + Policy.
- [ ] **5.3** `SetBudget` and `CalculateBudgetUsage` Actions (spent vs. limit, %, status).
- [ ] **5.4** `BudgetStatus` enum/computation (ok / at_risk ≥80% / exceeded >100%).
- [ ] **5.5** UI: set the month's budgets, progress bars with color states.
- [ ] **5.6** Tests: 450/500 → 90% "at risk"; 510/500 → 102% "exceeded".

> **Checkpoint 5:** I set budgets and see consumption with visual alerts.

---

## PHASE 6 — Dashboard and reports (F6, F7)

- [ ] **6.1** `ReportRepository` with aggregate queries (by category, by month, balance).
- [ ] **6.2** `DashboardData` DTO assembling all dashboard metrics.
- [ ] **6.3** `DashboardController` → React dashboard page.
- [ ] **6.4** Chart components (expense donut by category; line/bar over 6 months).
      Use a charting library compatible with React 19.
- [ ] **6.5** Cards: net worth, income vs. expenses for the month, budgets, latest transactions.
- [ ] **6.6** Reports: monthly summary, month-over-month comparison, CSV export of the current filter.
- [ ] **6.7** Tests: figures reflect only the user's data; the CSV respects the filter.

> **Checkpoint 6:** the dashboard tells the month's financial story at a glance.

---

## PHASE 7 — Polish and close

- [ ] **7.1** Empty, loading, and error states on every screen.
- [ ] **7.2** Accessibility: focus, labels, contrast, keyboard navigation.
- [ ] **7.3** Mobile responsive.
- [ ] **7.4** Security review: no query without a user filter; Policies on every action.
- [ ] **7.5** Full suite green; Pint, ESLint, and types with no errors.
- [ ] **7.6** App README with startup instructions and a complete `.env.example`.

> **Final checkpoint:** all "done" criteria from `spec.md` §7 are met.

---

## How to ask Claude Code to advance

> "Run PHASE 2 of tasks.md. Start at 2.1 and stop at Checkpoint 2 for my review.
> Follow constitution.md and plan.md. Write each task's tests alongside the code."
