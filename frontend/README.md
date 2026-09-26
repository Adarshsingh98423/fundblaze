<div align="center">

<img src="https://img.shields.io/badge/FundBlaze-Crowdfunding%20Platform-FF6B00?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0xIDE1aC0ydi02aDJ2NnptMC04aC0yVjdoMnYyeiIvPjwvc3ZnPg==" alt="FundBlaze" />

# FundBlaze 🔥

### *Ignite Hope. Fund Dreams.*

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-E0234E?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Redis](https://img.shields.io/badge/Redis-7.x-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=flat-square&logo=socket.io)](https://socket.io)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com)

[![Razorpay](https://img.shields.io/badge/Razorpay-Payments-02042B?style=flat-square&logo=razorpay&logoColor=white)](https://razorpay.com)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat-square&logo=stripe&logoColor=white)](https://stripe.com)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?style=flat-square&logo=cloudinary&logoColor=white)](https://cloudinary.com)
[![Vercel](https://img.shields.io/badge/Vercel-Frontend-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)

[![Build Status](https://img.shields.io/github/actions/workflow/status/your-org/fundblaze/ci.yml?branch=main&style=flat-square&label=CI%2FCD&logo=github-actions)](https://github.com/your-org/fundblaze/actions)
[![Coverage](https://img.shields.io/codecov/c/github/your-org/fundblaze?style=flat-square&logo=codecov)](https://codecov.io/gh/your-org/fundblaze)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](./CONTRIBUTING.md)

---

**FundBlaze** is a production-grade, full-stack crowdfunding platform built for creators and donors alike. It features dual-gateway payment processing via Razorpay and Stripe, real-time donation feeds over Socket.io, media management through Cloudinary, role-based access control, and a blazing-fast dark-first React 18 UI with glassmorphism design. Every architectural decision was made for scale, security, and developer ergonomics.

[**Live Demo**](https://fundblaze.vercel.app) · [**API Docs**](https://api.fundblaze.io/api/docs) · [**Report a Bug**](https://github.com/your-org/fundblaze/issues) · [**Request Feature**](https://github.com/your-org/fundblaze/discussions)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Why FundBlaze?](#-why-fundblaze)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Internal Working / System Design](#️-internal-working--system-design)
- [Database Schema](#-database-schema)
- [API Documentation](#-api-documentation)
- [Authentication & Security](#-authentication--security)
- [Payment Processing](#-payment-processing)
- [Performance Optimization](#-performance-optimization)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [FAQ](#-faq)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🌐 Overview

FundBlaze is a **full-stack Kickstarter-style crowdfunding platform** engineered for production from the ground up. Unlike boilerplate tutorial projects, every layer of FundBlaze was designed with real-world constraints in mind — from the NestJS Controller → Service → Repository strict layering and MongoDB Atlas M10 cluster configuration, down to idempotent Razorpay webhook handling and the Cloudinary media pipeline.

**Key capabilities at a glance:**

- 💳 **Dual payment gateway** — Razorpay (India-first, ₹) and Stripe (international currencies) with webhook signature verification, idempotency keys, and full audit trails via a dedicated `transactions` collection
- ⚡ **Real-time donation feed** — Socket.io v4 with a Redis pub/sub adapter delivers live progress bar updates and donation toast notifications to every visitor on a campaign page, across any number of backend instances
- 🛡️ **Security-first architecture** — dual-token JWT (15 min access + 7 day HTTP-only refresh), RBAC with four roles (`guest`, `donor`, `creator`, `admin`), bcrypt-10 hashing, NoSQL injection prevention, and per-route rate limiting
- 🎨 **Blaze Dark design system** — React 18 + Vite + Tailwind CSS with glassmorphism cards, orange-gradient primary palette, Framer Motion page transitions, and TanStack Query for zero-boilerplate server state
- 🚀 **Production-ready DevOps** — multi-stage Docker builds, GitHub Actions CI/CD with PR preview environments, Vercel for the frontend, Render/Railway for the API, and Sentry + Pino structured logging

---

## 🤔 Why FundBlaze?

### Problems with Existing Crowdfunding Platform Implementations

| Problem | Common Approach | FundBlaze Solution |
|---|---|---|
| Payment webhooks processed multiple times | No idempotency check | Idempotency keys checked against `transactions` audit log before any state change |
| Donation totals go stale between refreshes | Polling every N seconds | Socket.io room-based push — progress bars update the instant a webhook is confirmed |
| Page-based pagination breaks at scale | `skip(page * limit)` — O(n) DB scan | Cursor-based pagination using ObjectId — O(log n) indexed lookup regardless of collection size |
| Media uploads block the request thread | Synchronous upload inside route handler | Cloudinary upload streams asynchronously; presigned URLs offload work from the API |
| Access tokens stolen via XSS | `localStorage` token storage | Access token lives in Zustand memory only; refresh token is HTTP-only, `SameSite=Strict` cookie |
| Real-time events lost when scaling horizontally | In-process Socket.io rooms | `@socket.io/redis-adapter` — any backend instance can emit to any client's room via Redis pub/sub |
| Secrets committed or baked into images | `ENV` in Dockerfile / `.env` in repo | GitHub Actions Secrets + Render environment variables; `.env` excluded by `.gitignore` and `.dockerignore` |
| Campaign slug collisions under concurrent creation | No uniqueness guarantee | `slugify` utility + MongoDB unique index on `slug`; auto-appends ObjectId suffix on conflict |

---

## ✨ Features

### Core Features

**Campaign Creation & Management**
Creators build campaigns through an intuitive four-step wizard: basics (title, category, tags), story (cover image with drag-and-drop preview, rich text body, optional video embed), funding goals (goal amount, currency, deadline, minimum donation, reward tiers), and a final review-and-publish screen. Campaigns auto-save to `localStorage` every 30 seconds as a draft. Zod schemas validate each step before the user can advance.

**Dual-Currency Payment Processing**
FundBlaze integrates both Razorpay (INR) and Stripe (USD/international). The donation flow creates a payment order on the server, processes it client-side via the respective gateway SDK, then verifies the payment server-side before marking the donation as confirmed. Webhook handlers run independently to catch async confirmation events, protected by HMAC signature verification and idempotency checks.

**Real-Time Donation Live Feed**
Every campaign detail page joins a Socket.io room scoped to that campaign's ID on mount. When a donation is confirmed, the server emits a `donation_confirmed` event to the room. The progress bar animates with a spring transition, donor count increments live, and a toast notification fires — all without a page refresh.

**Role-Based Access Control**
Four roles govern every request: `guest` (browse public campaigns), `donor` (donate, view own history), `creator` (create and manage campaigns, view their own donation analytics), and `admin` (feature campaigns, manage users, view platform-wide reports). Guards are applied at the NestJS controller level via a `RolesGuard` + `@Roles()` decorator pair.

**Creator Dashboard & Analytics**
Authenticated creators see a dashboard with total raised, donor count, active campaign count, and a Recharts time-series chart of donations over the last 30 days. The campaigns table shows live funding progress and days remaining. Recent activity streams the latest donations in a real-time-updated list.

**Search & Discovery**
A debounced search bar (300 ms) performs MongoDB full-text search across campaign titles and descriptions. Category filter pills, a sort dropdown (Trending / Newest / Most Funded / Ending Soon), and URL-reflected query params (`?q=solar&category=tech&sort=trending`) make the Explore page fully shareable and bookmarkable. The trending algorithm scores campaigns using a Redis sorted set updated on every new donation.

**Notification System**
Persistent in-app notifications (stored in MongoDB) and real-time Socket.io push events inform creators when their campaign receives a donation, hits a funding milestone, or is fully funded. Donors receive confirmation notifications. All notifications expose a mark-as-read API consumed by the frontend badge counter.

### Advanced Features

**Multi-Step Form with Draft Auto-Save**
The four-step create-campaign wizard saves progress to `localStorage` every 30 seconds. If a creator closes the tab mid-way, their draft is restored on next visit. Each step validates only that step's Zod schema — partial saves never block progress.

**Optimistic UI Updates**
TanStack Query's `onMutate` / `onError` rollback pattern makes every interaction feel instantaneous. Donation counts, notification badges, and profile edits update before the server responds, rolling back silently on failure.

**JWT Refresh Queue**
The Axios interceptor implements a concurrent request queue. If multiple API calls are in-flight when the access token expires, they all pause while a single token refresh executes, then replay in order — no lost requests, no race conditions, no duplicate refresh calls.

**Idempotent Webhook Processing**
Both the Razorpay and Stripe webhook handlers check the `transactions` collection for the incoming event's gateway event ID before processing. A duplicate event is acknowledged (HTTP 200) but produces no state change — making the handlers safe to replay under any network retry scenario.

**Graceful Shutdown**
NestJS lifecycle hooks (`OnModuleDestroy`) close the Mongoose connection, disconnect ioredis, and drain in-flight HTTP requests cleanly on SIGTERM — ensuring zero dropped requests during rolling Render deployments.

---

## 🛠 Tech Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20 LTS | JavaScript runtime |
| NestJS | 10.x | Opinionated HTTP framework with DI container |
| TypeScript | 5.x | Strict-mode type safety end-to-end |
| Mongoose | 8.x | MongoDB ODM with schema decorators |
| Passport.js | 0.7.x | JWT authentication strategy |
| class-validator | 0.14.x | DTO validation via decorators (NestJS pipes) |
| Zod | 3.x | Business logic schema validation |
| ioredis | 5.x | Redis client for caching, pub/sub, blacklist |
| Razorpay SDK | 2.x | India-first payment gateway integration |
| Stripe SDK | 14.x | International payment gateway integration |
| Cloudinary SDK | 2.x | Image and video upload, transformation, CDN |
| Nodemailer | 6.x | Transactional email with Handlebars templates |
| Pino | 8.x | Structured JSON logging via `nestjs-pino` |
| Sentry SDK | 7.x | Error tracking and performance monitoring |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18.x | UI framework with concurrent features |
| Vite | 5.x | Sub-second HMR dev server and build tool |
| TypeScript | 5.x | End-to-end type safety |
| Tailwind CSS | 3.x | Utility-first design system (Blaze Dark theme) |
| Framer Motion | 11.x | Page transitions, card hover, progress spring animations |
| TanStack Query | 5.x | Server state, caching, infinite scroll, optimistic updates |
| Zustand | 4.x | Lightweight global state (authStore, uiStore, campaignStore) |
| React Hook Form | 7.x | Performant multi-step form management |
| Zod | 3.x | Client-side schema validation (shared via `packages/shared`) |
| Axios | 1.x | HTTP client with request interceptors and refresh token queue |
| Socket.io Client | 4.x | Real-time donation feed and notification events |
| Recharts | 2.x | Donation analytics charts in the creator dashboard |
| Lucide React | Latest | Consistent icon system |
| MSW | 2.x | Mock Service Worker for API mocking during development |

### Database & Storage

| Technology | Purpose |
|---|---|
| MongoDB Atlas (M10+) | Primary document store; replica set, VPC peering |
| Redis (Upstash in prod) | Response caching, refresh token blacklist, Socket.io pub/sub, trending sorted set |
| Cloudinary | Image/video hosting, transformation CDN, presigned upload URLs |

### DevOps & Infrastructure

| Technology | Purpose |
|---|---|
| Docker | Multi-stage builds (builder → Alpine runner, final image < 200 MB) |
| GitHub Actions | CI (lint, typecheck, test) + CD (build → push Docker Hub → deploy) |
| Vercel | Frontend hosting with automatic branch deploys and PR previews |
| Render / Railway | Backend Docker-based web service with health-check-gated rolling deploys |
| Cloudflare | DNS proxy, SSL/TLS termination, DDoS protection |
| Sentry | Error aggregation, release tracking, performance tracing |
| UptimeRobot | Availability monitoring with Slack/email alerting |

### Testing

| Tool | Scope |
|---|---|
| Jest + Supertest | Backend unit and E2E API tests |
| `@nestjs/testing` | NestJS module mocking and isolated unit tests |
| mongodb-memory-server | In-memory MongoDB for isolated integration test runs |
| ioredis-mock | In-memory Redis mock for blacklist and cache tests |
| Vitest + RTL | Frontend component and hook tests |
| MSW (Mock Service Worker) | API mocking for frontend Vitest tests |
| Playwright | End-to-end critical path tests (Chromium + Firefox) |

---

## 🏗 Architecture

### High-Level System Diagram

```
                        ┌─────────────────────────────────────────┐
                        │              Internet                   │
                        └──────────────┬──────────────────────────┘
                                       │
                        ┌──────────────▼────────────────────────────┐
                        │         Cloudflare DNS + WAF + SSL         │
                        └────────┬──────────────────┬───────────────┘
                                 │ HTTPS             │ HTTPS
                  ┌──────────────▼────┐    ┌─────────▼──────────────────┐
                  │   Vercel CDN      │    │  Render / Railway           │
                  │   React SPA       │    │  NestJS API (Docker)        │
                  │  (fundblaze.app)  │    │  (api.fundblaze.io :5000)   │
                  └───────────────────┘    └────────────┬───────────────┘
                                                        │
                              ┌─────────────────────────┼───────────────────────┐
                              │                         │                       │
                  ┌───────────▼──────────┐  ┌───────────▼──────────┐  ┌────────▼────────────┐
                  │    MongoDB Atlas      │  │   Upstash Redis       │  │   Cloudinary CDN    │
                  │    M10+ Cluster       │  │   Serverless          │  │   (images/videos)   │
                  │    ap-south-1         │  │   ap-south-1          │  │                     │
                  └──────────────────────┘  └──────────────────────┘  └─────────────────────┘
                              │
                  ┌───────────┴──────────────────────────┐
                  │                                      │
         ┌────────▼────────────┐              ┌──────────▼──────────────┐
         │    Razorpay          │              │      Stripe              │
         │  (INR payments)      │              │  (USD / international)   │
         └─────────────────────┘              └─────────────────────────┘
                              │
                  ┌───────────┴──────────────────────────┐
                  │                                      │
         ┌────────▼────────────┐              ┌──────────▼──────────────┐
         │    Sentry            │              │   GitHub Actions         │
         │  (errors + APM)      │              │   (CI / CD pipeline)     │
         └─────────────────────┘              └─────────────────────────┘
```

### Request Flow

A typical API request travels this path:

1. **DNS + WAF** — Cloudflare resolves `api.fundblaze.io`, applies DDoS and bot-mitigation rules, and proxies with full SSL/TLS encryption.
2. **Render load balancer** — Routes the request to the running Docker container. WebSocket upgrade requests are passed through with protocol upgrade headers intact.
3. **NestJS global middleware** — Helmet security headers, CORS policy, body-parser (JSON + raw for Stripe webhook), cookie-parser, Morgan HTTP logger, and Sentry request handler run in sequence.
4. **Global rate limiter** — `ThrottlerGuard` enforces per-IP rate limits at the application level before any route handler executes.
5. **Guards & interceptors** — `JwtAuthGuard` validates the Bearer token and populates `req.user` from the JWT payload (no DB round-trip). `RolesGuard` checks the `@Roles()` decorator against the user's role. `TransformInterceptor` wraps the outgoing response in `{ data, meta }`.
6. **Controller → Service → Repository** — Strict three-layer separation. Controllers validate DTOs, call the service. Services run business logic and throw domain exceptions. Repositories execute lean, projected Mongoose queries.
7. **Redis cache** — Read paths check the cache first. On a MISS, the MongoDB result is stored with its TTL and a `X-Cache: MISS` header is set. On a HIT, the response returns without touching MongoDB.
8. **Socket.io emit** — Mutating operations (donation confirmed, campaign funded) emit events via the `@socket.io/redis-adapter` to broadcast across all backend instances.
9. **Standardized response** — `TransformInterceptor` ensures every success response shape is `{ data: T, meta?: PaginationMeta }`. `AllExceptionsFilter` maps every thrown exception to `{ statusCode, message, errors? }`.

---

## ⚙️ Internal Working / System Design

### Component Interaction Map

```
┌──────────────────────────────────────────────────────────────────────┐
│                          Backend (NestJS)                            │
│                                                                      │
│  main.ts ──► AppModule ──► FeatureModule ──► Controller              │
│     │              │                             │                   │
│     │         Global Guards                   Service                │
│     │        (JwtAuthGuard,                      │                   │
│     │         RolesGuard,                  ┌─────┴──────┐           │
│     │         ThrottlerGuard)              │            │           │
│     │                                 Repository    Redis           │
│  CampaignGateway ◄─ NotificationsService ◄─ Mongoose  (ioredis)     │
│  (Socket.io + Redis Adapter)              (Atlas)                   │
│                                                                      │
│  PaymentsModule ──► RazorpayService / StripeService                  │
│                          │                                           │
│                    WebhookHandlers                                   │
│                    (signature verify + idempotency check)            │
└──────────────────────────────────────────────────────────────────────┘
                            ▲  REST / WSS
                            │
┌──────────────────────────────────────────────────────────────────────┐
│                        Frontend (React 18)                           │
│                                                                      │
│  App.tsx ──► Router ──► Page ──► Feature Components                  │
│     │                                │                              │
│  useAuth()                    TanStack Query                        │
│  useSocket()                  (useQuery / useMutation /             │
│                                useInfiniteQuery +                   │
│  Zustand Stores                Optimistic Updates)                  │
│  ├── authStore (token, user, role)       │                          │
│  ├── uiStore (theme, sidebar, modal)  Service Layer                 │
│  └── campaignStore (draft, filters)   (api.ts Axios instance        │
│                                        + refresh token queue)       │
│                                        + Razorpay/Stripe JS SDK)    │
│                                                 │                   │
│  Socket.io Client ◄──── campaignSocket (donation events)            │
│  (useDonationFeed,      notificationsSocket                          │
│   useNotifications)                                                  │
└──────────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

**NestJS over plain Express**
NestJS's dependency injection container, module system, decorator-based validation, and first-class Swagger/OpenAPI support enforce the Controller → Service → Repository pattern architecturally. The same DTOs that validate incoming requests also generate the living API documentation — eliminating drift between code and docs.

**Separate `transactions` Collection (Append-Only Audit Log)**
Every payment event from Razorpay and Stripe is persisted verbatim in a `transactions` collection with the gateway event ID as a unique index. This provides idempotency (duplicate webhook events find an existing record and short-circuit), a complete audit trail for disputes, and the ability to replay webhooks safely in development.

**Denormalized `amountRaised` and `donorCount` on Campaigns**
Rather than aggregating the `donations` collection on every campaign page load, `amountRaised` and `donorCount` are maintained as atomic `$inc` fields on the `Campaign` document, updated in the same write as the donation status change. Campaign page reads become a single indexed document fetch.

**Token-in-Memory Pattern**
The JWT access token lives exclusively in the Zustand `authStore` — never `localStorage` or `sessionStorage`. The refresh token is stored in an HTTP-only, `Secure`, `SameSite=Strict` cookie, inaccessible to JavaScript. This simultaneously eliminates XSS-based access token theft and CSRF-based refresh token abuse.

**Shared `packages/shared` Package**
Zod schemas, TypeScript interfaces, and constants live in a monorepo-internal shared package imported by both `apps/web` and `apps/api`. The `CreateCampaignDto` validated on the backend and the Zod resolver powering the frontend form are the same file — client and server validation are always in sync.

**Fail-Open Redis**
All Redis operations are wrapped in try/catch. A Redis outage degrades FundBlaze to direct MongoDB reads rather than a hard failure. The `X-Cache: MISS` response header signals the bypass to monitoring tools.

---

## 🗄 Database Schema

### Collections Overview

#### `users`

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `_id` | ObjectId | PK | Auto-generated |
| `name` | String | required, trim, maxLength 100 | Display name |
| `email` | String | required, unique, lowercase, indexed | Regex validated |
| `password` | String | required, `select: false` | bcrypt-10 hashed in pre-save hook; never returned by default |
| `role` | Enum | `['donor', 'creator', 'admin']`, default `'donor'` | RBAC |
| `bio` | String | optional, maxLength 300 | |
| `avatarUrl` | String | optional | Cloudinary CDN URL |
| `isActive` | Boolean | default `true` | Soft-delete flag |
| `isEmailVerified` | Boolean | default `false` | Gated on email verification flow |
| `lastSeen` | Date | auto-updated on login | |
| `timestamps` | Auto | `createdAt`, `updatedAt` | |

**Indexes:** unique on `email`; compound `{ role: 1, isActive: 1 }` for admin queries.

#### `campaigns`

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `slug` | String | unique, indexed | Generated from title via `slugify`; ObjectId suffix on collision |
| `title` | String | required, maxLength 100, text index | Full-text search field |
| `description` | String | required, maxLength 500 | Short summary shown on cards |
| `story` | String | required | HTML from rich editor; rendered on detail page |
| `creator` | ObjectId | ref: `User`, indexed | |
| `category` | ObjectId | ref: `Category`, indexed | |
| `tags` | [String] | max 5 items, indexed | |
| `goalAmount` | Number | required, min 1 | |
| `currency` | Enum | `['INR', 'USD']`, required | Determines which payment gateway is used |
| `amountRaised` | Number | default 0 | Denormalized; updated atomically via `$inc` |
| `donorCount` | Number | default 0 | Denormalized |
| `deadline` | Date | required | Max 90 days from creation |
| `status` | Enum | `['draft', 'active', 'funded', 'expired', 'cancelled']` | |
| `isFeatured` | Boolean | default `false` | Admin-only toggle |
| `coverImageUrl` | String | required | Cloudinary CDN URL |
| `videoUrl` | String | optional | YouTube/Vimeo embed URL |
| `rewardTiers` | [Object] | optional | Array of `{ title, minAmount, description }` |
| `trendScore` | Number | default 0 | Updated by cron job; drives Redis sorted set |
| `isDeleted` | Boolean | default `false` | Soft-delete |
| `timestamps` | Auto | `createdAt`, `updatedAt` | |

**Indexes:** `{ slug: 1 }` unique; `{ creator: 1, status: 1 }`; `{ category: 1, status: 1 }`; `{ deadline: 1 }` (expiry cron); `{ trendScore: -1 }` (trending); `{ title: 'text', description: 'text' }` (full-text search).

#### `donations`

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `campaign` | ObjectId | ref: `Campaign`, required, indexed | |
| `donor` | ObjectId | ref: `User`, required, indexed | |
| `amount` | Number | required, min 1 | |
| `currency` | Enum | `['INR', 'USD']`, required | |
| `gateway` | Enum | `['razorpay', 'stripe']`, required | |
| `gatewayOrderId` | String | required, indexed | Razorpay order ID or Stripe PaymentIntent ID |
| `gatewayPaymentId` | String | indexed | Filled on confirmation |
| `status` | Enum | `['pending', 'confirmed', 'failed', 'refunded']`, default `'pending'` | |
| `isAnonymous` | Boolean | default `false` | Hides donor name on public donor list |
| `message` | String | optional, maxLength 200 | Donor's public message |
| `idempotencyKey` | String | unique | Client-generated UUID preventing duplicate submissions |
| `timestamps` | Auto | `createdAt`, `updatedAt` | |

**Indexes:** `{ campaign: 1, status: 1, createdAt: -1 }` (campaign donor list); `{ donor: 1, createdAt: -1 }` (donor history); `{ idempotencyKey: 1 }` unique.

#### `transactions`

Append-only audit log. Never mutated after insert.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `donation` | ObjectId | ref: `Donation` | May be null for failed pre-donation events |
| `event` | String | required | e.g. `'payment.captured'`, `'payment.failed'` |
| `gateway` | String | required | `'razorpay'` or `'stripe'` |
| `gatewayEventId` | String | unique, indexed | Gateway-provided event/payment ID; enforces idempotency |
| `payload` | Mixed | required | Full raw webhook payload stored verbatim |
| `createdAt` | Date | auto | |

#### `notifications`

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `user` | ObjectId | ref: `User`, required, indexed | Recipient |
| `type` | Enum | `['donation_received', 'campaign_funded', 'milestone', 'system']` | |
| `title` | String | required | |
| `message` | String | required | |
| `isRead` | Boolean | default `false` | |
| `metadata` | Object | optional | `{ campaignId?, donationId? }` for deep-links |
| `timestamps` | Auto | `createdAt`, `updatedAt` | |

**Indexes:** `{ user: 1, isRead: 1, createdAt: -1 }` (unread-first list).

#### `categories`

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `name` | String | required, unique | |
| `slug` | String | required, unique | |
| `icon` | String | optional | Lucide icon name |

#### `refreshTokens`

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `user` | ObjectId | ref: `User`, indexed | |
| `tokenHash` | String | required, indexed | SHA-256 hash of the raw refresh token |
| `expiresAt` | Date | required | TTL index auto-deletes expired documents |

**Indexes:** `{ expiresAt: 1 }` TTL; `{ tokenHash: 1 }` for O(1) blacklist lookup.

### Relationship Diagram

```
User (1) ──────────── (N) Campaign        [creator field]
User (1) ──────────── (N) Donation        [donor field]
Campaign (1) ──────── (N) Donation        [campaign field]
Donation (1) ──────── (N) Transaction     [donation field — audit trail]
Campaign (N) ──────── (1) Category        [category field]
User (1) ──────────── (N) Notification    [user field]
```

---

## 📡 API Documentation

All endpoints are prefixed with `/api/v1`. Full interactive Swagger documentation is available at `/api/docs`. All successful responses follow the shape produced by `TransformInterceptor`:

```json
{
  "data": { },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "hasMore": true
  }
}
```

Error responses:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "email must be a valid email address" }]
}
```

### Auth Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/signup` | ❌ | Register a new user and receive token pair |
| `POST` | `/auth/login` | ❌ | Authenticate and receive token pair |
| `POST` | `/auth/refresh` | Cookie | Rotate refresh token, issue new access token |
| `POST` | `/auth/logout` | ✅ | Blacklist refresh token and clear cookie |
| `GET` | `/auth/me` | ✅ | Get authenticated user's profile |

**POST `/auth/signup`**

```json
// Request
{
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "password": "SecurePass1!",
  "role": "creator"
}

// Response 201
{
  "data": {
    "accessToken": "eyJhbGci...",
    "user": {
      "_id": "64f3a2b1c8d4e5f6a7b8c9d0",
      "name": "Priya Sharma",
      "email": "priya@example.com",
      "role": "creator"
    }
  }
}
// HTTP-only cookie: refreshToken=<token>; Path=/api/v1/auth/refresh; SameSite=Strict; Secure
```

### Campaign Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/campaigns` | ❌ | Cursor-paginated campaign list with filters |
| `GET` | `/campaigns/trending` | ❌ | Top 10 campaigns by Redis trend score |
| `GET` | `/campaigns/:slug` | ❌ | Single campaign detail by slug |
| `POST` | `/campaigns` | ✅ Creator | Create a new campaign |
| `PUT` | `/campaigns/:id` | ✅ Owner | Update own campaign |
| `DELETE` | `/campaigns/:id` | ✅ Owner/Admin | Soft-delete a campaign |
| `GET` | `/campaigns/:id/donations` | ✅ Owner | Paginated donation list for a campaign |
| `POST` | `/campaigns/:id/feature` | ✅ Admin | Toggle featured status |

**GET `/campaigns?category=tech&sort=trending&q=solar&cursor=<objectId>&limit=20`**

```json
// Response 200
{
  "data": [
    {
      "_id": "64f3a2b1...",
      "slug": "solar-school-project",
      "title": "Solar Power for Rural Schools",
      "description": "Bringing renewable energy to 50 schools in Rajasthan.",
      "creator": { "name": "Priya Sharma", "avatarUrl": "https://res.cloudinary.com/..." },
      "category": { "name": "Education", "slug": "education" },
      "goalAmount": 500000,
      "amountRaised": 312000,
      "donorCount": 148,
      "currency": "INR",
      "deadline": "2025-03-15T00:00:00.000Z",
      "coverImageUrl": "https://res.cloudinary.com/...",
      "status": "active"
    }
  ],
  "meta": { "nextCursor": "64f3a2b0...", "hasMore": true, "count": 20 }
}
```

### Donation & Payment Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/donations/initiate` | ✅ | Create a payment order (Razorpay or Stripe) |
| `POST` | `/payments/razorpay/verify` | ✅ | Verify Razorpay signature and confirm donation |
| `POST` | `/payments/razorpay/webhook` | ❌ (signature verified) | Razorpay async payment events |
| `POST` | `/payments/stripe/webhook` | ❌ (signature verified) | Stripe async payment events |
| `GET` | `/donations/my` | ✅ | Paginated donor's own donation history |
| `GET` | `/donations/campaign/:id` | ✅ Creator | All donations for a creator's campaign |

**POST `/donations/initiate`**

```json
// Request
{
  "campaignId": "64f3a2b1...",
  "amount": 1000,
  "currency": "INR",
  "gateway": "razorpay",
  "isAnonymous": false,
  "message": "Keep up the amazing work!",
  "idempotencyKey": "a3f7b2c1-4d9e-..."
}

// Response 201
{
  "data": {
    "donationId": "64f3a2b2...",
    "orderId": "order_OzFMf...",
    "amount": 1000,
    "currency": "INR",
    "keyId": "rzp_live_..."
  }
}
```

### Other Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/users/:id` | ❌ | Public profile (no sensitive fields) |
| `GET` | `/users/:id/campaigns` | ❌ | Paginated campaigns created by user |
| `PUT` | `/users/me` | ✅ | Update own profile (name, bio) |
| `PUT` | `/users/me/avatar` | ✅ | Upload avatar via Cloudinary |
| `PUT` | `/users/me/password` | ✅ | Change password (requires current password) |
| `DELETE` | `/users/me` | ✅ | Soft-delete own account |
| `POST` | `/uploads/image` | ✅ | Upload a single image to Cloudinary |
| `GET` | `/search?q=&type=campaigns\|creators` | ❌ | Full-text search |
| `GET` | `/notifications` | ✅ | Paginated notifications, unread first |
| `PUT` | `/notifications/read-all` | ✅ | Mark all notifications as read |
| `PUT` | `/notifications/:id/read` | ✅ | Mark one notification as read |
| `GET` | `/health` | ❌ | Service health check (`{ status, db, redis, timestamp }`) |

### Socket.io Events

| Namespace | Event | Direction | Payload | Room |
|---|---|---|---|---|
| `/campaigns` | `join_campaign` | Client → Server | `{ campaignId: string }` | `campaign:<id>` |
| `/campaigns` | `leave_campaign` | Client → Server | `{ campaignId: string }` | `campaign:<id>` |
| `/campaigns` | `donation_confirmed` | Server → Client | `{ campaignId, amount, currency, donorName?, message?, amountRaised, donorCount }` | `campaign:<id>` |
| `/campaigns` | `campaign_funded` | Server → Client | `{ campaignId, title, amountRaised }` | `campaign:<id>` |
| `/campaigns` | `milestone_reached` | Server → Client | `{ campaignId, percentage }` | `campaign:<id>` |
| `/notifications` | `new_notification` | Server → Client | `{ _id, type, title, message }` | `user:<id>` |

---

## 🔐 Authentication & Security

### Dual-Token Architecture

FundBlaze implements a two-token JWT system with automatic rotation on every refresh:

```
┌─────────────┐          ┌──────────────────────────────────────────────┐
│   Client    │          │                  Server                      │
│             │──login──►│  Issues: accessToken (15m, HS256)            │
│  Zustand    │          │  + refreshToken (7d, HTTP-only cookie)       │
│  authStore  │◄─token───│  Stores SHA-256(refreshToken) in Redis       │
│  (memory)   │          │                                              │
│             │          │                                              │
│  Every API  │──Bearer──►  JwtAuthGuard: verify signature +            │
│  call       │          │  decode payload (no DB round-trip)           │
│             │          │                                              │
│  Token      │──cookie──►  POST /auth/refresh                         │
│  expires →  │          │  ├─ Verify refresh token signature           │
│  queue all  │◄─new────│  ├─ Lookup SHA-256 hash in Redis             │
│  requests   │  tokens  │  ├─ Blacklist OLD hash (rotation)            │
│             │          │  └─ Issue new token pair                     │
└─────────────┘          └──────────────────────────────────────────────┘
```

### RBAC Permission Matrix

| Resource | Guest | Donor | Creator | Admin |
|---|---|---|---|---|
| Browse campaigns | ✅ | ✅ | ✅ | ✅ |
| View campaign detail | ✅ | ✅ | ✅ | ✅ |
| Donate to a campaign | ❌ | ✅ | ✅ | ✅ |
| Create a campaign | ❌ | ❌ | ✅ | ✅ |
| Edit own campaign | ❌ | ❌ | ✅ | ✅ |
| View own donation history | ❌ | ✅ | ✅ | ✅ |
| View campaign donor list | ❌ | ❌ | ✅ (own) | ✅ |
| Feature a campaign | ❌ | ❌ | ❌ | ✅ |
| Manage all users | ❌ | ❌ | ❌ | ✅ |

### Security Measures

**Password Security** — bcrypt with cost factor 10. Hashing is enforced in the Mongoose pre-save hook — no controller code path can skip it. The `password` field carries `select: false`, making it impossible to accidentally leak via a lean query.

**Token Security** — Refresh tokens are SHA-256 hashed before storage in Redis. The hash's TTL matches the token's remaining lifetime, so Redis auto-evicts expired entries. Each refresh consumes the old token and issues a new one (single-use rotation), meaning a stolen refresh token becomes invalid the moment the legitimate user triggers a refresh.

**Transport Security** — Helmet sets `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`. The refresh token cookie carries `Secure: true` in production and `SameSite=Strict`, preventing transmission over HTTP and neutralizing CSRF.

**Injection Prevention** — `class-validator` and `class-transformer` enforce DTO shapes at the NestJS global `ValidationPipe`. Mongoose parameterized queries prevent NoSQL injection. Helmet's `xssFilter` and `contentSecurityPolicy` headers prevent reflected XSS.

**Rate Limiting** — Per-route limits enforced by `@nestjs/throttler`:

| Route | Limit |
|---|---|
| `POST /auth/login` | 5 req / 15 min per IP |
| `POST /auth/signup` | 10 req / hour per IP |
| `POST /donations/*` | 20 req / min per IP |
| Global API | 500 req / 15 min per IP |

**Webhook Security** — Razorpay webhooks are verified via `crypto.createHmac('sha256', secret)` against the `X-Razorpay-Signature` header. Stripe webhooks are verified via `stripe.webhooks.constructEvent()` against the `Stripe-Signature` header. Both handlers reject any request that fails verification with HTTP 400 before touching any application state.

**OWASP Top 10 Coverage**

| OWASP | Threat | Mitigation |
|---|---|---|
| A01 | Broken Access Control | `JwtAuthGuard` + `RolesGuard` + `@Roles()` on every protected route |
| A02 | Cryptographic Failures | bcrypt-10, HTTPS-only cookies, HS256 with 64-char secrets |
| A03 | Injection | `class-validator` DTOs, `ValidationPipe`, parameterized Mongoose queries |
| A04 | Insecure Design | Dual-token arch, refresh rotation, single-use tokens, RBAC |
| A05 | Security Misconfiguration | Helmet headers, strict CORS, `X-Powered-By` removed |
| A07 | Auth Failures | Rate limiting, no user enumeration, timing-safe token comparison |
| A08 | Data Integrity | JWT signing, DTO validation on all inputs, webhook signature verification |
| A09 | Logging & Monitoring | Pino structured logs with request IDs, Sentry error aggregation |

---

## 💳 Payment Processing

### Razorpay Flow (INR)

```
Client                          Server                         Razorpay
  │                                │                               │
  │── POST /donations/initiate ───►│                               │
  │                                │── createOrder() ─────────────►│
  │                                │◄── { orderId, amount } ───────│
  │◄── { orderId, keyId } ─────────│                               │
  │                                │                               │
  │── Razorpay.open(orderId) ──────────────────────────────────────►│
  │◄── onSuccess({ paymentId, signature }) ────────────────────────│
  │                                │                               │
  │── POST /payments/razorpay/verify ──►│                          │
  │                                │  verifyHmacSignature()        │
  │                                │  mark donation CONFIRMED      │
  │                                │  $inc amountRaised            │
  │                                │  emit Socket.io event         │
  │◄── { success: true } ──────────│                               │
  │                                │                               │
  │          (async)               │◄── webhook: payment.captured──│
  │                                │  gatewayEventId idempotency   │
  │                                │  append to transactions log   │
```

### Stripe Flow (USD / International)

```
Client                          Server                           Stripe
  │                                │                               │
  │── POST /donations/initiate ───►│                               │
  │                                │── createPaymentIntent() ─────►│
  │                                │◄── { clientSecret } ──────────│
  │◄── { clientSecret } ───────────│                               │
  │                                │                               │
  │── stripe.confirmCardPayment() ─────────────────────────────────►│
  │◄── { paymentIntent: 'succeeded' } ─────────────────────────────│
  │                                │                               │
  │          (async)               │◄── webhook: payment_intent    │
  │                                │         .succeeded            │
  │                                │  verifyStripeSignature()      │
  │                                │  mark donation CONFIRMED      │
  │                                │  $inc amountRaised            │
  │                                │  emit Socket.io event         │
```

---

## ⚡ Performance Optimization

### Caching Strategy

FundBlaze uses Redis as a read-through cache with surgical key invalidation:

```
Request
   │
   ▼
Redis Cache (sub-millisecond)
   │ HIT → return instantly, set X-Cache: HIT
   │ MISS ↓
MongoDB (indexed query)
   │
   ▼
Store in Redis with TTL
   │
   ▼
Return response, set X-Cache: MISS
```

| Cache Key | TTL | Invalidated On |
|---|---|---|
| `campaigns:trending` | 300s | New donation confirmed, new campaign published |
| `campaign:<slug>` | 180s | Campaign updated, donation confirmed (amountRaised) |
| `campaigns:category:<slug>:<cursor>` | 60s | New campaign in category published |
| `user:<id>:profile` | 300s | Profile updated, avatar changed |
| `user:<id>:campaigns:<cursor>` | 120s | Campaign created/updated/deleted by user |
| `categories:all` | 3600s | Admin updates category list |
| `donations:campaign:<id>:<cursor>` | 60s | New donation confirmed for campaign |

### Redis Trending Sorted Set

The trending algorithm maintains a Redis Sorted Set `campaigns:trending:zset` where each member is a campaign ID scored by a composite trend score (donation velocity × recency decay). On every confirmed donation, the campaign's score is updated atomically via `ZINCRBY`. The `/campaigns/trending` endpoint reads the top 10 IDs from the sorted set (O(log n + k)) and resolves the full documents in a single `$in` query — no aggregation pipeline required.

### Database Query Optimization

**Cursor pagination** replaces offset pagination entirely. The query `{ _id: { $lt: cursor }, status: 'active', isDeleted: false }` hits the compound index directly — O(log n) regardless of collection size.

**Lean queries** (`.lean()`) are used for all read-only list operations, returning plain JavaScript objects. This eliminates Mongoose document hydration overhead and reduces memory allocation by 40–60% for large result sets.

**Projection** limits fetched fields to exactly what the response DTO requires. Campaign card projections exclude `story` (potentially large HTML), `rewardTiers`, and internal admin fields.

**Parallel execution** via `Promise.all()` is applied wherever independent queries exist. The campaign detail service fetches the campaign document and the first page of donations in parallel, cutting response time nearly in half.

### Frontend Performance

**Infinite scroll** — `useInfiniteQuery` with a cursor-based next-page fetcher loads campaigns in batches of 20. An `IntersectionObserver` sentinel fires the next fetch 200 px before the user reaches the bottom.

**Code splitting** — Every page component is wrapped in `React.lazy()` and loaded on demand. The initial bundle contains only the router, auth store, and shell layout.

**Optimistic UI** — TanStack Query's `onMutate` / rollback pattern makes donation initiation, notification reads, and profile edits feel instantaneous with no spinners.

**Framer Motion `LazyMotion`** with the `domAnimation` feature bundle reduces the animation runtime import to ~18 KB instead of the full ~35 KB build.

---

## 🚀 Installation & Setup

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 20 LTS or later |
| npm | 10.x or later |
| MongoDB | Atlas cluster or local 7.x |
| Redis | 7.x (local or Upstash free tier) |
| Docker | 24.x (optional, for containerized setup) |
| Cloudinary account | Free tier sufficient for development |
| Razorpay account | Test mode keys required |
| Stripe account | Test mode keys required |

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/fundblaze.git
cd fundblaze
```

### 2. Install All Dependencies

```bash
# From the monorepo root (installs web, api, and shared packages)
npm install
```

### 3. Backend Setup

```bash
cd apps/api

# Copy environment variables
cp .env.example .env
# Edit .env with your values (see Environment Variables section)

# Start development server with hot reload
npm run start:dev
```

The API will be available at `http://localhost:5000` and Swagger docs at `http://localhost:5000/api/docs`.

### 4. Frontend Setup

```bash
cd apps/web

# Copy environment variables
cp .env.example .env
# Edit .env with your values

# Start Vite dev server with MSW mock API
npm run dev
```

The frontend will be available at `http://localhost:5173`. With `VITE_USE_MSW=true`, all API calls are intercepted by Mock Service Worker — no running backend required for UI development.

### 5. Docker Compose (Recommended for Local Full-Stack)

Spin up MongoDB, Redis, API, and frontend together:

```bash
# From the project root
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env

docker-compose up -d

# View API logs
docker-compose logs -f api

# Stop all services
docker-compose down
```

| Service | URL |
|---|---|
| Frontend | `http://localhost:5173` |
| Backend API | `http://localhost:5000/api/v1` |
| Swagger Docs | `http://localhost:5000/api/docs` |
| MongoDB | `mongodb://localhost:27017` |
| Redis | `redis://localhost:6379` |

### Makefile Shortcuts

```bash
make up           # Start all services via Docker Compose
make down         # Stop all services
make logs         # Tail logs from all services
make test-api     # Run backend test suite
make test-web     # Run frontend test suite
make test-e2e     # Run Playwright end-to-end tests
make shell-api    # Open a shell in the API container
make clean        # Stop services and remove volumes (wipes DB + Redis)
make build        # Rebuild all Docker images from scratch
make lint         # Run ESLint across both apps
```

---

## 🔑 Environment Variables

### Backend (`apps/api/.env`)

```bash
# ── Server ─────────────────────────────────────────────────────────────
NODE_ENV=development              # REQUIRED | development | production | test
PORT=5000                         # REQUIRED | HTTP server port

# ── Database ───────────────────────────────────────────────────────────
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/  # REQUIRED
MONGO_DB_NAME=fundblaze                                     # REQUIRED

# ── Redis ──────────────────────────────────────────────────────────────
REDIS_URL=redis://localhost:6379   # REQUIRED | Use Upstash URL in production

# ── JWT ────────────────────────────────────────────────────────────────
# Minimum 32 characters. Generate with: openssl rand -hex 32
JWT_ACCESS_SECRET=your_access_secret_minimum_32_chars        # REQUIRED
JWT_REFRESH_SECRET=your_refresh_secret_minimum_32_chars      # REQUIRED
JWT_ACCESS_EXPIRY=15m              # REQUIRED | Access token lifetime
JWT_REFRESH_EXPIRY=7d              # REQUIRED | Refresh token lifetime

# ── CORS ───────────────────────────────────────────────────────────────
CLIENT_ORIGIN=http://localhost:5173  # REQUIRED | Frontend URL for CORS whitelist

# ── Payments: Razorpay ─────────────────────────────────────────────────
RAZORPAY_KEY_ID=rzp_test_...        # REQUIRED
RAZORPAY_KEY_SECRET=...             # REQUIRED
RAZORPAY_WEBHOOK_SECRET=...         # REQUIRED | From Razorpay dashboard

# ── Payments: Stripe ───────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_...       # REQUIRED
STRIPE_WEBHOOK_SECRET=whsec_...     # REQUIRED | From Stripe CLI or dashboard

# ── Media: Cloudinary ──────────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=...           # REQUIRED
CLOUDINARY_API_KEY=...              # REQUIRED
CLOUDINARY_API_SECRET=...           # REQUIRED

# ── Email: Nodemailer ──────────────────────────────────────────────────
SMTP_HOST=smtp.gmail.com            # OPTIONAL | Defaults to console log in dev
SMTP_PORT=587                       # OPTIONAL
SMTP_USER=your@email.com            # OPTIONAL
SMTP_PASS=...                       # OPTIONAL
EMAIL_FROM=noreply@fundblaze.io     # OPTIONAL

# ── Monitoring ─────────────────────────────────────────────────────────
SENTRY_DSN=https://...              # OPTIONAL | Error tracking DSN
```

### Frontend (`apps/web/.env`)

```bash
VITE_API_URL=http://localhost:5000         # REQUIRED | Backend API base URL
VITE_SOCKET_URL=http://localhost:5000      # REQUIRED | Socket.io server URL
VITE_APP_NAME=FundBlaze                    # REQUIRED
VITE_RAZORPAY_KEY_ID=rzp_test_...         # REQUIRED | Public Razorpay key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...   # REQUIRED | Public Stripe key
VITE_USE_MSW=true                          # OPTIONAL | Enable MSW mock API (dev only)
VITE_SENTRY_DSN=https://...               # OPTIONAL | Frontend error tracking
```

> ⚠️ **Never commit `.env` files.** They are excluded by `.gitignore` and `.dockerignore`. In production, all secrets are injected via Render environment variables or GitHub Actions Secrets — they never touch the filesystem.

---

## 📂 Project Structure

```
fundblaze/
├── apps/
│   ├── web/                              # React 18 / Vite frontend
│   │   ├── public/
│   │   │   └── mockServiceWorker.js      # MSW service worker for dev mocking
│   │   ├── src/
│   │   │   ├── main.tsx                  # ReactDOM.createRoot entry point
│   │   │   ├── App.tsx                   # QueryClientProvider, router, Toaster, auth init
│   │   │   ├── components/
│   │   │   │   ├── ui/                   # Design system: Button, Input, Badge, Modal, Skeleton…
│   │   │   │   ├── layout/               # Navbar, Footer, Sidebar, PageWrapper
│   │   │   │   ├── campaign/             # CampaignCard, ProgressBar, CountdownTimer, DonorList
│   │   │   │   ├── donation/             # DonationModal, AmountSelector, PaymentForm
│   │   │   │   ├── dashboard/            # StatsCard, DonationChart, CampaignTable
│   │   │   │   ├── search/               # SearchBar, SearchResults, CategoryFilter
│   │   │   │   └── auth/                 # ProtectedRoute, GuestRoute
│   │   │   ├── pages/
│   │   │   │   ├── HomePage.tsx          # Hero, trending campaigns, categories, CTA
│   │   │   │   ├── ExplorePage.tsx       # Search, filter, infinite scroll campaign grid
│   │   │   │   ├── CampaignDetailPage.tsx# Story/Updates/Donors tabs + sticky donation panel
│   │   │   │   ├── CreateCampaignPage.tsx# Multi-step form with draft auto-save
│   │   │   │   ├── EditCampaignPage.tsx
│   │   │   │   ├── DashboardPage.tsx     # Creator analytics dashboard
│   │   │   │   ├── ProfilePage.tsx
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   ├── SignupPage.tsx
│   │   │   │   └── NotFoundPage.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts            # Auth state + token refresh lifecycle
│   │   │   │   ├── useCampaigns.ts       # TanStack Query campaign fetchers
│   │   │   │   ├── useDonation.ts        # Donation initiation + payment verification
│   │   │   │   ├── useSocket.ts          # Socket.io connection + room lifecycle
│   │   │   │   ├── useInfiniteScroll.ts  # IntersectionObserver sentinel hook
│   │   │   │   └── useDebounce.ts
│   │   │   ├── services/
│   │   │   │   ├── api.ts                # Axios instance + interceptors + refresh queue
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── campaign.service.ts
│   │   │   │   ├── donation.service.ts
│   │   │   │   └── payment.service.ts    # Razorpay + Stripe client-side SDK wrappers
│   │   │   ├── store/
│   │   │   │   ├── authStore.ts          # JWT access token, user object, role
│   │   │   │   ├── uiStore.ts            # Theme, sidebar, modal state
│   │   │   │   └── campaignStore.ts      # Draft auto-save, explore filter state
│   │   │   ├── mocks/
│   │   │   │   ├── handlers/             # MSW request handlers per feature
│   │   │   │   ├── fixtures/             # Realistic seed data: users, campaigns, donations
│   │   │   │   └── browser.ts            # MSW browser setup entry
│   │   │   ├── types/                    # TypeScript interfaces: campaign, user, donation, payment
│   │   │   ├── schemas/                  # Zod schemas for form validation
│   │   │   ├── utils/                    # formatCurrency, formatDate, calculateProgress, cn()
│   │   │   └── router/index.tsx          # createBrowserRouter with lazy-loaded routes
│   │   ├── e2e/                          # Playwright end-to-end test specs
│   │   ├── Dockerfile                    # Multi-stage: Vite build → Nginx alpine
│   │   ├── nginx.conf                    # SPA routing, gzip, asset caching, API proxy
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts            # Blaze Dark theme extensions
│   │   ├── vitest.config.ts
│   │   └── .env.example
│   │
│   └── api/                              # NestJS backend
│       ├── src/
│       │   ├── main.ts                   # Bootstrap: listen, Swagger setup, global pipes/filters
│       │   ├── app.module.ts             # Root module: imports all feature modules
│       │   ├── config/                   # Per-service config factories (DB, Redis, JWT, Cloudinary…)
│       │   ├── common/
│       │   │   ├── decorators/           # @CurrentUser(), @Roles(), @Public()
│       │   │   ├── guards/               # JwtAuthGuard, RolesGuard, WsAuthGuard
│       │   │   ├── interceptors/         # TransformInterceptor, LoggingInterceptor, TimeoutInterceptor
│       │   │   ├── filters/              # AllExceptionsFilter, MongooseExceptionFilter
│       │   │   ├── pipes/                # ValidationPipe, MongoIdPipe
│       │   │   └── utils/                # slugify, idempotency helpers, pagination utils
│       │   ├── modules/
│       │   │   ├── auth/                 # signup, login, refresh, logout + JWT strategies
│       │   │   ├── users/                # Profile CRUD, avatar upload, password change
│       │   │   ├── campaigns/            # Campaign CRUD, trending, search, featured toggle
│       │   │   ├── donations/            # Donation history, campaign donor lists
│       │   │   ├── payments/
│       │   │   │   ├── razorpay/         # Order creation, signature verification, webhook handler
│       │   │   │   └── stripe/           # PaymentIntent creation, webhook handler
│       │   │   ├── uploads/              # Cloudinary upload endpoint
│       │   │   ├── notifications/        # Notification CRUD + Nodemailer email service
│       │   │   └── realtime/             # CampaignGateway (Socket.io) with Redis adapter
│       │   └── database/                 # DatabaseModule: Mongoose + connection factory
│       ├── test/                         # Jest + Supertest E2E specs
│       ├── Dockerfile                    # Multi-stage: builder (tsc) → runner (alpine, non-root)
│       ├── nest-cli.json
│       └── .env.example
│
├── packages/
│   └── shared/                           # Shared TypeScript types, Zod schemas, constants
│       ├── src/
│       │   ├── types/                    # IUser, ICampaign, IDonation — single source of truth
│       │   ├── schemas/                  # Zod schemas imported by both web and api
│       │   └── constants/               # APP_ROUTES, MAX_GOAL_AMOUNT, CURRENCY_OPTIONS
│       └── package.json
│
├── docker/
│   ├── mongo-init.js                     # MongoDB init script (DB user, seed indexes)
│   └── redis.conf                        # Redis config (appendonly, maxmemory-policy)
│
├── docker-compose.yml                    # Local dev: mongodb, redis, api (hot-reload), web
├── docker-compose.prod.yml               # Production sim: no source mounts, resource limits
├── playwright.config.ts                  # E2E base URL, browsers, retries config
├── Makefile                              # Developer convenience commands
└── .github/
    └── workflows/
        ├── ci.yml                        # lint + typecheck + test (parallel jobs)
        ├── deploy.yml                    # build → push Docker Hub → deploy Render + Vercel
        └── pr-preview.yml               # Vercel PR preview environment deployments
```

---

## 🐳 Deployment

### Local Docker Compose

```bash
# Build and start all services
docker-compose up -d --build

# Check service health
docker-compose ps

# View API logs
docker-compose logs -f api
```

### Production: Render (Backend) + Vercel (Frontend)

#### Backend — Render Docker Web Service

1. Connect your GitHub repository to Render.
2. Select **Docker** as the environment; set the Dockerfile path to `apps/api/Dockerfile`.
3. Set all environment variables from `apps/api/.env.example` in the Render dashboard.
4. Set the **Health Check Path** to `/api/v1/health`.
5. Render automatically deploys on every push to `main` after CI passes.

```bash
# Trigger a manual deploy via the Render deploy hook
curl -X POST $RENDER_DEPLOY_HOOK_URL

# Poll until the new instance is healthy (done automatically by deploy.yml)
curl https://api.fundblaze.io/api/v1/health
```

#### Frontend — Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Link project (first time)
cd apps/web && vercel link

# Deploy to production
vercel build --prod
vercel deploy --prebuilt --prod

# Or simply push to main — Vercel auto-deploys on every push
```

Set `VITE_API_URL`, `VITE_SOCKET_URL`, `VITE_RAZORPAY_KEY_ID`, and `VITE_STRIPE_PUBLISHABLE_KEY` in the Vercel project's environment variable settings.

#### Docker Image — Multi-Platform Build

```bash
# Build for both amd64 (Render) and arm64 (Apple Silicon dev)
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t fundblaze/api:$(git rev-parse --short HEAD) \
  -t fundblaze/api:latest \
  --push \
  ./apps/api
```

### CI/CD Pipeline (GitHub Actions)

Every push to `main` triggers the full pipeline:

```
push to main
     │
     ├── lint-and-typecheck (web + api in parallel)
     │
     ├── test-backend
     │   ├── MongoDB 7 + Redis 7 service containers
     │   ├── Jest unit tests
     │   ├── Supertest E2E API tests
     │   └── Upload coverage → Codecov
     │
     ├── test-frontend
     │   ├── Vitest + RTL component tests
     │   └── Upload coverage → Codecov
     │
     ├── build-docker
     │   ├── Multi-platform buildx (amd64 + arm64)
     │   └── Push fundblaze/api:<sha> + :latest to Docker Hub
     │
     └── deploy-production (sequential)
         ├── Trigger Render deploy hook
         ├── Poll /api/v1/health every 10s (5 min timeout)
         ├── vercel deploy --prebuilt --prod (frontend)
         ├── Smoke test: assert HTTP 200 from /api/v1/health
         └── Notify Slack (success or failure with commit SHA)
```

Pull requests additionally trigger **Vercel Preview Deployments** — each PR gets a unique `https://fundblaze-pr-<number>.vercel.app` URL for reviewer testing.

---

## 🧪 Testing

### Backend Tests

```bash
cd apps/api

# Run all tests
npm test

# Run with coverage report
npm test -- --coverage

# Run only unit tests
npm run test:unit

# Run only E2E (integration) tests
npm run test:e2e

# Run a specific test file
npm run test:e2e -- campaigns.e2e-spec.ts

# Watch mode during development
npm run test:watch
```

### Frontend Tests

```bash
cd apps/web

# Run all component and hook tests
npm run test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### End-to-End Tests (Playwright)

```bash
# Install Playwright browsers (first time)
npx playwright install --with-deps chromium firefox

# Run all E2E tests (requires running local stack)
npx playwright test

# Run with headed browser
npx playwright test --headed

# Run a specific spec file
npx playwright test e2e/donation-flow.spec.ts

# Open the interactive HTML report
npx playwright show-report
```

### Test Coverage Targets

| Layer | Target | Critical Paths |
|---|---|---|
| Backend unit tests | 80% line coverage | 100% for auth, payment verification, webhook handlers |
| Backend E2E tests | All API routes | Full donation flow: initiate → verify → webhook |
| Frontend components | 70% coverage | CampaignCard, ProgressBar, DonationModal, auth pages |
| E2E journeys | 8 critical paths | Register → create campaign → donate → webhook → real-time update |

---

## 🔧 Troubleshooting

**`Error: JWT_ACCESS_SECRET must be at least 32 characters`**
Your `apps/api/.env` is missing or has a truncated secret. Run `openssl rand -hex 32` to generate a valid 64-character hex secret and paste it into the `.env` file.

**`MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`**
MongoDB is not running. Either start it locally (`mongod`) or verify your Atlas `MONGO_URI` is correct and your Atlas Network Access whitelist includes your current IP address (`0.0.0.0/0` for development).

**`Redis connection error: connect ECONNREFUSED 127.0.0.1:6379`**
Redis is not running. Start it with `redis-server` or point `REDIS_URL` to an Upstash instance. FundBlaze degrades gracefully — the API will start, but caching, trending sorted sets, and multi-instance WebSocket scaling will be unavailable.

**`Razorpay webhook: invalid signature`**
The `RAZORPAY_WEBHOOK_SECRET` in your `.env` does not match the secret configured in the Razorpay dashboard. Verify both and ensure there is no trailing whitespace in the env value.

**`Stripe webhook: No signatures found matching the expected signature`**
For local testing, use the Stripe CLI: `stripe listen --forward-to localhost:5000/api/v1/payments/stripe/webhook`. The CLI provides its own webhook signing secret that differs from the dashboard's `whsec_...` secret — set `STRIPE_WEBHOOK_SECRET` to the value the CLI prints on startup.

**CORS error in browser when calling the API**
Verify `CLIENT_ORIGIN` in `apps/api/.env` exactly matches the frontend origin including protocol and port (e.g., `http://localhost:5173`). Trailing slashes will cause a mismatch.

**Donation progress bar doesn't update in real-time**
Check the browser Network tab for a WebSocket connection to `ws://localhost:5000/campaigns`. If absent, verify `VITE_SOCKET_URL` is set and the `useSocket` hook's `join_campaign` event fires after page mount. Confirm the `donation_confirmed` Socket.io event is emitted inside the payment webhook handler.

**`docker-compose up` fails with port already in use**
A previous container or local process occupies port 5000, 5173, 27017, or 6379. Run `docker-compose down -v` and check `docker ps -a` for stale containers.

**MSW intercepts API calls in the deployed Vercel build**
Ensure `VITE_USE_MSW` is unset or explicitly `false` in your Vercel environment variables. MSW only activates when `import.meta.env.VITE_USE_MSW === 'true'`.

---

## ❓ FAQ

**Q: Why NestJS instead of plain Express?**
NestJS's dependency injection container, module system, and decorator-based DTOs enforce the Controller → Service → Repository pattern architecturally — not just by convention. The built-in Swagger integration generates living API documentation from the same DTOs used for validation, eliminating documentation drift as the API evolves.

**Q: Why both Razorpay and Stripe?**
Razorpay is the dominant gateway for Indian Rupee payments, offering UPI, net banking, and wallet support that Stripe does not provide in India. Stripe handles all international currencies. Shipping both from day one means FundBlaze serves creators targeting Indian donors (₹) and global audiences without any platform limitations.

**Q: How does the real-time progress bar update without polling?**
When a donation is confirmed, the Payments service calls `NotificationsService.emitDonationConfirmed()`, which emits a `donation_confirmed` Socket.io event to the `campaign:<id>` room. Every browser viewing that campaign page is subscribed to that room and receives the event instantly, updating `amountRaised` and `donorCount` with a Framer Motion spring animation — no polling, no page refresh.

**Q: How are duplicate webhook deliveries handled?**
Before processing any webhook event, the handler performs a `findOne({ gatewayEventId })` lookup on the `transactions` collection. If a document already exists for that event ID, the handler returns HTTP 200 immediately without changing any state. All webhook handlers are fully idempotent — safe to replay any number of times.

**Q: Why a monorepo?**
The `packages/shared` package allows Zod schemas, TypeScript types, and constants to be imported from a single source of truth by both the frontend and backend. A `CreateCampaignDto` schema validated server-side and the Zod resolver powering the frontend form step are literally the same object — runtime validation and compile-time types stay synchronized automatically.

**Q: Can FundBlaze run without Redis?**
Yes. Without Redis, the API starts normally: MongoDB queries run without a cache layer (higher latency), the trending endpoint falls back to a MongoDB aggregation, refresh tokens are stored in MongoDB, and Socket.io works in single-instance mode. Redis is strongly recommended for production but is not a hard startup dependency.

**Q: How do I test payments locally without real money?**
Razorpay provides test mode keys (`rzp_test_...`) that accept [documented test card numbers](https://razorpay.com/docs/payments/payments/test-card-upi-details/). Stripe provides test mode keys (`sk_test_...`) and the test card `4242 4242 4242 4242`. For webhooks, use the Stripe CLI (`stripe listen`) and Razorpay's dashboard webhook simulator.

---

## 🗺 Roadmap

### Phase 2 — In Progress

- [ ] **Comments & Updates** — creators post campaign updates; donors leave public comments with threaded replies
- [ ] **Reward Tier Fulfilment** — digital reward delivery tracking; creator marks tiers as fulfilled; donor receives email confirmation
- [ ] **Refunds** — admin-triggered partial and full refunds via Razorpay and Stripe APIs with donor notification
- [ ] **Email Verification** — mandatory verification gate before campaign creation with resend flow

### Phase 3 — Planned

- [ ] **Admin Dashboard** — platform-wide stats, campaign flagging queue, user management, payout oversight
- [ ] **OAuth Login** — Sign in with Google and GitHub via Passport.js strategies
- [ ] **Referral / Share Tracking** — UTM-based referral attribution on donations; creator sees which share links drove conversions
- [ ] **Payout Automation** — scheduled payout to creator's bank account when campaign ends funded
- [ ] **Campaign Analytics** — daily donation chart, donor geography heatmap, traffic source breakdown

### Phase 4 — Future

- [ ] **Mobile Apps** — React Native clients sharing the Zustand store and service layer
- [ ] **Recurring Donations** — Stripe Subscription-based monthly giving for long-running campaigns
- [ ] **Content Moderation** — AI-powered campaign screening via AWS Rekognition and OpenAI moderation API
- [ ] **Multi-language** — i18n with `react-i18next`, RTL layout support for Arabic and Hebrew
- [ ] **Equity Crowdfunding** — optional SAFE-note module for early-stage startup fundraising (regulatory compliance required)

---

## 🤝 Contributing

Contributions are welcome and appreciated. Please read through the guidelines before opening a pull request.

**Development workflow:**

```bash
# 1. Fork the repository and clone your fork
git clone https://github.com/<your-username>/fundblaze.git

# 2. Create a feature branch from develop
git checkout -b feature/my-feature develop

# 3. Make your changes and write tests
cd apps/api && npm test -- --coverage
cd apps/web && npm run test:coverage

# 4. Ensure linting and type-checking pass
npm run lint && npm run type-check

# 5. Commit with a conventional commit message
git commit -m "feat(payments): add Stripe PaymentElement for 3DS card support"

# 6. Push and open a pull request against develop
git push origin feature/my-feature
```

**Commit format** — FundBlaze uses [Conventional Commits](https://www.conventionalcommits.org): `type(scope): description`. Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`. Scopes: `auth`, `campaigns`, `donations`, `payments`, `realtime`, `ui`, `infra`.

**Branch strategy:**

| Branch | Purpose |
|---|---|
| `main` | Production-ready code. Every merge triggers a production deploy. |
| `develop` | Integration branch. All feature PRs target here. |
| `feature/*` | New features |
| `fix/*` | Bug fixes |
| `hotfix/*` | Critical production patches branched directly from `main` |

PRs must include test coverage for new functionality. PRs that lower the overall coverage percentage without justification will not be merged.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

## 📬 Contact

| | |
|---|---|
| **Project Lead** | [@your-handle](https://github.com/your-handle) |
| **GitHub Discussions** | [github.com/your-org/fundblaze/discussions](https://github.com/your-org/fundblaze/discussions) |
| **Bug Reports** | [github.com/your-org/fundblaze/issues](https://github.com/your-org/fundblaze/issues) |
| **Email** | hello@fundblaze.io |
| **Twitter / X** | [@FundBlazeApp](https://twitter.com/FundBlazeApp) |

---

<div align="center">

Built with ❤️ and ☕ — if FundBlaze helped you, consider giving it a ⭐

</div>
