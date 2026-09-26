# 📦 Amazon Clone — Production-Grade E-Commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.1.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.2-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.19-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.5.0-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Mongoose](https://img.shields.io/badge/Mongoose-8.2.1-red?style=flat-square&logo=mongoose)](https://mongoosejs.com/)
[![Redis](https://img.shields.io/badge/Redis-Optional%20%2F%20In--Memory%20Fallback-DC382D?style=flat-square&logo=redis)](https://redis.io/)
[![Zustand](https://img.shields.io/badge/Zustand-5.0.15-brown?style=flat-square)](https://zustand-demo.pmnd.rs/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=flat-square)]()
[![Type Safety](https://img.shields.io/badge/TypeScript-Strict%20Verified-success?style=flat-square)]()

An enterprise-grade, full-stack Amazon.com replica engineered with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **MongoDB (Mongoose ODM)**, **Redis Cache**, and **Zustand**. 

This system demonstrates scalable e-commerce architecture, including multi-tier caching, dual JWT authentication with two-factor email OTP verification, guest-to-user shopping cart persistence, multi-step checkout, real-time order tracking, comprehensive admin operations, customer reviews, wishlists, and in-app notifications.

---

## 📑 Table of Contents

- [Architectural Overview](#-architectural-overview)
- [System Highlights & Key Features](#-system-highlights--key-features)
  - [1. Storefront & Catalog Discovery](#1-storefront--catalog-discovery)
  - [2. Cart Architecture & Synchronization](#2-cart-architecture--synchronization)
  - [3. Multi-Step Checkout & Order Processing](#3-multi-step-checkout--order-processing)
  - [4. Authentication, Security & Email OTP](#4-authentication-security--email-otp)
  - [5. Customer Accounts, Orders & Tracking](#5-customer-accounts-orders--tracking)
  - [6. Wishlist, Reviews & Notifications](#6-wishlist-reviews--notifications)
  - [7. Administrative Management Portal](#7-administrative-management-portal)
- [Technology Stack](#-technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [REST API Specification](#-rest-api-specification)
- [Getting Started & Local Setup](#-getting-started--local-setup)
  - [Prerequisites](#prerequisites)
  - [Step-by-Step Installation](#step-by-step-installation)
  - [Environment Variables Configuration](#environment-variables-configuration)
- [Docker & Containerized Deployment](#-docker--containerized-deployment)
- [Quality Assurance & Verification](#-quality-assurance--verification)
- [Ethical, Legal & Trademark Disclaimers](#-ethical-legal--trademark-disclaimers)
- [Contributing & Code of Conduct](#-contributing--code-of-conduct)
- [License & Acknowledgments](#-license--acknowledgments)

---

## 🏗 Architectural Overview

```
                                 ┌───────────────────────────────────────────────┐
                                 │              Client (Next.js 14)              │
                                 │   App Router · Tailwind CSS · Zustand Store   │
                                 └───────────────────────┬───────────────────────┘
                                                         │
                                        HTTP / JSON Requests & Cookies
                                                         │
                                                         ▼
                                 ┌───────────────────────────────────────────────┐
                                 │             Next.js Edge Middleware           │
                                 │   Protected Routes (/admin, /checkout, etc.)  │
                                 └───────────────────────┬───────────────────────┘
                                                         │
                                                         ▼
                                 ┌───────────────────────────────────────────────┐
                                 │         Next.js Serverless API Routes         │
                                 │      Zod Schema Validation & Rate Limiting     │
                                 └───────────────┬───────────────┬───────────────┘
                                                 │               │
                         ┌───────────────────────┘               └───────────────────────┐
                         ▼                                                               ▼
  ┌─────────────────────────────────────────────┐                 ┌─────────────────────────────────────────────┐
  │       Data Layer: MongoDB & Mongoose        │                 │    High-Speed Caching Layer: Redis / Map    │
  │  Users · Orders · Carts · Products · Reviews│                 │  Session cache · Search query cache · TTL   │
  │  Wishlists · Notifications · Email OTPs     │                 │   Automatic in-memory fallback if no Redis  │
  └─────────────────────────────────────────────┘                 └─────────────────────────────────────────────┘
                         │                                                               │
                         └───────────────────────┬───────────────────────────────────────┘
                                                 │
                                                 ▼
                                 ┌───────────────────────────────────────────────┐
                                 │               External Services               │
                                 │  • SMTP Mailer (Nodemailer OTP Delivery)      │
                                 │  • Rainforest API (Live Amazon Catalog Data)  │
                                 │  • Rich Deterministic Seed Catalog Fallback   │
                                 └───────────────────────────────────────────────┘
```

---

## ✨ System Highlights & Key Features

### 1. Storefront & Catalog Discovery
- **Amazon Header & Navigation**: Fully responsive navbar featuring delivery destination selector, category dropdown, search box with debounced autocomplete, returns & orders shortcut, and dynamic live cart counter.
- **Hero Slider Banner**: Smooth auto-advancing carousel showcasing featured offers, category promotions, and prime deals.
- **Rich Seed & Live Catalog**: Dynamic product ingestion supporting live data via **Rainforest API** or an automatic deterministic 50+ item seed catalog across 6 key departments: *Electronics*, *Computers*, *Smart Home*, *Fashion*, *Books*, and *Home & Kitchen*.
- **Faceted Product Search**: Instant filtering by category, price ranges, star ratings, and Prime shipping eligibility with animated skeleton loaders during transitions.
- **Product Detail Experience (PDP)**: Interactive multi-angle image gallery with thumbnail preview, dynamic stock indicators, bulleted feature specifications, customer ratings breakdown, and related product carousels.

### 2. Cart Architecture & Synchronization
- **Zustand 5 Reactive Store**: State-driven cart drawer accessible globally across any route.
- **Guest Session Resilience**: Guest shoppers can add, remove, and adjust quantities stored in HTTP cookies and local storage.
- **Automatic Account Cart Merging**: Unauthenticated guest items automatically merge with the customer's remote MongoDB cart upon login.
- **Free Shipping Progress Meter**: Real-time threshold calculation displaying progress toward free shipping.
- **Direct Wishlist Transfer**: Move items effortlessly between cart and saved wishlist items.

### 3. Multi-Step Checkout & Order Processing
- **Step 1 — Shipping Address Selection**: Choose from saved addresses or create and validate a new destination on the fly.
- **Step 2 — Payment Method Selection**: Supports Credit/Debit Cards, Cash on Delivery (COD), UPI, and Amazon Pay balance simulation.
- **Step 3 — Order Review & Promo Codes**: Final line-item verification with order breakdown (items subtotal, shipping fee, sales tax, promotional discount).
- **Step 4 — Instant Confirmation & Receipt**: Generates permanent order record with instant invoice summary and status initiation.

### 4. Authentication, Security & Email OTP
- **Dual JWT Token Architecture**:
  - Short-lived Access Tokens (15-minute validity) passed via headers for API authorization.
  - Long-lived Refresh Tokens (30-day validity) stored in `HttpOnly`, `SameSite=Lax`, secure cookies.
  - Automatic silent token refresh mechanism.
- **Two-Factor Email OTP Verification**:
  - Secure 6-digit one-time password generated via crypto module and stored with SHA-256 hashing.
  - Configurable expiration (10 minutes) and resend rate-limiting cooldown (60 seconds).
  - Production SMTP email delivery using **Nodemailer** with DNS MX domain verification.
  - Development mode visual OTP banner and server logging for instantaneous testing without external email infrastructure.
- **Password Protection**: Salted password hashing with `bcryptjs` (10 rounds).
- **Edge Middleware**: Next.js Route Protection inspecting JWT authenticity prior to route rendering.

### 5. Customer Accounts, Orders & Tracking
- **Order Management & History**: Complete list of past orders with filterable tabs, grand totals, individual item status, and one-click "Buy it again" reordering.
- **Interactive Order Tracking Timeline**: Visual milestone stepper for orders (`Pending` ➔ `Processing` ➔ `Shipped` ➔ `Delivered` / `Cancelled`) with estimated arrival dates.
- **Customer Address Book**: Manage multiple delivery locations with primary address setting and instant deletion.
- **Personalized Recommendations**: Dynamic feed calculating recommended products based on browsing session history and viewed categories.

### 6. Wishlist, Reviews & Notifications
- **Persistent Wishlist**: Dedicated page and slide-in controls to save favorite products, with one-tap transfer to shopping cart.
- **Customer Reviews & Ratings**: Submit star ratings (1-5) and written feedback on products with average rating calculations.
- **In-App Notification Center**: Alert feed notifying users of order milestone updates, promotions, and security events with read/unread tracking.

### 7. Administrative Management Portal
- **Executive Analytics Dashboard (`/admin`)**: Real-time business metrics including gross revenue, completed orders, registered user counts, low-stock warnings, and top-selling products.
- **Admin Order Management (`/admin/orders`)**: Comprehensive view of all system orders with interactive status dropdowns to advance shipments.
- **Admin User Management (`/admin/users`)**: Searchable user directory with administrative role assignment (User ⇄ Admin privileges).

---

## 💻 Technology Stack

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14.1.3 (App Router) | Server-Side Rendering (SSR), Static Generation, and Client Components |
| **UI Library & Styling** | React 18, Tailwind CSS, Lucide Icons | Responsive Amazon-accurate interface, micro-interactions, icons |
| **State Management** | Zustand 5 | Client-side reactive stores for Auth, Cart Drawer, and Wishlist |
| **Backend & APIs** | Next.js Serverless Route Handlers | RESTful API endpoints with `force-dynamic` runtime configuration |
| **Database & ODM** | MongoDB 6.5.0, Mongoose 8.2.1 | Document storage for Users, Products, Carts, Orders, Reviews, OTPs |
| **Caching Layer** | Redis / In-Memory Map | Fast catalog lookups and session caching with automatic fallback |
| **Validation & Types** | Zod 4, TypeScript 5 (Strict) | End-to-end type safety and request payload schema validation |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` | Dual-token authentication, password hashing, Edge middleware |
| **Email Delivery** | Nodemailer, `dns/promises` | SMTP verification email delivery with MX record validation |
| **Notifications** | React Hot Toast | User-friendly asynchronous operation feedback |
| **Containerization** | Docker, Docker Compose | Multi-stage Alpine containerization for full stack orchestration |

---

## 📁 Project Directory Structure

```plaintext
amazone-clone/
├── .agent-logs/                   # Agent capture verification transcripts
├── .env.local.example             # Documented environment variable template
├── .eslintrc.json                 # ESLint configuration (Next.js Core Web Vitals)
├── CAPTURE-TEST.md                # Evaluation test log and canary verification
├── Dockerfile                     # Multi-stage optimized Node.js container build
├── docker-compose.yml             # Orchestration for Next.js App, MongoDB & Redis
├── next.config.mjs                # Next.js configuration
├── package.json                   # Project dependencies and operational scripts
├── postcss.config.js              # PostCSS plugin configurations
├── tailwind.config.js             # Tailwind theme extensions & Amazon palette
├── tsconfig.json                  # TypeScript compiler options (strict mode)
│
├── scripts/
│   └── sync_agent_logs.py         # Autonomous session log synchronization utility
│
└── src/
    ├── middleware.ts              # Next.js Edge route guard & session validator
    │
    ├── app/                       # Next.js App Router
    │   ├── layout.tsx             # Root layout with Global Toast & Navigation
    │   ├── page.tsx               # Storefront homepage (Hero, Feeds, Carousels)
    │   ├── globals.css            # Custom utility classes & Amazon brand styling
    │   │
    │   ├── admin/                 # Administrator Portal
    │   │   ├── page.tsx           # Business metrics & performance dashboard
    │   │   ├── orders/page.tsx    # Order status control & management
    │   │   └── users/page.tsx     # User role management & account status
    │   │
    │   ├── auth/                  # Authentication Module
    │   │   ├── login/page.tsx     # Customer sign-in & OTP modal
    │   │   └── register/page.tsx  # Registration with email OTP verification
    │   │
    │   ├── cart/page.tsx          # Full shopping cart breakdown & price summary
    │   ├── checkout/page.tsx      # 4-stage checkout & payment process
    │   ├── notifications/page.tsx # Customer notification inbox
    │   ├── orders/                # Order Management
    │   │   ├── page.tsx           # Order history & reorder triggers
    │   │   └── [id]/page.tsx      # Detailed order milestone tracking
    │   │
    │   ├── product/[asin]/        # Single product display page (PDP)
    │   ├── products/page.tsx      # Paginated product catalog with facet filters
    │   ├── profile/page.tsx       # User profile, address manager & security
    │   ├── search/page.tsx        # Keyword search results & category filters
    │   ├── wishlist/page.tsx      # Saved items & transfer to cart
    │   │
    │   └── api/                   # Serverless REST API Endpoints (33 routes)
    │       ├── admin/             # Analytics, user role & order status APIs
    │       ├── auth/              # Login, register, OTP verify/resend, refresh
    │       ├── cart/              # Cart CRUD & line item management
    │       ├── notifications/     # Notifications read/unread endpoints
    │       ├── orders/            # Order placement & history retrieval
    │       ├── products/          # Catalog listing, search & product details
    │       ├── reviews/           # Product review creation & retrieval
    │       ├── search/            # Autocomplete & keyword query engine
    │       ├── user/              # Profile, address book & browsing history
    │       └── wishlist/          # Wishlist item addition & deletion
    │
    ├── components/                # Reusable React UI Components
    │   ├── CartDrawer.tsx         # Slide-out quick cart modal
    │   ├── Footer.tsx             # Amazon multi-column navigational footer
    │   ├── HeroCarousel.tsx       # Auto-rotating hero promotion banner
    │   ├── Navbar.tsx             # Primary Amazon navigation bar
    │   ├── PersonalizedRecommendations.tsx # History-based recommendation feed
    │   ├── ProductCard.tsx        # Grid product card with ratings & badges
    │   ├── ProductCarousel.tsx    # Horizontal swipeable category carousel
    │   ├── ProductSkeleton.tsx    # Accessible shimmer placeholder states
    │   ├── SearchAutocomplete.tsx # Live search dropdown with history
    │   └── SubNav.tsx             # Secondary department category bar
    │
    ├── lib/                       # Core Utilities & Backend Logic
    │   ├── auth.ts                # Dual-token JWT generation & verification
    │   ├── cache.ts               # Redis cache client with in-memory fallback
    │   ├── db.ts                  # Cached MongoDB connection handler
    │   ├── emailExistence.ts      # DNS MX record email existence verification
    │   ├── mailer.ts              # Nodemailer transporter & HTML OTP templates
    │   ├── products.ts            # Seed product catalog & Rainforest integration
    │   ├── validators.ts          # Zod schema definitions
    │   │
    │   └── models/                # Mongoose Database Schemas
    │       ├── Cart.ts            # Shopping cart schema
    │       ├── EmailOtp.ts        # OTP security schema (hashed tokens + TTL)
    │       ├── Notification.ts    # User alert notifications schema
    │       ├── Order.ts           # Order schema with items, address & status
    │       ├── Product.ts         # Product schema with specifications & variants
    │       ├── Review.ts          # Customer rating & review schema
    │       ├── User.ts            # User profile, password hash & address book
    │       └── Wishlist.ts        # Customer saved items schema
    │
    └── store/                     # Zustand Reactive Global State
        ├── useAuthStore.ts        # User authentication & session state
        ├── useCartStore.ts        # Cart drawer, count, items & sync state
        └── useWishlistStore.ts    # Wishlist collection & sync actions
```

---

## 📡 REST API Specification

The backend provides **33 structured serverless API endpoints** supporting JSON request/response structures, HTTP status codes, and input validation:

### Authentication & Authorization
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new account & dispatch email OTP | No |
| `POST` | `/api/auth/register/verify-otp` | Validate 6-digit OTP and issue JWT tokens | No |
| `POST` | `/api/auth/register/resend-otp` | Request a fresh registration OTP | No |
| `POST` | `/api/auth/login` | Validate credentials & trigger 2FA OTP | No |
| `POST` | `/api/auth/login/verify-otp` | Verify 2FA OTP and complete user sign-in | No |
| `POST` | `/api/auth/login/resend-otp` | Request a fresh login 2FA OTP | No |
| `POST` | `/api/auth/refresh` | Exchange refresh cookie for new access token | Cookie |
| `POST` | `/api/auth/logout` | Revoke session & clear authentication cookies | Yes |
| `GET` | `/api/auth/me` | Retrieve authenticated user profile | Yes |

### Products & Search
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/products` | Fetch paginated catalog with category/price filters | No |
| `GET` | `/api/products/[asin]` | Fetch product details by ASIN / Product ID | No |
| `GET` | `/api/search` | Search query engine with live autocomplete | No |
| `GET` | `/api/reviews/[asin]` | Fetch verified customer reviews for a product | No |
| `POST` | `/api/reviews/[asin]` | Post customer review and star rating | Yes |

### Shopping Cart & Wishlist
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/cart` | Retrieve current cart items & computed subtotal | Guest / User |
| `POST` | `/api/cart/add` | Add product SKU to cart or increase quantity | Guest / User |
| `PUT` | `/api/cart/update` | Modify item quantity or remove line item | Guest / User |
| `GET` | `/api/wishlist` | Fetch customer wishlist items | Yes |
| `POST` | `/api/wishlist/add` | Save product to wishlist | Yes |
| `DELETE`| `/api/wishlist/remove/[asin]`| Remove product from wishlist | Yes |

### Orders & Checkout
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/orders/place` | Validate cart, reserve items & place order | Yes |
| `GET` | `/api/orders` | Retrieve authenticated user's order history | Yes |
| `GET` | `/api/orders/[id]` | Fetch detailed milestone tracking for order | Yes |

### Customer Account & Profile
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/user/profile` | Retrieve account profile & settings | Yes |
| `PUT` | `/api/user/profile` | Update user name or profile preferences | Yes |
| `GET` | `/api/user/address` | List saved delivery addresses | Yes |
| `POST` | `/api/user/address` | Save new delivery address | Yes |
| `DELETE`| `/api/user/address/[id]` | Remove address from address book | Yes |
| `GET` | `/api/user/history` | Retrieve user product browsing history | Optional |
| `GET` | `/api/notifications` | Fetch user alert notifications | Yes |
| `PUT` | `/api/notifications/[id]` | Mark notification as read | Yes |

### Administrative Operations
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/admin/stats` | Business KPI metrics (revenue, orders, users) | Admin |
| `GET` | `/api/admin/orders` | View all system orders across all users | Admin |
| `PUT` | `/api/admin/orders/[id]/status` | Advance or update order tracking status | Admin |
| `GET` | `/api/admin/users` | List all registered accounts with role data | Admin |
| `PUT` | `/api/admin/users/[id]/role` | Promote/demote user permissions (admin/user) | Admin |

---

## 🚀 Getting Started & Local Setup

### Prerequisites
Before running the application, ensure the following are installed:
- **Node.js**: `v18.17.0` or higher (Node 20 recommended)
- **npm**: `v9.x` or higher (or `pnpm` / `yarn`)
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) connection URI
- **Redis** *(Optional)*: Local Redis instance (`redis://localhost:6379`). If omitted, the app automatically switches to an in-memory caching engine with zero configuration needed.

---

### Step-by-Step Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/your-username/amazone-clone.git
cd amazone-clone
```

#### 2. Install Project Dependencies
```bash
npm install
```

#### 3. Configure Environment Variables
Create your local environment configuration by duplicating the provided template:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Database Connection (Required)
MONGODB_URI=mongodb://localhost:27017/amazon_clone

# Cryptographic Authentication Secrets (Required)
JWT_SECRET=super_secret_jwt_access_key_change_in_production
JWT_REFRESH_SECRET=super_secret_jwt_refresh_key_change_in_production

# Application Base URL (Required)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Redis Cache (Optional - In-Memory Map fallback is used if omitted)
REDIS_URL=redis://localhost:6379

# Live Product API (Optional - If omitted, rich 50+ seed catalog is used)
RAINFOREST_API_KEY=

# SMTP Email Delivery (Optional - If omitted, OTPs log to console and dev banner)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM="Amazon Clone <no-reply@amazon-clone.local>"
```

#### 4. Run the Development Server
```bash
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

> [!TIP]
> **Testing Email OTP Without SMTP**:
> If you leave `SMTP_USER` and `SMTP_PASS` blank, you don't need real mail credentials! The application will automatically print the 6-digit OTP directly to your terminal console and display a handy on-screen test banner during registration and login.

---

### Environment Variables Configuration

| Variable | Required | Default / Example | Description |
| :--- | :---: | :--- | :--- |
| `MONGODB_URI` | **Yes** | `mongodb://localhost:27017/amazon_clone` | MongoDB connection connection string |
| `JWT_SECRET` | **Yes** | `your_jwt_access_secret` | Secret key used to sign 15-minute access JWTs |
| `JWT_REFRESH_SECRET`| **Yes** | `your_jwt_refresh_secret` | Secret key used to sign 30-day refresh cookies |
| `NEXT_PUBLIC_APP_URL`| **Yes**| `http://localhost:3000` | Fully qualified base domain of the application |
| `REDIS_URL` | No | `redis://localhost:6379` | Redis connection URL for query & session caching |
| `RAINFOREST_API_KEY` | No | *(None - Mock Seed Active)* | API key for live Amazon catalog data |
| `SMTP_HOST` | No | `smtp.gmail.com` | Outgoing SMTP host for email delivery |
| `SMTP_PORT` | No | `587` | Outgoing SMTP TLS port (587 or 465) |
| `SMTP_USER` | No | `user@example.com` | SMTP username / authentication email |
| `SMTP_PASS` | No | `app-specific-password` | SMTP password / app password |
| `SMTP_FROM` | No | `"Amazon Clone" <no-reply@...>` | Outgoing sender display header |

---

## 🐳 Docker & Containerized Deployment

A production-ready `Dockerfile` and `docker-compose.yml` are provided to spin up the entire application stack (Next.js application, MongoDB database, and Redis cache) with a single command.

### Launch Complete Stack with Docker Compose
```bash
docker-compose up --build
```

This starts:
- **Web App**: Accessible on port `3000` -> `http://localhost:3000`
- **MongoDB**: Internal port `27017` with persistent Docker volume `mongo_data`
- **Redis**: Internal port `6379` with persistent Docker volume `redis_data`

To shut down the stack:
```bash
docker-compose down
```

---

## 🧪 Quality Assurance & Verification

The project includes strict type checking, code style enforcement, and production build validation:

```bash
# 1. Static Type Checking (Zero TypeScript Errors)
npx tsc --noEmit

# 2. Next.js Core Web Vitals Linting
npm run lint

# 3. Production Build Compilation & Asset Optimization
npm run build

# 4. Start Production Server
npm start
```

All 15 App Router pages and 33 API routes compile into optimized serverless and static targets.

---

## ⚖️ Ethical, Legal & Trademark Disclaimers

> [!IMPORTANT]
> ### 1. Educational Purpose & Non-Commercial Notice
> This project has been developed strictly for **educational, portfolio, and research purposes** to demonstrate full-stack software engineering proficiency, modern web architecture, and user experience design. It is **NOT** a commercial platform, does **NOT** sell actual merchandise, and does **NOT** accept real monetary transactions.

> [!NOTE]
> ### 2. Trademark & Intellectual Property Attribution
> **Amazon**, **Amazon Prime**, the Amazon Smile logo, and related brand identifiers, trademarks, and trade dress are registered trademarks of **Amazon.com, Inc.** or its respective affiliates. 
> 
> This repository and its creator are **not affiliated with, associated with, authorized by, endorsed by, or in any way officially connected with Amazon.com, Inc.** Any product imagery, titles, or descriptions used in demo mock seeds are utilized strictly under **Fair Use** principles for illustrative simulation purposes.

> [!CAUTION]
> ### 3. Security, Privacy & Payment Simulation
> - **No Real Payments**: The checkout system is an educational simulation. Do **NOT** enter real credit card numbers, CVVs, or sensitive banking information.
> - **Data Isolation**: Any information entered into demo instances is stored locally or in your configured database sandbox.
> - **Credential Safety**: Always generate distinct random secrets for `JWT_SECRET` and `JWT_REFRESH_SECRET` before hosting in any public or staging environment.

---

## 🤝 Contributing & Code of Conduct

Contributions, feedback, and issue reports are welcome:

1. **Fork the Repository**
2. **Create a Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Commit Your Changes**: `git commit -m "feat: add amazing feature"`
4. **Push to Branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

Please ensure all tests pass (`npx tsc --noEmit` and `npm run lint`) before submitting pull requests.

---

## 📄 License & Acknowledgments

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more details.

Built with dedication to clean code, robust architecture, and modern web engineering.
