# Amazon Clone — Production-Grade E-Commerce System

An enterprise-ready, high-performance Amazon.com clone built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **MongoDB (Mongoose)**, **Redis**, and **Zustand**.

Designed as a technical assessment demonstration of modern web engineering, clean architecture, responsive UX, and full-stack API integration.

---

## 🚀 Key Features

### 🛒 1. E-Commerce & Product Browsing
- **Real-Time & Seeded Product System**: Integrated with **Rainforest API** for live Amazon product data, with an automatic rich 50+ item seed fallback across 6 categories.
- **Debounced Live Autocomplete Search**: Search input with real-time suggestions dropdown, category filters, and history logging.
- **Interactive Product Catalog**: Sidebar filtering by category, price range, and star rating with animated skeleton placeholders.
- **Rich Product Detail Page**: Multi-image gallery with thumbnail selection, variant selectors (color & size), stock status, Prime badges, trust badges, features bullet points, and related products grid.
- **Horizontal Product Carousels**: Smooth left/right arrow controls, responsive touch scrolling, and direct product navigation.

### 💳 2. Shopping Cart & Multi-Step Checkout
- **Unified Zustand Cart Store**: Real-time state management supporting guest session carts (HTTP-only session cookie) and authenticated user carts stored in MongoDB.
- **Automatic Cart Merging**: Guest carts seamlessly merge into user accounts upon sign-in.
- **Slide-In Cart Drawer**: Instant side drawer accessible from any page with quantity controls and item removal.
- **Free Shipping Tracker**: Dynamic progress bar calculating threshold until free shipping is unlocked.
- **Multi-Step Checkout**: Step 1 (Address Form / Saved Addresses) ➔ Step 2 (Payment Selector) ➔ Step 3 (Item Snapshot Review) ➔ Step 4 (Order Confirmation).

### 🔐 3. Authentication & Security
- **Dual JWT Token Pattern**: Short-lived Access Tokens (15 mins) + HTTP-only Refresh Tokens (30 days) with automatic silent rotation.
- **Route Middleware**: Protected routes (`/profile`, `/orders`, `/checkout`) enforced via Next.js Middleware.
- **Session Expiry Notice**: Live countdown indicator for guest session validity.

### 📦 4. Orders & User Account
- **Order Management System**: Order history listing with status timeline badges, item breakdown, order grand total, and one-click "Buy it again" reordering.
- **User Profile & Address Book**: Save multiple delivery addresses with default selection, update profile credentials, and view account security status.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, React Hot Toast
- **State Management**: Zustand
- **Backend**: Next.js Serverless API Routes
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis (with in-memory Map fallback)
- **Validation**: Zod
- **Containerization**: Docker & Docker Compose

---

## 🛠 Local Setup & Installation

### Prerequisites
- Node.js >= 18.x
- MongoDB (local or MongoDB Atlas URI)
- Redis (Optional, in-memory fallback enabled by default)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/amazon-clone.git
cd amazon-clone
npm install
```

### 2. Environment Configuration
Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

Configure `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/amazon_clone
JWT_SECRET=your_jwt_access_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Setup

Run the entire application stack (Next.js App + MongoDB + Redis) using Docker Compose:

```bash
docker-compose up --build
```
The app will be accessible at [http://localhost:3000](http://localhost:3000).

---

## 🧪 Verification & Type Safety

Run TypeScript compiler check to verify zero type errors across the codebase:
```bash
npx tsc --noEmit
```

Build production bundle:
```bash
npm run build
```

---

## 📄 License
MIT License. Built as a technical demonstration.
