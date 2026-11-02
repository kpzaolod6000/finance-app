# Functional Specification — Finance App

The **WHAT**. Defines features, business rules, and acceptance criteria.
It does not talk about technology (that's `plan.md`). Version 1.0.

---

## 1. Vision

A personal web application where a user records income and expenses, organizes them by accounts
and categories, sets budgets, and understands where their money goes through a clear, visual
dashboard. Multi-user (each person sees only their own data), but designed for individual use.

## 2. Actors

- **User**: a registered person managing their own finances. The only role in v1.

## 3. Version 1 scope (solid MVP)

Includes: authentication, accounts, categories, transactions (income/expense/transfer),
per-category budgets, dashboard with metrics and charts, filters, and basic reports.

Out of scope for v1 (noted for the future): automatic bank linking, real-time multi-currency
conversion, native mobile app, shared expenses between users, AI auto-categorization. The
architecture must leave the door open for these without a redesign.

---

## 4. Features and acceptance criteria

### F1 — Authentication

- The user can register with name, email, and password.
- Can sign in and sign out.
- Can edit their profile and change password.
- **Acceptance:** an unauthenticated user cannot reach any data screen; they are redirected to login.

### F2 — Accounts

Represent where the money is: cash, bank, card, savings, etc.

- Create, edit, archive, and delete accounts.
- Each account has: name, type (cash, bank, card, savings, investment), initial balance,
  currency, color/icon.
- The current balance is computed from initial balance + transactions; it is not editable by hand.
- **Acceptance:** creating an account with an initial balance of 1000 yields a current balance
  of 1000 with no transactions. After a 200 expense, the current balance is 800.
- **Rule:** an account with transactions cannot be deleted; it is archived.

### F3 — Categories

Classify transactions: food, transport, salary, etc.

- Create, edit, delete categories.
- Each category has: name, type (income or expense), color, icon, and optionally a parent
  category (subcategories, one level deep).
- A default set of categories is created on registration (seed).
- **Acceptance:** an "expense" category cannot be used on an income transaction.
- **Rule:** deleting a category with transactions requires reassigning them to another category
  or marks them as "uncategorized".

### F4 — Transactions

The heart of the system.

- Three types: **income**, **expense**, **transfer** (between two of the user's own accounts).
- Fields: amount, type, date, account (source and destination if transfer), category,
  description/note, optional tags.
- Create, edit, delete.
- Recurring transactions (monthly, weekly): generated automatically.
- List with pagination, text search, and filters (date range, account, category, type, amount).
- **Acceptance (amount):** amount must be > 0. A negative or zero amount is rejected.
- **Acceptance (transfer):** a transfer moves money from account A to account B without changing
  total net worth; it counts as neither income nor expense in reports.
- **Acceptance (recurring):** a monthly transaction created on the 5th generates a new instance
  automatically on the 5th of each month.
- **Rule:** a transfer requires two distinct accounts.

### F5 — Budgets

- Define a monthly budget per expense category (e.g. "Food: 500/month").
- See budget consumption in real time (spent vs. limit, % and remaining).
- Visual alert when crossing 80% and when crossing 100%.
- **Acceptance:** with a 500 budget and 450 spent in the month, the indicator shows 90% and an
  "at risk" status. At 510, it shows 102% and "exceeded".

### F6 — Dashboard

Main screen after signing in.

- Total net worth (sum of account balances).
- Income vs. expenses for the current month.
- Expense distribution by category (donut/pie chart).
- Income and expense trend over time (line/bar, last 6 months).
- Current-month budget status.
- Latest transactions.
- **Acceptance:** every figure on the dashboard reflects only the authenticated user's data and
  updates when a transaction is recorded.

### F7 — Reports

- Monthly summary: total income, total expenses, balance, savings.
- Month-over-month comparison.
- Export transactions to CSV.
- **Acceptance:** the exported CSV contains exactly the transactions matching the applied filter.

---

## 5. Cross-cutting business rules

- **BR1:** every record belongs to a user; nobody sees another user's data.
- **BR2:** money is handled with exact decimal precision (no floating-point errors).
- **BR3:** an account balance is always a computed value, never directly editable.
- **BR4:** transfers are neutral in income/expense reports.
- **BR5:** dates are stored in UTC and shown in the user's timezone.
- **BR6:** deletions are soft (soft delete) on transactions, accounts, and categories to allow
  auditing and recovery.

---

## 6. Empty and error states (don't forget)

- No accounts: the dashboard invites creating the first account.
- No transactions: a guiding message + action button.
- Validation error: clear messages next to each field.
- Server error: a friendly screen, never a stack trace.

---

## 7. MVP "done" criteria

- [ ] A user can register, create accounts and categories, record transactions of all three
      types, set budgets, and see everything reflected on the dashboard.
- [ ] All business rules (BR1–BR6) have at least one test that verifies them.
- [ ] The UI is responsive, accessible, and consistent.
- [ ] No way for a user to access another user's data (authorization test).

---

## 8. Design language (experience expectations)

The product reads as a calm, precise **ledger for adults** — not a colorful student app. This is a
product requirement, not just styling. (The technical implementation lives in `plan.md` §12.)

- **One coherent identity** across every screen, including authentication. No default framework
  branding is ever visible.
- **Dark by default**, neutral palette with a single restrained accent; color is reserved to carry
  meaning (income vs. expense vs. transfer), never decoration.
- **Money is legible:** all amounts render in aligned, tabular figures so columns scan cleanly.
- **Primary navigation is a persistent sidebar** (drawer on mobile); the current section is always
  clear.
- **Create/edit happens in a side panel (slide-over)** that scrolls on its own, so long forms never
  overflow or break the page. Small confirmations may still use a centered dialog.
- **Empty/error states guide the next action** (see §6) and speak in the interface's voice.
