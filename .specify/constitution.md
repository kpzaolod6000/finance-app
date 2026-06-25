# Project Constitution

Non-negotiable principles. Every design decision and every PR is measured against this.
Version 1.0.

---

## Article I — Quality over speed

We prefer clear, tested code over code that's fast to write. If a feature has no test, it's not
done. The goal is a small but **flawless** system, not a throwaway MVP.

## Article II — Separation of concerns

Each piece does exactly one thing:

- **Controller**: receives the request, delegates, returns the response. No logic.
- **Form Request**: validates and authorizes input.
- **Action**: one unit of business logic, invokable, testable in isolation.
- **DTO**: carries typed data between layers.
- **Model**: persistence and Eloquent relations. No heavy business logic.
- **Policy**: decides who can do what.
- **Resource / Inertia props**: the shape of data flowing out to React.

If a class needs more than one sentence to explain "what it does", it's doing too much.

## Article III — User data is sacred

- Every personal-data query **filters by the authenticated user**. No exceptions.
- Authorization is checked via Policies, not loose `if` statements.
- Money is represented with exact types (`decimal`/`numeric`), never `float`.
- Migrations are the only way to change the schema. No manual DB changes.

## Article IV — Design patterns with judgment

We use patterns because they solve a real problem, not because they're fashionable:

- **Action pattern**: to encapsulate use cases (create transaction, transfer between accounts…).
- **DTO pattern**: for explicit data contracts.
- **Repository pattern**: **only** when an entity has complex queries reused in several places.
  We don't apply it to everything by default (Eloquent is already a decent repository).
- **Policy / Gate**: for every access decision.
- **Backed Enum (PHP 8.1+)**: for closed states and types (transaction type, currency…).

Over-engineering is forbidden. A pattern that solves no concrete problem is debt.

## Article V — End-to-end typing

The backend defines the shape of data via DTOs. The frontend consumes that data with TypeScript
types mirroring that shape. A change to the data contract must break compilation if the front
isn't updated. No `any` unless justified in writing.

## Article VI — Modern, consistent UI

- Design system based on tokens (Tailwind v4 + shadcn/ui). No stray magic styles.
- Reusable, accessible components (labels, focus, contrast).
- Empty, loading, and error states are always considered, not just the happy path.
- Responsive by default.
- All user-facing copy in English (see CLAUDE.md language policy).

## Article VII — Spec-driven, always

Code serves the specification, not the other way around. Unbreakable order:

```
change in spec.md → update plan.md and tasks.md → implement → test → mark task done
```

Nothing gets built "on the fly" without going through the spec.

## Article VIII — Reversibility

Every change must be revertible: migrations with `down()`, atomic commits, no hidden coupling.
If something can't be cleanly reverted, it gets redesigned.
