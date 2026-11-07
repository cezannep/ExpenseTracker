# System Design & Architecture: Personal Expense Tracker PWA

**Document status:** Updated architecture baseline\
**Purpose:** Implementation specification for the coding agent\
**Version:** 2.1\
**Last updated:** 7 November 2026

------------------------------------------------------------------------

## 1. Executive Summary

The **Personal Expense Tracker PWA** is a high-performance, mobile-first
Progressive Web Application designed for frictionless daily financial
tracking, budget management, and spending insights.

The application uses **Next.js 16 App Router, React 19, TypeScript,
Tailwind CSS v4, Zustand, Firebase Authentication, and Cloud
Firestore**. It is designed to work online and provide a clearly defined
offline experience, including safe local transaction capture and
synchronization when connectivity returns.

The system must prioritize:

1.  Financial data accuracy and consistency.
2.  Clear separation of UI, business logic, state management, and
    persistence.
3.  Reusable components and maintainable feature-oriented code.
4.  Secure user-scoped data access.
5.  Predictable offline behavior and synchronization.
6.  Mobile-first usability, accessibility, and performance.

This document is the source of truth for implementation decisions. The
coding agent must follow the architecture and constraints described
here. If an implementation detail is not specified, prefer the simplest
maintainable solution that fits the existing stack. Do not introduce
additional libraries, abstractions, or optimizations without a concrete
requirement.

## 2. Technology Stack

  -----------------------------------------------------------------------
  Layer                   Technology              Purpose
  ----------------------- ----------------------- -----------------------
  Framework               Next.js 16.3.0, App     Routing, layouts,
                          Router                  application structure

  UI library              React 19.2.8            Component-based user
                                                  interface

  Language                TypeScript 5.x          Static type safety

  Styling                 Tailwind CSS v4,        Responsive styling and
                          PostCSS                 theme tokens

  Animation               Framer Motion 12.x      Gestures, transitions,
                                                  and sheet animations

  State management        Zustand 5.x             Client-side application
                                                  state

  Local persistence       Zustand persist /       UI preferences and
                          localStorage            carefully selected
                                                  local cache

  Backend and             Firebase 12.x           Google authentication
  authentication                                  and cloud services

  Database                Cloud Firestore         User profiles,
                                                  transactions, and
                                                  budget history

  Charts                  Recharts 3.x            Financial charts and
                                                  visual analytics

  Icons                   Lucide React            Consistent iconography

  Forms                   React Hook Form         Form state and
                                                  submission

  Validation              Zod 3.x                 Runtime validation and
                                                  typed schemas

  PWA                     Web App Manifest and    Installability and
                          Service Worker API      offline application
                                                  shell

  Testing                 Vitest or Jest, React   Unit, component,
                          Testing Library,        integration, and E2E
                          Playwright              testing
  -----------------------------------------------------------------------

**Dependency policy:** Use the listed stack unless a requirement cannot
be met with it. Check the existing project dependencies before
installing anything. Avoid duplicate libraries that solve the same
problem.

## 3. Product Scope and Core Features

### 3.1 Home dashboard

-   Total income and total expenses displayed side by side in equal-width summary cards.
-   Current balance displayed immediately below them in a separate full-width card.
-   Daily budget and spending progress.
-   Date navigation for daily budget review.
-   Quick actions to add income or expenses.
-   Recent transactions grouped by date.

### 3.2 Transactions

-   Add, edit, and delete transactions.
-   Transaction type: income or expense.
-   Amount, category, user-selectable transaction date, and optional note.
-   Add missing income or expenses to any previous calendar date without changing the actual record creation timestamp.
-   Search by note, category, or amount.
-   Filter by transaction type and category.
-   Safe deletion confirmation.
-   Clear loading, empty, offline, and error states.

### 3.3 Budget management

-   Daily spending limit.
-   Monthly budget target.
-   Historical daily budget snapshots.
-   Daily overspending calculation.
-   Budget editing with effective-date semantics.

### 3.4 Analytics

-   Income, expenses, and net savings summaries.
-   Expense breakdown by category.
-   Most frequently used expense category.
-   Average daily spending.
-   Date-range-aware analytics.

### 3.5 Settings

-   User profile.
-   Sign out.
-   Daily and monthly budget configuration.
-   Theme preference.
-   CSV export.

### 3.6 PWA

-   Installable application.
-   Standalone display mode.
-   Offline application shell.
-   Offline transaction capture with visible sync status.
-   Safe synchronization when connectivity returns.

------------------------------------------------------------------------

## 4. UI/UX and Design System

### 4.1 Design philosophy

-   **Mobile-first shell:** Use a centered mobile application container
    with a maximum width of approximately 448px. On wider screens,
    preserve the mobile-app composition rather than stretching content
    unnecessarily.
-   **Responsive behavior:** Ensure the application remains usable on
    small mobile screens and does not break on tablets or desktop
    browsers.
-   **Micro-interactions:** Use restrained drag gestures, spring
    transitions, modal and bottom-sheet animations, and active
    navigation indicators.
-   **Ambient lighting:** Use a deep dark background with subtle teal
    and indigo radial glows.
-   **Clarity:** Financial values, transaction types, and budget states
    must be immediately understandable.
-   **Accessibility:** Do not communicate income, expense, or warning
    states through color alone. Pair color with labels or icons.

### 4.2 Color tokens

  -----------------------------------------------------------------------
  Name                    Hex value               Usage
  ----------------------- ----------------------- -----------------------
  Background (dark)       `#031023`               Main application
                                                  background

  Card surface (dark)     `#071b3a` / `#0b2854`   Cards, sheets,
                                                  navigation

  Primary accent (teal)   `#10d2c3` / `#24dacd`   Income, positive
                                                  balance, active states

  Secondary accent (navy) `#123c73`               Borders and subtle
                                                  surfaces

  Expense / alert (rose)  `#f43f5e` / `#e11d48`   Expenses and warnings

  Primary text            `#ffffff` / `#f8fafc`   Main content

  Muted text              `#94a3b8` / `#64748b`   Secondary content
  -----------------------------------------------------------------------

Use semantic CSS variables for colors rather than scattering raw color
values across components. Define both dark and light theme tokens.
Verify contrast for text and interactive controls.

### 4.3 Typography and spacing

-   Font: Inter, loaded through `next/font/google`.
-   Use a consistent type scale and avoid excessive one-off font sizes.
-   Use consistent spacing tokens.
-   Use `rounded-2xl` for common cards and inputs, `rounded-3xl` for
    major widgets, and `rounded-full` for pills and badges.
-   Respect device safe areas, especially around bottom navigation and
    sheets.

### 4.4 Shared visual components

Create reusable primitives for buttons, inputs, cards, badges, dialogs,
bottom sheets, loading indicators, empty states, and error messages.
Feature-specific components should compose these primitives rather than
duplicating their implementations.

------------------------------------------------------------------------

## 5. Application Architecture

### 5.1 Architectural principles

Use a feature-oriented architecture with explicit responsibility
boundaries:

-   **App Router:** Routing, layouts, and route-level composition.
-   **Components:** Presentation and user interaction.
-   **Hooks:** Reusable client-side behavior and subscriptions.
-   **Services:** Application use cases and business rules.
-   **Repositories:** Data access and persistence abstractions.
-   **Stores:** Shared client-side UI state and selected cached data.
-   **Schemas:** Runtime validation of user input and data received from
    external boundaries.
-   **Types:** Shared domain and infrastructure types where appropriate.

Do not place Firestore queries directly inside page components or
reusable UI components. Do not place complex business rules inside
Zustand components or event handlers.

### 5.2 Recommended folder structure

Adapt this structure to the existing project instead of moving files
without a reason.

``` text
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── transactions/
│   │   ├── analytics/
│   │   └── settings/
│   ├── layout.tsx
│   ├── globals.css
│   └── manifest.ts
│
├── components/
│   ├── ui/                 # Generic reusable primitives
│   ├── layout/             # Header, navigation, app shell
│   └── shared/             # Cross-feature shared components
│
├── features/
│   ├── transactions/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   └── types/
│   ├── budget/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   └── types/
│   ├── analytics/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   └── settings/
│       ├── components/
│       ├── services/
│       └── schemas/
│
├── stores/
│   ├── useAppStore.ts
│   └── slices/             # Only if the store grows enough to justify slices
│
├── lib/
│   ├── firebase/
│   │   ├── client.ts
│   │   └── config.ts
│   ├── utils/
│   ├── date/
│   └── constants/
│
├── types/
└── schemas/
```

### 5.3 Dependency direction

Use the following direction:

``` text
App Routes / UI Components
          |
          v
       Hooks
          |
          v
      Services
          |
          v
     Repositories
          |
          v
 Firebase / Firestore
```

Domain types and validation schemas may be imported by the layers that
need them. Lower-level data access code must not depend on page
components.

### 5.4 Repository pattern

Define repository contracts for data operations and provide Firestore
implementations.

Example:

``` typescript
export interface TransactionRepository {
  create(
    userId: string,
    input: CreateTransactionInput
  ): Promise<Transaction>;

  update(
    userId: string,
    transactionId: string,
    input: UpdateTransactionInput
  ): Promise<Transaction>;

  delete(
    userId: string,
    transactionId: string
  ): Promise<void>;

  getById(
    userId: string,
    transactionId: string
  ): Promise<Transaction | null>;

  list(
    userId: string,
    options: TransactionQueryOptions
  ): Promise<Transaction[]>;
}
```

The Firestore implementation must enforce user scoping in its document
paths and queries. Services use the repository contract and contain
application-level rules. Components must not know how Firestore is
structured.

Do not create interfaces and abstractions for every trivial function.
Introduce an abstraction when it improves separation, testability, or
maintainability.

### 5.5 Server and client component boundaries

-   Keep components as Server Components by default.
-   Add `"use client"` only where browser APIs, event handlers, hooks,
    Zustand, or client-side Firebase interactions are required.
-   Do not import browser-only Firebase modules into Server Components.
-   Keep client-only providers and application state providers as low in
    the component tree as practical.
-   Do not assume that hiding a route or rendering a loading screen
    protects Firestore data. Security rules are authoritative.

------------------------------------------------------------------------

## 6. State Management and Data Flow

### 6.1 Zustand responsibilities

Zustand is the global client-side state manager. Use it for state that
is genuinely shared across multiple parts of the application, such as:

-   Authenticated user profile summary, where appropriate.
-   Cached transaction data or transaction query state.
-   Selected dashboard date.
-   Theme preference.
-   Shared filters.
-   UI state such as an open sheet or selected modal, if shared
    globally.

Do not put every form field, temporary input, derived value, or server
response into the global store. Keep local component state local when it
is not shared.

### 6.2 Persist middleware policy

Use Zustand `persist` selectively.

Suitable persisted values: - Theme preference. - Selected non-sensitive
UI preferences. - A deliberately designed local transaction cache, if
required by the offline strategy.

Do not treat localStorage as the authoritative financial database. Do
not persist authentication credentials, Firebase tokens, or sensitive
secrets in Zustand storage.

For persisted application data: - Version the persisted schema. - Define
a migration strategy. - Handle malformed or outdated persisted data. -
Scope cached data to the authenticated user. - Clear or isolate
user-specific state on sign-out and account changes. - Handle hydration
so the UI does not briefly show incorrect theme, user, or financial
values.

### 6.3 Source of truth

Firestore is the cloud source of truth for synchronized user data. The
local cache supports fast rendering and offline access but must have
explicit synchronization metadata.

The application must distinguish: - Data loaded from Firestore. -
Local-only pending changes. - Successfully synchronized changes. -
Failed changes requiring retry or user attention.

### 6.4 Transaction write lifecycle

Use a service-driven write lifecycle:

``` text
User submits transaction
          |
          v
Validate input with Zod
          |
          v
Create stable transaction ID
          |
          v
Mark local operation as pending
          |
          v
Update local UI optimistically
          |
          v
Repository writes to Firestore
          |
       +--+--+
       |     |
    Success Failure
       |     |
       v     v
 Mark synced  Keep recoverable pending/failed state
       |     |
       v     v
 Reconcile   Show status and allow safe retry
 local data  without creating a duplicate
```

The exact rollback or retry behavior must be consistent across create,
update, and delete operations. Never silently discard a user's locally
captured transaction because a network request failed.

### 6.5 Error handling

-   Use typed application errors where useful.
-   Translate Firebase errors into user-understandable messages.
-   Log diagnostic details without logging sensitive financial notes or
    credentials.
-   Do not swallow persistence errors.
-   Avoid showing raw Firebase error messages to end users.
-   Provide retry actions for recoverable network failures.
-   Ensure loading states are cleared in `finally` blocks or equivalent
    safe patterns.

### 6.6 Derived financial state

Prefer pure selector or calculation functions over storing duplicate
computed values.

Required calculations: - Balance = total income minus total expenses. -
Total income. - Total expenses. - Spending for a selected local date. -
Remaining daily budget. - Budget overage. - Monthly spending and
savings. - Category totals and transaction counts.

Derived values must be calculated from a clearly defined transaction set
and date range. Avoid maintaining multiple independently updated copies
of the same total.

------------------------------------------------------------------------

## 7. Data Models and Firestore Design

### 7.1 Firestore collection structure

Recommended user-scoped structure:

``` text
users/{uid}
    profile fields

users/{uid}/transactions/{transactionId}
    transaction document

users/{uid}/dailyBudgets/{date}
    daily budget snapshot
```

This structure keeps user-owned records under the authenticated user's
document. A root-level collection is also valid if collection-group
queries or reporting requirements justify it, but the chosen structure
must be used consistently.

### 7.2 Transaction model

Store money as integer paise, not floating-point rupees.

``` typescript
type TransactionType = "income" | "expense";

interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amountPaise: number;
  category: string;
  note?: string;
  date: string;          // YYYY-MM-DD in the user's local calendar
  createdAt: string;     // ISO 8601 timestamp
  updatedAt: string;     // ISO 8601 timestamp
  syncStatus?: "pending" | "synced" | "failed";
}
```

Notes: - `amountPaise` must be a positive safe integer. - The
transaction type determines whether the amount is income or expense. -
Do not store negative expense amounts. - `syncStatus` may be local-only
metadata. Do not trust a client-provided sync status as a security or
authorization field in Firestore. - Firestore document IDs should be
stable across retries so a retry does not create duplicate
transactions. - Use Firestore server timestamps for authoritative cloud
creation/update metadata where appropriate. Maintain a local timestamp
separately when an offline action needs one.

Display amounts in rupees using a single currency formatting utility.
Convert rupees to paise at the input boundary and paise to rupees only
for display.

### 7.3 User profile model

``` typescript
interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  dailyLimitPaise: number;
  monthlyBudgetPaise?: number;
  createdAt: string;
  updatedAt: string;
  timezone: string;       // IANA timezone identifier
  currency: "INR";
}
```

The initial defaults may be: - Daily limit: ₹150 (15000 paise). -
Monthly budget: ₹4500 (450000 paise). - Currency: INR.

Defaults must be applied consistently during user provisioning and
validated before use.

### 7.4 Daily budget snapshot model

``` typescript
interface DailyBudgetSnapshot {
  date: string;           // YYYY-MM-DD
  amountPaise: number;
  createdAt: string;
  updatedAt: string;
}
```

Store snapshots at:

``` text
users/{uid}/dailyBudgets/{YYYY-MM-DD}
```

### 7.5 Historical budget resolution

The application must define how a budget applies to each date.

Recommended rule: 1. If a snapshot exists for date `D`, use it. 2.
Otherwise, find the latest snapshot dated on or before `D`. 3. If no
earlier snapshot exists, use the account's initial default budget. 4. A
budget change made today must not retroactively change prior dates. 5. A
budget edit should have an explicit effective date. By default, it
applies from the current local date. 6. If a user intentionally edits a
past date, the application must make the historical effect clear before
saving.

Avoid storing an unbounded map of every date's budget inside the user
profile document. Separate documents are easier to query and avoid the
Firestore document size limit.

### 7.6 Date and timezone policy

Date-only values and timestamps serve different purposes.

-   Store transaction calendar dates as `YYYY-MM-DD` in the user's
    configured timezone.
-   Store event timestamps as Firestore timestamps or normalized ISO
    8601 instants.
-   Store the user's IANA timezone identifier, such as `Asia/Kolkata`.
-   Do not derive a local calendar date by blindly slicing a UTC ISO
    timestamp.
-   Use one shared date utility for day boundaries, month boundaries,
    formatting, and comparisons.
-   Test daylight-saving transitions for users in timezones that observe
    them, even though the initial default timezone is India.
-   Define whether analytics use transaction date or creation timestamp.
    Financial reporting must use transaction date.

------------------------------------------------------------------------

## 8. Feature Specifications

### 8.0 Dashboard financial summary layout

**Required display order on the Home screen:**

1. **First row:** Two equally prominent cards in a horizontal two-column layout: **Total Income** on the left and **Total Expenses** on the right.
2. **Second row:** A separate, full-width **Current Balance** card directly below the first row.
3. Below the financial summary, render the daily budget card, quick actions, and recent transactions according to the established mobile-first layout.

The summary cards must use shared card components and semantic theme tokens. The layout must fit the existing mobile shell without horizontal overflow. Use readable currency formatting and accessible labels; do not depend on color alone. All three values must use the same clearly defined reporting scope. For the default all-time scope, **Current Balance = all-time income − all-time expenses**. Do not accidentally calculate a date-filtered balance from all-time totals, or vice versa. Update the cards reactively after transaction creation, editing, deletion, and synchronization reconciliation.

**Acceptance criteria:** On Home, income and expenses are side by side, the balance appears below them, and totals are correct after adding a transaction to a past date.

### 8.0.1 Backdated income and expense entry

Users must be able to record transactions they forgot to enter on an earlier date.

- The add-transaction form must contain a clearly labeled, accessible date picker. Its default is today's date in the user's configured timezone.
- The user can choose any valid **past date or today**; future dates are not allowed for this feature.
- When the user opens Add Income or Add Expense from a selected date on the daily budget card, prefill the transaction date with that selected date. Do not silently reset the chosen date while the form is open.
- Date navigation must allow reaching dates without existing transactions. A calendar/date picker should support jumping directly to an arbitrary past date; do not restrict navigation to dates that already contain activity.
- On save, persist the chosen calendar date in `Transaction.date` (`YYYY-MM-DD`) and keep the real `createdAt` timestamp as the time the transaction was actually recorded. Never falsify the creation timestamp to match the backdated transaction date.
- Validate the selected date with the shared date utilities and Zod. Do not use UTC date slicing to determine the user's local date.
- After a successful local write, immediately update the selected day's transaction list and daily expense/budget calculations, as well as the applicable monthly totals, analytics, and overall financial summary. Reconcile with Firestore when synchronized.
- If the transaction is created offline, preserve the selected past date and show pending synchronization status; retries must not duplicate the transaction.
- When editing an existing transaction's date, recalculate both the old and new dates and their respective monthly aggregates.
- Display a useful empty state and an Add Transaction action for dates with no recorded activity.

**Example:** On 7 November, the user records an expense of ₹250 for 3 November. The transaction belongs to **3 November** for financial reporting and daily budget evaluation, while its actual creation timestamp remains **7 November**. The 3 November expense total increases by ₹250, and the current balance decreases by ₹250.

**Acceptance criteria:** A user can select a previous date with no transactions, add income or expense to it, see it under that date, and see all affected summaries update without duplicates or date shifts.

### 8.1 Swipeable daily budget card

-   Support horizontal drag gestures and previous/next date controls.
-   Navigate dates with transaction activity, while allowing the user to
    reach the current date easily.
-   Display the selected date's budget snapshot.
-   Display expenses for that date and remaining budget.
-   Show exact overage when spending exceeds the limit.
-   Do not allow a timer to be the only mechanism for date correctness.
-   Re-evaluate the current date when the app becomes visible, regains
    focus, or the user returns to Home.
-   A periodic check may be used if justified, but it must be cleaned up
    correctly and must not create duplicate timers.

### 8.2 Transaction create, edit, and delete

-   Validate all form input before invoking a service.
-   Amount must be greater than zero and convertible to a safe integer
    number of paise.
-   Require transaction type, category, and valid transaction date.
-   Note is optional and must have a reasonable maximum length.
-   Show pending/success/failure state.
-   Use stable IDs for retry safety.
-   Confirm destructive deletion.
-   Do not remove a transaction permanently from local state until the
    selected deletion strategy has safely recorded the operation.
-   Ensure edit and delete operations verify that the transaction
    belongs to the authenticated user.

### 8.3 Transaction filtering

Support combined filters: 1. Type: all, income, expense. 2. Category:
all or a selected category. 3. Search: note, category, and formatted
amount. 4. Date range, if included in the relevant screen.

Filtering must be deterministic and must not mutate the original
transaction array. Provide a one-tap reset action.

For large transaction histories, use Firestore query constraints and
pagination rather than loading every record indefinitely. Keep
client-side filtering for the currently loaded result set where
appropriate.

### 8.4 Analytics

-   Income, expense, and net savings summaries.
-   Category-wise expense distribution.
-   Most frequently used expense category.
-   Average daily spend.
-   Clear date range selection and labels.
-   Empty states when no qualifying transactions exist.

Calculation definitions: - Net savings = income minus expenses within
the selected range. - Most used category = expense category with the
highest transaction count in the selected range. - Average daily spend =
total expenses divided by the number of distinct dates with at least one
expense in the selected range.

Do not divide by zero. Make the selected date range explicit in every
analytics view. Do not imply that category frequency is the same as
category spend.

### 8.5 CSV export

-   Export headers: `ID`, `Type`, `Amount (INR)`, `Category`, `Note`,
    `Date`, `Created At`.
-   Convert paise to rupees for export.
-   Escape quotes, commas, and line breaks correctly.
-   Protect against spreadsheet formula injection for user-controlled
    text fields.
-   Use UTF-8 encoding and a suitable Blob MIME type.
-   Export the intended date range or all available transactions, and
    make the scope clear to the user.
-   Handle empty exports and download errors gracefully.

------------------------------------------------------------------------

## 9. Offline-First and Synchronization Strategy

### 9.1 Offline requirements

The application shell should load when offline after it has been cached.
Users should be able to view previously cached data and create
transactions offline if that capability is enabled.

Offline support must be described honestly in the UI. Do not imply that
data has been backed up to the cloud while it is still local-only.

### 9.2 Local operation queue

For reliable offline writes, define a durable local operation queue.
Each operation should include:

``` typescript
interface PendingOperation {
  operationId: string;
  entityId: string;
  entityType: "transaction" | "dailyBudget";
  operation: "create" | "update" | "delete";
  payload?: unknown;
  createdAt: string;
  status: "pending" | "processing" | "failed";
  retryCount: number;
  lastError?: string;
}
```

The queue must: - Use stable operation and entity IDs. - Preserve
operation ordering for the same entity. - Avoid duplicate writes on
retry. - Retry recoverable failures with bounded backoff. - Avoid
retrying permanent validation or authorization failures indefinitely. -
Expose pending and failed states to the UI. - Be scoped to the
authenticated user. - Be cleared or safely isolated on sign-out.

For production-grade offline writes, prefer a durable local database
such as IndexedDB over relying only on localStorage. If Firebase's own
offline persistence is selected instead, document its behavior and
limitations and avoid building a conflicting second queue. Choose one
primary offline-write mechanism.

### 9.3 Conflict handling

Define conflict behavior for edits and deletes: - Use `updatedAt` or a
version field for conflict detection. - Do not silently overwrite a
newer remote edit. - Surface a recoverable conflict when the same record
has changed on another device. - Define delete-versus-update behavior. -
Preserve user-entered data when synchronization fails.

### 9.4 Connectivity and sync indicators

Provide clear application states: - Online and synchronized. -
Offline. - Syncing. - Pending changes. - Sync failed / action required.

A browser `online` event is only a connectivity hint; it does not
guarantee that Firestore is reachable. Confirm successful repository
operations before showing a synchronized state.

------------------------------------------------------------------------

## 10. PWA and Service Worker

### 10.1 Manifest

Use a valid web app manifest with: - `name` and `short_name`. -
`display: "standalone"`. - `start_url`. - Appropriate portrait
orientation preference. - Theme and background colors aligned with the
design tokens. - 192x192 and 512x512 icons. - Maskable icon variants.

### 10.2 Service worker strategy

-   Cache the application shell and static assets deliberately.
-   Use cache-first for suitable versioned static assets.
-   Use network-first or stale-while-revalidate where appropriate for
    navigations and non-sensitive public assets.
-   Do not cache authenticated financial API or Firestore responses
    indiscriminately.
-   Do not assume that caching a route guarantees that all of its
    dynamic data is available offline.
-   Version caches and remove obsolete caches during activation.
-   Handle failed navigation requests with an offline fallback where
    available.
-   Test service worker updates and old-client behavior.

Calling `skipWaiting()` and `clients.claim()` immediately can activate a
new worker while a user is working. Choose an update policy that avoids
unexpectedly disrupting an active session. If using immediate
activation, ensure the app handles reload and data safety correctly.

### 10.3 Install prompt

-   Capture `beforeinstallprompt` only in supported browsers.
-   Do not assume the event exists on every platform.
-   Show the prompt at a non-disruptive time.
-   Persist dismissal only for the intended duration.
-   Suppress the prompt when already running in standalone mode.
-   Provide platform-appropriate installation guidance where the browser
    does not expose the event.
-   Do not auto-dismiss so quickly that the user cannot read or interact
    with the prompt.

------------------------------------------------------------------------

## 11. Authentication and Security

### 11.1 Authentication

-   Use Firebase Authentication with Google sign-in.
-   Observe authentication state through a single well-defined auth
    layer.
-   Provision the Firestore user profile idempotently after successful
    authentication.
-   Handle loading, unauthenticated, authenticated, and auth-error
    states.
-   Clean up auth subscriptions.
-   Clear or isolate user-specific client state on sign-out.
-   Never store Firebase ID tokens or refresh credentials in custom
    localStorage state.

### 11.2 Firestore security rules

Security rules must enforce: - A user can read only their own profile
and records. - A user can create, update, and delete only records under
their own UID. - Required fields and allowed field types are validated
where practical. - Amounts are positive integers within supported
limits. - Transaction type is restricted to the supported enum. -
User-controlled ownership fields cannot be changed to another UID. -
Immutable fields such as ownership and creation time cannot be
arbitrarily modified.

For a user-scoped structure, rules should use the authenticated UID to
authorize access to:

``` text
/users/{userId}
/users/{userId}/transactions/{transactionId}
/users/{userId}/dailyBudgets/{date}
```

The coding agent must create and test actual Firestore rules.
Client-side validation is not a substitute for database security rules.

### 11.3 Validation

Use Zod schemas for: - Transaction create and update inputs. - Daily and
monthly budget inputs. - Profile updates. - Date and category values. -
Data received from persistence boundaries when appropriate.

Validate data at the boundary, not only in the form. Never trust
arbitrary values read from localStorage or remote documents without
appropriate parsing.

### 11.4 Environment configuration

-   Keep Firebase configuration in environment variables.
-   Use only `NEXT_PUBLIC_` for Firebase configuration values that are
    intentionally exposed to the browser.
-   Never place service-account private keys or admin credentials in
    client-side environment variables.
-   Provide an `.env.example` containing variable names and placeholder
    values, never real secrets.
-   Validate required environment variables during application
    initialization.

------------------------------------------------------------------------

## 12. Performance and Scalability

-   Use pagination for transaction history.
-   Avoid loading an unlimited transaction collection on initial page
    load.
-   Query only the fields and date ranges needed where practical.
-   Add Firestore indexes required by actual query patterns.
-   Avoid unnecessary Zustand subscriptions that cause unrelated
    components to re-render.
-   Use stable selectors and component boundaries where they improve
    measured behavior.
-   Lazy-load heavy analytics or chart code when it materially improves
    initial loading.
-   Avoid premature memoization and unnecessary `useMemo`,
    `useCallback`, or `React.memo`.
-   Optimize images and fonts using Next.js-supported mechanisms.
-   Keep animations smooth but respect reduced-motion preferences.
-   Do not sacrifice financial correctness for perceived speed.

------------------------------------------------------------------------

## 13. Accessibility and UX States

Every feature must account for:

-   Loading state.
-   Empty state.
-   Error state.
-   Offline state.
-   Pending synchronization state.
-   Disabled state where an action is unavailable.
-   Success feedback.

Accessibility requirements: - Semantic HTML. - Keyboard-operable
controls. - Visible focus indicators. - Accessible names for icon-only
buttons. - Appropriate dialog focus management. - Sufficient color
contrast. - Screen-reader-friendly form errors and status updates. -
Reduced-motion support. - Touch targets suitable for mobile use.

------------------------------------------------------------------------

## 14. Testing Strategy

### 14.1 Unit tests

Test pure business logic: - Paise/rupee conversion. - Balance and
totals. - Daily and monthly budget calculations. - Historical budget
resolution. - Date and timezone utilities. - Transaction filtering. -
Analytics calculations. - CSV escaping and formula-injection protection.

### 14.2 Component tests

Test: - Transaction forms and validation. - Transaction cards. - Budget
cards and date navigation. - Confirmation dialogs. - Filter controls. -
Loading, empty, and error states. - Accessibility behavior for key
interactions.

### 14.3 Integration tests

Test: - Services using repository test doubles. - Repository query and
write behavior. - Authenticated user provisioning. - User-scoped data
access. - Offline queue processing and retry behavior. - Failed writes
and recovery.

### 14.4 End-to-end tests

Cover critical user journeys: 1. Sign in. 2. Add income. 3. Add expense.
4. Edit a transaction. 5. Delete a transaction after confirmation. 6.
Change daily and monthly budgets. 7. Navigate historical dates. 8.
Review analytics. 9. Export CSV. 10. Go offline, create a transaction,
reconnect, and verify synchronization. 11. Sign out and verify user data
is not exposed to another account.

Use the Firebase Emulator Suite for automated Firestore and
Authentication integration tests where practical. Never run destructive
tests against production user data.

------------------------------------------------------------------------

## 15. Logging, Monitoring, and Error Reporting

-   Keep development logs useful and structured.
-   Do not log passwords, tokens, sensitive profile data, or private
    transaction notes.
-   Distinguish expected offline/network errors from unexpected
    application failures.
-   Make failed synchronization visible to the user.
-   Add production error monitoring only when a provider and privacy
    requirements are decided.
-   Do not claim an operation succeeded until the relevant persistence
    layer confirms success.

------------------------------------------------------------------------

## 16. Implementation Rules for the Coding Agent

The coding agent must follow these rules for every change.

### 16.1 Before changing code

1.  Inspect the existing project structure and current implementation.
2.  Read the relevant files before editing them.
3.  Identify existing reusable components, hooks, services, schemas, and
    utilities.
4.  Check installed dependencies and existing conventions.
5.  Identify the impact of the requested change on related features.
6.  Do not assume that the design document describes code that has
    already been implemented.

### 16.2 Code quality rules

-   Use TypeScript strict typing; avoid `any`.
-   Reuse existing components and utilities instead of recreating them.
-   Do not duplicate business logic across pages or components.
-   Keep components focused on presentation and interaction.
-   Keep business rules in services or pure domain functions.
-   Keep database access in repositories.
-   Use Zod at input and external-data boundaries.
-   Use Zustand only for genuinely shared state.
-   Avoid unnecessary optimizations and abstractions.
-   Do not introduce a new dependency without explaining why it is
    needed.
-   Follow the existing naming and import conventions.
-   Handle loading, errors, empty states, and offline states.
-   Do not leave placeholder implementations or silently ignored errors.

### 16.3 Change safety

-   Do not rewrite unrelated files.
-   Do not remove existing functionality unless explicitly requested.
-   Preserve working behavior while implementing the requested changes.
-   Do not change the technology stack without approval.
-   Do not alter database structure without considering existing data
    and migration requirements.
-   If a requested change conflicts with this document, explain the
    conflict and propose a resolution rather than silently choosing one.
-   Do not invent requirements that are not in this document or the
    user's latest instruction.

### 16.4 Completion checklist

After implementation: 1. Run the relevant lint checks. 2. Run TypeScript
type checking. 3. Run relevant unit and integration tests. 4. Run a
production build when practical. 5. Fix errors introduced by the
changes. 6. Summarize files changed and behavior implemented. 7. List
tests and commands executed, including any that could not be run. 8.
Clearly disclose remaining limitations or follow-up work.

------------------------------------------------------------------------

## 17. Open Decisions and Assumptions

The following decisions must be confirmed when the relevant feature is
implemented. Do not invent a final behavior prematurely.

  -----------------------------------------------------------------------
  Topic                   Current direction       Decision still required
  ----------------------- ----------------------- -----------------------
  Offline persistence     Durable local storage   Choose IndexedDB queue
                          for pending operations  or Firebase offline
                                                  persistence as the
                                                  primary mechanism

  Transaction history     User-scoped Firestore   Confirm pagination size
                          collection              and date-range query
                                                  patterns

  Budget edits            Effective from current  Decide whether users
                          local date by default   can edit past snapshots

  Conflict resolution     Detect concurrent       Decide exact
                          changes                 user-facing conflict
                                                  resolution flow

  Categories              Predefined categories   Finalize category list
                                                  and whether custom
                                                  categories are
                                                  supported

  Monthly budget          Monthly target          Define whether it
                                                  resets automatically
                                                  and how month
                                                  boundaries are handled

  Analytics               Date-range calculations Finalize default date
                                                  range and available
                                                  filters

  Error monitoring        Structured error        Select a provider if
                          handling                production monitoring
                                                  is required

  Data retention          User-owned cloud data   Define account deletion
                                                  and data export
                                                  requirements
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 18. Definition of Done

A feature is complete only when:

-   It meets the requested behavior.
-   It follows the architecture and coding rules in this document.
-   It reuses existing components and utilities where applicable.
-   Input and persisted data are validated appropriately.
-   Loading, empty, error, and offline states are handled.
-   User data remains scoped to the authenticated user.
-   Financial calculations use integer paise internally.
-   Relevant tests pass.
-   Type checking, linting, and build checks have been run where
    practical.
-   The implementation summary and known limitations are documented.

**This document is the current architecture baseline.** Future user
instructions may extend or revise it. The coding agent must treat the
latest explicitly approved design document and user instructions as
authoritative.
