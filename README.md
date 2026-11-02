# StudyHub - Student Study Material Portal with Premium Plans & Online Payments

A complete, production-grade, **frontend-only** web application built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**.

All persistence and data operations are simulated with an asynchronous client-side Data Access Layer (`src/lib/db.ts`) connected to `localStorage`, allowing the entire application to operate end-to-end as a realistic demo without requiring an external database or backend server.

---

## 🚀 Live Demo Credentials

Use the pre-seeded demo accounts to test student and administrator experiences:

| Role | Email | Password | Access Tier | Features |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin@studyhub.com` | `Admin@123` | Full Admin | Curriculum CRUD, Student Management, Pricing Plans, Payment Audits, CSV Export |
| **Free Student** | `student@studyhub.com` | `Student@123` | Free Tier | Free PDFs & Videos, Gated Premium Prompts, Mock Payment Checkout |
| **Premium Student**| `premium@studyhub.com` | `Premium@123` | Premium Member | Unlimited access to all high-yield notes, formula sheets, HD lectures, valid for 150 days |

> **Note**: Demo passwords can also be autofilled with single-click demo credential chips on both the Student and Admin login screens.

---

## 🛠️ Tech Stack & Design System

- **Framework**: Next.js 16 (App Router + Turbopack)
- **Language**: TypeScript (Strict typing across all models and APIs)
- **Styling**: Tailwind CSS (Curated Light Theme: Navy `#12284C`, Teal `#0E8F8A`, Slate `#F8FAFC`, Amber for Premium)
- **Icons**: `lucide-react`
- **Charts**: `recharts` (Interactive revenue and enrollment trends)
- **Typography**: Plus Jakarta Sans / Inter via `next/font`
- **Persistence**: Centralized async localStorage Data Access Layer

---

## 🏃 Getting Started

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm run start
```

---

## 📁 Project Architecture & Folder Structure

```
learning_portal/
├── public/                       # Static public assets
├── src/
│   ├── app/                      # Next.js App Router routes
│   │   ├── admin/                # Admin Panel protected routes
│   │   │   ├── dashboard/        # Live metrics, revenue chart, quick actions
│   │   │   ├── login/            # Dedicated Admin login screen
│   │   │   ├── materials/        # PDF materials CRUD (Drive links, Free/Premium)
│   │   │   ├── payments/         # All payment transactions + CSV export
│   │   │   ├── plans/            # Subscription plans editor
│   │   │   ├── semesters/        # Semesters management with orphan guard
│   │   │   ├── settings/         # Demo data reset & platform diagnostics
│   │   │   ├── students/         # Student directory, block/unblock, grant premium
│   │   │   ├── subjects/         # Course codes and semester assignment
│   │   │   └── videos/           # Video lecture stream catalog
│   │   ├── checkout/[planId]/    # Mock Razorpay payment modal (Success & Failure test)
│   │   ├── dashboard/            # Student portal dashboard & status
│   │   ├── login/                # Student authentication
│   │   ├── materials/            # Semester & subject PDF catalog with access gating
│   │   ├── payments/             # Student payment history & invoice records
│   │   ├── plans/                # Premium tier selection
│   │   ├── pricing/              # Public pricing overview
│   │   ├── profile/              # Student settings, password reset, expiry check
│   │   ├── register/             # Student self-registration
│   │   ├── videos/               # Video library
│   │   │   └── [id]/             # Video lecture player (YouTube/Drive embed)
│   │   ├── globals.css           # Design tokens, color palette, animations
│   │   ├── layout.tsx            # Root layout with font and client providers
│   │   ├── page.tsx              # Public high-conversion Landing Page
│   │   └── providers.tsx         # Client context provider wrapper
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AdminLayout.tsx   # Admin sidebar drawer and navigation
│   │   │   ├── Footer.tsx        # Public footer with brand links
│   │   │   ├── Navbar.tsx        # Public navigation header
│   │   │   └── StudentLayout.tsx # Responsive student portal sidebar
│   │   └── ui/                   # Reusable atomic UI components
│   │       ├── Badge.tsx         # Status & tier badges (Premium, Free, Success)
│   │       ├── Button.tsx        # Primary, secondary, outline, danger, warning variants
│   │       ├── Card.tsx          # Card container with hover micro-animations
│   │       ├── DataTable.tsx     # Generic table with search, sorting & pagination
│   │       ├── EmptyState.tsx    # Friendly illustration empty states
│   │       ├── Input.tsx         # Input field with show/hide password toggle
│   │       ├── Modal.tsx         # Accessible overlay modal dialog
│   │       ├── Select.tsx        # Styled form select
│   │       ├── Skeleton.tsx      # Loading state placeholders
│   │       └── Toast.tsx         # Non-blocking notification toasts
│   │
│   ├── hooks/
│   │   ├── useAuth.tsx           # Authentication state & session guard
│   │   └── useToast.tsx          # Toast notification dispatch hook
│   │
│   ├── lib/
│   │   ├── auth.ts               # Login, registration, and session helpers
│   │   ├── db.ts                 # Centralized async Data Access Layer (localStorage)
│   │   ├── seed.ts               # Initial demo seed dataset (4 sems, 12 subjects, 20 PDFs)
│   │   └── utils.ts              # INR currency formatting, dates, access control
│   │
│   └── types/
│       └── index.ts              # Strict TypeScript interfaces
```

---

## 🔌 Replacing `lib/db.ts` with Real Backend APIs

StudyHub adheres strictly to the **Data Access Layer Pattern**. No UI component or page ever directly queries `localStorage` or executes database drivers.

Every function in `src/lib/db.ts` is explicitly typed and asynchronous:
```ts
export async function getMaterials(): Promise<Material[]>
export async function createMaterial(data: Omit<Material, 'id' | 'createdAt'>): Promise<Material>
export async function purchasePlan(studentId: string, planId: string, method: string, success: boolean): Promise<Payment>
```

### Transitioning to a Real Backend (e.g., Node.js / Python / Go)
To migrate this frontend to production with real database persistence:

1. **Keep Component Signatures Identical**: Components will continue to call `getMaterials()`, `createMaterial()`, `purchasePlan()`, etc.
2. **Swap Implementation in `src/lib/db.ts`**:
   Replace the internal `getStore()` / `setStore()` functions with standard HTTP `fetch` or `axios` calls:

```ts
// src/lib/db.ts (Production Example with REST API)

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.studyhub.com/v1';

export async function getMaterials(): Promise<Material[]> {
  const res = await fetch(`${API_BASE}/materials`, {
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error('Failed to fetch materials');
  return res.json();
}

export async function purchasePlan(
  studentId: string,
  planId: string,
  method: 'upi' | 'card' | 'netbanking',
  success: boolean
): Promise<Payment> {
  const res = await fetch(`${API_BASE}/payments/charge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ studentId, planId, method, success }),
  });
  return res.json();
}
```

3. **Backend Password Hashing & Real Gateways**:
   In production, replace client plain-text password comparisons with server-side bcrypt hashing, HTTP-only JWT cookies, and real Razorpay / Stripe webhooks.

---

## 🧪 Interactive Testing Guide

Here is a recommended test sequence to experience all features:

1. **Public Exploration**:
   - Visit `/` to see the high-conversion hero, curriculum feature grid, how-it-works workflow, FAQ, and footer.
   - Click "View Plans" or visit `/pricing` to see available subscription tiers.

2. **Student Login & Free vs Premium Gating**:
   - Go to `/login` and click the **"Autofill Free Student"** chip (`student@studyhub.com`).
   - Navigate to `/materials`: browse by Semester 1 to 4 and subjects. Notice free PDFs open directly, while premium PDFs display a locked badge. Click "Unlock" to see the modal prompt.
   - Navigate to `/videos`: free videos play directly in `/videos/[id]`, while premium lectures display an upgrade lock.

3. **Mock Payment Simulation (Success & Failure)**:
   - Click "Upgrade to Premium" or visit `/plans`.
   - Select the **"Semester Pass"** (₹499).
   - In `/checkout/[planId]`:
     - Test **"Simulate Failure"**: Observe the realistic 1.2s gateway processing spinner and decline screen with the option to retry.
     - Test **"Simulate Success"**: Observe the processing spinner, receipt creation, and immediate account upgrade.
   - Check `/payments`: verify your newly recorded payment transaction ID and status.
   - Return to `/materials` or `/videos`: all premium locks are now unlocked!

4. **Profile & Expiry Monitoring**:
   - Visit `/profile`: update your name or phone number, change your password, and verify your membership status and days remaining.

5. **Admin Panel Features**:
   - Log out and visit `/admin/login`.
   - Click **"Autofill Demo Admin"** (`admin@studyhub.com` / `Admin@123`).
   - **Dashboard**: View live metric cards, interactive revenue trend chart (Recharts), and latest transactions.
   - **Semesters & Subjects**: Create new semesters or subjects, edit course codes, and test the deletion safeguard.
   - **Materials & Videos**: Add new study documents with pasted URLs and toggle the Free/Premium content lock.
   - **Students Management**: Search for students, toggle block/unblock, and manually grant or revoke premium durations.
   - **Payments**: Filter transactions by status (Success/Failed/Pending) and click **"Export to CSV"** to download the transaction report.
   - **Settings**: Click **"Reset Demo Data"** to restore original demo seed records at any time.

---

## 📄 License
MIT License. Built for university student academic excellence and exam readiness.
