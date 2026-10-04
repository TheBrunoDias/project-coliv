@AGENTS.md

# Instructions for Claude Code — Coliv (Shared Home Management App)

## 📌 Project Overview

Mobile-first PWA built with Next.js for organizing shared household chores, shared purchases (expense splitting), and notice boards among housemates (e.g., student accommodation).

Tasks are **reminders, not checklists**: they are never marked as completed. Their purpose is to show everyone who is currently responsible for each chore (e.g., "this week Ana takes out the trash"), with responsibility rotating automatically over time.

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack, Client Components for interactive UI)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand (Client-side UI & active house state)
- **Backend & Database:** Firebase (Authentication, Firestore)
- **PWA Tooling:** Native Next.js Web App Manifest (`app/manifest.ts`) + [Serwist](https://github.com/serwist/serwist) for the service worker (Turbopack-compatible; do **not** use `next-pwa`, which is webpack-only)

---

## 🏠 Domain Rules

### Houses & Membership

- A user belongs to **at most one house** at a time (`users.houseId`).
- To join another house, the user must **leave their current house first**.
- A user without a house sees only the onboarding screen: create a house or open an invite link.

### Roles

- There are only two roles:
  - **Admin:** the user who created the house (`houses.ownerId`). There is exactly one admin per house.
  - **Resident:** every other member.
- The admin is **also a resident**: they appear in member lists, can be assigned to tasks, and take part in rotations like everyone else.
- The admin role is derived from `houses.ownerId === uid`; it is not stored on the member document.

### Invites

- Invites are done **via link**: `/invite/{inviteCode}`.
- Only the admin can see and share the invite link (Web Share API, with copy-to-clipboard fallback).
- The admin can **regenerate** the invite code, which invalidates the previous link.
- Opening the link:
  - Not logged in → login/register, then return to the invite page.
  - Already in another house → show a message explaining they must leave their current house first.
  - No house → show the house name and a "Join" button.
- How it is enforced: `invites/{code}` stores `houseId` + `houseName` (so non-members can see the name). Joining writes the member document **with the `inviteCode` used**, and the rules check it against `houses.inviteCode`.

### Tasks (Rotating Reminders)

- Tasks are created and edited **only by the admin**.
- A task is delegated either to **residents** or to **groups** (`assigneeType`): with groups, the whole group is responsible during its turn (e.g. "Kitchen cleaning: Room A, then Room B").
- A task has an ordered **rotation** of assignees and a **schedule**: `frequency` (`daily`, `weekly`, `monthly`) × `interval` (1–30), e.g. weekly × 2 = every 2 weeks. The form offers presets (every day / week / 2 weeks / month) plus a custom "every N days/weeks/months".
- Legacy `frequency: 'biweekly'` is read as weekly × 2 (`toRotation` normalizes it); new tasks never write it.
- A rotation with a single assignee is a **fixed responsibility** (never changes hands).
- Tasks have **no completion status**. The UI shows the **current** responsible person/group, the **next** one, and **when the turn changes**.
- The current assignee is **computed on the client** from the task data (no cron job or backend needed):
  - `currentIndex = (anchorIndex + periodsElapsed(anchorDate, now, frequency, interval)) % rotation.length`
  - `daily` / `weekly` periods count 1 / 7 days × `interval`; `monthly` counts calendar months × `interval`.
  - Implement this in `src/utils/rotation.ts` as pure functions.
- When the rotation list changes (task edited, member leaves), **re-anchor** the task so the current turn is preserved: set `anchorDate` to the start of the current period and `anchorIndex` to the current assignee's position in the new list (if the current assignee was removed, the next one in line takes over).
- **Editing**: the form loads the rotation via `toEditableRotation` — reordered so the current assignee is first, with the start date set to the current period — and saves with `anchorIndex: 0`. Saving unchanged keeps every turn; the admin changes who is on duty by reordering or changing the date.
- Periods are computed in the **device's local time** (calendar days, DST-safe; months clamp to shorter months: Jan 31 → Feb 28).
- UI reads tasks through `useTaskViews()` (resolved current/next assignee, refreshed every minute by `useNow`). Unknown user ids render as "Ex-morador", deleted groups as "Grupo removido".

### Leaving a House

- Leaving removes the member document (group membership lives in `members.groupIds`, so it goes with it) and sets `users.houseId` to `null`, in a single batch.
- In the same batch, the user is removed from every user-type task rotation (`removeFromRotations`, re-anchored). Tasks are admin-write only, but the rules let any member update a task **only** to remove their own id from `rotation` (+ anchor fields). Removing a member (admin) and deleting a group clean rotations the same way.
- The admin can remove residents from the house (same cleanup as leaving). The removed user's `houseId` is cleared lazily on their device (see below).
- **The admin cannot simply leave: leaving means deleting the house.** The UI must warn clearly and ask for confirmation (e.g., type the house name).

### Deleting a House

- Only the admin can delete the house.
- Deletion removes the house document, all its subcollections (`members`, `groups`, `tasks`, `purchases`, legacy `shopping_items`, `notice_board`) and its `invites` document, using batched writes (max 500 operations per batch).
- The admin's own `users.houseId` is set to `null` in the same operation.
- Other residents' `users.houseId` cannot be written by the admin (security rules), so it is **cleared lazily** by `useHouseListeners`: when a listener gets `permission-denied`, the house is missing, or the user is not in `members`, it waits for pending writes and asks the server (`isConfirmedMember`) before clearing `houseId` — listeners can run ahead of a just-committed create/join batch.

### Deleting an Account

- Available on the House page ("Sua conta") and on onboarding.
- Flow (`DeleteAccountDialog` → `accountService.deleteAccount`):
  1. Type `EXCLUIR` and **reauthenticate** (Google popup or password) — Firebase requires a recent sign-in to delete the auth user, so this happens before any data is touched.
  2. Admin → the house is deleted (same as "Deleting a House"); resident → leaves the house.
  3. Delete `users/{uid}` (rules only allow it once `houseId` is `null`).
  4. Delete the Firebase Auth user, which signs them out.
- While it runs, `useAuthStore.deletingAccount` keeps the UI on a loader so the profile listener does not redirect or show errors midway.
- Content the user created in other places (e.g. purchases `paidBy`) stays; the UI must handle unknown user ids gracefully (e.g. "Ex-morador").

### Purchases (Shared Expenses)

- Replaces the old "to buy" shopping list. **Any member** registers something they bought for the house: an optional **description** (e.g. "Compra do mês no supermercado"), the items, the **total paid**, and the date. It needs a description, items, or both — for big shopping trips the description alone is enough.
- Each purchase is split **equally among all residents**: the app shows the value per person (no per-room split, no balances / "who owes whom" — settling up happens outside the app).
- `splitCount` = number of residents when the purchase was registered; it never changes afterwards (people joining/leaving later do not rewrite history).
- Money is stored as integer cents (`amountCents`); parse input with `parseAmount` ("12,50", "12.50", "1.234,56") and display with `formatMoney`.
- Currency is a house setting (`houses.currency`: EUR, BRL, USD, GBP; default EUR), chosen when creating the house and changeable by the admin.
- Only the payer or the admin can edit/delete a purchase; nobody can change `paidBy` or `splitCount`.
- The Compras page groups purchases by month with "total" and "per person" (sum of each purchase's share); the dashboard shows the current month.

### Notice Board

- **Only the admin** can create, edit, and delete house rules and announcements.
- All residents can read them.
- **Rules** (`isRule: true`) are a numbered list at the top of the Mural, in creation order. **Announcements** are cards with author and date, newest first ("· editado" when `updatedAt` is set).
- A notice needs a title (≤ 100); `content` is optional (≤ 2000, empty string when absent).
- The dashboard shows the latest announcement if it is less than 7 days old.

---

## 📁 Project Directory Structure (Next.js App Router)

```text
src/
├── app/                      # Next.js App Router
│   ├── (auth)/               # Auth routes (login, register)
│   ├── (dashboard)/          # Authenticated app routes
│   │   ├── house/            # House settings, members, groups, invite link
│   │   ├── tasks/            # Task rotations & current assignees
│   │   ├── shopping/         # Purchases & expense split ("Compras" tab)
│   │   ├── notices/          # Notice board & rules
│   │   ├── layout.tsx        # Dashboard layout with Bottom Nav
│   │   └── page.tsx          # "/" — Dashboard overview ("who's on duty now")
│   ├── invite/
│   │   └── [code]/page.tsx   # Invite link landing page
│   ├── onboarding/           # Create house (users without a house)
│   ├── serwist/[path]/       # Route that builds/serves the service worker (/serwist/sw.js)
│   ├── ~offline/             # Offline fallback page (precached)
│   ├── sw.ts                 # Service worker source (Serwist)
│   ├── layout.tsx            # Root layout, AuthListener, LocaleSync, ServiceWorker
│   └── manifest.ts           # PWA Manifest configuration
├── components/               # React Components
│   ├── ui/                   # Low-level reusable components (Buttons, Modals, Inputs)
│   ├── auth/                 # Auth forms & Protected Route wrappers
│   ├── house/                # House setup, Invite link share, Member list, Group cards
│   ├── tasks/                # Task cards, Task form (admin), Rotation editor
│   ├── purchases/            # Purchase card, Purchase form, Items chips input
│   ├── notices/              # Notice board cards, Rules section
│   └── navigation/           # Mobile Bottom Nav, Header
├── lib/                      # External library configurations
│   └── firebase.ts           # Firebase Client App & Firestore initialization
├── hooks/                    # Custom React hooks (useAuthListener, useHouseListeners, useTaskViews)
├── i18n/                     # Locales config, messages (pt-BR, en), useT / useLocale, changeLocale
├── services/                 # Firestore API wrappers & real-time listeners
├── store/                    # Zustand stores (useAuthStore, useHouseStore)
├── types/                    # TypeScript interfaces & Firestore data models
└── utils/                    # Utility functions (rotation math, date formatting, code generators)

firestore.rules               # Firestore Security Rules (project root)
```

> There is no `app/page.tsx`: `(dashboard)/page.tsx` owns `/`. Route guards are client components:
> `RequireAuth` (`house="required" | "forbidden" | "any"`) and `GuestOnly` for `(auth)` routes.

---

## 📊 Database Schema (Firestore Collections)

### 1. `users` Collection

Document ID: `{userId}`

```typescript
interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  houseId: string | null; // A user belongs to at most one house
  locale?: 'pt-BR' | 'en'; // UI language chosen by the user
  createdAt: Timestamp;
}
```

### 2. `houses` Collection

Document ID: `{houseId}`

```typescript
interface House {
  id: string;
  name: string;
  ownerId: string; // Creator of the house = the only admin
  inviteCode: string; // Random, URL-safe code used in /invite/{inviteCode}
  currency?: 'EUR' | 'BRL' | 'USD' | 'GBP'; // Purchases currency, default EUR
  createdAt: Timestamp;
}
```

### 3. `invites` Collection

Document ID: `{inviteCode}`

Lookup table so a non-member can resolve an invite link to a house without being able to list houses.

```typescript
interface Invite {
  houseId: string;
  createdAt: Timestamp;
}
```

### 4. `houses/{houseId}/members` Subcollection

Document ID: `{userId}`

```typescript
interface HouseMember {
  userId: string;
  displayName: string; // Denormalized from users for display
  photoURL?: string; // Denormalized from users for display
  groupIds: string[]; // Groups the member belongs to (e.g., "Room 101")
  joinedAt: Timestamp;
}
```

### 5. `houses/{houseId}/groups` Subcollection

Document ID: `{groupId}`

```typescript
interface Group {
  id: string;
  name: string; // e.g., "Room 1", "Kitchen Shift"
  createdAt: Timestamp;
}
```

### 6. `houses/{houseId}/tasks` Subcollection

Document ID: `{taskId}`

```typescript
type Frequency = 'daily' | 'weekly' | 'biweekly' | 'monthly'; // 'biweekly' is legacy

interface Task {
  id: string;
  title: string; // e.g., "Take out the trash"
  description?: string;
  assigneeType: 'user' | 'group';
  rotation: string[]; // Ordered userIds or groupIds; a single id = fixed assignee
  frequency: Frequency;
  interval?: number; // 1–30, default 1: weekly + 2 = every 2 weeks
  anchorDate: Timestamp; // Start of the period in which rotation[anchorIndex] is responsible
  anchorIndex: number;
  createdBy: string; // userId of the admin
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 7. `houses/{houseId}/purchases` Subcollection

Document ID: `{purchaseId}`

```typescript
interface Purchase {
  id: string;
  description?: string; // Optional, up to 200 chars
  items: string[]; // What was bought (may be empty when there is a description)
  amountCents: number; // Total paid, in cents of the house currency
  date: Timestamp; // Day of the purchase
  paidBy: string; // userId
  splitCount: number; // Residents when registered (keeps history stable)
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
```

> `shopping_items` is a legacy collection (old shopping list). It is no longer written; rules only allow reading and admin deletion so old houses can still be deleted.

### 8. `houses/{houseId}/notice_board` Subcollection

Document ID: `{noticeId}`

```typescript
interface Notice {
  id: string;
  title: string;
  content: string;
  isRule: boolean; // true = permanent house rule, false = temporary announcement
  createdBy: string; // userId
  createdAt: Timestamp;
}
```

---

## 🎨 Architecture & Next.js Conventions

### Client vs Server Components

- Use Client Components (`'use client'`) for interactive components, forms, and pages using Zustand stores or Firestore real-time listeners (`onSnapshot`).
- Keep layout shell structure lean to optimize PWA load times.

### React Compiler

- `reactCompiler: true` is on. The compiler reads the property paths used inside closures **during render** to memoize them.
- Never use non-null assertions on nullable state inside callbacks (`() => remove(item!.id)` crashes on render while `item` is `null`). Guard inside instead: `async () => { if (item) await remove(item.id); }`.

### Internationalization (i18n)

- Supported UI languages: **pt-BR** and **en** (`src/i18n/config.ts`). Code, identifiers and comments stay in English.
- **No hardcoded UI strings.** All copy lives in `src/i18n/messages/pt-BR.ts` (source of truth, defines the `Messages` type) and `en.ts` (typed as `Messages`, so a missing key fails the build). Use functions for interpolation and plurals, e.g. `count: (n: number) => ...`.
- In components: `const t = useT(); t.tasks.title` and `const locale = useLocale()` for formatting.
- Locale-aware formatting only through utils that take a `locale`: `formatRelativeDay`, `formatMonth` (`utils/date.ts`), `formatMoney` (`utils/money.ts`). Never hardcode `'pt-BR'` in `Intl` calls.
- No locale in the URL (the app is behind login and invite links must work in any language). The language is picked by `LocaleSync`: user profile `locale` → value saved on the device (`localStorage`) → browser language (Portuguese → pt-BR, anything else → en).
- `changeLocale()` updates the store, the device and `users.locale`. The picker (`LanguageSelect`) is on the auth screens, onboarding and the House page ("Sua conta").
- Route `metadata` is static, so page titles are just "Coliv" (no translated titles).
- Utilities that need words (e.g. "you", "former resident") receive them as parameters (`AssigneeLabels`, `MemberNameLabels`); errors in stores are codes (`AuthErrorCode`) translated by the UI.

### Styling

- Use the theme tokens defined in `src/app/globals.css` (`bg-background`, `bg-surface`, `text-muted`, `border-border`, `bg-brand`, `text-danger`, …) instead of raw Tailwind colors, so light/dark mode stays consistent.
- Reuse the primitives in `src/components/ui/` (`Button`, `Input`, `Alert`, `Spinner`, `FullScreenLoader`).

### Mobile-First PWA

- Layout optimized for mobile viewports (`h-dvh`, bottom navigation bar).
- Disable pull-to-refresh on mobile where necessary to feel native.
- **Manifest**: `src/app/manifest.ts`. **Icons**: `public/icons/*` (any + maskable), `src/app/icon.svg` (favicon), `src/app/apple-icon.png`. All generated from one SVG by `node scripts/generate-icons.mjs` — edit the glyph/color there and re-run instead of editing PNGs.
- **Service worker** (Serwist, Turbopack): source `src/app/sw.ts`, built and served at `/serwist/sw.js` by the route `src/app/serwist/[path]/route.ts`, registered by `components/pwa/ServiceWorker.tsx` (**disabled in development**; test with `pnpm build && pnpm start`).
- The SW only caches **same-origin** requests (Serwist's `defaultCache` filtered). Never let it handle Firebase/Google requests: Firestore's streaming listen channel breaks behind a caching strategy, and Firestore already has its own IndexedDB offline cache.
- Navigating offline to a page that was never visited shows the precached `/~offline` page (translated, client component).

### Permissions

| Action | Admin | Resident |
| --- | :---: | :---: |
| Create / edit / delete tasks | ✅ | ❌ |
| View tasks and current assignees | ✅ | ✅ |
| Be assigned to tasks | ✅ | ✅ |
| Manage groups and group membership | ✅ | ❌ |
| Edit house settings, share / regenerate invite link | ✅ | ❌ |
| Remove residents | ✅ | ❌ |
| Register purchases | ✅ | ✅ |
| Edit / delete a purchase | ✅ (any) | Only their own |
| Change the house currency | ✅ | ❌ |
| Create / edit / delete notices and rules | ✅ | ❌ |
| Read notices and rules | ✅ | ✅ |
| Leave the house | ❌ (must delete the house) | ✅ |
| Delete the house | ✅ | ❌ |

### Firebase Data Access

- Always isolate Firestore operations inside `src/services/` (e.g., `taskService.ts`, `houseService.ts`). Do not call Firestore raw queries directly inside components.
- Initialize Firestore with offline persistence using the modern API (`enableMultiTabIndexedDbPersistence` is deprecated):

  ```typescript
  initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });
  ```

### Firestore Security Rules

Permissions must be enforced in `firestore.rules`, not only in the UI:

- `users/{uid}`: read/write only by the owner (a user can always set their own `houseId` to `null`; `locale` must be `pt-BR` or `en`); delete only when `houseId` is `null`.
- `invites/{code}`: `get` by any authenticated user; `list` denied; write only by the house admin.
- `houses/{houseId}` and subcollections: read only by members.
- Joining: a user may create their own `members/{uid}` document only if they have no house and the house's invite code is valid.
- `tasks`, `groups`, `notice_board`, house settings, house deletion: write only by the admin (`houses.ownerId == request.auth.uid`).
- `members/{uid}`: a resident may delete their own document (leave); the admin may delete any resident's document (remove) and all documents when deleting the house.
- `purchases`: create by any member as the payer (`paidBy == uid`); update/delete by the payer or the admin; `paidBy`, `splitCount` and `createdAt` are immutable.
- `notice_board`: read by members; create/update/delete by the admin only.
- `shopping_items` (legacy): read by members, delete by the admin; no writes.

### Testing

- `pnpm test` — unit tests (Vitest) for `src/**/*.test.ts` (pure utils). Rotation tests should pass in any `TZ` (e.g. `TZ=America/New_York pnpm test`).
- `pnpm test:rules` — security rules tests in `tests/rules/` against the Firestore emulator (demo project, never touches production). Requires **Java 21+** (`sudo update-alternatives --config java`, or set `JAVA_HOME`).
- **Every rules change must come with tests.** Mirror the exact batch shapes used in `src/services/`.
- Deploy rules after changing them: `firebase deploy --only firestore:rules`.

---

## 🚀 Step-by-Step Implementation Roadmap

### Phase 1: Setup & Auth

- [x] Install dependencies (`firebase`, `zustand`) and configure env vars (`.env.local`).
- [x] Configure Firebase Client (`src/lib/firebase.ts`).
- [x] Implement Zustand `useAuthStore` and synchronization with `onAuthStateChanged`.
- [x] Create Auth routes `(auth)/login` and `(auth)/register` (support a `redirect` param for invite links).
- [x] Build Protected Route layout wrapper for `(dashboard)`; redirect users without a house to `/onboarding`.
- [x] Initial `firestore.rules` (deploy with `firebase deploy --only firestore:rules`).

### Phase 2: House & Membership

- [x] Onboarding: create house (creator becomes admin and first resident).
- [x] Invite link: share (Web Share API / copy), regenerate code.
- [x] Invite landing page `/invite/[code]` with join flow and "already in a house" handling.
- [x] Member list; admin can remove residents.
- [x] Leave house flow for residents (task rotation cleanup pending, see Phase 3).
- [x] Delete house flow for the admin (with confirmation) + lazy `houseId` cleanup for other residents.
- [x] Group/Room creation UI and assignment of members (admin only).
- [x] Dashboard shell (header + bottom nav).
- [x] Delete account (with reauthentication; deletes the house if admin).

### Phase 3: Task Rotations

- [x] Rotation utilities (`src/utils/rotation.ts`): current assignee, next assignee, next change date, re-anchoring.
- [x] Rules for `tasks` create/update (admin) + the "remove myself from rotations" exception used when leaving; update `leaveHouse` / `removeMember` / `deleteGroup` to clean rotations.
- [x] Task form (admin only): title, description, assignee type, ordered rotation, frequency, start date.
- [x] Task list showing current and next assignee and when the turn changes.
- [x] Dashboard highlight: "Your responsibilities right now".

### Phase 4: Shared Purchases

- [x] Register purchases (items, total, date) with equal split per resident.
- [x] Monthly grouping with total and per-person share; dashboard summary.
- [x] House currency setting (create form + admin setting).
- [x] Edit/delete by payer or admin.

### Phase 5: Notice Board

- [x] Permanent house rules section.
- [x] Announcement cards with author details.
- [x] Notice form (admin only).
- [x] Latest announcement on the dashboard.

### Phase 6: PWA Configuration & Optimization

- [x] Configure Next.js Manifest (`app/manifest.ts`) and PWA icons.
- [x] Service worker with Serwist (Turbopack setup) + offline fallback page.
- [ ] Verify on a real phone over HTTPS (install, offline navigation, Firestore offline cache).

---

## 🔮 Out of Scope (Post-MVP)

- **Push notifications** (Firebase Cloud Messaging) when a resident's turn starts on a task. Requires Cloud Functions (Blaze plan). Do not implement in the MVP.
