# FundBlaze — System Architecture & Technical Blueprint
> **Tagline:** Ignite Hope. Fund Dreams.
> **Version:** 1.0.0 | **Stage:** 1 — Architecture
> **Author:** Senior Staff Architect | **Status:** Approved for Engineering Hand-off

---

## Table of Contents

1. [System Architecture Diagram](#1-system-architecture-diagram)
2. [Monorepo Folder Structure](#2-monorepo-folder-structure)
3. [Backend Module Breakdown](#3-backend-module-breakdown)
4. [Database Schema](#4-database-schema)
5. [Complete API Contract](#5-complete-api-contract)
6. [Data Flow Diagrams](#6-data-flow-diagrams)
7. [Security Architecture](#7-security-architecture)
8. [Caching Strategy](#8-caching-strategy)
9. [Real-Time Architecture (Socket.io)](#9-real-time-architecture-socketio)
10. [Scaling & Reliability Strategy](#10-scaling--reliability-strategy)
11. [Environment Variables Master List](#11-environment-variables-master-list)
12. [Tech Stack Decision Log](#12-tech-stack-decision-log)

---

## 1. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                               CLIENT LAYER                                          │
│                                                                                     │
│   ┌─────────────────────┐          ┌──────────────────────┐                         │
│   │  Browser (React PWA) │          │  Mobile Browser (PWA) │                        │
│   └──────────┬──────────┘          └──────────┬───────────┘                         │
└──────────────┼───────────────────────────────-┼───────────────────────────────────--┘
               │ HTTPS / WSS                     │ HTTPS / WSS
               ▼                                 ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         CDN / EDGE LAYER — Vercel                                │
│                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────┐   │
│   │  Vercel Edge Network                                                     │   │
│   │  • Static assets (JS, CSS, images) served from PoP closest to user      │   │
│   │  • Immutable cache headers on hashed bundles                             │   │
│   │  • /api/* routes proxied to backend (HTTPS)                              │   │
│   └────────────────────────────┬─────────────────────────────────────────────┘   │
└────────────────────────────────┼─────────────────────────────────────────────────┘
                                 │ HTTPS
                                 ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                        LOAD BALANCER (Render / Railway)                          │
│                                                                                  │
│   Round-robin across API instances  •  Health check: GET /health  (TCP)         │
│   Sticky sessions for Socket.io enabled via Redis adapter                       │
└────────┬──────────────────────────────────────────┬───────────────────────────┘
         │ HTTPS                                    │ WSS
         ▼                                          ▼
┌───────────────────────┐              ┌─────────────────────────────┐
│  NestJS API Gateway   │◄────────────►│  Socket.io WebSocket Server │
│  (REST + BullMQ jobs) │   In-process │  (attached to NestJS app)   │
│                       │              │  Namespace: /realtime        │
│  Modules:             │              │  Rooms: campaign:{id}        │
│  • AuthModule         │              └───────────┬─────────────────┘
│  • UsersModule        │                          │ TCP (pub/sub)
│  • CampaignsModule    │                          ▼
│  • DonationsModule    │◄──────────────────────────────────────────────┐
│  • PaymentsModule     │              ┌─────────────────────────────┐  │
│  • NotificationsModule│    TCP       │  Redis (Upstash in prod)    │  │
│  • SearchModule       │◄────────────►│  • Cache (GET, SET, TTL)    │  │
│  • UploadsModule      │              │  • BullMQ job queues        │  │
│  • AdminModule        │              │  • Socket.io adapter        │  │
│  • HealthModule       │              │  • Rate-limit counters      │  │
└──────────┬────────────┘              └─────────────────────────────┘
           │ TCP (Mongoose)
           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    MongoDB Atlas Cluster (M10+)                      │
│                                                                      │
│   Primary ──── Secondary ──── Secondary   (Replica Set, 3 nodes)    │
│                                                                      │
│   Collections: users, campaigns, donations, transactions,            │
│                categories, notifications, refreshTokens, media       │
└──────────────────────────────────────────────────────────────────────┘

EXTERNAL SERVICES (all outbound HTTPS from NestJS)
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│  Cloudinary (primary)   │  │  Razorpay (India)        │  │  Stripe (International) │
│  Media upload/transform │  │  Payment gateway         │  │  Payment gateway        │
│  HTTPS REST + CDN       │  │  HTTPS REST + Webhooks   │  │  HTTPS REST + Webhooks  │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘

┌─────────────────────────┐  ┌─────────────────────────┐
│  AWS S3 (fallback)      │  │  SMTP / SendGrid         │
│  HTTPS (presigned URLs) │  │  Email notifications     │
└─────────────────────────┘  └─────────────────────────┘

CI/CD & OBSERVABILITY
┌─────────────────────────────────────────────────────────────────────────────────┐
│  GitHub Actions                                                                 │
│  push → lint → test → build → Docker image → push to registry → deploy        │
│  (HTTPS to Render/Railway deploy hooks)                                         │
└─────────────────────────────────────────────────────────────────────────────────┘
┌────────────────────────────┐  ┌─────────────────────────────────────────────────┐
│  Sentry (Error Tracking)   │  │  Pino / Winston (Structured Logs → stdout)      │
│  HTTPS SDK, both FE & BE   │  │  Aggregated in Render / Railway log drain       │
└────────────────────────────┘  └─────────────────────────────────────────────────┘
```

---

## 2. Monorepo Folder Structure

```
fundblaze/                             ← Monorepo root
│
├── apps/
│   │
│   ├── web/                           ← React 18 + Vite frontend
│   │   ├── public/
│   │   │   ├── favicon.ico
│   │   │   ├── manifest.json          ← PWA manifest
│   │   │   └── robots.txt
│   │   ├── src/
│   │   │   ├── main.tsx               ← React DOM entry point
│   │   │   ├── App.tsx                ← Router shell + providers
│   │   │   │
│   │   │   ├── assets/                ← Static images, fonts
│   │   │   │
│   │   │   ├── components/            ← Shared, reusable UI components
│   │   │   │   ├── ui/                ← Primitive components (Button, Input, Modal…)
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Input.tsx
│   │   │   │   │   ├── Modal.tsx
│   │   │   │   │   ├── Skeleton.tsx
│   │   │   │   │   ├── Toast.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── layout/            ← Navbar, Footer, Sidebar, PageWrapper
│   │   │   │   │   ├── Navbar.tsx
│   │   │   │   │   ├── Footer.tsx
│   │   │   │   │   └── PageWrapper.tsx
│   │   │   │   ├── campaign/          ← Campaign card, progress bar, media carousel
│   │   │   │   │   ├── CampaignCard.tsx
│   │   │   │   │   ├── ProgressBar.tsx
│   │   │   │   │   ├── MediaCarousel.tsx
│   │   │   │   │   └── DonationTicker.tsx  ← live feed via Socket.io
│   │   │   │   └── donation/
│   │   │   │       ├── DonationForm.tsx
│   │   │   │       └── PaymentMethodSelector.tsx
│   │   │   │
│   │   │   ├── pages/                 ← Route-level page components
│   │   │   │   ├── Home.tsx           ← Trending + hero section
│   │   │   │   ├── Explore.tsx        ← Browse + filter + search
│   │   │   │   ├── CampaignDetail.tsx ← Full campaign page
│   │   │   │   ├── CreateCampaign.tsx ← Multi-step campaign creation wizard
│   │   │   │   ├── Dashboard.tsx      ← Creator dashboard
│   │   │   │   ├── Profile.tsx
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Register.tsx
│   │   │   │   ├── ForgotPassword.tsx
│   │   │   │   ├── ResetPassword.tsx
│   │   │   │   ├── VerifyEmail.tsx
│   │   │   │   ├── PaymentSuccess.tsx
│   │   │   │   ├── PaymentFailed.tsx
│   │   │   │   ├── admin/
│   │   │   │   │   ├── AdminLayout.tsx
│   │   │   │   │   ├── AdminDashboard.tsx
│   │   │   │   │   ├── AdminCampaigns.tsx
│   │   │   │   │   ├── AdminUsers.tsx
│   │   │   │   │   └── AdminPayouts.tsx
│   │   │   │   └── NotFound.tsx
│   │   │   │
│   │   │   ├── hooks/                 ← Custom React hooks
│   │   │   │   ├── useAuth.ts         ← Auth state + token refresh
│   │   │   │   ├── useCampaign.ts     ← TanStack Query wrappers
│   │   │   │   ├── useDonation.ts
│   │   │   │   ├── useSocket.ts       ← Socket.io connection + event subscription
│   │   │   │   ├── useDebounce.ts
│   │   │   │   └── useInfiniteScroll.ts
│   │   │   │
│   │   │   ├── store/                 ← Zustand global stores
│   │   │   │   ├── authStore.ts       ← user, accessToken, isAuthenticated
│   │   │   │   ├── uiStore.ts         ← modals, toasts, loading states
│   │   │   │   └── donationStore.ts   ← live donation feed buffer
│   │   │   │
│   │   │   ├── context/               ← React Context providers
│   │   │   │   ├── ThemeContext.tsx   ← dark/light mode
│   │   │   │   └── AuthContext.tsx    ← wraps Zustand for component tree
│   │   │   │
│   │   │   ├── api/                   ← Axios client + per-module API functions
│   │   │   │   ├── client.ts          ← Axios instance with interceptors
│   │   │   │   ├── auth.api.ts
│   │   │   │   ├── campaigns.api.ts
│   │   │   │   ├── donations.api.ts
│   │   │   │   ├── payments.api.ts
│   │   │   │   ├── uploads.api.ts
│   │   │   │   └── admin.api.ts
│   │   │   │
│   │   │   ├── lib/                   ← Utility functions and third-party setup
│   │   │   │   ├── queryClient.ts     ← TanStack Query client config
│   │   │   │   ├── socket.ts          ← Socket.io client singleton
│   │   │   │   ├── sentry.ts          ← Sentry initialisation
│   │   │   │   └── utils.ts           ← formatCurrency, timeAgo, truncate…
│   │   │   │
│   │   │   ├── router/
│   │   │   │   ├── index.tsx          ← createBrowserRouter definition
│   │   │   │   ├── ProtectedRoute.tsx ← Auth guard HOC
│   │   │   │   └── AdminRoute.tsx     ← Admin role guard HOC
│   │   │   │
│   │   │   └── types/                 ← Frontend-only type augmentations
│   │   │       └── env.d.ts           ← import.meta.env type definitions
│   │   │
│   │   ├── index.html                 ← Vite HTML entry
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── postcss.config.js
│   │   ├── tsconfig.json
│   │   ├── tsconfig.node.json
│   │   ├── .env.local                 ← gitignored local env
│   │   └── .env.example
│   │
│   └── api/                           ← NestJS backend
│       ├── src/
│       │   ├── main.ts                ← NestJS bootstrap, Helmet, CORS, Swagger
│       │   ├── app.module.ts          ← Root module, imports all feature modules
│       │   │
│       │   ├── auth/
│       │   │   ├── auth.module.ts
│       │   │   ├── auth.controller.ts
│       │   │   ├── auth.service.ts
│       │   │   ├── auth.guard.ts      ← JwtAuthGuard
│       │   │   ├── roles.guard.ts     ← RolesGuard (RBAC)
│       │   │   ├── roles.decorator.ts ← @Roles() decorator
│       │   │   ├── jwt.strategy.ts    ← Passport JWT strategy
│       │   │   ├── refresh.strategy.ts
│       │   │   └── dto/
│       │   │       ├── login.dto.ts
│       │   │       └── register.dto.ts
│       │   │
│       │   ├── users/
│       │   │   ├── users.module.ts
│       │   │   ├── users.controller.ts
│       │   │   ├── users.service.ts
│       │   │   ├── users.repository.ts
│       │   │   ├── schemas/
│       │   │   │   └── user.schema.ts ← Mongoose schema
│       │   │   └── dto/
│       │   │       └── update-user.dto.ts
│       │   │
│       │   ├── campaigns/
│       │   │   ├── campaigns.module.ts
│       │   │   ├── campaigns.controller.ts
│       │   │   ├── campaigns.service.ts
│       │   │   ├── campaigns.repository.ts
│       │   │   ├── schemas/
│       │   │   │   └── campaign.schema.ts
│       │   │   └── dto/
│       │   │       ├── create-campaign.dto.ts
│       │   │       └── update-campaign.dto.ts
│       │   │
│       │   ├── donations/
│       │   │   ├── donations.module.ts
│       │   │   ├── donations.controller.ts
│       │   │   ├── donations.service.ts
│       │   │   ├── donations.repository.ts
│       │   │   ├── schemas/
│       │   │   │   └── donation.schema.ts
│       │   │   └── dto/
│       │   │       └── create-donation.dto.ts
│       │   │
│       │   ├── payments/
│       │   │   ├── payments.module.ts
│       │   │   ├── payments.controller.ts
│       │   │   ├── payments.service.ts
│       │   │   ├── razorpay/
│       │   │   │   ├── razorpay.service.ts
│       │   │   │   └── razorpay-webhook.handler.ts
│       │   │   ├── stripe/
│       │   │   │   ├── stripe.service.ts
│       │   │   │   └── stripe-webhook.handler.ts
│       │   │   └── dto/
│       │   │       ├── create-order.dto.ts
│       │   │       └── verify-payment.dto.ts
│       │   │
│       │   ├── notifications/
│       │   │   ├── notifications.module.ts
│       │   │   ├── notifications.controller.ts
│       │   │   ├── notifications.service.ts
│       │   │   ├── notifications.repository.ts
│       │   │   ├── schemas/
│       │   │   │   └── notification.schema.ts
│       │   │   └── email/
│       │   │       ├── email.service.ts      ← SendGrid/SMTP wrapper
│       │   │       └── templates/            ← Handlebars email templates
│       │   │           ├── verify-email.hbs
│       │   │           ├── donation-received.hbs
│       │   │           └── campaign-funded.hbs
│       │   │
│       │   ├── search/
│       │   │   ├── search.module.ts
│       │   │   ├── search.controller.ts
│       │   │   └── search.service.ts         ← MongoDB text index + trending score
│       │   │
│       │   ├── uploads/
│       │   │   ├── uploads.module.ts
│       │   │   ├── uploads.controller.ts
│       │   │   ├── uploads.service.ts        ← Cloudinary SDK wrapper
│       │   │   └── schemas/
│       │   │       └── media.schema.ts
│       │   │
│       │   ├── admin/
│       │   │   ├── admin.module.ts
│       │   │   ├── admin.controller.ts
│       │   │   └── admin.service.ts
│       │   │
│       │   ├── health/
│       │   │   ├── health.module.ts
│       │   │   └── health.controller.ts      ← Terminus health checks
│       │   │
│       │   ├── realtime/
│       │   │   ├── realtime.module.ts
│       │   │   ├── realtime.gateway.ts       ← Socket.io @WebSocketGateway
│       │   │   └── realtime.service.ts       ← emit helpers used by other modules
│       │   │
│       │   ├── common/
│       │   │   ├── filters/
│       │   │   │   └── http-exception.filter.ts
│       │   │   ├── interceptors/
│       │   │   │   ├── logging.interceptor.ts
│       │   │   │   └── transform.interceptor.ts  ← Wrap responses in {data, meta}
│       │   │   ├── guards/
│       │   │   │   └── throttler.guard.ts
│       │   │   ├── pipes/
│       │   │   │   └── zod-validation.pipe.ts
│       │   │   ├── decorators/
│       │   │   │   └── current-user.decorator.ts
│       │   │   └── utils/
│       │   │       ├── paginate.util.ts
│       │   │       └── hash.util.ts
│       │   │
│       │   └── config/
│       │       ├── app.config.ts             ← NestJS ConfigModule factories
│       │       ├── database.config.ts
│       │       ├── redis.config.ts
│       │       └── jwt.config.ts
│       │
│       ├── test/
│       │   ├── app.e2e-spec.ts
│       │   └── jest-e2e.json
│       │
│       ├── Dockerfile
│       ├── .env.example
│       ├── nest-cli.json
│       ├── tsconfig.json
│       └── tsconfig.build.json
│
├── packages/
│   └── shared/                        ← Shared across web + api (no runtime deps)
│       ├── src/
│       │   ├── types/
│       │   │   ├── user.types.ts      ← IUser, IPublicUser
│       │   │   ├── campaign.types.ts  ← ICampaign, ICampaignStatus
│       │   │   ├── donation.types.ts  ← IDonation
│       │   │   ├── payment.types.ts   ← IPaymentOrder, IPaymentGateway
│       │   │   └── api.types.ts       ← ApiResponse<T>, PaginatedResponse<T>
│       │   ├── schemas/               ← Zod schemas (validated on both FE + BE)
│       │   │   ├── auth.schema.ts
│       │   │   ├── campaign.schema.ts
│       │   │   └── donation.schema.ts
│       │   └── constants/
│       │       ├── roles.ts           ← ROLES enum: GUEST, DONOR, CREATOR, ADMIN
│       │       ├── campaign-status.ts ← CampaignStatus enum
│       │       └── socket-events.ts   ← Typed socket event name constants
│       ├── package.json
│       └── tsconfig.json
│
├── docker/
│   ├── docker-compose.yml             ← Orchestrates api + mongo + redis locally
│   ├── docker-compose.prod.yml        ← Production overrides
│   └── nginx/
│       └── nginx.conf                 ← Optional local nginx reverse proxy config
│
├── .github/
│   └── workflows/
│       ├── ci.yml                     ← Lint, type-check, unit tests on every PR
│       ├── deploy-web.yml             ← Deploy frontend to Vercel on merge to main
│       └── deploy-api.yml             ← Build Docker image, push, deploy to Render
│
├── .gitignore
├── .eslintrc.js                       ← Root ESLint config (extends per package)
├── .prettierrc
├── turbo.json                         ← Turborepo pipeline config
├── package.json                       ← Workspace root (pnpm workspaces)
├── pnpm-workspace.yaml
└── README.md
```

---

## 3. Backend Module Breakdown

### 3.1 `auth`
**Responsibility:** Handles all authentication flows — registration, login, logout, token refresh, email verification, and password reset.

| Method | Path                              | Auth Required |
|--------|-----------------------------------|---------------|
| POST   | `/auth/register`                  | No            |
| POST   | `/auth/login`                     | No            |
| POST   | `/auth/logout`                    | Yes (JWT)     |
| POST   | `/auth/refresh`                   | No (refresh cookie) |
| GET    | `/auth/verify-email/:token`       | No            |
| POST   | `/auth/forgot-password`           | No            |
| POST   | `/auth/reset-password/:token`     | No            |
| GET    | `/auth/me`                        | Yes (JWT)     |

**Internal Dependencies:** `users`, `notifications`

---

### 3.2 `users`
**Responsibility:** Manages user profiles, role assignments, and account settings.

| Method | Path                    | Auth Required     |
|--------|-------------------------|-------------------|
| GET    | `/users/:id`            | Yes               |
| PATCH  | `/users/:id`            | Yes (own only)    |
| DELETE | `/users/:id`            | Yes (own/admin)   |
| GET    | `/users/:id/campaigns`  | Yes               |
| GET    | `/users/:id/donations`  | Yes (own/admin)   |
| POST   | `/users/:id/avatar`     | Yes (own)         |

**Internal Dependencies:** `uploads`

---

### 3.3 `campaigns`
**Responsibility:** Full lifecycle management of campaigns — create, read, update, publish, close, and soft-delete.

| Method | Path                            | Auth Required        |
|--------|---------------------------------|----------------------|
| GET    | `/campaigns`                    | No (public)          |
| GET    | `/campaigns/trending`           | No (public)          |
| GET    | `/campaigns/:id`                | No (public)          |
| POST   | `/campaigns`                    | Yes (creator+)       |
| PATCH  | `/campaigns/:id`                | Yes (owner)          |
| DELETE | `/campaigns/:id`                | Yes (owner/admin)    |
| POST   | `/campaigns/:id/publish`        | Yes (owner)          |
| POST   | `/campaigns/:id/close`          | Yes (owner/admin)    |
| GET    | `/campaigns/:id/donations`      | No                   |
| POST   | `/campaigns/:id/media`          | Yes (owner)          |
| DELETE | `/campaigns/:id/media/:mediaId` | Yes (owner)          |

**Internal Dependencies:** `uploads`, `search`, `realtime`, `notifications`

---

### 3.4 `donations`
**Responsibility:** Records donations after payment verification and links them to campaigns and users.

| Method | Path                          | Auth Required   |
|--------|-------------------------------|-----------------|
| POST   | `/donations`                  | Yes (donor+)    |
| GET    | `/donations/:id`              | Yes (own/admin) |
| GET    | `/donations/campaign/:id`     | No              |
| GET    | `/donations/user/:id`         | Yes (own/admin) |

**Internal Dependencies:** `payments`, `campaigns`, `realtime`, `notifications`

---

### 3.5 `payments`
**Responsibility:** Creates payment orders with Razorpay/Stripe, verifies signatures on payment completion, and handles webhook events.

| Method | Path                              | Auth Required     |
|--------|-----------------------------------|-------------------|
| POST   | `/payments/order`                 | Yes               |
| POST   | `/payments/verify`                | Yes               |
| POST   | `/payments/webhook/razorpay`      | No (HMAC verified)|
| POST   | `/payments/webhook/stripe`        | No (sig verified) |
| GET    | `/payments/transactions`          | Yes (admin)       |
| GET    | `/payments/transactions/:id`      | Yes (own/admin)   |

**Internal Dependencies:** `donations`, `campaigns`, `notifications`

---

### 3.6 `notifications`
**Responsibility:** Creates in-app notifications and dispatches transactional emails.

| Method | Path                              | Auth Required |
|--------|-----------------------------------|---------------|
| GET    | `/notifications`                  | Yes           |
| PATCH  | `/notifications/:id/read`         | Yes           |
| PATCH  | `/notifications/read-all`         | Yes           |
| DELETE | `/notifications/:id`              | Yes           |

**Internal Dependencies:** `realtime` (push via socket), email service (SendGrid)

---

### 3.7 `search`
**Responsibility:** Full-text search across campaigns and users using MongoDB Atlas text indexes, with trending score calculation.

| Method | Path            | Auth Required | Query Params                              |
|--------|-----------------|---------------|-------------------------------------------|
| GET    | `/search`       | No            | `q`, `category`, `status`, `page`, `limit`|
| GET    | `/search/tags`  | No            | `q`                                       |

**Internal Dependencies:** `campaigns`

---

### 3.8 `uploads`
**Responsibility:** Manages media upload to Cloudinary, stores metadata in the `media` collection, and provides signed URLs for secure delivery.

| Method | Path                  | Auth Required |
|--------|-----------------------|---------------|
| POST   | `/uploads/image`      | Yes           |
| POST   | `/uploads/video`      | Yes           |
| DELETE | `/uploads/:publicId`  | Yes (own/admin)|

**Internal Dependencies:** None (leaf service)

---

### 3.9 `admin`
**Responsibility:** Platform-wide administration — flagging campaigns, managing payouts, viewing aggregate analytics, and managing user roles.

| Method | Path                             | Auth Required  |
|--------|----------------------------------|----------------|
| GET    | `/admin/stats`                   | Admin          |
| GET    | `/admin/campaigns`               | Admin          |
| PATCH  | `/admin/campaigns/:id/flag`      | Admin          |
| PATCH  | `/admin/campaigns/:id/approve`   | Admin          |
| GET    | `/admin/users`                   | Admin          |
| PATCH  | `/admin/users/:id/role`          | Admin          |
| PATCH  | `/admin/users/:id/ban`           | Admin          |
| GET    | `/admin/payouts`                 | Admin          |
| POST   | `/admin/payouts/:id/release`     | Admin          |

**Internal Dependencies:** `users`, `campaigns`, `payments`, `notifications`

---

### 3.10 `health`
**Responsibility:** Exposes Kubernetes/load-balancer-compatible health and readiness endpoints.

| Method | Path             | Auth Required |
|--------|------------------|---------------|
| GET    | `/health`        | No            |
| GET    | `/health/ready`  | No            |
| GET    | `/health/live`   | No            |

**Internal Dependencies:** Terminus (MongoDB ping, Redis ping)

---

## 4. Database Schema

### 4.1 `users`

```typescript
interface IUser {
  _id:              ObjectId;                // Mongoose: Schema.Types.ObjectId
  email:            string;                  // unique, lowercase, indexed
  passwordHash:     string;                  // NEVER returned in API responses
  name:             string;                  // min:2, max:80
  username:         string;                  // unique, lowercase, alphanum, min:3
  avatarUrl:        string;                  // Cloudinary URL
  bio:              string;                  // max:500, optional
  role:             'guest'|'donor'|'creator'|'admin';  // default: 'donor'
  isEmailVerified:  boolean;                 // default: false
  isBanned:         boolean;                 // default: false
  emailVerifyToken: string;                  // nullable, hashed, TTL via refreshTokens
  resetPasswordToken: string;               // nullable, hashed
  resetPasswordExpiry: Date;               // nullable
  totalDonated:     number;                  // denormalised, updated on donation
  campaignsCreated: ObjectId[];             // ref: Campaign
  donationIds:      ObjectId[];             // ref: Donation (last 100)
  createdAt:        Date;
  updatedAt:        Date;
}
```

**Indexes:**
- `{ email: 1 }` — unique
- `{ username: 1 }` — unique
- `{ role: 1 }` — for admin queries
- `{ createdAt: -1 }` — pagination

---

### 4.2 `campaigns`

```typescript
type CampaignStatus = 'draft' | 'pending_review' | 'active' | 'funded' | 'closed' | 'flagged';

interface ICampaign {
  _id:              ObjectId;
  creatorId:        ObjectId;               // ref: User, indexed
  title:            string;                  // min:10, max:120, text-indexed
  slug:             string;                  // unique, URL-safe, auto-generated
  description:      string;                  // max:5000, text-indexed
  shortDescription: string;                  // max:200
  categoryId:       ObjectId;               // ref: Category
  tags:             string[];               // max:10 items
  goalAmount:       number;                  // in smallest currency unit (paise/cents)
  raisedAmount:     number;                  // denormalised, updated on donation
  donorCount:       number;                  // denormalised
  currency:         'INR' | 'USD';
  deadline:         Date;
  status:           CampaignStatus;          // default: 'draft'
  mediaIds:         ObjectId[];             // ref: Media
  coverImageUrl:    string;                  // Cloudinary URL
  videoUrl:         string;                  // optional
  trendingScore:    number;                  // computed, see §6.E
  viewCount:        number;                  // incremented on GET
  isFeatured:       boolean;                 // set by admin
  updates:          CampaignUpdate[];        // embedded subdocs
  payoutStatus:     'pending' | 'released' | 'refunded';
  stripeAccountId:  string;                  // for Stripe Connect, optional
  razorpayFundId:   string;                  // optional
  createdAt:        Date;
  updatedAt:        Date;
}

interface CampaignUpdate {
  _id:       ObjectId;
  title:     string;
  body:      string;
  postedAt:  Date;
}
```

**Indexes:**
- `{ slug: 1 }` — unique
- `{ creatorId: 1 }` — compound queries
- `{ status: 1, trendingScore: -1 }` — homepage trending feed
- `{ categoryId: 1, status: 1 }` — category browse
- `{ deadline: 1 }` — for expiry jobs
- `{ title: 'text', description: 'text', tags: 'text' }` — full-text search
- `{ createdAt: -1 }` — newest first pagination

---

### 4.3 `donations`

```typescript
interface IDonation {
  _id:              ObjectId;
  donorId:          ObjectId;               // ref: User
  campaignId:       ObjectId;               // ref: Campaign, indexed
  transactionId:    ObjectId;               // ref: Transaction, unique
  amount:           number;                  // in smallest unit
  currency:         'INR' | 'USD';
  message:          string;                  // optional, max:300
  isAnonymous:      boolean;                 // default: false
  status:           'pending' | 'completed' | 'failed' | 'refunded';
  gateway:          'razorpay' | 'stripe';
  gatewayOrderId:   string;
  gatewayPaymentId: string;
  idempotencyKey:   string;                  // unique, prevents duplicate charges
  createdAt:        Date;
  updatedAt:        Date;
}
```

**Indexes:**
- `{ campaignId: 1, createdAt: -1 }` — live donation feed per campaign
- `{ donorId: 1, createdAt: -1 }` — user donation history
- `{ idempotencyKey: 1 }` — unique, prevents duplicates
- `{ status: 1 }` — for reconciliation queries
- `{ transactionId: 1 }` — unique

---

### 4.4 `transactions`

```typescript
interface ITransaction {
  _id:                ObjectId;
  donationId:         ObjectId;             // ref: Donation, unique
  campaignId:         ObjectId;             // ref: Campaign
  userId:             ObjectId;             // ref: User (donor)
  gateway:            'razorpay' | 'stripe';
  gatewayOrderId:     string;              // indexed, unique per gateway
  gatewayPaymentId:   string;
  gatewaySignature:   string;              // raw signature, stored encrypted
  amount:             number;
  currency:           string;
  platformFeeAmount:  number;              // e.g. 5% of amount
  netAmount:          number;              // amount - platformFeeAmount
  status:             'initiated' | 'completed' | 'failed' | 'refunded';
  webhookPayload:     Record<string, unknown>; // raw webhook body for audit
  idempotencyKey:     string;              // unique
  createdAt:          Date;
  updatedAt:          Date;
}
```

**Indexes:**
- `{ gatewayOrderId: 1 }` — unique (per-gateway lookup in webhooks)
- `{ donationId: 1 }` — unique
- `{ campaignId: 1 }` — for payout aggregation
- `{ status: 1, createdAt: -1 }` — admin reconciliation

---

### 4.5 `categories`

```typescript
interface ICategory {
  _id:         ObjectId;
  name:        string;    // unique, e.g. "Medical", "Education"
  slug:        string;    // unique, url-safe
  iconUrl:     string;    // Cloudinary URL
  description: string;    // optional
  isActive:    boolean;   // default: true
  sortOrder:   number;    // for homepage display ordering
  createdAt:   Date;
}
```

**Indexes:**
- `{ slug: 1 }` — unique
- `{ isActive: 1, sortOrder: 1 }` — active categories ordered

---

### 4.6 `notifications`

```typescript
type NotificationType =
  | 'donation_received'
  | 'campaign_funded'
  | 'campaign_approved'
  | 'campaign_flagged'
  | 'payout_released'
  | 'new_follower'
  | 'campaign_update';

interface INotification {
  _id:        ObjectId;
  userId:     ObjectId;             // recipient, ref: User
  type:       NotificationType;
  title:      string;
  body:       string;
  isRead:     boolean;              // default: false
  actionUrl:  string;               // deep link, optional
  metadata:   Record<string, unknown>; // e.g. { campaignId, donorName }
  createdAt:  Date;
}
```

**Indexes:**
- `{ userId: 1, isRead: 1, createdAt: -1 }` — unread feed
- `{ createdAt: 1 }` — TTL index, expires after 90 days

---

### 4.7 `refreshTokens`

```typescript
interface IRefreshToken {
  _id:       ObjectId;
  userId:    ObjectId;           // ref: User
  tokenHash: string;             // bcrypt hash of the raw token
  family:    string;             // UUID, rotated on each use (token family for reuse detection)
  expiresAt: Date;               // 7 days from issuance
  revokedAt: Date;               // nullable — set when revoked
  userAgent: string;             // for session display
  ipAddress: string;
  createdAt: Date;
}
```

**Indexes:**
- `{ tokenHash: 1 }` — lookup on refresh
- `{ userId: 1 }` — all sessions for a user
- `{ expiresAt: 1 }` — TTL index, auto-delete expired tokens

---

### 4.8 `media`

```typescript
type MediaType = 'image' | 'video' | 'document';

interface IMedia {
  _id:           ObjectId;
  uploadedBy:    ObjectId;       // ref: User
  campaignId:    ObjectId;       // ref: Campaign, optional (can be profile pic)
  cloudinaryId:  string;         // public_id in Cloudinary, indexed
  url:           string;         // Cloudinary delivery URL
  secureUrl:     string;         // HTTPS URL
  format:        string;         // 'jpg', 'mp4', etc.
  mediaType:     MediaType;
  width:         number;
  height:        number;
  bytes:         number;
  duration:      number;         // video only, in seconds
  altText:       string;         // accessibility
  createdAt:     Date;
}
```

**Indexes:**
- `{ cloudinaryId: 1 }` — unique, fast deletion
- `{ uploadedBy: 1 }` — user's media
- `{ campaignId: 1 }` — campaign media gallery

---

## 5. Complete API Contract

> All paths are prefixed with `/api/v1`. Paginated endpoints accept `?page=1&limit=20`. All responses are wrapped: `{ success: true, data: T, meta?: PaginationMeta }`.

### Auth

| Method | Path                          | Auth    | Request Body                                       | Response                          |
|--------|-------------------------------|---------|---------------------------------------------------|-----------------------------------|
| POST   | `/auth/register`              | None    | `{ name, email, password, username }`             | `{ user: IPublicUser }`           |
| POST   | `/auth/login`                 | None    | `{ email, password }`                             | `{ accessToken, user }`           |
| POST   | `/auth/logout`                | JWT     | —                                                 | `{ message: 'Logged out' }`       |
| POST   | `/auth/refresh`               | Cookie  | —                                                 | `{ accessToken }`                 |
| GET    | `/auth/verify-email/:token`   | None    | —                                                 | `{ message }`                     |
| POST   | `/auth/forgot-password`       | None    | `{ email }`                                       | `{ message }`                     |
| POST   | `/auth/reset-password/:token` | None    | `{ password }`                                    | `{ message }`                     |
| GET    | `/auth/me`                    | JWT     | —                                                 | `{ user: IPublicUser }`           |

### Users

| Method | Path                    | Auth        | Request Body                           | Response                          |
|--------|-------------------------|-------------|----------------------------------------|-----------------------------------|
| GET    | `/users/:id`            | JWT         | —                                      | `{ user: IPublicUser }`           |
| PATCH  | `/users/:id`            | JWT (own)   | `{ name?, bio?, username? }`           | `{ user: IPublicUser }`           |
| DELETE | `/users/:id`            | JWT (own)   | —                                      | `{ message }`                     |
| GET    | `/users/:id/campaigns`  | JWT         | —                                      | `{ campaigns[], meta }`           |
| GET    | `/users/:id/donations`  | JWT (own)   | —                                      | `{ donations[], meta }`           |
| POST   | `/users/:id/avatar`     | JWT (own)   | `multipart/form-data: file`            | `{ avatarUrl }`                   |

### Campaigns

| Method | Path                               | Auth          | Request Body                                                | Response                        |
|--------|------------------------------------|---------------|-------------------------------------------------------------|---------------------------------|
| GET    | `/campaigns`                       | None          | —                                                           | `{ campaigns[], meta }`         |
| GET    | `/campaigns/trending`              | None          | —                                                           | `{ campaigns[] }`               |
| GET    | `/campaigns/:id`                   | None          | —                                                           | `{ campaign: ICampaign }`       |
| POST   | `/campaigns`                       | JWT (creator) | `{ title, description, shortDescription, goalAmount, deadline, currency, categoryId, tags[] }` | `{ campaign }` |
| PATCH  | `/campaigns/:id`                   | JWT (owner)   | Partial campaign fields                                     | `{ campaign }`                  |
| DELETE | `/campaigns/:id`                   | JWT (owner)   | —                                                           | `{ message }`                   |
| POST   | `/campaigns/:id/publish`           | JWT (owner)   | —                                                           | `{ campaign }`                  |
| POST   | `/campaigns/:id/close`             | JWT (owner)   | —                                                           | `{ campaign }`                  |
| GET    | `/campaigns/:id/donations`         | None          | —                                                           | `{ donations[], meta }`         |
| POST   | `/campaigns/:id/media`             | JWT (owner)   | `multipart/form-data: file`                                 | `{ media: IMedia }`             |
| DELETE | `/campaigns/:id/media/:mediaId`    | JWT (owner)   | —                                                           | `{ message }`                   |
| POST   | `/campaigns/:id/updates`           | JWT (owner)   | `{ title, body }`                                           | `{ campaign }`                  |

### Donations

| Method | Path                           | Auth        | Request Body                                              | Response                      |
|--------|--------------------------------|-------------|-----------------------------------------------------------|-------------------------------|
| POST   | `/donations`                   | JWT         | `{ campaignId, amount, currency, message?, isAnonymous?, idempotencyKey }` | `{ donation }` |
| GET    | `/donations/:id`               | JWT (own)   | —                                                         | `{ donation }`                |
| GET    | `/donations/campaign/:id`      | None        | —                                                         | `{ donations[], meta }`       |
| GET    | `/donations/user/:id`          | JWT (own)   | —                                                         | `{ donations[], meta }`       |

### Payments

| Method | Path                            | Auth          | Request Body                                              | Response                        |
|--------|---------------------------------|---------------|-----------------------------------------------------------|---------------------------------|
| POST   | `/payments/order`               | JWT           | `{ campaignId, amount, currency, gateway }`               | `{ orderId, key, amount }`      |
| POST   | `/payments/verify`              | JWT           | `{ orderId, paymentId, signature, donationId }`           | `{ success, donation }`         |
| POST   | `/payments/webhook/razorpay`    | None (HMAC)   | Raw Razorpay event body                                   | `200 OK`                        |
| POST   | `/payments/webhook/stripe`      | None (sig)    | Raw Stripe event body                                     | `200 OK`                        |
| GET    | `/payments/transactions`        | JWT (admin)   | —                                                         | `{ transactions[], meta }`      |
| GET    | `/payments/transactions/:id`    | JWT (own)     | —                                                         | `{ transaction }`               |

### Notifications

| Method | Path                            | Auth  | Request Body | Response                        |
|--------|---------------------------------|-------|--------------|---------------------------------|
| GET    | `/notifications`                | JWT   | —            | `{ notifications[], meta }`     |
| PATCH  | `/notifications/:id/read`       | JWT   | —            | `{ notification }`              |
| PATCH  | `/notifications/read-all`       | JWT   | —            | `{ message }`                   |
| DELETE | `/notifications/:id`            | JWT   | —            | `{ message }`                   |

### Search

| Method | Path             | Auth  | Query Params                              | Response                  |
|--------|------------------|-------|-------------------------------------------|---------------------------|
| GET    | `/search`        | None  | `q, category, status, sort, page, limit`  | `{ results[], meta }`     |
| GET    | `/search/tags`   | None  | `q`                                       | `{ tags[] }`              |

### Uploads

| Method | Path                   | Auth  | Request Body               | Response          |
|--------|------------------------|-------|----------------------------|-------------------|
| POST   | `/uploads/image`       | JWT   | `multipart/form-data: file`| `{ media }`       |
| POST   | `/uploads/video`       | JWT   | `multipart/form-data: file`| `{ media }`       |
| DELETE | `/uploads/:publicId`   | JWT   | —                          | `{ message }`     |

### Admin

| Method | Path                              | Auth  | Request Body              | Response                      |
|--------|-----------------------------------|-------|---------------------------|-------------------------------|
| GET    | `/admin/stats`                    | Admin | —                         | `{ stats: IAdminStats }`      |
| GET    | `/admin/campaigns`                | Admin | —                         | `{ campaigns[], meta }`       |
| PATCH  | `/admin/campaigns/:id/flag`       | Admin | `{ reason }`              | `{ campaign }`                |
| PATCH  | `/admin/campaigns/:id/approve`    | Admin | —                         | `{ campaign }`                |
| GET    | `/admin/users`                    | Admin | —                         | `{ users[], meta }`           |
| PATCH  | `/admin/users/:id/role`           | Admin | `{ role }`                | `{ user }`                    |
| PATCH  | `/admin/users/:id/ban`            | Admin | `{ reason }`              | `{ user }`                    |
| GET    | `/admin/payouts`                  | Admin | —                         | `{ payouts[], meta }`         |
| POST   | `/admin/payouts/:id/release`      | Admin | —                         | `{ transaction }`             |

### Health

| Method | Path             | Auth  | Response                                 |
|--------|------------------|-------|------------------------------------------|
| GET    | `/health`        | None  | `{ status, mongo, redis, uptime }`       |
| GET    | `/health/ready`  | None  | `200` or `503`                           |
| GET    | `/health/live`   | None  | `200`                                    |

---

## 6. Data Flow Diagrams

### 6.A — User Registration & Email Verification

```
Step 1  Client          → POST /auth/register { name, email, password, username }
Step 2  ZodValidation   → Validates schema; rejects 400 if invalid
Step 3  AuthService     → Checks email/username uniqueness in DB
Step 4  AuthService     → bcrypt.hash(password, 12) → passwordHash
Step 5  UsersRepository → INSERT new User document (role=donor, isEmailVerified=false)
Step 6  AuthService     → Generate cryptographically random emailVerifyToken (uuid v4)
Step 7  UsersRepository → Store hashed token on user.emailVerifyToken
Step 8  NotificationsSvc→ Enqueue email job: SMTP/SendGrid sends verify-email.hbs
Step 9  AuthService     → Generate accessToken (JWT, 15 min) + refreshToken (opaque, 7 days)
Step 10 RefreshTokenRepo→ INSERT RefreshToken { userId, tokenHash, expiresAt, family }
Step 11 AuthController  → Set httpOnly Secure SameSite=Strict cookie: refreshToken
Step 12 Client          ← 201 { accessToken, user: IPublicUser }

--- Email verification flow (async, triggered by email link) ---

Step 13 Client          → GET /auth/verify-email/:rawToken
Step 14 AuthService     → Hash received token → look up user.emailVerifyToken
Step 15 AuthService     → Validate token not expired
Step 16 UsersRepository → UPDATE isEmailVerified=true, clear emailVerifyToken
Step 17 Client          ← 200 { message: "Email verified" }
```

---

### 6.B — Campaign Creation with Media Upload

```
Step 1  Client          → POST /campaigns { title, description, goalAmount, deadline, … }
Step 2  JwtAuthGuard    → Verify accessToken; attach user to request
Step 3  RolesGuard      → Assert role ∈ {creator, admin}
Step 4  ZodValidation   → Validate CreateCampaignDto
Step 5  CampaignsSvc    → Auto-generate slug from title (unique check + suffix if clash)
Step 6  CampaignRepo    → INSERT Campaign (status='draft')
Step 7  Client          ← 201 { campaign }

--- Media upload (per file) ---

Step 8  Client          → POST /uploads/image multipart/form-data (coverImage)
Step 9  UploadsController→ Multer memory storage; validate MIME type + size ≤ 10 MB
Step 10 UploadsService  → cloudinary.uploader.upload(buffer, { folder: 'campaigns' })
Step 11 Cloudinary      → Returns { public_id, secure_url, format, width, height, bytes }
Step 12 MediaRepository → INSERT Media document
Step 13 Client          ← 201 { media: IMedia }

--- Attach media & publish ---

Step 14 Client          → PATCH /campaigns/:id { coverImageUrl: media.secureUrl }
Step 15 Client          → POST /campaigns/:id/media (additional gallery images, same as 8-13)
Step 16 Client          → POST /campaigns/:id/publish
Step 17 CampaignsSvc    → Validate all required fields present + deadline > now
Step 18 CampaignRepo    → UPDATE status='pending_review' (or 'active' if auto-approve enabled)
Step 19 NotificationsSvc→ Email creator: "Campaign submitted for review"
Step 20 SearchModule    → Campaign indexed for full-text search (update trendingScore=0)
Step 21 Client          ← 200 { campaign }
```

---

### 6.C — Donation with Payment Processing & Real-time Update

```
Step 1  Client          → POST /payments/order { campaignId, amount, currency, gateway: 'razorpay' }
Step 2  JwtAuthGuard    → Verify accessToken
Step 3  PaymentsSvc     → Create idempotencyKey = uuid()
Step 4  RazorpaySvc     → razorpay.orders.create({ amount, currency, receipt: idempotencyKey })
Step 5  Razorpay        → Returns { id: order_id, amount, currency }
Step 6  Client          ← 200 { orderId, key: RAZORPAY_KEY_ID, amount }

Step 7  Client          → Razorpay Checkout SDK (browser) collects card/UPI details
Step 8  Razorpay        → Payment processed; returns { razorpay_order_id, razorpay_payment_id, razorpay_signature }

Step 9  Client          → POST /payments/verify { orderId, paymentId, signature, campaignId, amount, idempotencyKey }
Step 10 PaymentsSvc     → HMAC-SHA256 verify: expected_sig = sign(orderId+"|"+paymentId, secret)
Step 11 PaymentsSvc     → Check idempotencyKey not already in donations (prevent replay)
Step 12 DonationRepo    → INSERT Donation { status='pending', idempotencyKey }
Step 13 TransactionRepo → INSERT Transaction { status='initiated' }
Step 14 PaymentsSvc     → Confirm payment via Razorpay Fetch API
Step 15 DonationRepo    → UPDATE Donation { status='completed' }
Step 16 TransactionRepo → UPDATE Transaction { status='completed' }
Step 17 CampaignRepo    → ATOMIC $inc: { raisedAmount: amount, donorCount: 1 }
Step 18 CacheService    → INVALIDATE campaign:{id}:detail  &  campaign:{id}:donations
Step 19 RealtimeSvc     → socket.to('campaign:'+campaignId).emit('donation:new', { amount, donorName, totalRaised })
Step 20 NotificationsSvc→ INSERT notification for campaign creator; dispatch email
Step 21 CampaignsSvc    → Recalculate trendingScore (async job)
Step 22 Client          ← 200 { success: true, donation }

--- Donor's browser receives real-time update ---
Step 23 Socket.io       → All clients in room 'campaign:{id}' receive 'donation:new' event
Step 24 Client (React)  → Progress bar animates via Framer Motion; donation feed appends entry
```

---

### 6.D — JWT Authentication (Access + Refresh Token Rotation)

```
--- Access Token Usage ---
Step 1  Client          → HTTPS request with Authorization: Bearer <accessToken>
Step 2  JwtStrategy     → passport.authenticate('jwt') → decode & verify signature
Step 3  JwtStrategy     → Check expiry (15 min) — if expired → 401 Unauthorized
Step 4  JwtStrategy     → Attach decoded { sub: userId, role, email } to req.user
Step 5  RouteHandler    → Executes with authenticated user context

--- Refresh Token Rotation ---
Step 6  Client          → POST /auth/refresh (httpOnly cookie: refreshToken)
Step 7  AuthService     → Extract token from cookie; hash it
Step 8  RefreshTokenRepo→ Lookup { tokenHash } — if not found or revoked → 401 (possible theft)
Step 9  AuthService     → Check token family — if family was already rotated → REVOKE all family tokens (reuse detected)
Step 10 RefreshTokenRepo→ DELETE old RefreshToken document
Step 11 AuthService     → Generate new accessToken (JWT, 15 min)
Step 12 AuthService     → Generate new refreshToken (opaque uuid)
Step 13 RefreshTokenRepo→ INSERT new RefreshToken { same family, new tokenHash, expiresAt }
Step 14 AuthController  → Set new httpOnly cookie
Step 15 Client          ← 200 { accessToken }

--- Logout ---
Step 16 Client          → POST /auth/logout + cookie
Step 17 RefreshTokenRepo→ DELETE refresh token record (or mark revokedAt)
Step 18 AuthController  → Clear cookie (Set-Cookie: refreshToken=; Max-Age=0)
Step 19 Client          ← 200 { message: 'Logged out' }
```

---

### 6.E — Search & Trending Algorithm

```
--- Search Flow ---
Step 1  Client          → GET /search?q=cancer+treatment&category=medical&page=1&limit=20
Step 2  SearchController→ Parse + validate query params
Step 3  SearchService   → Build MongoDB query:
                          { $text: { $search: q }, status: 'active', categoryId: resolvedId }
Step 4  MongoDB         → Text index search → returns scored results ($meta: 'textScore')
Step 5  SearchService   → Sort by { score: { $meta: 'textScore' }, trendingScore: -1 }
Step 6  SearchService   → Apply pagination skip/limit
Step 7  Redis           → Check cache key search:{hash(query)} — if HIT return cached
Step 8  (Cache MISS)    → Execute query → cache results for 60 seconds
Step 9  Client          ← 200 { results[], meta: { page, limit, total } }

--- Trending Score Calculation (BullMQ job, runs every 10 minutes) ---
Step 1  Scheduler       → TrendingJob triggered every 10 min by BullMQ cron
Step 2  TrendingJob     → For each active campaign in past 7 days:
          trendingScore = (donations_24h × 3) + (donations_7d × 1)
                        + (viewCount_24h × 0.1)
                        + (donorCount × 0.5)
                        + (isFeatured ? 100 : 0)
                        - (daysSinceCreation × 2)   // time decay
Step 3  CampaignRepo    → Bulk WRITE updated trendingScore values
Step 4  CacheService    → INVALIDATE trending:campaigns key
```

---

## 7. Security Architecture

### 7.1 Authentication & Authorization

**JWT Strategy**
- Signing algorithm: `RS256` (asymmetric — private key signs, public key verifies; key rotation possible without invalidating all tokens)
- Access token expiry: `15 minutes`
- Refresh token expiry: `7 days` (stored as hashed opaque token in `refreshTokens` collection)
- Refresh token delivery: `httpOnly; Secure; SameSite=Strict` cookie (never accessible to JavaScript)
- Token rotation: Every refresh call rotates the refresh token. Reuse detection via token family — detects stolen tokens and revokes entire family.

**RBAC Permission Matrix**

| Action                        | guest | donor | creator | admin |
|-------------------------------|-------|-------|---------|-------|
| Browse campaigns              | ✅    | ✅    | ✅      | ✅    |
| Donate to a campaign          | ❌    | ✅    | ✅      | ✅    |
| Create a campaign             | ❌    | ❌    | ✅      | ✅    |
| Edit own campaign             | ❌    | ❌    | ✅      | ✅    |
| Publish a campaign            | ❌    | ❌    | ✅      | ✅    |
| Edit any campaign             | ❌    | ❌    | ❌      | ✅    |
| Flag / approve campaign       | ❌    | ❌    | ❌      | ✅    |
| View all users                | ❌    | ❌    | ❌      | ✅    |
| Ban users                     | ❌    | ❌    | ❌      | ✅    |
| Release payouts               | ❌    | ❌    | ❌      | ✅    |
| Access /admin/* routes        | ❌    | ❌    | ❌      | ✅    |

---

### 7.2 API Security

**Helmet Headers** (configured in `main.ts`)
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'", "https://checkout.razorpay.com", "https://js.stripe.com"],
      styleSrc:    ["'self'", "'unsafe-inline'"],
      imgSrc:      ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc:  ["'self'", "wss://api.fundblaze.com"],
      frameSrc:    ["https://api.razorpay.com", "https://js.stripe.com"],
    },
  },
  crossOriginEmbedderPolicy: false,  // required for payment iframes
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xContentTypeOptions: true,
  xFrameOptions: { action: 'sameorigin' },
}));
```

**CORS Policy**
```typescript
app.enableCors({
  origin:      process.env.ALLOWED_ORIGINS?.split(',') || ['https://fundblaze.com'],
  methods:     ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Idempotency-Key'],
  credentials: true,  // required for cookie-based refresh tokens
  maxAge:      86400,
});
```

**Rate Limiting** (via `@nestjs/throttler` + Redis store)

| Route Pattern          | Limit              | Window    |
|------------------------|--------------------|-----------|
| `POST /auth/login`     | 5 requests         | 15 min    |
| `POST /auth/register`  | 3 requests         | 1 hour    |
| `POST /auth/forgot-password` | 3 requests   | 1 hour    |
| `POST /payments/order` | 10 requests        | 1 hour    |
| `POST /uploads/*`      | 20 requests        | 1 hour    |
| `GET /search`          | 60 requests        | 1 min     |
| All other endpoints    | 100 requests       | 1 min     |
| WebSocket connections  | 1 connection/IP    | Persistent|

**Input Sanitization**
- All request bodies validated with Zod schemas in `ZodValidationPipe` (applied globally)
- `mongo-sanitize` middleware strips `$` and `.` from all incoming request objects to prevent NoSQL injection
- File upload validation: MIME type allowlist (`image/jpeg`, `image/png`, `image/webp`, `video/mp4`), max sizes enforced in Multer before Cloudinary upload

**Zod Validation Placement**
Zod runs inside `ZodValidationPipe` which is bound globally in `main.ts` as `app.useGlobalPipes(new ZodValidationPipe())`. Validation occurs before the route handler executes, after middleware, immediately upon entering the controller.

---

### 7.3 Payment Security

**Webhook Signature Verification**

*Razorpay:*
```typescript
const expectedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
  .update(rawBody)
  .digest('hex');
if (expectedSignature !== req.headers['x-razorpay-signature']) throw new UnauthorizedException();
```

*Stripe:*
```typescript
const event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
```

Both webhook endpoints use raw body buffers (bypass JSON parsing middleware for signature endpoints) and respond `200 OK` immediately before processing to prevent gateway retries.

**Idempotency Key Strategy**
- Client generates `idempotencyKey = uuidv4()` and sends with donation request
- Server checks `donations` collection for existing record with same key before creating new payment order
- Keys stored as unique index — database-level enforcement prevents race conditions
- Keys expire from display after 7 days but are retained for audit purposes

**PCI-DSS Compliance Notes**
- FundBlaze **never touches raw card data** — Razorpay Checkout and Stripe.js collect card details client-side and return only order/payment IDs
- All payment communication over TLS 1.2+
- Gateway signatures stored encrypted at rest using AES-256 (field-level encryption in MongoDB Atlas)
- Transaction logs retained for 7 years per PCI requirements

---

### 7.4 Data Security

**Password Hashing**
```typescript
const passwordHash = await bcrypt.hash(password, 12); // 12 rounds (~300ms on modern hardware)
```

**Fields Never Returned in API Responses**
The `TransformInterceptor` strips these fields from all outbound responses via `class-transformer` `@Exclude()` decorator and explicit response DTOs:
`passwordHash`, `emailVerifyToken`, `resetPasswordToken`, `tokenHash`, `gatewaySignature`, `webhookPayload`, `ipAddress`

**MongoDB Injection Prevention**
- `mongo-sanitize` middleware applied globally
- Mongoose strict mode enabled by default (unknown fields silently dropped)
- All user-controlled values in queries go through Mongoose query builders — never raw string interpolation

**Redis Key Namespacing & Expiry**
```
fundblaze:cache:campaign:{id}:detail          TTL: 300s
fundblaze:cache:campaign:{id}:donations       TTL: 60s
fundblaze:cache:trending:campaigns            TTL: 600s
fundblaze:cache:user:{id}:profile             TTL: 300s
fundblaze:cache:categories:all                TTL: 3600s
fundblaze:ratelimit:{ip}:{route}              TTL: per window
fundblaze:sessions:refresh:{family}           TTL: 7 days
```

---

## 8. Caching Strategy

| Resource               | Redis Key Pattern                               | TTL     | Strategy      | Invalidation Trigger                              |
|------------------------|-------------------------------------------------|---------|---------------|--------------------------------------------------|
| Trending campaigns     | `fundblaze:cache:trending:campaigns`            | 600 s   | Cache-aside   | TrendingJob completes; campaign status changes    |
| Campaign detail        | `fundblaze:cache:campaign:{id}:detail`          | 300 s   | Cache-aside   | Campaign PATCH/DELETE; donation confirmed          |
| Campaign donations     | `fundblaze:cache:campaign:{id}:donations`       | 60 s    | Cache-aside   | New donation confirmed for campaign               |
| User profile (public)  | `fundblaze:cache:user:{id}:profile`             | 300 s   | Cache-aside   | User PATCH (name, avatar, bio)                   |
| Category list          | `fundblaze:cache:categories:all`                | 3600 s  | Cache-aside   | Admin creates/updates/disables a category         |
| Donation totals        | `fundblaze:cache:campaign:{id}:stats`           | 60 s    | Write-through | Every confirmed donation atomically increments    |
| Search results         | `fundblaze:cache:search:{sha256(query)}`        | 60 s    | Cache-aside   | Natural TTL expiry only (short-lived)             |
| Rate limit counters    | `fundblaze:ratelimit:{ip}:{route}`              | Per window | Write-through | Not invalidated; expires with window TTL        |

**Cache-aside pattern implementation:**
```typescript
async getCampaign(id: string): Promise<ICampaign> {
  const key = `fundblaze:cache:campaign:${id}:detail`;
  const cached = await this.redis.get(key);
  if (cached) return JSON.parse(cached);
  const campaign = await this.campaignRepo.findById(id);
  await this.redis.setex(key, 300, JSON.stringify(campaign));
  return campaign;
}
```

**Write-through for donation totals** — after every confirmed donation, the service performs a single atomic Redis `INCRBYFLOAT` on `campaign:{id}:stats` in addition to the MongoDB `$inc`. This keeps the cache warm so subsequent reads hit Redis.

---

## 9. Real-Time Architecture (Socket.io)

### Namespace: `/realtime`

All Socket.io traffic uses the `/realtime` namespace. Clients connect after receiving an access token.

### Event Contract

| Event Name                | Direction          | Payload Schema                                                                      | Room / Namespace         |
|---------------------------|--------------------|-------------------------------------------------------------------------------------|--------------------------|
| `connect`                 | Client → Server    | `{ auth: { token: string } }`                                                       | `/realtime`              |
| `join:campaign`           | Client → Server    | `{ campaignId: string }`                                                            | `/realtime`              |
| `leave:campaign`          | Client → Server    | `{ campaignId: string }`                                                            | `/realtime`              |
| `donation:new`            | Server → Room      | `{ donorName: string, amount: number, currency: string, message?: string, totalRaised: number, donorCount: number, timestamp: string }` | `campaign:{id}` |
| `campaign:progress`       | Server → Room      | `{ campaignId: string, raisedAmount: number, goalAmount: number, percentFunded: number }` | `campaign:{id}` |
| `notification:new`        | Server → User      | `{ id: string, type: string, title: string, body: string, actionUrl?: string }`     | `user:{userId}`          |
| `campaign:status_changed` | Server → Room      | `{ campaignId: string, status: CampaignStatus }`                                   | `campaign:{id}`          |
| `error`                   | Server → Client    | `{ code: string, message: string }`                                                 | `/realtime`              |
| `disconnect`              | Client → Server    | —                                                                                   | `/realtime`              |

### Connection Authentication

```typescript
// Server-side middleware in RealtimeGateway
io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('UNAUTHORIZED'));
  try {
    const payload = jwtService.verify(token);
    socket.data.userId = payload.sub;
    socket.data.role = payload.role;
    next();
  } catch {
    next(new Error('INVALID_TOKEN'));
  }
});
```

### Room Management

- On `join:campaign` → `socket.join('campaign:' + campaignId)` + join personal room `user:${socket.data.userId}`
- On `leave:campaign` → `socket.leave('campaign:' + campaignId)`
- On `disconnect` → Socket.io auto-cleans rooms; no explicit cleanup needed
- Personal user room joined on every authenticated connection for push notifications

### Scaling with Redis Adapter

```typescript
// In RealtimeModule
const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));
```

This ensures `socket.to(room).emit()` works across all API instances behind the load balancer.

---

## 10. Scaling & Reliability Strategy

### Horizontal Scaling — API Layer
- NestJS is **stateless** (JWT auth, Redis for sessions/cache) — can scale to N replicas without code changes
- Render/Railway auto-scaling based on CPU > 70% or p95 latency > 500ms
- Socket.io sticky sessions enabled at the load balancer level (required for WebSocket upgrade handshake), with Redis adapter ensuring messages broadcast across all nodes
- Target: 2 replicas at launch, auto-scale to 8 at peak

### MongoDB Atlas Recommendations
- **Tier:** M10 at launch (2 vCPUs, 2 GB RAM, 10 GB storage), upgrade to M30 at 6 months
- **Replica Set:** 3-node replica set (1 primary + 2 secondaries) for automatic failover
- **Read Preference:** `secondaryPreferred` for read-heavy endpoints (campaign browse, donations list)
- **Sharding:** Not required at launch; add shard key `{ creatorId: 1 }` on `campaigns` collection when document count exceeds 10M
- **Atlas Search** (Lucene-based): Replace MongoDB text indexes with Atlas Search for richer search at scale (Phase 2)
- **Backups:** Continuous cloud backups with point-in-time recovery enabled (M10+)

### Redis Recommendations
- **Development:** Local Redis 7 via Docker
- **Production:** Upstash Redis (serverless, HTTP-based Redis) — no persistent connection management needed on serverless; pay per request
- **At scale (>50K MAU):** Migrate to Redis Cloud with Redis Sentinel for HA (no need for full cluster at typical crowdfunding volumes)
- Key expiry and namespace isolation prevent cross-environment contamination

### Socket.io
- Redis adapter (see §9) handles multi-node pub/sub
- Sticky sessions at load balancer prevent WebSocket re-handshake loops (configure via `X-Forwarded-For` hash in Render)
- Heartbeat: `pingTimeout: 60000, pingInterval: 25000`

### CDN Strategy for Media Assets
- Cloudinary provides its own global CDN — all media URLs already point to edge nodes
- Cloudinary transformations (resize, crop, WebP conversion) are applied on first request and cached at edge indefinitely
- Video streaming via Cloudinary's adaptive bitrate (ABR) HLS delivery

### Throughput Estimates

| Period        | DAU    | Peak RPS (API) | Peak WS Connections | Storage (MongoDB) |
|---------------|--------|----------------|---------------------|-------------------|
| Launch        | 1,000  | 50             | 500                 | < 5 GB            |
| 3 months      | 10,000 | 300            | 3,000               | ~20 GB            |
| 6 months      | 50,000 | 1,200          | 10,000              | ~80 GB            |

### SLA Targets

| Metric                 | Target            |
|------------------------|-------------------|
| API uptime             | 99.9% (< 9h/year) |
| p50 response time      | < 80 ms           |
| p95 response time      | < 300 ms          |
| p99 response time      | < 800 ms          |
| WebSocket reconnect    | < 2 seconds       |
| Media delivery (CDN)   | < 100 ms globally |
| Error rate             | < 0.1%            |

---

## 11. Environment Variables Master List

### `apps/api/.env.example`

```dotenv
# ═══════════════════════════════════════════
#  FUNDBLAZE API — Environment Variables
# ═══════════════════════════════════════════

# ── Application ──────────────────────────────────────────────────
NODE_ENV=development                  # REQUIRED | 'development' | 'staging' | 'production'
PORT=4000                             # OPTIONAL | Default: 4000
API_BASE_URL=http://localhost:4000    # REQUIRED | Public base URL of API
FRONTEND_URL=http://localhost:5173    # REQUIRED | Allowed CORS origin
ALLOWED_ORIGINS=http://localhost:5173 # REQUIRED | Comma-separated list of allowed CORS origins

# ── Database — MongoDB Atlas ──────────────────────────────────────
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/fundblaze?retryWrites=true&w=majority
# REQUIRED | Full Atlas connection string

MONGODB_DB_NAME=fundblaze             # OPTIONAL | Default: 'fundblaze'

# ── Cache — Redis (Upstash in production) ────────────────────────
REDIS_URL=redis://localhost:6379      # REQUIRED | Redis connection URL
# Production Upstash example: rediss://:password@host:6379

# ── Authentication — JWT (RS256) ─────────────────────────────────
JWT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
# REQUIRED | RS256 private key (PEM format, newlines escaped as \n)

JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n..."
# REQUIRED | RS256 public key (PEM format)

JWT_ACCESS_EXPIRES_IN=15m             # OPTIONAL | Default: 15m
JWT_REFRESH_EXPIRES_IN=7d             # OPTIONAL | Default: 7d
JWT_REFRESH_COOKIE_NAME=fundblaze_rt  # OPTIONAL | Cookie name for refresh token

BCRYPT_ROUNDS=12                      # OPTIONAL | Default: 12

# ── Payments — Razorpay (India) ──────────────────────────────────
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx     # REQUIRED | Razorpay Key ID
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx  # REQUIRED | Razorpay Key Secret
RAZORPAY_WEBHOOK_SECRET=xxxxxxxx      # REQUIRED | Razorpay webhook signing secret
PLATFORM_FEE_PERCENT=5                # OPTIONAL | Default: 5 (%)

# ── Payments — Stripe (International) ───────────────────────────
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxx  # REQUIRED | Stripe secret key
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx  # REQUIRED | Sent to frontend
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx  # REQUIRED | Stripe webhook signing secret

# ── Media Storage — Cloudinary ───────────────────────────────────
CLOUDINARY_CLOUD_NAME=fundblaze       # REQUIRED | Cloudinary cloud name
CLOUDINARY_API_KEY=123456789012345    # REQUIRED | Cloudinary API key
CLOUDINARY_API_SECRET=xxxxxxxxxx      # REQUIRED | Cloudinary API secret

# ── Media Storage — AWS S3 (fallback) ───────────────────────────
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXX # OPTIONAL | Required only if using S3 fallback
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxx  # OPTIONAL
AWS_S3_BUCKET_NAME=fundblaze-media    # OPTIONAL
AWS_S3_REGION=ap-south-1              # OPTIONAL | Default: ap-south-1

# ── Email — SendGrid ─────────────────────────────────────────────
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxx  # REQUIRED | SendGrid API key
EMAIL_FROM=noreply@fundblaze.com      # REQUIRED | Sender address
EMAIL_FROM_NAME=FundBlaze             # OPTIONAL | Default: FundBlaze

# ── Real-time — Socket.io ────────────────────────────────────────
SOCKET_CORS_ORIGIN=http://localhost:5173  # REQUIRED | Socket.io CORS origin

# ── Monitoring ───────────────────────────────────────────────────
SENTRY_DSN=https://xxx@oyyy.ingest.sentry.io/zzz  # REQUIRED in production
LOG_LEVEL=debug                       # OPTIONAL | 'debug'|'info'|'warn'|'error'

# ── Rate Limiting ────────────────────────────────────────────────
THROTTLE_TTL=60000                    # OPTIONAL | Global TTL in ms, Default: 60000
THROTTLE_LIMIT=100                    # OPTIONAL | Global max requests, Default: 100
```

---

### `apps/web/.env.example`

```dotenv
# ═══════════════════════════════════════════
#  FUNDBLAZE WEB — Environment Variables
# ═══════════════════════════════════════════

# ── API Connection ────────────────────────────────────────────────
VITE_API_BASE_URL=http://localhost:4000/api/v1
# REQUIRED | REST API base URL

VITE_SOCKET_URL=http://localhost:4000
# REQUIRED | Socket.io server URL (no path)

# ── Payments ─────────────────────────────────────────────────────
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
# REQUIRED | Razorpay publishable key (safe to expose)

VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxx
# REQUIRED | Stripe publishable key

# ── Media ─────────────────────────────────────────────────────────
VITE_CLOUDINARY_CLOUD_NAME=fundblaze
# REQUIRED | For client-side Cloudinary URL construction

# ── Monitoring ────────────────────────────────────────────────────
VITE_SENTRY_DSN=https://xxx@oyyy.ingest.sentry.io/zzz
# REQUIRED in production | Sentry DSN for frontend

VITE_APP_ENV=development
# OPTIONAL | 'development' | 'staging' | 'production'

# ── Feature Flags ─────────────────────────────────────────────────
VITE_ENABLE_STRIPE=true
# OPTIONAL | Default: true | Set false to hide Stripe in dev

VITE_ENABLE_ANALYTICS=false
# OPTIONAL | Default: false | Enable analytics in production
```

---

## 12. Tech Stack Decision Log

| Technology     | Chosen            | Alternative 1         | Alternative 2        | Reason for Selection                                                                                  | Known Trade-offs                                             |
|----------------|-------------------|-----------------------|----------------------|-------------------------------------------------------------------------------------------------------|--------------------------------------------------------------|
| **Frontend Framework** | React 18 + Vite | Next.js 14 (SSR) | SvelteKit | Vite's instant HMR and React's ecosystem maturity. No SSR complexity needed — campaigns are public and cacheable at CDN. Simpler mental model for the team. | No SSR means initial load depends on bundle parse time. SEO handled via meta tags and prerendering. |
| **Backend Framework** | NestJS (TypeScript) | Express + TypeScript | Fastify + TypeScript | NestJS provides a highly opinionated, module-based architecture that enforces Controller→Service→Repository layering out of the box. Excellent DI system, Swagger integration, and first-class WebSocket support. | Higher cold-start memory (~120 MB vs ~40 MB Express). Steeper learning curve for developers new to Angular-style DI. |
| **Database** | MongoDB Atlas | PostgreSQL (Supabase) | PlanetScale (MySQL) | Campaign data is document-oriented (nested media, updates, tags). MongoDB's flexible schema allows campaigns to evolve without migrations. Atlas provides managed backups, global clusters, and Atlas Search. | Lacks strong ACID transactions (mitigated with Mongoose transactions for donation flows). Joins require $lookup aggregations. |
| **ODM** | Mongoose 8 | Prisma (MongoDB connector) | TypeORM | Mongoose provides fine-grained control over schemas, middleware (pre/post hooks), and virtual fields essential for computed properties. TypeScript generics in v8 are much improved. | More verbose than Prisma's type-safe query builder. Requires manual schema → TypeScript interface synchronisation (mitigated by `shared/types`). |
| **Cache / Queue** | Redis (Upstash) | Memcached | Elasticsearch | Redis handles caching, BullMQ queues, rate-limiting counters, Socket.io adapter, and refresh token families in one service. Upstash's serverless HTTP Redis eliminates persistent connection pooling. | Upstash has ~1ms additional latency vs same-region dedicated Redis. At very high throughput, cost per request becomes significant. |
| **Payments (India)** | Razorpay | Cashfree | PayU | Razorpay is the dominant Indian payment gateway with best-in-class UPI support, instant settlement for eligible accounts, and a polished Checkout SDK. Excellent webhook reliability. | Razorpay's international coverage is limited — Stripe required alongside it for global donors. |
| **Payments (Global)** | Stripe | Braintree | Adyen | Stripe offers the best developer experience, comprehensive webhook system, Radar fraud detection, and Connect for marketplace payouts. | Stripe's India coverage requires a Stripe-registered Indian entity; combined with Razorpay adds complexity. |
| **Media Storage** | Cloudinary | AWS S3 + CloudFront | Uploadcare | Cloudinary provides automatic transformation (resizing, WebP, blur-hash), a built-in global CDN, and video transcoding without separate infrastructure. Dramatically reduces backend media processing logic. | More expensive per GB than raw S3 at high volume. Vendor lock-in for URL structure. |
| **Real-time** | Socket.io v4 | Firebase Realtime DB | Ably | Socket.io provides full control over rooms, namespaces, and event contracts. The Redis adapter scales horizontally. No vendor dependency for core product feature. | Socket.io adds ~50 KB to client bundle. Requires sticky sessions at the load balancer. |
| **Auth Strategy** | JWT RS256 + httpOnly refresh token | Session + database tokens | Paseto | RS256 allows public-key verification on edge/CDN without the private key. httpOnly cookie refresh token prevents XSS token theft. Rotation with family tracking prevents refresh token replay. | More complex than simple session cookies. Key management (rotation, storage) requires operational discipline. |
| **State Management** | Zustand + React Context | Redux Toolkit | Jotai | Zustand provides a minimal, TypeScript-friendly global store without boilerplate. React Context is sufficient for stable, infrequently updated state (theme, auth). TanStack Query handles all server-state caching. | Zustand devtools are less mature than Redux DevTools. No built-in time-travel debugging. |
| **Styling** | Tailwind CSS v3 | Styled Components | CSS Modules | Tailwind enforces design constraints, eliminates CSS naming conflicts, and produces highly optimised CSS via PurgeCSS. Co-locating styles with JSX accelerates development. | Verbose classNames on complex components. Requires design token discipline to maintain consistency. |
| **CI/CD** | GitHub Actions | GitLab CI | CircleCI | Native integration with GitHub (where the repo lives), free for public repos, generous free tier for private. YAML-based pipelines are portable. Marketplace has actions for Docker, Vercel, Render. | Limited parallelism on free tier. Large monorepos can have slow pipeline times without Turborepo remote caching. |
| **Monorepo Tooling** | Turborepo + pnpm workspaces | Nx | Lerna + Yarn workspaces | Turborepo's remote caching (Vercel Cache) dramatically reduces CI build times. pnpm workspaces provide strict dependency isolation. Simpler configuration than Nx. | Turborepo's task graph definition requires careful ordering. Remote cache requires Vercel account (or self-hosted). |

---

*End of FundBlaze Architecture Blueprint — v1.0.0*
*This document is the authoritative reference for Stage 2 (Frontend) and Stage 3 (Backend) implementation.*
*Any deviations from this spec must be reviewed by the lead architect and recorded as an amendment.*
