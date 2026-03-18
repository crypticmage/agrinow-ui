# SeedSense Analytics — API-Backed Pages Implementation Design
**Date:** 2026-03-18
**Scope:** Phases 0, 1, 9, 2, 3, 10 (API-backed pages only)
**Visual Direction:** Modern Agricultural — earthy warmth, amber/terracotta + green accents, card-heavy, soft gradients, tablet-friendly

---

## Context

The project is ~15–20% complete. Auth, dashboard, layout, mock data, and component scaffolding are in place. 11 of 13 pages are stubs.

**Tech stack:** Next.js 16 App Router · React 19 · TypeScript · TailwindCSS 4 · ShadcN/UI · Zustand (in-memory, no persist) · TanStack Query · React Hook Form + Zod · Recharts · Lucide React · date-fns · Leaflet + react-leaflet · react-dropzone · @tanstack/react-table

**Backend auth:** HTTP-only cookie named `access_token`. Browser sends automatically via `withCredentials: true`. No token in response body. No manual Authorization headers.

**Roles:** `admin | manager | farmer | agent | analyst`

**API "Sites"** = what UI labels as "Fields"

---

## Phase 0 — Foundation Fixes

### 0.1 Auth Rewrite (`src/lib/axiosInstance.ts` → `src/lib/api.ts`)

**Action:** Delete `src/lib/axiosInstance.ts` and create `src/lib/api.ts` as a replacement. Update all imports across the codebase from `@/lib/axiosInstance` → `@/lib/api`.

- Remove request interceptor that reads `auth-token` cookie and sets `Authorization: Bearer` header
- Keep `withCredentials: true` — this is the only auth mechanism needed
- Keep 401 response interceptor: clear Zustand store + redirect to `/login`
- `baseURL = process.env.NEXT_PUBLIC_BACKEND_URL`

### 0.2 Login Hook (`src/hooks/queries/useAuth.ts`)
- Remove all cookie-setting logic (`document.cookie = ...`)
- Remove JWT decode + expiry extraction from response
- Store only `{ username, email, role }` from response into Zustand (backend sets HTTP-only cookie)

### 0.3 Zustand Store (`src/stores/appStore.ts`)
- Remove `persist` middleware — no localStorage
- Store only: `{ username, email, role, isAuthenticated, sidebarOpen }`
- Remove `exp` field (no client-side JWT expiry tracking needed)

### 0.3b Session Bootstrap — Rehydration on Page Refresh
Because Zustand no longer persists to localStorage, a page refresh will clear `isAuthenticated` even though the HTTP-only cookie is still valid. To solve this:
- Add `useBootstrapSession()` hook in `src/hooks/useBootstrapSession.ts`
- Calls `GET /auth/me` on mount (inside the protected layout `src/app/(protected)/layout.tsx`)
- On success: populates Zustand `{ username, email, role, isAuthenticated: true }`
- On 401: clears store + redirects to `/login` (handled by the axios 401 interceptor)
- Show a full-page loading spinner while the bootstrap call is in flight before rendering children
- This replaces the current `useAuthCheck()` JWT expiry logic

### 0.4 Role Alignment

- `src/types/auth.ts`: Update `AuthRole` → `'admin' | 'manager' | 'farmer' | 'agent' | 'analyst' | null`
- `src/types/user.ts`: Update `UserRole` → `'admin' | 'manager' | 'farmer' | 'agent' | 'analyst'`
- `src/data/sidebarRoutes.ts`: Re-map role visibility:
  - `admin` → all routes
  - `manager` → all except User Management, Create User
  - `farmer` / `agent` → Dashboard, Sites, Field Visits, Pest & Disease
  - `analyst` → Dashboard, Sites, Crop Stages, Yield Forecast, Reports

### 0.5 Shared UI Components (new files)

**`src/components/ui/data-table.tsx`**
- TanStack Table v8 wrapper
- Props: `columns`, `data`, `isLoading?`, `emptyState?`
- Built-in: column sorting (click header), global text filter input, pagination (10/25/50 per page)
- Uses `TableSkeleton` during loading

**`src/components/ui/page-header.tsx`**
- Props: `title`, `subtitle?`, `action?` (ReactNode for right-side button slot)
- Consistent spacing and typography across all pages

**`src/components/ui/status-badge.tsx`**
- Role colors: admin=violet, manager=blue, farmer=emerald, agent=amber, analyst=cyan
- Status colors: active=green, closed=gray, pending=yellow
- Uses ShadcN `Badge` under the hood

**`src/components/ui/empty-state.tsx`**
- Props: `icon`, `title`, `description`, `action?` (optional CTA button)
- Centered layout with illustration placeholder

### 0.6 Skeleton Expansion (`src/components/Skeletons.tsx`)
Add to existing file:
- `TableSkeleton` — configurable rows/cols, animated shimmer
- `ChatSkeleton` — alternating left/right message bubbles
- `MapSkeleton` — full-height gray placeholder with compass rose
- `FormSkeleton` — stacked label + input pairs

---

## Phase 1 — Auth Flow Completion

### 1.1 Login Page Minor Fixes (`src/app/(auth)/login/LoginForm.tsx`)
- Remove cookie-setting on login success
- Remove JWT decode logic
- Add "Forgot password?" link below submit button → `/forgot-password`
- Keep existing dark glassmorphism aesthetic unchanged

### 1.2 Forgot Password Page (new: `src/app/(auth)/forgot-password/page.tsx`)
- Same visual style as login: dark green background, glassmorphism card, ambient blobs
- Single `email` field with Zod `z.string().email()` validation
- `POST /auth/forgot-password` with `{ email }`
- **Always** shows: *"If that email is registered, a reset link was sent."* — regardless of API response (security)
- Back to login link at bottom
- Uses shared axios instance with `withCredentials: true`

### 1.3 Reset Password Page (new: `src/app/(auth)/reset-password/page.tsx`)

- Reads `?token=<uuid>` via `useSearchParams()`
- No token in URL → redirect to `/forgot-password`
- Fields: `new_password` + `confirm_password`
- Zod: min 6 chars + `.refine()` match check
- `POST /auth/reset-password` with `{ token, new_password }`
- On success: toast → redirect to `/login`
- On 400/410 (expired or already-used token): show inline error — *"This reset link has expired or already been used."* with a link back to `/forgot-password`
- Same visual style as login

---

## Phase 9 — User Management Gap-Fill

### What Exists
- Data table with React Table v8, create/edit/delete dialogs, org chart tab
- Role values currently use `Admin/Manager/Staff` (wrong)

### What to Fix/Add

**Role values:** Update all role strings throughout user management to lowercase API values: `admin | manager | farmer | agent | analyst`

**Role badge colors:**
- admin → violet
- manager → blue
- farmer → emerald
- agent → amber
- analyst → cyan

**Create User form additions:**
- `language` field: select (en / hi / kn)
- `emp_type` field: select (full_time / part_time / contract / intern)
- `phone` field: optional text input
- `hire_date` field: date picker
- `relive_date` field: optional date picker
- `manager_id` field: dropdown populated from `GET /users/manager_dropdown`

**Edit User drawer:**
- Add `is_active` toggle with ShadcN AlertDialog confirmation before sending `PUT /users/{id}`

**Delete confirmation:**
- ShadcN AlertDialog before `DELETE /users/{id}`

**Access guard:**
- Non-admin roles redirect to `/dashboard`

**Data hooks update (`src/hooks/queries/users.ts`):**
- Swap to new `api.ts` axios instance
- Add `useManagerDropdown()` hook → `GET /users/manager_dropdown`

---

## Phase 2 — Sites / Fields Map (`/fields-map`)

### Layout
Three-panel layout:
1. **Left sidebar** (280px, scrollable) — site list cards with status dot. Green = active, gray = closed (based on `close_date`). Click → opens detail panel.
2. **Center** — Leaflet map, full remaining height. Wrapped in `dynamic(() => import(...), { ssr: false })`. Site markers using static coords from `mockData.ts`. Click marker → opens detail panel.
3. **Right panel** — ShadcN `Sheet` (slide-in from right). Opens when a site is selected.

### Site Detail Sheet
- Site name (h2) + description
- Created date + close date (formatted with date-fns)
- Assigned users list (from `GET /sites/all-assignments`, filtered by `site_id`)
- First 3 comments preview (from `GET /sites/{id}/comments`)
- "View Field Visits" button → `/field-visits?site=<id>`
- "Assign User" button (admin/manager only)

### Modals
**Create Site** (admin/manager only, top-right button):
- React Hook Form + Zod
- Fields: `site_name` (required), `site_description` (required), `created_date` (required), `close_date` (optional)
- `POST /sites/` on submit
- Invalidates sites query on success

**Assign User** (inside site sheet, admin/manager only):

- User dropdown populated from `GET /users/` (full user list, not manager_dropdown — assignment applies to any role)
- `POST /sites/assign` with `{ site_id, user_id }`
- Unassign is out of scope for this phase — no removal UI

### Data Hooks (`src/hooks/queries/useSites.ts`)

Query keys are defined as constants at the top of the file to ensure consistent cache invalidation:

- `useSitesList()` → `GET /sites/` — query key: `['sites']`
- `useMySites()` → `GET /sites/my` — query key: `['sites', 'my']`
- `useCreateSite()` → `POST /sites/` (mutation) — invalidates `['sites']` on success
- `useAssignUser()` → `POST /sites/assign` (mutation) — invalidates `['sites', 'assignments']` on success
- `useSiteAssignments()` → `GET /sites/all-assignments` — query key: `['sites', 'assignments']`

### Map Coordinates Strategy

The API `GET /sites/` response does not include GPS coordinates. Strategy:

- Maintain a `SITE_COORDS` lookup map in `src/data/mockData.ts` keyed by `site_id` (integer)
- When rendering markers, merge API site data with coords from `SITE_COORDS[site.id]`
- Sites with no matching coords entry are shown in the left sidebar list only (no map marker)
- This is an explicit MVP deferral — a `// TODO: replace with API coords when available` comment is added

### Visual Style

- Map uses OpenStreetMap tiles (free, no API key)
- Marker colors match site status (green/gray)
- Left sidebar cards: soft shadow, amber accent for active sites, earthy card backgrounds

---

## Phase 3 — Field Visits / Site Chat (`/field-visits`)

### Layout

**Site selector** — horizontal tab bar at top. Tabs = user's assigned sites from `GET /sites/my-assignments`. URL param `?site=<id>` for deep linking (populated from fields map "View Field Visits" button).

**Desktop view** (`md:` breakpoint and above, 768px+) — table layout using shared `data-table.tsx`:

- Columns: Date/Time, User, Message (truncated), Image (thumbnail if present), Actions
- Filter by date range + username
- Sortable by date (default: newest first)

**Mobile view** (below `md:`, under 768px) — chat bubble UI:
- Your messages: right-aligned, green bubble
- Others' messages: left-aligned, white/cream bubble
- Username + timestamp above each bubble
- Thumbnail inline if `image_id` present
- Click thumbnail → lightbox modal (full image)

### Image Handling

- Thumbnail: `GET /images/base/{image_id}` → returns `{ data_uri }` → `<img src={data_uri} />`
- Full image: `GET /images/{image_id}` → returns `{ data_uri }` → displayed in ShadcN Dialog lightbox
- Upload: react-dropzone → `POST /images/` (multipart/form-data) → returns `{ id }`
- Accepted MIME types: `image/jpeg`, `image/png`, `image/webp`. Max file size: 5MB (enforced client-side in dropzone config)
- **N+1 mitigation:** Thumbnails are rendered lazily using Intersection Observer (`loading="lazy"` on `<img>` tags). Only visible thumbnails trigger `useThumbnail()` queries.
- **Upload failure:** If `POST /images/` fails, show toast error and keep the file preview. Do not submit the comment. If `POST /images/` succeeds but `POST /sites/comments` fails, the orphaned image is acceptable for MVP — show error toast, allow retry.
- **Post form disabled state:** If `GET /sites/my-assignments` returns no matching entry for the selected site, the post form shows a disabled state with message: *"You are not assigned to this site."*

### Post Form (sticky bottom, both views)
- Textarea (expandable, max 4 rows)
- Image attach button → react-dropzone → uploads immediately on file select → shows preview thumbnail
- Submit: `POST /sites/comments` with `{ site_user_relation_id, comment, image_id?, type: "text" | "image" }`
- `site_user_relation_id`: from `GET /sites/my-assignments` matching currently selected site
- Loading spinner on submit, clears form on success

### Data Hooks

**`src/hooks/queries/useSiteComments.ts`**

- `useComments(siteId)` → `GET /sites/{site_id}/comments` — query key: `['comments', siteId]`
- `usePostComment()` → `POST /sites/comments` (mutation) — invalidates `['comments', siteId]` on success
- `useMyAssignments()` → `GET /sites/my-assignments` — query key: `['sites', 'my-assignments']`

**Note:** Phase 2's site detail sheet preview also uses `useComments(siteId)` from this same hook file. The sheet slices the result to the first 3 entries client-side — no separate hook needed.

**`src/hooks/queries/useImages.ts`**
- `useUploadImage()` → `POST /images/` (mutation, multipart)
- `useThumbnail(imageId)` → `GET /images/base/{imageId}`
- `useFullImage(imageId)` → `GET /images/{imageId}` (lazy, only on click)

---

## Phase 10 — Activity Log (`/activity-log`)

### Layout
- **Summary cards (3):** Logins Today, Logins This Week, Most Active User — derived client-side from log data
- **Filters bar:** Username text search + date range picker (ShadcN Popover + Calendar)
- **Log table:** Shared `data-table.tsx`. Columns: `#`, Username, Timestamp (date-fns formatted), Action ("Login"). Default sort: newest first.
- Auto-refresh: TanStack Query `refetchInterval: 60000` (60 seconds)

### Access
Admin-only. Other roles redirected to `/dashboard`.

### Data Hook
`GET /users/logs?limit=100` → `[{ id, user_id, username, timestamp }]`

---

## Visual Design System — Modern Agricultural Theme

**Color palette:**
- Primary green: existing `#0d1a0f` dark, lighter greens for accents
- Warm amber: `amber-500` / `amber-600` for CTAs, highlights, active states
- Earthy backgrounds: warm off-whites in light mode, warm dark grays in dark mode (not cold blue-grays)
- Status: emerald (active/success), amber (warning/pending), rose (error/closed), gray (inactive)

**Component style:**
- Cards: soft box-shadow, slightly rounded corners (12px), subtle border
- Tables: alternating row backgrounds, hover highlight
- Forms: floating labels or clear label-above-input pattern
- Buttons: primary = amber-600 with white text; secondary = outlined with green; destructive = rose

**Typography:**
- Keep existing Inter font
- Page titles: font-semibold, text-xl/2xl
- Card values: font-bold, text-2xl/3xl with color accents
- Secondary text: text-muted-foreground, text-sm

**Spacing:** Consistent 4/6/8 Tailwind spacing units. Page content max-width: `max-w-7xl mx-auto`.

---

## Implementation Order

1. Phase 0: Foundation (auth rewrite + shared components + skeleton expansion)
2. Phase 1: Forgot password + reset password pages + login fix
3. Phase 9: User management gap-fill
4. Phase 2: Fields map (install leaflet + react-leaflet first)
5. Phase 3: Field visits / site chat
6. Phase 10: Activity log

---

## New Package Dependencies Required

- `leaflet@^1.9` + `react-leaflet@^4` — interactive map (react-leaflet v4 is the last version with confirmed React 18/19 compat; verify before installing)
- `@types/leaflet` — TypeScript types
- `react-dropzone@^14` — image file upload (v14 API: `useDropzone` hook with `accept` as object `{ 'image/*': [] }`)

**Leaflet Next.js setup notes (must do):**

1. Import `leaflet/dist/leaflet.css` inside the dynamic map component (not root layout)
2. Fix default marker icons by importing `leaflet` and reassigning `L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl })` at component init — standard Next.js/Webpack Leaflet gotcha

**ShadcN components to add if not present:**
Run `npx shadcn@latest add calendar` and `npx shadcn@latest add popover` before implementing Phase 10 date range filters.

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/lib/api.ts` | Shared axios instance (replaces + deletes axiosInstance.ts) |
| `src/hooks/useBootstrapSession.ts` | Session rehydration from HTTP-only cookie on page refresh |
| `src/components/ui/data-table.tsx` | TanStack Table wrapper |
| `src/components/ui/page-header.tsx` | Page title component |
| `src/components/ui/status-badge.tsx` | Role/status badge |
| `src/components/ui/empty-state.tsx` | Empty state component |
| `src/hooks/queries/useSites.ts` | Site CRUD hooks |
| `src/hooks/queries/useSiteComments.ts` | Comments + my-assignments hooks |
| `src/hooks/queries/useImages.ts` | Image upload/fetch hooks |
| `src/app/(auth)/forgot-password/page.tsx` | Forgot password page |
| `src/app/(auth)/reset-password/page.tsx` | Reset password page |
| `src/components/features/map/` | Map components (SiteMap, SiteList, SiteDetailSheet, CreateSiteModal, AssignUserModal) |
| `src/components/features/field-visits/` | Chat/visit components (CommentList, ChatBubble, PostForm, ImageLightbox) |

## Files to Delete

| File                        | Reason                              |
|-----------------------------|-------------------------------------|
| `src/lib/axiosInstance.ts`  | Replaced by `src/lib/api.ts`        |
| `src/hooks/useAuthCheck.ts` | Replaced by `useBootstrapSession.ts` |

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/queries/useAuth.ts` | Remove cookie-setting + JWT decode from login mutation |
| `src/stores/appStore.ts` | Remove persist middleware, remove exp field |
| `src/types/auth.ts` | Update role union to farmer/agent/analyst |
| `src/types/user.ts` | Update UserRole union |
| `src/data/sidebarRoutes.ts` | Re-map role visibility to real API role names |
| `src/data/mockData.ts` | Add SITE_COORDS lookup map keyed by site_id |
| `src/components/Skeletons.tsx` | Add TableSkeleton, ChatSkeleton, MapSkeleton, FormSkeleton |
| `src/app/(auth)/login/LoginForm.tsx` | Remove cookie logic, add "Forgot password?" link |
| `src/app/(protected)/layout.tsx` | Add useBootstrapSession call, show loading spinner while bootstrapping |
| `src/app/(protected)/user-management/_components/` | Role values, manager dropdown, full create form fields |
| `src/hooks/queries/users.ts` | Swap axiosInstance import → api.ts |
| `src/lib/server-api.ts` | Swap axiosInstance import → api.ts |
| `src/app/(protected)/fields-map/page.tsx` | Full implementation |
| `src/app/(protected)/field-visits/page.tsx` | Full implementation |
| `src/app/(protected)/activity-log/page.tsx` | Full implementation |
