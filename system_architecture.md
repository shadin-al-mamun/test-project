# System Architecture Document (SAD)
## Project Name: Bachelor Home Hostel ERP (ব্যাচেলর হোম হোস্টেল ইআরপি)
**Document Version:** 1.0.0  
**Status:** Approved for Implementation Phase  
**Base Reference:** [prd.md](file:///c:/Users/MTBD/Documents/Bachelor%20Home%20ERP/prd.md)  
**Target Audience:** Lead Architects, Backend & Frontend Developers, DevOps Engineers, QA Engineers  

---

## 1. Architecture Overview & Core Objectives

### 1.1 Architectural Vision
The **Bachelor Home Hostel ERP** system architecture is designed following **Clean Architecture (Hexagonal Architecture)** and **Domain-Driven Design (DDD)** principles. It guarantees high availability, real-time data consistency, strict temporal rule enforcement (10:00 PM Cutoff), tamper-evident audit trails, and seamless bilingual responsiveness across mobile and desktop devices.

### 1.2 Core Architectural Principles
1. **Separation of Concerns:** Strict decoupling of UI (Presentation), Business Logic (Domain & Application Services), and Data Access (Infrastructure/Persistence).
2. **Deterministic Temporal Consistency:** The 10:00 PM Meal Cutoff Engine operates strictly in `Asia/Dhaka` (UTC+6) time with automated locks and transactional integrity.
3. **Auditability by Design:** Financial vouchers, seat allocations, and meal overrides are append-only and immutable.
4. **Hybrid Persistence Capability:** Standard Relational Database (PostgreSQL/SQLite) with an optional Google Sheets Connector Service to allow two-way sync or lightweight deployment as outlined in the blueprint.
5. **Mobile-First Responsiveness:** Low-latency API design with payload compression for mobile networks.

---

## 2. System Context & C4 Architecture Model

### 2.1 C4 Level 1: System Context Diagram
Shows how the Bachelor Home Hostel ERP interacts with external actors and third-party systems.

```mermaid
graph TD
    classDef actorStyle fill:#2563EB,stroke:#1E40AF,stroke-width:2px,color:#fff;
    classDef systemStyle fill:#059669,stroke:#047857,stroke-width:2px,color:#fff;
    classDef externalStyle fill:#4B5563,stroke:#374151,stroke-width:2px,color:#fff;

    Admin["Hostel Owner / Admin"]:::actorStyle
    Manager["Mess Manager"]:::actorStyle
    Border["Border / Resident"]:::actorStyle
    Accountant["Accountant"]:::actorStyle
    Cook["Cook / Caretaker"]:::actorStyle

    ERP["Bachelor Home Hostel ERP System"]:::systemStyle

    SMSGateway["SMS / WhatsApp Gateway<br/>(Bulk SMS BD, Twilio)"]:::externalStyle
    PaymentGateway["MFS / Payment Gateway<br/>(bKash, Nagad, SSLCommerz)"]:::externalStyle
    CloudStorage["Object / Drive Storage<br/>(NID Scans, Bazaar Receipts)"]:::externalStyle
    GoogleSheets["Google Sheets / Drive<br/>(Optional Sync Backend)"]:::externalStyle

    Admin -->|Configures, Monitors, Audits| ERP
    Manager -->|Manages Meals, Bazaar, Check-in| ERP
    Border -->|Toggles Meals, Views Dues, Pays| ERP
    Accountant -->|Generates Invoices, Enters Receipts| ERP
    Cook -->|Views Daily Headcounts| ERP

    ERP -->|Sends Invoices & Alerts| SMSGateway
    ERP -->|Reconciles Payments| PaymentGateway
    ERP -->|Stores KYC & Vouchers| CloudStorage
    ERP -.->|Syncs Data / Export| GoogleSheets
```

---

### 2.2 C4 Level 2: Container Diagram
Decomposes the ERP system into high-level runnable containers/services.

```mermaid
graph TB
    subgraph ClientLayer ["Client Presentation Layer (Browser / Mobile PWA)"]
        SPA["Single Page Web App & PWA<br/>(HTML5 / Modern JS / Vanilla CSS / React)<br/>Bilingual EN/BN Interface"]
    end

    subgraph APILayer ["API & Application Gateway Layer"]
        Gateway["Reverse Proxy & Gateway<br/>(Nginx / Caddy / Node Gateway)"]
        AuthMiddleware["JWT & RBAC Middleware"]
        RateLimiter["Rate Limiter & Security Headers"]
    end

    subgraph ServiceLayer ["Core Business Application Services"]
        AuthService["Auth & User Management Service"]
        PropertyService["Property & Seat Hierarchy Service"]
        BorderService["Border KYC & Allocation Service"]
        MealEngine["Meal Management & 10 PM Cutoff Engine"]
        BillingEngine["Billing, Meal Rate & Invoicing Engine"]
        ExpenseService["Bazaar & Operational Expense Service"]
        ReportService["Reporting & BI Analytics Service"]
        AuditService["Immutable Audit Trail Service"]
        CronWorker["Background Scheduler / Cron Service<br/>(Cutoff Triggers, Midnight Jobs)"]
    end

    subgraph PersistenceLayer ["Data & Storage Layer"]
        PrimaryDB[("Primary Database<br/>(PostgreSQL / MySQL / SQLite)")]
        CacheStore[("In-Memory Cache & Lock Store<br/>(Redis / Key-Value Cache)")]
        FileStore[("File Storage<br/>(Local Storage / S3 / Google Drive)")]
    end

    SPA -->|HTTPS / REST / JSON| Gateway
    Gateway --> RateLimiter
    RateLimiter --> AuthMiddleware
    AuthMiddleware --> ServiceLayer

    CronWorker -->|Triggers at 22:00:00 Asia/Dhaka| MealEngine
    CronWorker -->|Monthly 1st Job| BillingEngine

    ServiceLayer --> PrimaryDB
    ServiceLayer --> CacheStore
    ServiceLayer --> FileStore
    ServiceLayer --> AuditService
    AuditService --> PrimaryDB
```

---

## 3. Layered Component Architecture (Clean Architecture)

```mermaid
graph TD
    subgraph Presentation ["Presentation Layer (UI / API Controllers)"]
        API_Controllers["REST Controllers<br/>(/api/v1/meals, /api/v1/billing, etc.)"]
        RequestDTOs["Validation DTOs (Zod / JSON Schema)"]
        Responses["Standardized API Responses {success, data, error}"]
    end

    subgraph Application ["Application Services (Use Cases)"]
        UC1["ToggleMealUseCase"]
        UC2["LockDayMealsUseCase"]
        UC3["CalculateMealRateUseCase"]
        UC4["GenerateMonthlyInvoicesUseCase"]
        UC5["AllocateSeatUseCase"]
        UC6["ClearAndCheckoutBorderUseCase"]
    end

    subgraph Domain ["Domain Layer (Business Entities & Rules)"]
        EntitySeat["Seat Entity & State Machine"]
        EntityMeal["Meal Entry & 10 PM Rule"]
        EntityInvoice["Invoice & Ledger Calculation"]
        DomainEvents["Domain Events (MealLocked, PaymentReceived)"]
    end

    subgraph Infrastructure ["Infrastructure Layer (External Adaptors)"]
        DBRepo["PostgreSQL / SQLite Repositories"]
        SheetsRepo["Google Sheets Adaptor (Fallback/Sync)"]
        StorageAdaptor["Local/Cloud File Storage Adaptor"]
        SMSAdaptor["SMS Provider Adaptor"]
    end

    Presentation --> Application
    Application --> Domain
    Application --> Infrastructure
    Infrastructure -.-> Domain
```

---

## 4. Subsystem Deep-Dive & Core Technical Engines

### 4.1 The 10:00 PM Meal Cutoff & State Machine Engine
The meal cutoff is a critical system boundary requiring atomic state transitions and concurrency safeguards.

#### 4.1.1 State Machine Lifecycle
```mermaid
stateDiagram-v2
    [*] --> EDITABLE: Day N-1 (Created by System)
    
    EDITABLE --> EDITABLE: Border toggles meal (Before 22:00:00)
    
    EDITABLE --> AUTO_LOCKED: Cron fires at 22:00:00 Asia/Dhaka
    
    AUTO_LOCKED --> HEADCOUNT_COMPILED: Kitchen Sheet generated at 22:05:00
    
    AUTO_LOCKED --> MANAGER_OVERRIDDEN: Manager manual change + Reason
    MANAGER_OVERRIDDEN --> AUTO_LOCKED: Audit Logged & Re-locked
    
    HEADCOUNT_COMPILED --> CONSUMED: Next Day Service Completed
    CONSUMED --> BILLED: Month-End Rate Settlement
    BILLED --> [*]
```

#### 4.1.2 Concurrency & Timezone Locking Protocol
- **Authoritative Clock:** The server clock must be synchronized with NTP; timestamps are evaluated against the `Asia/Dhaka` timezone offset (`+06:00`).
- **Pessimistic / Optimistic Check:**
  ```javascript
  function assertMealEditable(targetDate, serverTime) {
      const cutoffTime = getCutoffDateTime(targetDate); // 22:00:00 of (targetDate - 1 day) in Asia/Dhaka
      if (serverTime >= cutoffTime) {
          throw new BusinessRuleViolationException(
              "CUTOFF_EXCEEDED", 
              "Meal modifications for tomorrow closed at 10:00 PM. Contact manager."
          );
      }
  }
  ```
- **Cron Architecture:**
  - Standard cron job: `0 22 * * *` (Runs every night at 22:00:00).
  - Executes batch SQL statement:
    ```sql
    UPDATE meals 
    SET is_locked = true, locked_at = NOW() 
    WHERE meal_date = CURRENT_DATE + INTERVAL '1 day' 
      AND is_locked = false;
    ```
  - Emits event: `EventBus.emit('MEALS_LOCKED_FOR_DATE', { date: tomorrow })`.
  - Aggregator listener generates morning bazaar headcount:
    $$\text{Breakfast Count} = \sum \text{breakfast\_count}$$
    $$\text{Lunch Count} = \sum \text{lunch\_count}$$
    $$\text{Dinner Count} = \sum \text{dinner\_count}$$

---

### 4.2 Dynamic Meal Rate & Month-End Invoicing Engine

#### 4.2.1 Calculation Pipeline
```mermaid
flowchart TD
    Start([Trigger Month-End Settlement]) --> Step1[Step 1: Aggregate Total Bazaar & Kitchen Overheads]
    Step1 --> Step2[Step 2: Aggregate Total Active & Guest Meals Consumed]
    Step2 --> Step3{Total Meals > 0?}
    Step3 -- No --> FallbackRate[Apply Pre-set Default Rate / Base Cost]
    Step3 -- Yes --> ComputeRate["Compute Meal Rate = Total Cost / Total Meals"]
    FallbackRate --> Step4
    ComputeRate --> Step4[Step 4: Compute Each Border's Total Meal Charges]
    Step4 --> Step5[Step 5: Fetch Base Seat Rent + Utility Shares + Arrears]
    Step5 --> Step6[Step 6: Generate Unified Invoices with Status = UNPAID]
    Step6 --> Step7[Step 7: Dispatch Invoices & Notifications to Borders]
    Step7 --> End([Settlement Complete])
```

#### 4.2.2 Mathematical Specifications
1. **Total Period Mess Expenditure ($E_{\text{mess}}$):**
   $$E_{\text{mess}} = \sum_{i=1}^{k} \text{BazaarExpense}_i + \sum_{j=1}^{m} \text{KitchenOverhead}_j$$
2. **Total Consumed Meal Units ($M_{\text{total}}$):**
   $$M_{\text{total}} = \sum_{\text{border}} (M_{\text{breakfast}} \times w_b + M_{\text{lunch}} \times w_l + M_{\text{dinner}} \times w_d) + M_{\text{guest}}$$
   *(where $w_b, w_l, w_d$ are customizable unit weights, e.g., $0.5, 1.0, 1.0$ or $1, 1, 1$)*
3. **Period Unit Meal Rate ($R_{\text{meal}}$):**
   $$R_{\text{meal}} = \frac{E_{\text{mess}}}{M_{\text{total}}}$$
4. **Individual Resident Total Invoice ($I_{\text{border}}$):**
   $$I_{\text{border}} = \text{SeatRent} + (M_{\text{border\_consumed}} \times R_{\text{meal}}) + U_{\text{electricity}} + U_{\text{gas}} + U_{\text{wifi}} + U_{\text{maid}} + \text{Arrears} - \text{AdvanceCredit}$$

---

### 4.3 Property & Seat Allocation State Engine
Seats follow a deterministic transition lifecycle to prevent double-booking:

```mermaid
stateDiagram-v2
    [*] --> AVAILABLE: Seat Created
    AVAILABLE --> BOOKED: Advance Booking Deposit Paid
    BOOKED --> OCCUPIED: Formal Border Check-in
    AVAILABLE --> OCCUPIED: Direct Walk-in Allocation
    OCCUPIED --> NOTICE_GIVEN: Border submits 30-day exit notice
    NOTICE_GIVEN --> MAINTENANCE: Final Clearance & Checkout
    OCCUPIED --> MAINTENANCE: Emergency Evacuation / Repairs
    MAINTENANCE --> AVAILABLE: Maintenance Completed
```

---

## 5. Security & Authentication Architecture

### 5.1 Authentication Flow
- **Protocol:** Stateless JSON Web Token (JWT) with HMAC-SHA256 or RSA-256 signing.
- **Token Strategy:**
  - `Access Token`: 15-minute validity, stored in memory or Secure, HttpOnly, SameSite=Lax cookie.
  - `Refresh Token`: 7-day validity, persisted in database with token-rotation to detect hijacking.
- **Passwords:** Hashed with `bcrypt` (cost factor 12) or `Argon2id`.

### 5.2 Granular RBAC Middleware Guard
Every incoming HTTP request traverses the security pipeline:

```mermaid
flowchart LR
    Request[HTTP Request] --> TokenExtract[Extract JWT Token]
    TokenExtract --> VerifySign{Token Valid & Active?}
    VerifySign -- No --> 401[401 Unauthorized]
    VerifySign -- Yes --> LoadUser[Load User & Role Context]
    LoadUser --> PermissionCheck{Role has Permission?}
    PermissionCheck -- No --> 403[403 Forbidden]
    PermissionCheck -- Yes --> Controller[Route Controller Execution]
```

### 5.3 Tamper-Evident Audit Logging Subsystem
- Any mutation on financial accounts, seat allocations, or post-10 PM meal overrides invokes `AuditService.logEvent()`.
- **Audit Table Invariants:**
  - No `UPDATE` or `DELETE` permissions granted on `audit_logs` table (database-level rule).
  - Records: `id`, `user_id`, `role`, `action`, `resource`, `resource_id`, `before_state_json`, `after_state_json`, `ip_address`, `user_agent`, `created_at`.

---

## 6. Bilingual Architecture (i18n & Localization)

### 6.1 Locale Management Architecture
- **Supported Locales:** `bn` (Bangla - Primary Default), `en` (English).
- **Resolution Strategy:**
  1. User Preference in Database Profile (if logged in).
  2. LocalStorage Cache: `current_locale`.
  3. Browser `Accept-Language` header.
- **Dictionary Organization:**
  ```
  locales/
  ├── bn/
  │   ├── common.json        # বাটন, মেনু, স্ট্যাটাস
  │   ├── meals.json         # সকাল, দুপুর, রাত, মেহমান মিল, কাট-অফ
  │   ├── finance.json       # সিট ভাড়া, মানি রসিদ, বকেয়া, লেজার
  │   ├── property.json      # ভবন, ফ্ল্যাট, রুম, সিট
  │   └── errors.json        # সতর্কবার্তা ও ভ্যালিডেশন
  └── en/
      ├── common.json
      ├── meals.json
      ├── finance.json
      ├── property.json
      └── errors.json
  ```

### 6.2 Currency & Number Formatter
- Dedicated utility `formatCurrency(amount, locale)`:
  - `formatCurrency(1500, 'bn')` $\rightarrow$ `৳ ১,৫০০.০০`
  - `formatCurrency(1500, 'en')` $\rightarrow$ `BDT 1,500.00`
- Date formatting localized with Gregorian-Bengali calendar text.

---

## 7. Data Synchronization & Persistence Modes

The system supports two persistence modes to ensure compatibility with traditional databases and cloud spreadsheets:

### 7.1 Primary Mode: Relational SQL Engine (Recommended)
- **Database:** PostgreSQL 15+ (Production) / SQLite 3 (Local Development & Edge Testing).
- **ORM / Query Builder:** Prisma / Drizzle ORM / Kysely for type safety and clean migration scripts.
- **Indexing Strategy:**
  - Composite Index on `meals(border_id, meal_date)` for instantaneous 31-day meal grid reads.
  - Index on `allocations(seat_id, is_active)` for zero-conflict seat lookups.
  - Index on `invoices(border_id, billing_month, status)` for instant accounts reconciliation.

### 7.2 Secondary Mode: Google Sheets Connector (Blueprint Feature)
- Dedicated `GoogleSheetsSyncService` for operators who require Google Sheets as their primary/backup spreadsheet:
  - Uses Google Sheets API v4 with Service Account credentials.
  - Asynchronous background worker pushes daily meal totals and monthly invoices to pre-formatted spreadsheet tabs.

---

## 8. Directory & Project Structure

The project follows standard Clean Architecture / Modular Monolith conventions:

```
bachelor-home-erp/
├── docs/
│   ├── prd.md                           # Product Requirements Document
│   ├── system_architecture.md           # This Architecture Document
│   ├── database_design.md               # Detailed Schemas & DDL (Phase 3)
│   └── api_specifications.md            # REST API Specifications (Phase 4)
├── src/
│   ├── core/                            # Core domain rules & constants
│   │   ├── config/                      # Environment variables, constants
│   │   ├── errors/                      # Domain & HTTP errors
│   │   └── utils/                       # Date/Timezone, Currency, Hashers
│   ├── modules/                         # Feature Modules (Bounded Contexts)
│   │   ├── auth/                        # Login, JWT, Roles, Middleware
│   │   ├── property/                    # Building, Flat, Room, Seat
│   │   ├── border/                      # Border KYC, Profiles, Documents
│   │   ├── allocation/                  # Seat Allocation, Transfer, Release
│   │   ├── meal/                        # Meal Roster, 10 PM Cron, Cutoff Engine
│   │   ├── bazaar/                      # Daily Grocery Expense, Categories
│   │   ├── billing/                     # Invoices, Calculations, Due Ledger
│   │   ├── payment/                     # Money Receipts, MFS Reconcile
│   │   ├── reports/                     # P&L, Occupancy, 31-Day Matrix
│   │   └── audit/                       # Immutable Audit Logger
│   ├── infrastructure/                  # External connections
│   │   ├── database/                    # DB Client, Migrations, Seeds
│   │   ├── storage/                     # File upload handler (Local/S3)
│   │   ├── cron/                        # Scheduled workers (Node-cron / Bull)
│   │   └── notifications/               # SMS / WhatsApp / Email adaptors
│   ├── public/                          # Static assets, styles, icons
│   └── views/ or client/                # Bilingual Frontend SPA / SSR views
│       ├── locales/                     # bn.json & en.json
│       ├── components/                  # UI Design System components
│       └── pages/                       # Dashboard, Meal Grid, Billing, KYC
├── package.json
└── README.md
```

---

## 9. Technology Stack Recommendation

| Component | Recommended Stack | Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | **React / Next.js / Vanilla JS + Tailwind / CSS3** | Ultra-fast load times, responsive on mobile, rich modern aesthetics. |
| **Backend Runtime** | **Node.js (TypeScript / Express or Fastify)** | Event-driven, non-blocking I/O for heavy concurrent meal toggling. |
| **Primary Database** | **PostgreSQL (Prod) / SQLite (Dev)** | Relational integrity for financial ledgers and seat hierarchies. |
| **Scheduled Tasks (Cron)** | **Node-Cron / BullMQ (Redis-backed)** | Sub-second accuracy for the 10:00 PM cutoff trigger. |
| **Report Generation** | **Puppeteer / PDFKit & SheetJS (xlsx)** | Native Bengali typography rendering for PDF receipts & Excel export. |
| **Cloud / Hosting** | **Docker + VPS / Railway / Vercel** | Containerized, easily maintainable, horizontal scaling. |

---

## 10. Next Steps in Architecture Execution

With the PRD and System Architecture defined, the next immediate steps are:
1. **`database_design.md`** — Complete SQL Schemas, Table DDLs, foreign keys, cascade rules, and sample seed records.
2. **`api_specifications.md`** — Complete RESTful endpoint definitions, JSON payloads, status codes, and error models.
3. **`ui_ux_architecture.md`** — Frontend Component architecture, state tree, route maps, and bilingual design system.
