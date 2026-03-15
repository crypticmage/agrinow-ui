<p align="center">
  <img src="public/favicon.svg" alt="Seed Sense Logo" width="80" />
</p>

<h1 align="center">🌱 Seed Sense</h1>

<p align="center">
  <b>Smart Agriculture Management Platform</b><br/>
  A modern, full-featured dashboard for farm operations — from field mapping and crop stage tracking to yield forecasting and workforce management.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-blue?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/pnpm-workspace-f69220?logo=pnpm" alt="pnpm" />
</p>

---

## ✨ Features

| Module | Description |
| --- | --- |
| **📊 Dashboard** | At-a-glance overview of key farm metrics, charts, and alerts |
| **🗺️ Fields Map** | Interactive field visualization with geospatial data |
| **📈 Yield Forecast** | Predictive analytics for crop yield estimation |
| **🐛 Pest & Disease** | Monitor and manage pest/disease incidents across fields |
| **🌿 Crop Stages** | Track crop growth stages from sowing to harvest |
| **🚜 Field Visits** | Schedule and log field inspection visits |
| **👤 Attendance** | Record and review workforce attendance |
| **💰 Payroll** | Manage worker pay, calculations, and payroll records |
| **📋 Reports** | Generate detailed operational and analytical reports |
| **👥 User Management** | Administer users, roles, and permissions |
| **📝 Activity Log** | Audit trail of all system activities |
| **⚙️ Settings** | Application configuration and preferences |

**Additional highlights:**

- 🌓 **Dark / Light mode** with `next-themes`
- 📱 **Fully responsive** — sidebar on desktop, bottom nav on mobile
- ⚡ **Page transitions** powered by Framer Motion
- 🔐 **Auth-gated routes** with login flow
- 🔍 **Global search, notifications & user menu** in the top navigation bar
- 🧩 **19 shadcn/ui primitives** (Button, Card, Dialog, Table, Select, Calendar …)

---

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **UI Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) · `tailwind-merge` · `tw-animate-css` |
| **Component Kit** | [shadcn/ui](https://ui.shadcn.com/) (Radix UI + CVA) |
| **State Management** | [Zustand 5](https://zustand.docs.pmnd.rs/) |
| **Server State** | [TanStack React Query 5](https://tanstack.com/query) |
| **Tables** | [TanStack React Table 8](https://tanstack.com/table) |
| **Forms** | [React Hook Form 7](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Charts** | [Recharts 3](https://recharts.org/) |
| **Animations** | [Framer Motion 12](https://www.framer.com/motion/) |
| **HTTP Client** | [Axios](https://axios-http.com/) |
| **Date Utils** | [date-fns 4](https://date-fns.org/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Toasts** | [Sonner](https://sonner.emilkowal.dev/) |
| **Package Manager** | [pnpm](https://pnpm.io/) (workspace) |

---

## 📂 Project Structure

```
seed-sense/
├── public/                      # Static assets (images, logos)
├── src/
│   ├── app/
│   │   ├── (auth)/login/        # Login page (public)
│   │   ├── (protected)/         # Auth-gated route group
│   │   │   ├── dashboard/
│   │   │   ├── fields-map/
│   │   │   ├── yield-forecast/
│   │   │   ├── pest-disease/
│   │   │   ├── crop-stages/
│   │   │   ├── field-visits/
│   │   │   ├── attendance/
│   │   │   ├── payroll/
│   │   │   ├── reports/
│   │   │   ├── settings/
│   │   │   ├── user-management/
│   │   │   └── activity-log/
│   │   ├── globals.css          # Global styles & Tailwind layers
│   │   ├── layout.tsx           # Root layout (fonts, providers)
│   │   ├── not-found.tsx        # Custom 404 page
│   │   └── page.tsx             # Landing / redirect
│   ├── components/
│   │   ├── layout/              # AppLayout, AppSidebar, TopNav, MobileBottomNav
│   │   ├── ui/                  # 19 shadcn/ui primitives
│   │   ├── helpers/             # Reusable helper components
│   │   ├── PageTransition.tsx   # Framer Motion page wrapper
│   │   ├── QueryProvider.tsx    # React Query provider
│   │   ├── ThemeProvider.tsx    # next-themes provider
│   │   ├── ThemeToggle.tsx      # Dark/light mode switch
│   │   └── Skeletons.tsx        # Loading skeleton components
│   ├── data/                    # Mock datasets & sidebar route config
│   ├── hooks/
│   │   ├── queries/             # TanStack Query hooks
│   │   ├── useAuthCheck.ts      # Auth guard hook
│   │   ├── useDarkMode.ts       # Dark mode hook
│   │   ├── use-mobile.ts        # Responsive breakpoint hook
│   │   └── useSimulatedLoading.ts
│   ├── lib/
│   │   ├── axiosInstance.ts     # Configured Axios client
│   │   ├── getQueryClient.ts    # Query client factory
│   │   ├── server-api.ts        # Server-side API helpers
│   │   └── utils.ts             # General utilities (cn, etc.)
│   ├── stores/
│   │   └── appStore.ts          # Zustand global store
│   └── types/                   # Shared TypeScript interfaces
├── components.json              # shadcn/ui configuration
├── next.config.ts               # Next.js config
├── tailwind.config.*            # Tailwind configuration
├── tsconfig.json                # TypeScript config
├── pnpm-workspace.yaml          # pnpm workspace definition
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** ≥ 9 — install with `npm i -g pnpm`

### Installation

```bash
# Clone the repository
git clone https://github.com/crypticmage/agrinow-ui.git
cd seed-sense

# Install dependencies
pnpm install
```

### Development

```bash
# Start the dev server (http://localhost:3000)
pnpm dev
```

### Production Build

```bash
pnpm build
pnpm start
```

### Linting

```bash
pnpm lint
```

---

## 🗺️ Roadmap

- [ ] Real-time weather integration
- [ ] Satellite imagery overlays on the fields map
- [ ] Push notifications for pest/disease alerts
- [ ] Multi-language (i18n) support
- [ ] Role-based access control (RBAC) enforcement
- [ ] Export reports to PDF / Excel
- [ ] Mobile app (React Native / Expo)

---

## 📄 License

This project is private. All rights reserved.
