# CLAUDE.md — Permanent project instructions

> Claude Code reads this file every session. It's the operational source of truth.
> If anything here conflicts with your instinct, this file wins.

## What this project is

Personal expense & finance tracker. Fixed stack:

- **Backend:** Laravel 13, PHP 8.3+, PostgreSQL 16
- **Frontend:** Inertia.js v2 + React 19 + TypeScript, Tailwind CSS v4, shadcn/ui
- **Auth:** Laravel starter kit (Sanctum under the hood)
- **Tests:** Pest
- **Runtime:** fully dockerized with Laravel Sail (host needs only Docker + Git)

## Documents you must respect (in order)

1. `.specify/constitution.md` — non-negotiable principles
2. `.specify/spec.md` — what gets built (features + acceptance criteria)
3. `.specify/plan.md` — how it's built (architecture + patterns)
4. `.specify/data-model.md` — database schema
5. `.specify/tasks.md` — ordered steps

**Never implement anything not in the spec.** If the user asks for a new feature, first propose
updating `spec.md` → `plan.md` → `tasks.md`, and only then write code.

## Language policy

- **Everything is in English**: code, identifiers, comments, docs, commit messages, and
  user-facing UI text. This is a full-English professional repo.
- Domain names in English: `Transaction`, `Account`, `Category`, `Budget`, etc.
- If localization is needed later, use Laravel `lang/` files + a front-end i18n layer; do not
  hardcode non-English strings.

## Golden rules

- **One `tasks.md` phase at a time.** Stop and ask for review before continuing.
- **Business logic in Actions, not controllers.** Controllers only orchestrate.
- **Validation in Form Requests.** Never validate inside controllers or Actions.
- **Data between layers via DTOs** (spatie/laravel-data). No loose arrays.
- **Authorization via Policies.** Every user query filters by `user_id`, ALWAYS.
- **Money = `decimal`/`numeric`**, never `float`. Store as `numeric(14,2)`.
- **Strict TypeScript** on the front. Shared types derived from the DTOs.
- **Tests with the code**, not after. Every Action has a feature test.
- **Small, atomic commits**, imperative mood messages.

## Environment: dockerized (Laravel Sail)

This project runs **fully in Docker via Laravel Sail**. The host only needs Docker + Git.
**Every command runs through Sail.** Never assume local PHP/Node/Postgres exist.

```bash
./vendor/bin/sail up -d                          # start the stack (app + pgsql)
./vendor/bin/sail down                           # stop

# Tests
./vendor/bin/sail artisan test                   # or: ./vendor/bin/sail pest

# Code quality
./vendor/bin/sail pint                            # PHP formatting
./vendor/bin/sail npm run lint                    # ESLint
./vendor/bin/sail npm run types                   # TS type check

# Database
./vendor/bin/sail artisan migrate:fresh --seed

# Front-end dev server
./vendor/bin/sail npm run dev

# Shell into the container / tinker
./vendor/bin/sail shell
./vendor/bin/sail artisan tinker
```

Critical Docker rule: in `.env`, **`DB_HOST=pgsql`** (the compose service name), not
`localhost`/`127.0.0.1`. See `plan.md` §10 for full setup.

## Style

- PHP: PSR-12, strict typing (`declare(strict_types=1)`), Pint is authoritative.
- React: functional components, hooks, no classes. Files in `PascalCase.tsx`.
- All identifiers and user-facing copy in English.

## When the user wants to learn

You have the `finance-mentor` skill. Use it whenever they ask how something is built, how to
approach a new feature, or which pattern to apply. Explain the technical *why* before writing
code.
