# SeedSense Analytics — Full Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Phases 0, 1, 9, 2, 3, and 10 of the SeedSense frontend — foundation fixes, auth pages, user management gap-fill, fields map, site chat, and activity log — all wired to the real Agrinow API.

**Architecture:** Layered build: foundation first (axios rewrite, shared components), then auth pages, then feature pages in dependency order. Each task is independently committable. Zustand stores only display-safe metadata in localStorage (no JWT). HTTP-only cookie handles auth automatically via `withCredentials: true`.

**Tech Stack:** Next.js 16 App Router · React 19 · TypeScript · TailwindCSS 4 · ShadcN/UI · Zustand 5 · TanStack Query 5 · React Hook Form + Zod · Leaflet + react-leaflet · react-dropzone · @tanstack/react-table · date-fns · Recharts · Lucide React

---

## Key API Facts (from agrinow-api-docs.html)

- **Login**: `POST /auth/login` — body: `{ identifier, password }` — backend sets HTTP-only `access_token` cookie automatically; response body returns `{ access_token, token_type, username, email, role }`
- **No `/auth/me` endpoint exists yet** — session rehydration uses minimal localStorage persist for display info only (not JWT)
- **Sites assign** requires `assigned_date` in body: `{ user_id, site_id, assigned_date }`
- **Thumbnail**: `GET /images/base/{id}` → `{ image_id, format, data_uri }` (base64, 256×256)
- **Full image**: `GET /images/{id}` → binary response — fetch with axios + create blob URL for lightbox
- **Comments** — `type` field: `"text"` (default) | `"image"` (when image_id present)
- **All endpoints require JWT** — sent automatically via HTTP-only cookie with `withCredentials: true`

---

## File Map

### Files to Create
| File | Responsibility |
|------|----------------|
| `src/lib/api.ts` | Single axios instance: `withCredentials: true`, 401 interceptor |
| `src/hooks/useBootstrapSession.ts` | Rehydrate Zustand from localStorage on mount; validate against 401 |
| `src/components/ui/data-table.tsx` | TanStack Table wrapper: sorting, filter, pagination |
| `src/components/ui/page-header.tsx` | Page title + subtitle + right action slot |
| `src/components/ui/status-badge.tsx` | Role/status color chips |
| `src/components/ui/empty-state.tsx` | Centered empty state with icon + CTA |
| `src/hooks/queries/useSites.ts` | All site CRUD query/mutation hooks |
| `src/hooks/queries/useSiteComments.ts` | Comments + my-assignments hooks |
| `src/hooks/queries/useImages.ts` | Image upload + thumbnail + full-image hooks |
| `src/app/(auth)/forgot-password/page.tsx` | Forgot password page |
| `src/app/(auth)/reset-password/page.tsx` | Reset password page |
| `src/components/features/map/SiteMap.tsx` | Leaflet map with markers |
| `src/components/features/map/SiteList.tsx` | Left sidebar site list |
| `src/components/features/map/SiteDetailSheet.tsx` | Right panel slide-in sheet |
| `src/components/features/map/CreateSiteModal.tsx` | Create site form dialog |
| `src/components/features/map/AssignUserModal.tsx` | Assign user form dialog |
| `src/components/features/field-visits/CommentList.tsx` | Desktop table + mobile chat view |
| `src/components/features/field-visits/ChatBubble.tsx` | Individual chat message bubble |
| `src/components/features/field-visits/PostForm.tsx` | Sticky comment post form |
| `src/components/features/field-visits/ImageLightbox.tsx` | Full-image dialog |

### Files to Delete
| File | Reason |
|------|--------|
| `src/lib/axiosInstance.ts` | Replaced by `src/lib/api.ts` |

### Files to Modify
| File | Change |
|------|--------|
| `src/hooks/queries/useAuth.ts` | Remove manual cookie-setting, remove JWT decode |
| `src/stores/appStore.ts` | Remove `exp` field; keep minimal localStorage persist for display info |
| `src/types/auth.ts` | Update role union |
| `src/types/user.ts` | Update UserRole union |
| `src/data/sidebarRoutes.ts` | Re-map to real role names |
| `src/data/mockData.ts` | Add `SITE_COORDS` lookup map |
| `src/components/Skeletons.tsx` | Add Table/Chat/Map/Form skeletons |
| `src/app/(auth)/login/LoginForm.tsx` | Remove cookie logic, add forgot-password link |
| `src/app/(protected)/layout.tsx` | Add useBootstrapSession, loading spinner |
| `src/app/(protected)/user-management/_components/columns.tsx` | Role badge colors |
| `src/app/(protected)/user-management/_components/create-user-dialog.tsx` | Add missing fields + manager dropdown |
| `src/app/(protected)/user-management/_components/edit-user-dialog.tsx` | Add is_active toggle + AlertDialog |
| `src/app/(protected)/user-management/_components/delete-user-dialog.tsx` | Wire to real DELETE endpoint |
| `src/hooks/queries/users.ts` | Swap to api.ts, add useManagerDropdown |
| `src/lib/server-api.ts` | Swap to api.ts |
| `src/app/(protected)/fields-map/page.tsx` | Full implementation |
| `src/app/(protected)/field-visits/page.tsx` | Full implementation |
| `src/app/(protected)/activity-log/page.tsx` | Full implementation |

---

## Task 1: Create `src/lib/api.ts` (replaces axiosInstance.ts)

**Files:**
- Create: `src/lib/api.ts`
- Delete: `src/lib/axiosInstance.ts` (after updating all imports)

- [ ] **Step 1: Create `src/lib/api.ts`**

```typescript
// src/lib/api.ts
import axios from 'axios'
import { useAppStore } from '@/stores/appStore'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true, // sends HTTP-only access_token cookie automatically
})

// 401 → clear store + redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAppStore.getState().logout()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
```

- [ ] **Step 2: Update all imports from axiosInstance → api**

Search for `@/lib/axiosInstance` across the codebase and replace with `@/lib/api`. Files to update (check all of these explicitly):
- `src/hooks/queries/useAuth.ts`
- `src/hooks/queries/users.ts`
- `src/lib/server-api.ts` ← **do not skip this one**
- Run `grep -r "axiosInstance" src/` to catch any others

- [ ] **Step 3: Delete old files**

```bash
rm src/lib/axiosInstance.ts
rm src/hooks/useAuthCheck.ts
```

- [ ] **Step 4: Verify build compiles**

```bash
cd "C:/Users/naman/OneDrive/Desktop/Project/Sammu/againow-ui" && npm run build 2>&1 | tail -20
```
Expected: no TypeScript errors related to axiosInstance

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: replace axiosInstance with api.ts using withCredentials"
```

---

## Task 2: Update Zustand Store + Auth Types

**Files:**
- Modify: `src/stores/appStore.ts`
- Modify: `src/types/auth.ts`
- Modify: `src/types/user.ts`

- [ ] **Step 1: Update `src/stores/appStore.ts`**

Remove `exp` field. Keep minimal localStorage persist for display info (not JWT). Update interface:

```typescript
// src/stores/appStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface StoreUser {
  username: string
  email: string
  role: 'admin' | 'manager' | 'farmer' | 'agent' | 'analyst'
}

interface AppState {
  currentUser: StoreUser | null
  isAuthenticated: boolean
  sidebarOpen: boolean
  login: (username: string, email: string, role: string) => void
  logout: () => void
  setRole: (role: string) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      sidebarOpen: true,
      login: (username, email, role) =>
        set({
          currentUser: { username, email, role: role as StoreUser['role'] },
          isAuthenticated: true,
        }),
      logout: () => set({ currentUser: null, isAuthenticated: false }),
      setRole: (role) =>
        set((state) => ({
          currentUser: state.currentUser
            ? { ...state.currentUser, role: role as StoreUser['role'] }
            : null,
        })),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'seedsense-user', // localStorage key — stores display info only, NOT the JWT
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
```

- [ ] **Step 2: Update `src/types/auth.ts`**

```typescript
// src/types/auth.ts
export type AuthRole = 'admin' | 'manager' | 'farmer' | 'agent' | 'analyst' | null

export interface AuthUser {
  id?: string
  username: string | null
  email: string
  role: AuthRole
}

export interface LoginResponse {
  access_token: string
  token_type: string
  username: string
  email: string
  role: string
}
```

- [ ] **Step 3: Update `src/types/user.ts`**

Update only the role union type line:
```typescript
// Change:
type UserRole = "Admin" | "Manager" | "Farmer" | "Agent" | "Analyst"
// To:
export type UserRole = 'admin' | 'manager' | 'farmer' | 'agent' | 'analyst'
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: update role types to match API values"
```

---

## Task 3: Update Login Hook + Auth Flow

**Files:**
- Modify: `src/hooks/queries/useAuth.ts`
- Modify: `src/app/(auth)/login/LoginForm.tsx`

- [ ] **Step 1: Rewrite `src/hooks/queries/useAuth.ts`**

Remove cookie-setting and JWT decode. Backend sets HTTP-only cookie automatically.

```typescript
// src/hooks/queries/useAuth.ts
'use client'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useAppStore } from '@/stores/appStore'
import type { LoginResponse } from '@/types/auth'

interface LoginCredentials {
  identifier: string
  password: string
}

export function useLogin() {
  const router = useRouter()
  const { login } = useAppStore()

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data } = await api.post<LoginResponse>('/auth/login', credentials)
      return data
    },
    onSuccess: (data) => {
      // Backend has set HTTP-only access_token cookie automatically.
      // Store only display-safe info in Zustand (no JWT).
      login(data.username, data.email, data.role)
      router.push('/dashboard?from=login')
      router.refresh()
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail ?? 'Login failed. Please try again.'
      toast.error(message)
    },
  })
}
```

- [ ] **Step 2: Update `src/app/(auth)/login/LoginForm.tsx`**

Remove cookie-setting code. Add "Forgot password?" link. The form field name should send `identifier` (API expects `identifier`, not `email`):

Find the `onSubmit` handler and update it to call `login({ identifier: values.emailOrUsername, password: values.password })`.

Add this link below the submit button:
```tsx
<div className="text-center text-sm">
  <Link href="/forgot-password" className="text-green-400 hover:text-green-300 transition-colors">
    Forgot password?
  </Link>
</div>
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: clean up login flow for HTTP-only cookie auth"
```

---

## Task 4: Update Role Routing + Sidebar

**Files:**
- Modify: `src/data/sidebarRoutes.ts`

- [ ] **Step 1: Update role arrays in sidebarRoutes.ts**

Read the current file and update role visibility. New role mappings:
- `admin` → all routes
- `manager` → all routes except user-management, activity-log
- `farmer` / `agent` → dashboard, fields-map, field-visits, pest-disease
- `analyst` → dashboard, fields-map, crop-stages, yield-forecast, reports

Update every route's `roles` array to use lowercase API values: `'admin'`, `'manager'`, `'farmer'`, `'agent'`, `'analyst'`

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: align sidebar routes with real API role names"
```

---

## Task 5: Expand Skeletons (must run BEFORE Task 6 — data-table imports TableSkeleton)

**Files:**
- Modify: `src/components/Skeletons.tsx`

- [ ] **Step 1: Add new skeletons to `src/components/Skeletons.tsx`**

Append to the existing file (do not replace existing skeletons):

```typescript
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-9 w-48 mb-3" />
      <div className="rounded-lg border overflow-hidden">
        <div className="bg-muted/40 flex gap-4 px-4 py-3">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3 border-t">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function ChatSkeleton({ messages = 5 }: { messages?: number }) {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: messages }).map((_, i) => (
        <div key={i} className={`flex gap-2 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="space-y-1 max-w-xs">
            <Skeleton className="h-3 w-16" />
            <Skeleton className={`h-12 rounded-2xl ${i % 2 === 0 ? 'w-56' : 'w-44'}`} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function MapSkeleton() {
  return (
    <div className="relative w-full h-full min-h-96 rounded-lg overflow-hidden bg-muted animate-pulse">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-muted-foreground/50 flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full border-4 border-muted-foreground/20 flex items-center justify-center">
            <div className="w-1 h-5 bg-muted-foreground/20 rounded" />
          </div>
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  )
}

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
      <Skeleton className="h-9 w-28 mt-2" />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add TableSkeleton, ChatSkeleton, MapSkeleton, FormSkeleton"
```

---

## Task 6: Add Shared UI Components

**Files:**
- Create: `src/components/ui/page-header.tsx`
- Create: `src/components/ui/status-badge.tsx`
- Create: `src/components/ui/empty-state.tsx`
- Create: `src/components/ui/data-table.tsx`

- [ ] **Step 1: Create `src/components/ui/page-header.tsx`**

```typescript
// src/components/ui/page-header.tsx
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-6', className)}>
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/ui/status-badge.tsx`**

```typescript
// src/components/ui/status-badge.tsx
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Role = 'admin' | 'manager' | 'farmer' | 'agent' | 'analyst'
type Status = 'active' | 'closed' | 'pending' | 'inactive'

const roleStyles: Record<Role, string> = {
  admin: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  farmer: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  agent: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  analyst: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
}

const statusStyles: Record<Status, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  closed: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  inactive: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
}

export function RoleBadge({ role }: { role: string }) {
  const styles = roleStyles[role as Role] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize', styles)}>
      {role}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase() as Status
  const styles = statusStyles[key] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize', styles)}>
      {status}
    </span>
  )
}
```

- [ ] **Step 3: Create `src/components/ui/empty-state.tsx`**

```typescript
// src/components/ui/empty-state.tsx
import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: { label: string; onClick: () => void }
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      {action && (
        <Button variant="outline" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Create `src/components/ui/data-table.tsx`**

```typescript
// src/components/ui/data-table.tsx
'use client'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { useState } from 'react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { TableSkeleton } from '@/components/Skeletons'
import { EmptyState } from './empty-state'
import { FileText } from 'lucide-react'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
  filterPlaceholder?: string
  pageSize?: number
}

export function DataTable<TData, TValue>({
  columns, data, isLoading, filterPlaceholder = 'Search...', pageSize = 10,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  })

  if (isLoading) return <TableSkeleton rows={6} />

  return (
    <div className="space-y-3">
      <Input
        placeholder={filterPlaceholder}
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="bg-muted/40 hover:bg-muted/40">
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="font-semibold cursor-pointer select-none"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === 'asc' ? ' ↑' : header.column.getIsSorted() === 'desc' ? ' ↓' : ''}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <EmptyState icon={FileText} title="No results" description="No data matches your search." />
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-amber-50/30 dark:hover:bg-amber-900/10">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Add `Table` component if not present** (ShadcN)

Check if `src/components/ui/table.tsx` exists. If not:
```bash
npx shadcn@latest add table
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add shared UI components (PageHeader, StatusBadge, EmptyState, DataTable)"
```

---

## Task 7: Forgot Password + Reset Password Pages

**Files:**
- Create: `src/app/(auth)/forgot-password/page.tsx`
- Create: `src/app/(auth)/reset-password/page.tsx`

- [ ] **Step 1: Create `src/app/(auth)/forgot-password/page.tsx`**

```typescript
// src/app/(auth)/forgot-password/page.tsx
'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { toast } from 'sonner'
import { Loader2, Mail, Sprout } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import api from '@/lib/api'

const schema = z.object({ email: z.string().email('Enter a valid email address') })
type FormValues = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (_values: FormValues) => {
    try {
      // Fire the API but ALWAYS show the same message regardless of response
      await api.post('/auth/forgot-password', { email: _values.email }).catch(() => {})
    } finally {
      setSubmitted(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1a0f] relative overflow-hidden">
      {/* Ambient background blobs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-green-900/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-emerald-900/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Sprout className="h-7 w-7 text-green-400" />
          <span className="text-xl font-semibold text-white">SeedSense</span>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {submitted ? (
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <Mail className="h-6 w-6 text-green-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Check your email</h2>
              <p className="text-sm text-white/60">
                If that email is registered, a reset link was sent. Check your inbox and spam folder.
              </p>
              <Link href="/login" className="block mt-4 text-sm text-green-400 hover:text-green-300 transition-colors">
                ← Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white">Reset your password</h2>
                <p className="text-sm text-white/50 mt-1">Enter your email and we&apos;ll send you a reset link.</p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-white/70 text-sm">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...register('email')}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-green-400"
                  />
                  {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-500 text-white">
                  {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</> : 'Send reset link'}
                </Button>
              </form>
              <Link href="/login" className="block mt-4 text-center text-sm text-white/40 hover:text-white/60 transition-colors">
                ← Back to login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/app/(auth)/reset-password/page.tsx`**

```typescript
// src/app/(auth)/reset-password/page.tsx
'use client'
import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { toast } from 'sonner'
import { Loader2, Sprout } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import api from '@/lib/api'

const schema = z
  .object({
    new_password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm_password: z.string(),
  })
  .refine((v) => v.new_password === v.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })
type FormValues = z.infer<typeof schema>

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) router.replace('/forgot-password')
  }, [token, router])

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await api.post('/auth/reset-password', { token, new_password: values.new_password })
      toast.success('Password reset successfully!')
      router.push('/login')
    } catch (error: any) {
      const status = error.response?.status
      if (status === 400 || status === 410) {
        setError('root', {
          message: 'This reset link has expired or has already been used.',
        })
      } else {
        setError('root', { message: 'Something went wrong. Please try again.' })
      }
    }
  }

  if (!token) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1a0f] relative overflow-hidden">
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-green-900/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-emerald-900/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Sprout className="h-7 w-7 text-green-400" />
          <span className="text-xl font-semibold text-white">SeedSense</span>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Set new password</h2>
            <p className="text-sm text-white/50 mt-1">Choose a strong password (min. 6 characters).</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errors.root && (
              <div className="text-sm text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg p-3">
                {errors.root.message}{' '}
                <Link href="/forgot-password" className="underline hover:text-red-300">Request a new link</Link>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="new_password" className="text-white/70 text-sm">New password</Label>
              <Input
                id="new_password"
                type="password"
                placeholder="••••••••"
                {...register('new_password')}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-green-400"
              />
              {errors.new_password && <p className="text-xs text-red-400">{errors.new_password.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm_password" className="text-white/70 text-sm">Confirm password</Label>
              <Input
                id="confirm_password"
                type="password"
                placeholder="••••••••"
                {...register('confirm_password')}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-green-400"
              />
              {errors.confirm_password && <p className="text-xs text-red-400">{errors.confirm_password.message}</p>}
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-500 text-white">
              {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Resetting...</> : 'Reset password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add forgot-password and reset-password pages"
```

---

## Task 8: User Management Gap-Fill

**Files:**
- Modify: `src/hooks/queries/users.ts`
- Modify: `src/app/(protected)/user-management/_components/columns.tsx`
- Modify: `src/app/(protected)/user-management/_components/create-user-dialog.tsx`
- Modify: `src/app/(protected)/user-management/_components/edit-user-dialog.tsx`
- Modify: `src/app/(protected)/user-management/_components/delete-user-dialog.tsx`

- [ ] **Step 1: Add `useManagerDropdown` to `src/hooks/queries/users.ts`**

Add this hook to the existing file:

```typescript
export function useManagerDropdown() {
  return useQuery({
    queryKey: ['users', 'manager-dropdown'],
    queryFn: async () => {
      const { data } = await api.get<{ id: number; username: string; first_name: string; last_name: string }[]>(
        '/users/manager_dropdown'
      )
      return data
    },
  })
}
```

- [ ] **Step 2: Update role colors in `columns.tsx`**

Replace any old role color logic with `RoleBadge` from `@/components/ui/status-badge`:

```typescript
import { RoleBadge } from '@/components/ui/status-badge'
// In role column cell:
cell: ({ row }) => <RoleBadge role={row.getValue('role')} />
```

- [ ] **Step 3: Update `create-user-dialog.tsx`**

Add the missing fields to the form. The Zod schema should include:
- `language`: `z.enum(['en', 'hi', 'kn']).default('en')`
- `emp_type`: `z.enum(['full_time', 'part_time', 'contract', 'intern']).optional()`
- `phone`: `z.string().optional()`
- `hire_date`: `z.string().min(1, 'Required')` (date input)
- `relive_date`: `z.string().optional()`
- `manager_id`: `z.number().optional()`

Add manager dropdown using `useManagerDropdown()`. Submit to `POST /create_user/`.

- [ ] **Step 4: Update `edit-user-dialog.tsx`**

Add `is_active` toggle field. Wrap the submit in a ShadcN AlertDialog when toggling `is_active` to false:

```typescript
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
```

- [ ] **Step 5: Verify `delete-user-dialog.tsx` uses AlertDialog**

Confirm it uses `AlertDialog` before calling `DELETE /users/{id}`. If not, wrap the delete button in `AlertDialog`.

- [ ] **Step 6: Admin-only guard on user-management page**

In `src/app/(protected)/user-management/page.tsx` or `UserManagementClient.tsx`, add:

```typescript
const { currentUser } = useAppStore()
if (currentUser?.role !== 'admin') {
  redirect('/dashboard')
}
```

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: user management gap-fill (role badges, manager dropdown, missing fields, guards)"
```

---

## Task 9: Install Dependencies for Map + Chat

- [ ] **Step 1: Install packages**

```bash
cd "C:/Users/naman/OneDrive/Desktop/Project/Sammu/againow-ui" && npm install react-leaflet leaflet @types/leaflet react-dropzone
```

- [ ] **Step 2: Verify versions**

```bash
npm list react-leaflet leaflet react-dropzone 2>&1
```
Expected: react-leaflet and leaflet installed without peer dependency errors.

- [ ] **Step 3: Add ShadcN table component if needed**

```bash
npx shadcn@latest add table 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json && git commit -m "chore: install leaflet, react-leaflet, react-dropzone"
```

---

## Task 10: Site + Image Query Hooks

**Files:**
- Create: `src/hooks/queries/useSites.ts`
- Create: `src/hooks/queries/useSiteComments.ts`
- Create: `src/hooks/queries/useImages.ts`

- [ ] **Step 1: Create `src/hooks/queries/useSites.ts`**

```typescript
// src/hooks/queries/useSites.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export interface Site {
  id: number
  site_name: string
  site_description: string
  created_date: string
  close_date: string | null
}

export interface SiteAssignment {
  id: number
  user_id: number
  site_id: number
  assigned_date: string
}

// Query keys
export const SITE_KEYS = {
  all: ['sites'] as const,
  my: ['sites', 'my'] as const,
  assignments: ['sites', 'assignments'] as const,
  myAssignments: ['sites', 'my-assignments'] as const,
}

export function useSitesList() {
  return useQuery({
    queryKey: SITE_KEYS.all,
    queryFn: async () => {
      const { data } = await api.get<Site[]>('/sites/')
      return data
    },
  })
}

export function useMySites() {
  return useQuery({
    queryKey: SITE_KEYS.my,
    queryFn: async () => {
      const { data } = await api.get<Site[]>('/sites/my')
      return data
    },
  })
}

export function useSiteAssignments() {
  return useQuery({
    queryKey: SITE_KEYS.assignments,
    queryFn: async () => {
      const { data } = await api.get<SiteAssignment[]>('/sites/all-assignments')
      return data
    },
  })
}

export function useCreateSite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Omit<Site, 'id'>) => {
      const { data } = await api.post<Site>('/sites/', payload)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SITE_KEYS.all })
    },
  })
}

export function useAssignUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { user_id: number; site_id: number; assigned_date: string }) => {
      const { data } = await api.post<SiteAssignment>('/sites/assign', payload)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SITE_KEYS.assignments })
    },
  })
}
```

- [ ] **Step 2: Create `src/hooks/queries/useSiteComments.ts`**

```typescript
// src/hooks/queries/useSiteComments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export interface SiteComment {
  id: number
  site_user_relation_id: number
  user_id: number
  username?: string
  comment: string
  image_id: number | null
  type: 'text' | 'image'
  timestamp: string
}

export interface MyAssignment {
  id: number       // this is site_user_relation_id
  user_id: number
  site_id: number
  assigned_date: string
}

export const COMMENT_KEYS = {
  bySite: (siteId: number) => ['comments', siteId] as const,
  myAssignments: ['sites', 'my-assignments'] as const,
}

export function useComments(siteId: number | null) {
  return useQuery({
    queryKey: COMMENT_KEYS.bySite(siteId ?? 0),
    queryFn: async () => {
      const { data } = await api.get<SiteComment[]>(`/sites/${siteId}/comments`)
      return data
    },
    enabled: siteId != null,
  })
}

export function useMyAssignments() {
  return useQuery({
    queryKey: COMMENT_KEYS.myAssignments,
    queryFn: async () => {
      const { data } = await api.get<MyAssignment[]>('/sites/my-assignments')
      return data
    },
  })
}

export function usePostComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      site_user_relation_id: number
      comment: string
      image_id?: number
      type?: 'text' | 'image'
      siteId: number // for cache invalidation only
    }) => {
      const { siteId, ...body } = payload
      const { data } = await api.post<SiteComment>('/sites/comments', body)
      return { data, siteId }
    },
    onSuccess: ({ siteId }) => {
      qc.invalidateQueries({ queryKey: COMMENT_KEYS.bySite(siteId) })
    },
  })
}
```

- [ ] **Step 3: Create `src/hooks/queries/useImages.ts`**

```typescript
// src/hooks/queries/useImages.ts
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/api'

export interface ImageMeta {
  id: number
  file_name: string
  format: string
  size: number
  created_at: string
}

export interface ThumbnailResponse {
  image_id: number
  format: string
  data_uri: string
}

export function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post<ImageMeta>('/images/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },
  })
}

export function useThumbnail(imageId: number | null) {
  return useQuery({
    queryKey: ['images', 'thumb', imageId],
    queryFn: async () => {
      const { data } = await api.get<ThumbnailResponse>(`/images/base/${imageId}`)
      return data
    },
    enabled: imageId != null,
    staleTime: 5 * 60 * 1000, // thumbnails rarely change
  })
}

// Lazy hook — only fetches when enabled=true
export function useFullImage(imageId: number | null, enabled: boolean) {
  return useQuery({
    queryKey: ['images', 'full', imageId],
    queryFn: async () => {
      // Full image returns binary — fetch as blob and create object URL
      const response = await api.get(`/images/${imageId}`, { responseType: 'blob' })
      const url = URL.createObjectURL(response.data)
      return url
    },
    enabled: imageId != null && enabled,
    staleTime: 5 * 60 * 1000,
  })
}
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add site, comment, and image query hooks"
```

---

## Task 11: Add SITE_COORDS to mockData

**Files:**
- Modify: `src/data/mockData.ts`

- [ ] **Step 1: Add SITE_COORDS map**

Append to `src/data/mockData.ts`:

```typescript
// TODO: replace with API coords when available (API does not yet return GPS coordinates)
export const SITE_COORDS: Record<number, { lat: number; lng: number }> = {
  1: { lat: 12.9716, lng: 77.5946 }, // Bangalore area
  2: { lat: 13.0827, lng: 80.2707 }, // Chennai area
  3: { lat: 17.3850, lng: 78.4867 }, // Hyderabad area
  4: { lat: 18.5204, lng: 73.8567 }, // Pune area
  5: { lat: 15.3173, lng: 75.7139 }, // Hubli area
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "chore: add SITE_COORDS lookup for map markers"
```

---

## Task 12: Fields Map Page

**Files:**
- Create: `src/components/features/map/SiteMap.tsx`
- Create: `src/components/features/map/SiteList.tsx`
- Create: `src/components/features/map/SiteDetailSheet.tsx`
- Create: `src/components/features/map/CreateSiteModal.tsx`
- Create: `src/components/features/map/AssignUserModal.tsx`
- Modify: `src/app/(protected)/fields-map/page.tsx`

- [ ] **Step 1: Create `src/components/features/map/SiteMap.tsx`**

This is a dynamic-imported Leaflet component (must not SSR):

```typescript
// src/components/features/map/SiteMap.tsx
'use client'
import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Site } from '@/hooks/queries/useSites'
import { SITE_COORDS } from '@/data/mockData'
import { format } from 'date-fns'

// Fix default marker icons (Next.js/Webpack gotcha)
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: '/leaflet/marker-icon.png',
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  shadowUrl: '/leaflet/marker-shadow.png',
})

interface SiteMapProps {
  sites: Site[]
  selectedSiteId: number | null
  onSiteSelect: (site: Site) => void
}

export default function SiteMap({ sites, selectedSiteId, onSiteSelect }: SiteMapProps) {
  const sitesWithCoords = sites
    .map((s) => ({ site: s, coords: SITE_COORDS[s.id] }))
    .filter((s) => s.coords != null)

  return (
    <MapContainer
      center={[15.0, 78.0]}
      zoom={6}
      className="w-full h-full"
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {sitesWithCoords.map(({ site, coords }) => {
        const isActive = !site.close_date || new Date(site.close_date) > new Date()
        return (
          <Marker
            key={site.id}
            position={[coords.lat, coords.lng]}
            eventHandlers={{ click: () => onSiteSelect(site) }}
            icon={L.divIcon({
              className: '',
              html: `<div style="
                width:14px;height:14px;border-radius:50%;
                background:${isActive ? '#10b981' : '#9ca3af'};
                border:2px solid white;
                box-shadow:0 0 0 2px ${isActive ? '#10b981' : '#9ca3af'}40;
              "></div>`,
              iconSize: [14, 14],
              iconAnchor: [7, 7],
            })}
          >
            <Popup>
              <div className="text-sm">
                <strong>{site.site_name}</strong>
                <p className="text-xs text-gray-500 mt-0.5">{site.site_description}</p>
                {site.close_date && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Closed: {format(new Date(site.close_date), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
```

- [ ] **Step 1b: Copy Leaflet marker images to `public/leaflet/`**

Without these files, markers show as broken images at runtime.

```bash
mkdir -p public/leaflet && cp node_modules/leaflet/dist/images/* public/leaflet/
```

- [ ] **Step 2: Create `src/components/features/map/SiteList.tsx`**

```typescript
// src/components/features/map/SiteList.tsx
'use client'
import { Site } from '@/hooks/queries/useSites'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { MapPin } from 'lucide-react'

interface SiteListProps {
  sites: Site[]
  selectedSiteId: number | null
  onSiteSelect: (site: Site) => void
}

export function SiteList({ sites, selectedSiteId, onSiteSelect }: SiteListProps) {
  return (
    <div className="h-full overflow-y-auto space-y-2 p-3">
      {sites.length === 0 && (
        <div className="text-center text-sm text-muted-foreground py-8">No sites found</div>
      )}
      {sites.map((site) => {
        const isActive = !site.close_date || new Date(site.close_date) > new Date()
        const isSelected = selectedSiteId === site.id
        return (
          <button
            key={site.id}
            onClick={() => onSiteSelect(site)}
            className={cn(
              'w-full text-left rounded-lg p-3 border transition-all group',
              isSelected
                ? 'bg-amber-50 border-amber-300 dark:bg-amber-900/20 dark:border-amber-700'
                : 'bg-card border-border hover:border-amber-200 hover:bg-amber-50/50 dark:hover:bg-amber-900/10'
            )}
          >
            <div className="flex items-start gap-2">
              <div className={cn(
                'mt-0.5 w-2.5 h-2.5 rounded-full shrink-0',
                isActive ? 'bg-emerald-500' : 'bg-gray-400'
              )} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{site.site_name}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{site.site_description}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {isActive ? (
                    <span className="text-emerald-600 dark:text-emerald-400">Active</span>
                  ) : (
                    <span>Closed {site.close_date ? format(new Date(site.close_date), 'MMM yyyy') : ''}</span>
                  )}
                </p>
              </div>
              <MapPin className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 mt-0.5" />
            </div>
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/features/map/SiteDetailSheet.tsx`**

```typescript
// src/components/features/map/SiteDetailSheet.tsx
'use client'
import { Site } from '@/hooks/queries/useSites'
import { useComments } from '@/hooks/queries/useSiteComments'
import { useSiteAssignments } from '@/hooks/queries/useSites'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Calendar, MessageSquare, Users } from 'lucide-react'

interface SiteDetailSheetProps {
  site: Site | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAssignUser: () => void
  canManage: boolean // admin or manager
}

export function SiteDetailSheet({ site, open, onOpenChange, onAssignUser, canManage }: SiteDetailSheetProps) {
  const router = useRouter()
  const { data: comments } = useComments(site?.id ?? null)
  const { data: assignments } = useSiteAssignments()

  const siteAssignments = assignments?.filter((a) => a.site_id === site?.id) ?? []
  const previewComments = comments?.slice(0, 3) ?? []

  if (!site) return null

  const isActive = !site.close_date || new Date(site.close_date) > new Date()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
            <SheetTitle>{site.site_name}</SheetTitle>
          </div>
          <p className="text-sm text-muted-foreground">{site.site_description}</p>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          {/* Dates */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>Created {format(new Date(site.created_date), 'MMM d, yyyy')}</span>
            </div>
            {site.close_date && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span>· Closes {format(new Date(site.close_date), 'MMM d, yyyy')}</span>
              </div>
            )}
          </div>

          {/* Assigned users */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> Assigned Users ({siteAssignments.length})
              </h4>
              {canManage && (
                <Button variant="outline" size="sm" onClick={onAssignUser}>
                  + Assign
                </Button>
              )}
            </div>
            {siteAssignments.length === 0 ? (
              <p className="text-xs text-muted-foreground">No users assigned yet.</p>
            ) : (
              <div className="space-y-1">
                {siteAssignments.slice(0, 5).map((a) => (
                  <div key={a.id} className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
                    User #{a.user_id} · Assigned {format(new Date(a.assigned_date), 'MMM d, yyyy')}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comments preview */}
          <div>
            <h4 className="text-sm font-medium flex items-center gap-1.5 mb-2">
              <MessageSquare className="h-3.5 w-3.5" /> Recent Field Visits
            </h4>
            {previewComments.length === 0 ? (
              <p className="text-xs text-muted-foreground">No visits recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {previewComments.map((c) => (
                  <div key={c.id} className="text-xs bg-muted/40 rounded-lg p-2">
                    <p className="font-medium">User #{c.user_id}</p>
                    <p className="text-muted-foreground truncate">{c.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CTA */}
          <Button
            className="w-full bg-amber-600 hover:bg-amber-500 text-white"
            onClick={() => {
              router.push(`/field-visits?site=${site.id}`)
              onOpenChange(false)
            }}
          >
            View Field Visits
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

- [ ] **Step 4: Create `src/components/features/map/CreateSiteModal.tsx`**

```typescript
// src/components/features/map/CreateSiteModal.tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { useCreateSite } from '@/hooks/queries/useSites'

const schema = z.object({
  site_name: z.string().min(1, 'Required'),
  site_description: z.string().min(1, 'Required'),
  created_date: z.string().min(1, 'Required'),
  close_date: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

interface CreateSiteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateSiteModal({ open, onOpenChange }: CreateSiteModalProps) {
  const createSite = useCreateSite()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await createSite.mutateAsync({
        site_name: values.site_name,
        site_description: values.site_description,
        created_date: values.created_date,
        close_date: values.close_date || null,
      })
      toast.success(`Site "${values.site_name}" created!`)
      reset()
      onOpenChange(false)
    } catch {
      toast.error('Failed to create site.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Site</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Site Name *</Label>
            <Input {...register('site_name')} placeholder="e.g. Alpha Farm Block" />
            {errors.site_name && <p className="text-xs text-destructive">{errors.site_name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Description *</Label>
            <Input {...register('site_description')} placeholder="Brief description" />
            {errors.site_description && <p className="text-xs text-destructive">{errors.site_description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Start Date *</Label>
              <Input type="date" {...register('created_date')} />
              {errors.created_date && <p className="text-xs text-destructive">{errors.created_date.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Close Date</Label>
              <Input type="date" {...register('close_date')} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={createSite.isPending} className="bg-amber-600 hover:bg-amber-500 text-white">
              {createSite.isPending ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Creating...</> : 'Create Site'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 5: Create `src/components/features/map/AssignUserModal.tsx`**

```typescript
// src/components/features/map/AssignUserModal.tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { useAssignUser } from '@/hooks/queries/useSites'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

const schema = z.object({
  user_id: z.string().min(1, 'Select a user'),
})
type FormValues = z.infer<typeof schema>

interface AssignUserModalProps {
  siteId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AssignUserModal({ siteId, open, onOpenChange }: AssignUserModalProps) {
  const assignUser = useAssignUser()
  const { data: users } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: async () => {
      const { data } = await api.get<{ id: number; username: string; first_name: string; last_name: string }[]>('/users/')
      return data
    },
    enabled: open,
  })

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    if (!siteId) return
    try {
      await assignUser.mutateAsync({
        user_id: parseInt(values.user_id),
        site_id: siteId,
        assigned_date: format(new Date(), 'yyyy-MM-dd'),
      })
      toast.success('User assigned successfully!')
      reset()
      onOpenChange(false)
    } catch {
      toast.error('Failed to assign user.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Assign User to Site</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Select User *</Label>
            <Select onValueChange={(val) => setValue('user_id', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a user..." />
              </SelectTrigger>
              <SelectContent>
                {users?.map((u) => (
                  <SelectItem key={u.id} value={String(u.id)}>
                    {u.first_name} {u.last_name} (@{u.username})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.user_id && <p className="text-xs text-destructive">{errors.user_id.message}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={assignUser.isPending} className="bg-amber-600 hover:bg-amber-500 text-white">
              {assignUser.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Assign'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 6: Rewrite `src/app/(protected)/fields-map/page.tsx`**

```typescript
// src/app/(protected)/fields-map/page.tsx
'use client'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { useSitesList } from '@/hooks/queries/useSites'
import { SiteList } from '@/components/features/map/SiteList'
import { SiteDetailSheet } from '@/components/features/map/SiteDetailSheet'
import { CreateSiteModal } from '@/components/features/map/CreateSiteModal'
import { AssignUserModal } from '@/components/features/map/AssignUserModal'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { MapSkeleton } from '@/components/Skeletons'
import { useAppStore } from '@/stores/appStore'
import { Plus } from 'lucide-react'
import type { Site } from '@/hooks/queries/useSites'

// Dynamic import — Leaflet must not run on server
const SiteMap = dynamic(() => import('@/components/features/map/SiteMap'), {
  ssr: false,
  loading: () => <MapSkeleton />,
})

export default function FieldsMapPage() {
  const { currentUser } = useAppStore()
  const canManage = currentUser?.role === 'admin' || currentUser?.role === 'manager'

  const { data: sites = [], isLoading } = useSitesList()
  const [selectedSite, setSelectedSite] = useState<Site | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)

  const handleSiteSelect = (site: Site) => {
    setSelectedSite(site)
    setSheetOpen(true)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="px-6 pt-6 pb-3 shrink-0">
        <PageHeader
          title="Fields Map"
          subtitle="View and manage your agricultural sites"
          action={
            canManage ? (
              <Button
                onClick={() => setCreateOpen(true)}
                className="bg-amber-600 hover:bg-amber-500 text-white"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                New Site
              </Button>
            ) : undefined
          }
        />
      </div>

      <div className="flex flex-1 min-h-0 gap-0 overflow-hidden">
        {/* Left sidebar */}
        <div className="w-72 shrink-0 border-r overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b bg-muted/30">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {sites.length} Sites
            </p>
          </div>
          <SiteList
            sites={sites}
            selectedSiteId={selectedSite?.id ?? null}
            onSiteSelect={handleSiteSelect}
          />
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="h-full p-4"><MapSkeleton /></div>
          ) : (
            <SiteMap
              sites={sites}
              selectedSiteId={selectedSite?.id ?? null}
              onSiteSelect={handleSiteSelect}
            />
          )}
        </div>
      </div>

      {/* Detail sheet */}
      <SiteDetailSheet
        site={selectedSite}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onAssignUser={() => setAssignOpen(true)}
        canManage={canManage}
      />

      {/* Modals */}
      <CreateSiteModal open={createOpen} onOpenChange={setCreateOpen} />
      <AssignUserModal siteId={selectedSite?.id ?? null} open={assignOpen} onOpenChange={setAssignOpen} />
    </div>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: implement fields map page with Leaflet, site list, detail sheet, create/assign modals"
```

---

## Task 13: Field Visits / Site Chat Page

**Files:**
- Create: `src/components/features/field-visits/ChatBubble.tsx`
- Create: `src/components/features/field-visits/ImageLightbox.tsx`
- Create: `src/components/features/field-visits/PostForm.tsx`
- Create: `src/components/features/field-visits/CommentList.tsx`
- Modify: `src/app/(protected)/field-visits/page.tsx`

- [ ] **Step 1: Create `src/components/features/field-visits/ChatBubble.tsx`**

```typescript
// src/components/features/field-visits/ChatBubble.tsx
'use client'
import { SiteComment } from '@/hooks/queries/useSiteComments'
import { useThumbnail } from '@/hooks/queries/useImages'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { ImageLightbox } from './ImageLightbox'

interface ChatBubbleProps {
  comment: SiteComment
  isOwn: boolean
}

function ThumbnailImg({ imageId, onClick }: { imageId: number; onClick: () => void }) {
  const { data } = useThumbnail(imageId)
  if (!data) return <div className="w-24 h-24 bg-muted animate-pulse rounded-lg" />
  return (
    <img
      src={data.data_uri}
      alt="Attachment"
      loading="lazy"
      onClick={onClick}
      className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
    />
  )
}

export function ChatBubble({ comment, isOwn }: ChatBubbleProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)

  return (
    <>
      <div className={cn('flex gap-2', isOwn ? 'flex-row-reverse' : 'flex-row')}>
        <div className={cn(
          'max-w-xs lg:max-w-md',
          isOwn ? 'items-end' : 'items-start',
          'flex flex-col gap-1'
        )}>
          <div className={cn('flex items-center gap-1.5 text-xs text-muted-foreground', isOwn && 'flex-row-reverse')}>
            <span className="font-medium">User #{comment.user_id}</span>
            <span>·</span>
            <span>{format(new Date(comment.timestamp), 'MMM d, h:mm a')}</span>
          </div>
          <div className={cn(
            'rounded-2xl px-3 py-2 text-sm',
            isOwn
              ? 'bg-emerald-600 text-white rounded-tr-sm'
              : 'bg-card border border-border rounded-tl-sm'
          )}>
            {comment.comment && <p>{comment.comment}</p>}
            {comment.image_id && (
              <div className="mt-1">
                <ThumbnailImg imageId={comment.image_id} onClick={() => setLightboxOpen(true)} />
              </div>
            )}
          </div>
        </div>
      </div>
      {comment.image_id && (
        <ImageLightbox
          imageId={comment.image_id}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
        />
      )}
    </>
  )
}
```

- [ ] **Step 2: Create `src/components/features/field-visits/ImageLightbox.tsx`**

```typescript
// src/components/features/field-visits/ImageLightbox.tsx
'use client'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useFullImage } from '@/hooks/queries/useImages'
import { Loader2 } from 'lucide-react'

interface ImageLightboxProps {
  imageId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImageLightbox({ imageId, open, onOpenChange }: ImageLightboxProps) {
  const { data: imageUrl, isLoading } = useFullImage(imageId, open)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-2">
        <div className="flex items-center justify-center min-h-48">
          {isLoading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt="Full size"
              className="max-h-[80vh] max-w-full rounded-lg object-contain"
            />
          ) : (
            <p className="text-sm text-muted-foreground">Image not available</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 3: Create `src/components/features/field-visits/PostForm.tsx`**

```typescript
// src/components/features/field-visits/PostForm.tsx
'use client'
import { useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Paperclip, Send, X } from 'lucide-react'
import { usePostComment } from '@/hooks/queries/useSiteComments'
import { useUploadImage } from '@/hooks/queries/useImages'
import { cn } from '@/lib/utils'

interface PostFormProps {
  siteUserRelationId: number | null
  siteId: number
}

export function PostForm({ siteUserRelationId, siteId }: PostFormProps) {
  const [text, setText] = useState('')
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadedImageId, setUploadedImageId] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const postComment = usePostComment()
  const uploadImage = useUploadImage()

  const { getRootProps, getInputProps, open: openDropzone } = useDropzone({
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: 5 * 1024 * 1024,
    noClick: true,
    noKeyboard: true,
    onDrop: async (accepted, rejected) => {
      if (rejected.length > 0) {
        toast.error('File too large or invalid type. Max 5MB (JPEG/PNG/WebP).')
        return
      }
      if (accepted.length === 0) return
      const file = accepted[0]
      setPreviewFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setIsUploading(true)
      try {
        const meta = await uploadImage.mutateAsync(file)
        setUploadedImageId(meta.id)
      } catch {
        toast.error('Image upload failed.')
        setPreviewFile(null)
        setPreviewUrl(null)
      } finally {
        setIsUploading(false)
      }
    },
  })

  const clearImage = () => {
    setPreviewFile(null)
    setPreviewUrl(null)
    setUploadedImageId(null)
  }

  const handleSubmit = async () => {
    if (!siteUserRelationId) return
    if (!text.trim() && !uploadedImageId) return

    try {
      await postComment.mutateAsync({
        site_user_relation_id: siteUserRelationId,
        comment: text.trim(),
        image_id: uploadedImageId ?? undefined,
        type: uploadedImageId ? 'image' : 'text',
        siteId,
      })
      setText('')
      clearImage()
    } catch {
      toast.error('Failed to send message.')
    }
  }

  const disabled = !siteUserRelationId

  return (
    <div className={cn('border-t bg-card p-3 space-y-2', disabled && 'opacity-60')}>
      {disabled && (
        <p className="text-xs text-muted-foreground text-center py-1">
          You are not assigned to this site.
        </p>
      )}
      {previewUrl && (
        <div className="relative inline-block">
          <img src={previewUrl} alt="Preview" className="h-16 w-16 object-cover rounded-lg" />
          {isUploading && (
            <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            </div>
          )}
          {!isUploading && (
            <button
              onClick={clearImage}
              className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full w-4 h-4 flex items-center justify-center"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          )}
        </div>
      )}
      <div {...getRootProps()} className="flex gap-2">
        <input {...getInputProps()} />
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a field observation..."
          disabled={disabled}
          className="resize-none min-h-[40px] max-h-24 flex-1 text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !disabled) {
              e.preventDefault()
              handleSubmit()
            }
          }}
        />
        <div className="flex flex-col gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={openDropzone}
            disabled={disabled || isUploading}
            title="Attach image"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            onClick={handleSubmit}
            disabled={disabled || postComment.isPending || isUploading || (!text.trim() && !uploadedImageId)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            {postComment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/components/features/field-visits/CommentList.tsx`**

```typescript
// src/components/features/field-visits/CommentList.tsx
'use client'
import { useState, useEffect, useRef } from 'react'
import { SiteComment } from '@/hooks/queries/useSiteComments'
import { ChatBubble } from './ChatBubble'
import { ChatSkeleton } from '@/components/Skeletons'
import { MessageSquare } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { useThumbnail } from '@/hooks/queries/useImages'
import { ImageLightbox } from './ImageLightbox'

function ThumbnailCell({ imageId }: { imageId: number }) {
  const { data } = useThumbnail(imageId)
  const [open, setOpen] = useState(false)
  if (!data) return <div className="w-8 h-8 bg-muted rounded animate-pulse" />
  return (
    <>
      <img
        src={data.data_uri}
        loading="lazy"
        onClick={() => setOpen(true)}
        className="w-8 h-8 object-cover rounded cursor-pointer hover:opacity-80"
        alt="thumb"
      />
      <ImageLightbox imageId={imageId} open={open} onOpenChange={setOpen} />
    </>
  )
}

const desktopColumns: ColumnDef<SiteComment>[] = [
  {
    accessorKey: 'timestamp',
    header: 'Date / Time',
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {format(new Date(row.getValue('timestamp')), 'MMM d, yyyy h:mm a')}
      </span>
    ),
  },
  {
    accessorKey: 'user_id',
    header: 'User',
    cell: ({ row }) => <span className="text-sm font-medium">User #{row.getValue('user_id')}</span>,
  },
  {
    accessorKey: 'comment',
    header: 'Message',
    cell: ({ row }) => (
      <p className="text-sm max-w-xs truncate">{row.getValue('comment') || '—'}</p>
    ),
  },
  {
    accessorKey: 'image_id',
    header: 'Image',
    cell: ({ row }) => {
      const id = row.getValue('image_id') as number | null
      return id ? <ThumbnailCell imageId={id} /> : <span className="text-xs text-muted-foreground">—</span>
    },
  },
]

interface CommentListProps {
  comments: SiteComment[]
  isLoading: boolean
  currentUserId?: number
}

export function CommentList({ comments, isLoading, currentUserId }: CommentListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments.length])

  if (isLoading) return <ChatSkeleton messages={5} />

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-center">
        <MessageSquare className="h-8 w-8 text-muted-foreground/30 mb-2" />
        <p className="text-sm text-muted-foreground">No field visits recorded yet.</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Post the first observation below.</p>
      </div>
    )
  }

  return (
    <>
      {/* Mobile: chat bubbles */}
      <div className="md:hidden flex-1 overflow-y-auto p-4 space-y-3">
        {comments.map((c) => (
          <ChatBubble key={c.id} comment={c} isOwn={c.user_id === currentUserId} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block flex-1 overflow-auto p-4">
        <DataTable
          columns={desktopColumns}
          data={[...comments].reverse()} // newest first for table view
          filterPlaceholder="Search messages..."
        />
      </div>
    </>
  )
}
```

- [ ] **Step 5: Rewrite `src/app/(protected)/field-visits/page.tsx`**

```typescript
// src/app/(protected)/field-visits/page.tsx
'use client'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useComments, useMyAssignments } from '@/hooks/queries/useSiteComments'
import { useMySites } from '@/hooks/queries/useSites'
import { CommentList } from '@/components/features/field-visits/CommentList'
import { PostForm } from '@/components/features/field-visits/PostForm'
import { PageHeader } from '@/components/ui/page-header'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/appStore'

function FieldVisitsContent() {
  const searchParams = useSearchParams()
  const initialSiteId = searchParams.get('site') ? parseInt(searchParams.get('site')!) : null

  const { data: mySites = [] } = useMySites()
  const { data: myAssignments = [] } = useMyAssignments()
  const { currentUser } = useAppStore()

  // Derive numeric user_id from assignments (all belong to current user)
  const currentUserId = myAssignments[0]?.user_id

  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(
    initialSiteId ?? (mySites[0]?.id ?? null)
  )

  const { data: comments = [], isLoading } = useComments(selectedSiteId)

  // Find site_user_relation_id for the selected site
  const myRelation = myAssignments.find((a) => a.site_id === selectedSiteId)

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="px-6 pt-6 pb-0 shrink-0">
        <PageHeader title="Field Visits" subtitle="Log observations and field activity by site" />

        {/* Site tab selector */}
        {mySites.length > 0 && (
          <div className="flex gap-1 overflow-x-auto pb-0 -mb-px">
            {mySites.map((site) => (
              <button
                key={site.id}
                onClick={() => setSelectedSiteId(site.id)}
                className={cn(
                  'px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                  selectedSiteId === site.id
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                )}
              >
                {site.site_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-t flex-1 flex flex-col min-h-0">
        {mySites.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">You have no assigned sites yet.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-hidden flex flex-col">
              <CommentList
                comments={comments}
                isLoading={isLoading}
                currentUserId={currentUserId}
              />
            </div>
            <PostForm
              siteUserRelationId={myRelation?.id ?? null}
              siteId={selectedSiteId ?? 0}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default function FieldVisitsPage() {
  return (
    <Suspense>
      <FieldVisitsContent />
    </Suspense>
  )
}
```

- [ ] **Step 6: Add Textarea ShadcN component if missing**

```bash
npx shadcn@latest add textarea 2>&1 | tail -5
```

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: implement field visits / site chat page with image upload and lightbox"
```

---

## Task 14: Activity Log Page

**Files:**
- Modify: `src/app/(protected)/activity-log/page.tsx`

- [ ] **Step 1: Rewrite `src/app/(protected)/activity-log/page.tsx`**

```typescript
// src/app/(protected)/activity-log/page.tsx
'use client'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/stores/appStore'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import api from '@/lib/api'
import { PageHeader } from '@/components/ui/page-header'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { format, isToday, isThisWeek } from 'date-fns'
import { Activity, Calendar, TrendingUp, Users } from 'lucide-react'
import { TableSkeleton } from '@/components/Skeletons'

interface LogEntry {
  id: number
  user_id: number
  username: string
  timestamp: string
}

const columns: ColumnDef<LogEntry>[] = [
  {
    header: '#',
    cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.index + 1}</span>,
  },
  {
    accessorKey: 'username',
    header: 'Username',
    cell: ({ row }) => <span className="text-sm font-medium">@{row.getValue('username')}</span>,
  },
  {
    accessorKey: 'timestamp',
    header: 'Timestamp',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {format(new Date(row.getValue('timestamp')), 'MMM d, yyyy · h:mm a')}
      </span>
    ),
  },
  {
    id: 'action',
    header: 'Action',
    cell: () => (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
        <Activity className="h-3 w-3" /> Login
      </span>
    ),
  },
]

export default function ActivityLogPage() {
  const { currentUser } = useAppStore()
  const router = useRouter()

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      router.replace('/dashboard')
    }
  }, [currentUser, router])

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['activity-logs'],
    queryFn: async () => {
      const { data } = await api.get<LogEntry[]>('/users/logs?limit=100')
      return data
    },
    refetchInterval: 60_000,
  })

  // Derived summary stats (client-side from fetched data)
  const stats = useMemo(() => {
    const today = logs.filter((l) => isToday(new Date(l.timestamp))).length
    const week = logs.filter((l) => isThisWeek(new Date(l.timestamp))).length
    const userCount: Record<string, number> = {}
    logs.forEach((l) => { userCount[l.username] = (userCount[l.username] ?? 0) + 1 })
    const mostActive = Object.entries(userCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
    return { today, week, mostActive }
  }, [logs])

  // Date range + username filter state (client-side)
  const [usernameFilter, setUsernameFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Sort newest first, then apply filters
  const sortedLogs = useMemo(() => {
    return [...logs]
      .reverse()
      .filter((l) => {
        if (usernameFilter && !l.username.toLowerCase().includes(usernameFilter.toLowerCase())) return false
        if (dateFrom && new Date(l.timestamp) < new Date(dateFrom)) return false
        if (dateTo && new Date(l.timestamp) > new Date(dateTo + 'T23:59:59')) return false
        return true
      })
  }, [logs, usernameFilter, dateFrom, dateTo])

  if (currentUser && currentUser.role !== 'admin') return null

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <PageHeader
        title="Activity Log"
        subtitle="Login and activity history across all users"
      />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Logins Today', value: stats.today, icon: Calendar, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Logins This Week', value: stats.week, icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Most Active User', value: stats.mostActive, icon: Users, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card border rounded-xl p-4 flex items-center gap-3">
            <div className={`rounded-lg p-2.5 ${bg}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xl font-bold text-foreground">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Filter by username..."
          value={usernameFilter}
          onChange={(e) => setUsernameFilter(e.target.value)}
          className="border rounded-md px-3 py-1.5 text-sm bg-background w-48"
        />
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="border rounded-md px-3 py-1.5 text-sm bg-background"
          title="From date"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="border rounded-md px-3 py-1.5 text-sm bg-background"
          title="To date"
        />
        {(usernameFilter || dateFrom || dateTo) && (
          <button
            onClick={() => { setUsernameFilter(''); setDateFrom(''); setDateTo('') }}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Log table */}
      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : (
        <DataTable
          columns={columns}
          data={sortedLogs}
          filterPlaceholder="Search by username..."
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: implement activity log page with summary cards and auto-refresh"
```

---

## Task 15: Protected Layout — Bootstrap Session

**Files:**
- Create: `src/hooks/useBootstrapSession.ts`
- Modify: `src/app/(protected)/layout.tsx`

- [ ] **Step 1: Create `src/hooks/useBootstrapSession.ts`**

Since `GET /auth/me` does not exist in the current API, this hook validates the session by checking Zustand state (persisted from localStorage) and treats a 401 from any API call as session expiry. For a proper server-validate-on-mount, add `GET /auth/me` to the backend later.

```typescript
// src/hooks/useBootstrapSession.ts
'use client'
import { useEffect, useState } from 'react'
import { useAppStore } from '@/stores/appStore'

/**
 * Validates session state on mount.
 * Currently uses Zustand localStorage persist for display info.
 * TODO: When backend adds GET /auth/me, call it here to rehydrate user
 *       after a page refresh and validate the HTTP-only cookie is still valid.
 */
export function useBootstrapSession() {
  const { isAuthenticated } = useAppStore()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Zustand's persist middleware rehydrates from localStorage synchronously
    // on first render. After hydration, isAuthenticated reflects stored state.
    setIsReady(true)
  }, [])

  return { isReady, isAuthenticated }
}
```

- [ ] **Step 2: Update `src/app/(protected)/layout.tsx`**

Replace the current `useAuthCheck()` call with `useBootstrapSession()`. Add a loading spinner while `isReady` is false:

```typescript
'use client'
import { useBootstrapSession } from '@/hooks/useBootstrapSession'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isReady, isAuthenticated } = useBootstrapSession()
  const router = useRouter()

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isReady, isAuthenticated, router])

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  return <AppLayout>{children}</AppLayout>
}
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add session bootstrap with loading state in protected layout"
```

---

## Task 16: Final Build Verification

- [ ] **Step 1: Install any missing ShadcN components**

```bash
cd "C:/Users/naman/OneDrive/Desktop/Project/Sammu/againow-ui"
npx shadcn@latest add table textarea select alert-dialog 2>&1 | tail -20
```

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -40
```

Fix any TypeScript errors before proceeding.

- [ ] **Step 3: Run build**

```bash
npm run build 2>&1 | tail -30
```

Expected: Build completes. Any errors listed should be fixed.

- [ ] **Step 4: Final commit**

```bash
git add -A && git commit -m "feat: SeedSense phases 0-1-9-2-3-10 complete"
```

---

## Implementation Order Summary

| Task | Feature | Est. | Notes |
|------|---------|------|-------|
| 1 | `src/lib/api.ts` — axios rewrite | Small | Delete axiosInstance.ts + useAuthCheck.ts |
| 2 | Zustand store + role types | Small | |
| 3 | Login hook clean-up + forgot link | Small | |
| 4 | Sidebar routes role alignment | Small | |
| 5 | **Skeleton expansion** ← must be before Task 6 | Small | Task 6 depends on TableSkeleton |
| 6 | Shared UI components (4 files) | Medium | imports TableSkeleton from Task 5 |
| 7 | Forgot/reset password pages | Medium | |
| 8 | User management gap-fill | Medium | |
| 9 | Install leaflet/react-dropzone | Tiny | |
| 10 | Site/comment/image hooks | Medium | |
| 11 | SITE_COORDS mock data | Tiny | |
| 12 | Fields map page (5 components) | Large | copy leaflet images to public/ |
| 13 | Field visits/chat page (5 components) | Large | |
| 14 | Activity log page | Medium | |
| 15 | Protected layout bootstrap | Small | |
| 16 | Final build verification | Small | |
