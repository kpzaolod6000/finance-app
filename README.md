# Finance App — Personal Expense & Finance Tracker

A **Spec-Driven Development (SDD)** package ready to hand off to **Claude Code**.
Stack: **Laravel 13 + Inertia.js v2 + React 19 + TypeScript + Tailwind v4 + PostgreSQL 16**.

---

## What this is

This is not code yet. It's the **executable specification** for the project: the set of
documents Claude Code reads to build the system in an orderly way, with a defined architecture
and no improvising. The idea of spec-driven development is simple: first agree on *what* you're
building and *how*, then write the code.

```
finance-app/
├── README.md              ← you are here: how to use everything
├── CLAUDE.md              ← permanent rules Claude Code reads every session
├── .specify/
│   ├── constitution.md    ← non-negotiable principles (quality, patterns, security)
│   ├── spec.md            ← the WHAT: features, business rules, acceptance criteria
│   ├── plan.md            ← the HOW: architecture, design patterns, technical decisions
│   ├── data-model.md      ← PostgreSQL schema: tables, relations, indexes
│   └── tasks.md           ← ordered, verifiable implementation tasks
└── .claude/skills/finance-mentor/
    └── SKILL.md           ← technical mentor: triggers on its own to explain the project
```

---

## The SDD flow (the order Claude Code reads in)

```
constitution.md  →  spec.md  →  plan.md  →  data-model.md  →  tasks.md  →  code
   principles        what         how         data            steps
```

Each document answers a different layer and builds on the previous one. If something isn't in
the spec, it doesn't get built. If you want a new feature, you update the spec first, then the
plan/tasks, and only then write code.

---

## How to spin it up with Claude Code (step by step)

### 1. Install Claude Code (if you don't have it)

```bash
npm install -g @anthropic-ai/claude-code
```

### 2. Use this folder as your project root and enter it

```bash
cd finance-app
claude
```

Claude Code auto-detects `CLAUDE.md` and loads the project context. The `finance-mentor` skill
becomes available for whenever you ask how something is built.

### 3. Suggested first prompt (scaffolding)

Paste this to Claude Code:

```
Read .specify/constitution.md, .specify/spec.md, .specify/plan.md,
.specify/data-model.md and .specify/tasks.md. Then run PHASE 0 of
tasks.md: create the dockerized Laravel 13 project with the React
starter kit and Laravel Sail (PostgreSQL service), get the stack
running with `sail up -d`, and confirm migrations run. This project is
fully dockerized — every command must go through ./vendor/bin/sail.
Confirm with me before installing dependencies.
```

### 4. Advance phase by phase

`tasks.md` is split into phases (0 to 7). Ask Claude Code to run **one phase at a time** and
review the result before moving on. Don't ask it to "do everything": the point of SDD is to
review at checkpoints.

### 5. When you want to learn or start something new

Ask in natural language, e.g.:

- *"How is the transaction creation layer built?"*
- *"I want to add per-category budgets, how do I approach it technically?"*

The `finance-mentor` skill will trigger and give you the technical explanation + the pattern to
follow, instead of just writing code blindly.

---

## Machine requirements

This project is **fully dockerized**. Your machine only needs:

| Tool | Min version | For |
|------|-------------|-----|
| Docker Desktop / Engine | current | runs everything (PHP, Postgres, Node) |
| Git | any | version control |

> No local PHP, Composer, Node, or PostgreSQL needed — they all live inside containers via
> **Laravel Sail**. Full setup in `.specify/plan.md` §10.

---

## Decisions already made (so you don't have to)

- **Inertia.js v2 + React**, not a separate REST API → single deployment, less boilerplate, real React.
- **PostgreSQL**, not MySQL → exact `numeric` money types, native enums, better indexes.
- **Fully dockerized with Laravel Sail** → host needs only Docker; consistent environment everywhere.
- **Actions + DTOs + Form Requests + Policies** → testable business logic decoupled from controllers.
- **TypeScript on the front** → clear data contracts between Laravel and React.
- **Pest** for tests → clean syntax, feature tests over the real logic.
- **Full-English codebase and UI** → professional repo standard; ready for i18n later.

The full detail and the *why* behind every decision is in `.specify/plan.md`.
