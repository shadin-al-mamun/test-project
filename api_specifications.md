# RESTful API Specifications
## Project Name: Bachelor Home Hostel ERP (ব্যাচেলর হোম হোস্টেল ইআরপি)
**Document Version:** 1.0.0  
**Status:** Approved for Implementation Phase  
**Base References:** [prd.md](file:///c:/Users/MTBD/Documents/Bachelor%20Home%20ERP/prd.md) | [system_architecture.md](file:///c:/Users/MTBD/Documents/Bachelor%20Home%20ERP/system_architecture.md) | [database_design.md](file:///c:/Users/MTBD/Documents/Bachelor%20Home%20ERP/database_design.md)  
**Standard:** OpenAPI 3.0 Compatible | RESTful JSON  

---

## 1. Global API Standards & Conventions

### 1.1 Base URL & Content Negotiation
- **Base Endpoint:** `https://api.bachelorhome.com/api/v1` (Production) | `http://localhost:5000/api/v1` (Development)
- **Headers:**
  - `Content-Type: application/json; charset=utf-8`
  - `Accept: application/json`
  - `Authorization: Bearer <JWT_ACCESS_TOKEN>`
  - `X-Timezone: Asia/Dhaka`
  - `Accept-Language: bn` (or `en`)

### 1.2 Uniform JSON Envelope Structure

#### Success Response Envelope (HTTP 200, 201)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "অপারেশন সফল হয়েছে (Operation successful)",
  "data": {},
  "meta": {
    "timestamp": "2026-10-07T22:00:00+06:00",
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalRecords": 85,
      "totalPages": 5
    }
  }
}
```

#### Error Response Envelope (HTTP 400, 401, 403, 404, 409, 422, 500)
```json
{
  "success": false,
  "statusCode": 400,
  "error": {
    "code": "CUTOFF_WINDOW_EXCEEDED",
    "message": "রাত ১০:০০ টার পর পরদিনের মিল পরিবর্তন করা যাবে না। ম্যানেজারের সাথে যোগাযোগ করুন।",
    "details": [
      {
        "field": "meal_date",
        "issue": "Modification locked after 22:00:00 Asia/Dhaka"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-10-07T22:15:20+06:00"
  }
}
```

---

## 2. API Endpoints by Feature Module

### 2.1 Module 1: Authentication & User Profile (`/auth`, `/users`)

#### 2.1.1 User Login
- **Endpoint:** `POST /api/v1/auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "identifier": "01700000001", // Mobile number or email
  "password": "SecurePassword123"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "সফলভাবে লগইন হয়েছে",
  "data": {
    "user": {
      "id": "b0000000-0000-0000-0000-000000000001",
      "name": "Super Administrator",
      "phone": "01700000001",
      "role": "SUPER_ADMIN",
      "preferredLanguage": "bn"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5...",
      "refreshToken": "d8e3b2a1...",
      "expiresIn": 900
    }
  }
}
```

#### 2.1.2 Refresh Token
- **Endpoint:** `POST /api/v1/auth/refresh-token`
- **Access:** Public (With Refresh Token)
- **Request Body:** `{ "refreshToken": "d8e3b2a1..." }`
- **Response (200 OK):** Returns new `accessToken` and rotated `refreshToken`.

#### 2.1.3 Current User Profile
- **Endpoint:** `GET /api/v1/auth/me`
- **Access:** Authenticated (Any Role)
- **Response (200 OK):** Returns current user details, role permissions, and active border/seat info (if role is `BORDER`).

---

### 2.2 Module 2: Property & Seat Hierarchy (`/buildings`, `/flats`, `/rooms`, `/seats`)

#### 2.2.1 Get All Buildings
- **Endpoint:** `GET /api/v1/buildings`
- **Access:** `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `ACCOUNTANT`
- **Query Params:** `?page=1&limit=10&status=active`
- **Response (200 OK):** Array of buildings with total floors and contact info.

#### 2.2.2 Create New Building
- **Endpoint:** `POST /api/v1/buildings`
- **Access:** `SUPER_ADMIN`, `ADMIN`
- **Request Body:**
```json
{
  "name": "Green View Building (গ্রিন ভিউ ভবন)",
  "code": "BLD-1",
  "address": "House #12, Road #4, Mirpur-10, Dhaka",
  "caretakerName": "Abdul Karim",
  "caretakerPhone": "01811000000",
  "totalFloors": 5
}
```

#### 2.2.3 Visual Seat Occupancy Matrix
- **Endpoint:** `GET /api/v1/seats/occupancy-matrix`
- **Access:** `SUPER_ADMIN`, `ADMIN`, `MANAGER`
- **Query Params:** `?buildingId=c0000000...&flatId=&status=AVAILABLE`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalSeats": 80,
    "occupiedSeats": 68,
    "availableSeats": 8,
    "bookedSeats": 2,
    "maintenanceSeats": 2,
    "occupancyRate": 85.0,
    "hierarchy": [
      {
        "buildingName": "Green View Building",
        "flats": [
          {
            "flatNumber": "Flat 3-A",
            "floor": 3,
            "rooms": [
              {
                "roomNumber": "Room 301",
                "category": "DOUBLE",
                "seats": [
                  {
                    "seatId": "f0000000-0000-0000-0000-000000000001",
                    "seatCode": "B1-F3A-R301-S1",
                    "label": "Window Bed",
                    "baseRent": 3500.00,
                    "status": "OCCUPIED",
                    "currentBorder": {
                      "name": "Tanvir Hasan",
                      "phone": "01722334455"
                    }
                  },
                  {
                    "seatId": "f0000000-0000-0000-0000-000000000002",
                    "seatCode": "B1-F3A-R301-S2",
                    "label": "Door Bed",
                    "baseRent": 3200.00,
                    "status": "AVAILABLE",
                    "currentBorder": null
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

---

### 2.3 Module 3: Border KYC & Resident Management (`/borders`)

#### 2.3.1 Register Border Profile & KYC
- **Endpoint:** `POST /api/v1/borders`
- **Access:** `SUPER_ADMIN`, `ADMIN`, `MANAGER`
- **Request Body:**
```json
{
  "name": "Tanvir Hasan (তানভীর হাসান)",
  "phone": "01722334455",
  "email": "tanvir@gmail.com",
  "nidNumber": "19952691234567890",
  "bloodGroup": "B+",
  "dateOfBirth": "1998-05-14",
  "institutionOrWorkplace": "BRAC Bank Ltd",
  "designation": "Officer",
  "permanentAddress": "Vill: Rampur, Thana: Kasba, Dist: Brahmanbaria",
  "emergencyContactName": "Md. Abul Kashem",
  "emergencyContactRelation": "বাবা (Father)",
  "emergencyContactPhone": "01811223344"
}
```

#### 2.3.2 Upload Border Documents (NID / Photo)
- **Endpoint:** `POST /api/v1/borders/:id/upload-document`
- **Access:** `SUPER_ADMIN`, `ADMIN`, `MANAGER`
- **Content-Type:** `multipart/form-data`
- **Form Fields:** `docType` (`NID_FRONT`, `NID_BACK`, `PASSPORT_PHOTO`), `file`

---

### 2.4 Module 4: Seat Allocation & Lifecycle (`/allocations`)

#### 2.4.1 Check-In & Seat Allocation
- **Endpoint:** `POST /api/v1/allocations/check-in`
- **Access:** `SUPER_ADMIN`, `ADMIN`, `MANAGER`
- **Request Body:**
```json
{
  "borderId": "7b8c9d0e-...",
  "seatId": "f0000000-0000-0000-0000-000000000001",
  "checkInDate": "2026-10-01",
  "agreedRent": 3500.00,
  "securityDeposit": 3500.00,
  "advanceRentPaid": 3500.00,
  "receivingAccountId": "a1111111-0000-0000-0000-000000000001", // Cash Box
  "paymentMethod": "CASH"
}
```
- **Response (201 Created):** Returns allocation record, updates seat to `OCCUPIED`, and issues initial security deposit receipt.

#### 2.4.2 Seat Transfer / Room Swap
- **Endpoint:** `POST /api/v1/allocations/transfer`
- **Access:** `SUPER_ADMIN`, `ADMIN`, `MANAGER`
- **Request Body:**
```json
{
  "currentAllocationId": "alloc-1234",
  "newSeatId": "seat-5678",
  "effectiveDate": "2026-10-15",
  "newAgreedRent": 4000.00,
  "reason": "Moved to AC room on 2nd floor"
}
```

#### 2.4.3 Final Checkout Clearance & Vacating
- **Endpoint:** `POST /api/v1/allocations/checkout`
- **Access:** `SUPER_ADMIN`, `ADMIN`, `MANAGER`
- **Request Body:**
```json
{
  "allocationId": "alloc-1234",
  "checkOutDate": "2026-10-31",
  "deductUnpaidBills": true,
  "refundAccountId": "a1111111-0000-0000-0000-000000000001",
  "notes": "Completed degree and leaving Dhaka"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalDuesOutstanding": 1200.00,
    "securityDepositHeld": 3500.00,
    "netRefundPayable": 2300.00,
    "seatFreed": "B1-F3A-R301-S1",
    "seatStatus": "AVAILABLE",
    "clearanceVoucherNo": "CLR-202610-0009"
  }
}
```

---

### 2.5 Module 5: Daily Meal Management & 10 PM Cutoff (`/meals`)

#### 2.5.1 Border Self-Service Meal Toggle (Before 22:00:00 Asia/Dhaka)
- **Endpoint:** `POST /api/v1/meals/toggle-self`
- **Access:** `BORDER` (Or Admin/Manager)
- **Request Body:**
```json
{
  "mealDate": "2026-10-08", // Tomorrow's date
  "breakfast": 1.0,
  "lunch": 1.0,
  "dinner": 0.0,            // Going out, turned off
  "guestLunch": 1.0         // Friend coming over
}
```
- **Validation:** Server verifies `NOW() < 2026-10-07 22:00:00 Asia/Dhaka`.
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "পরদিনের খাবার সফলভাবে আপডেট হয়েছে।",
  "data": {
    "mealDate": "2026-10-08",
    "totalUnits": 3.0,
    "isLocked": false
  }
}
```
- **Response (400 Bad Request if after 22:00:00):**
```json
{
  "success": false,
  "statusCode": 400,
  "error": {
    "code": "CUTOFF_WINDOW_EXCEEDED",
    "message": "রাত ১০:০০ টার পর পরদিনের মিল পরিবর্তন স্বয়ংক্রিয়ভাবে বন্ধ হয়ে গেছে।"
  }
}
```

#### 2.5.2 Manager Emergency Override (Post-10 PM)
- **Endpoint:** `POST /api/v1/meals/manager-override`
- **Access:** `SUPER_ADMIN`, `ADMIN`, `MANAGER`
- **Request Body:**
```json
{
  "borderId": "7b8c9d0e-...",
  "mealDate": "2026-10-08",
  "breakfast": 1.0,
  "lunch": 1.0,
  "dinner": 1.0,
  "guestDinner": 0.0,
  "auditReason": "বর্ডার জরুরি কাজে রাত ১১টায় ফিরেছেন, মালিকের নির্দেশে রাতের খাবার যোগ করা হলো।"
}
```
- **Response (200 OK):** Updates meal record and writes an immutable audit record to `audit_logs`.

#### 2.5.3 Daily Kitchen Requisition & Headcount
- **Endpoint:** `GET /api/v1/meals/kitchen-requisition?date=2026-10-08`
- **Access:** `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `STAFF`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "targetDate": "2026-10-08",
    "status": "LOCKED",
    "summary": {
      "breakfastHeadcount": 42.5,
      "lunchHeadcount": 58.0,
      "dinnerHeadcount": 64.0,
      "totalGuestMeals": 4.0,
      "grandTotalMealUnits": 164.5
    },
    "suggestedGroceryRequisition": {
      "estimatedRiceKg": 18.5,
      "estimatedFishOrMeatKg": 12.0
    }
  }
}
```

#### 2.5.4 31-Day Complete Meal Matrix Grid
- **Endpoint:** `GET /api/v1/meals/monthly-grid`
- **Access:** `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `ACCOUNTANT`
- **Query Params:** `?month=2026-10&buildingId=c0000000...`
- **Response (200 OK):** Returns matrix containing all borders on Y-axis, days 1 to 31 on X-axis, total individual sums, and daily mess totals.

---

### 2.6 Module 6: Bazaar & Mess Grocery Procurement (`/bazaar-expenses`)

#### 2.6.1 Add Daily Grocery/Bazaar Entry
- **Endpoint:** `POST /api/v1/bazaar-expenses`
- **Access:** `SUPER_ADMIN`, `ADMIN`, `MANAGER`
- **Request Body:**
```json
{
  "expenseDate": "2026-10-08",
  "category": "মাছ ও মাংস (Fish & Meat)",
  "itemDescription": "রুই মাছ ৪ কেজি, ব্রয়লার মুরগি ৬ কেজি, কাঁচামরিচ",
  "amount": 2850.00,
  "paidFromAccountId": "a1111111-0000-0000-0000-000000000001", // Cash Box
  "voucherImageUrl": "https://cdn.bachelorhome.com/receipts/20261008-01.jpg"
}
```

#### 2.6.2 List Bazaar Expenses
- **Endpoint:** `GET /api/v1/bazaar-expenses?from=2026-10-01&to=2026-10-31`
- **Access:** All Authenticated Roles (Read)
- **Response (200 OK):** Itemized list with total monthly grocery expense sum.

---

### 2.7 Module 7: Billing, Meal Rate & Accounting (`/billing`, `/invoices`, `/payments`)

#### 2.7.1 Calculate Dynamic Meal Rate
- **Endpoint:** `POST /api/v1/billing/calculate-meal-rate`
- **Access:** `SUPER_ADMIN`, `ADMIN`, `ACCOUNTANT`
- **Request Body:**
```json
{
  "billingMonth": "2026-10",
  "includeKitchenOverheads": true,
  "closeMonth": false // Preview mode if false, permanently locks rate if true
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "billingMonth": "2026-10",
    "totalBazaarExpenses": 84250.00,
    "totalKitchenOverheads": 6000.00,
    "grandTotalMessCost": 90250.00,
    "totalMealsConsumed": 1450.0,
    "calculatedMealRate": 62.2414,
    "formattedMealRate": "৳ ৬২.২৪ / মিল",
    "isClosed": false
  }
}
```

#### 2.7.2 Generate Monthly Invoices (1st of Month)
- **Endpoint:** `POST /api/v1/billing/generate-monthly-invoices`
- **Access:** `SUPER_ADMIN`, `ADMIN`, `ACCOUNTANT`
- **Request Body:**
```json
{
  "billingMonth": "2026-10",
  "dueDate": "2026-10-10",
  "applyMealBill": true,
  "utilityItems": [
    { "type": "ELECTRICITY", "amountPerBorder": 350.00, "description": "বিদ্যুৎ বিল (সাব-মিটার শেয়ার)" },
    { "type": "WIFI", "amountPerBorder": 150.00, "description": "হাই-স্পিড ওয়াইফাই বিল" },
    { "type": "GAS", "amountPerBorder": 200.00, "description": "গ্যাস সিলিন্ডার বিল" },
    { "type": "MAID_SALARY", "amountPerBorder": 400.00, "description": "খালা ও রান্নার বেতন" }
  ]
}
```
- **Response (201 Created):** Invoices generated for all active borders with prior due balances carried forward.

#### 2.7.3 Record Rent/Bill Payment & Generate Money Receipt
- **Endpoint:** `POST /api/v1/payments/collect`
- **Access:** `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `ACCOUNTANT`
- **Request Body:**
```json
{
  "invoiceId": "inv-9876",
  "borderId": "7b8c9d0e-...",
  "amount": 5500.00,
  "paymentMethod": "BKASH",
  "accountId": "a1111111-0000-0000-0000-000000000002", // bKash Merchant
  "transactionRef": "BKH9281746",
  "sendSmsNotification": true
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "পেমেন্ট সফলভাবে জমা হয়েছে এবং মানি রসিদ তৈরি হয়েছে।",
  "data": {
    "receiptNo": "MR-202610-0042",
    "amountPaid": 5500.00,
    "remainingInvoiceDue": 500.00,
    "accountNewBalance": 48000.00,
    "receiptDownloadUrl": "/api/v1/payments/receipts/MR-202610-0042/pdf"
  }
}
```

---

### 2.8 Module 8: Reports, Google Sheets Sync & BI (`/reports`)

#### 2.8.1 Monthly Dues & Defaulters Aging Report
- **Endpoint:** `GET /api/v1/reports/defaulters?month=2026-10`
- **Access:** `SUPER_ADMIN`, `ADMIN`, `ACCOUNTANT`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalBilled": 240000.00,
    "totalCollected": 195000.00,
    "totalOutstandingDue": 45000.00,
    "agingCategories": {
      "due_1_to_10_days": 25000.00,
      "due_11_to_20_days": 15000.00,
      "due_over_20_days": 5000.00
    },
    "defaulters": [
      {
        "borderName": "Rahim Ahmed",
        "roomSeat": "Room 302 / S1",
        "phone": "01911223344",
        "totalDue": 6500.00,
        "daysOverdue": 12
      }
    ]
  }
}
```

#### 2.8.2 Trigger Google Sheets Two-Way Sync / Export
- **Endpoint:** `POST /api/v1/reports/export/google-sheets`
- **Access:** `SUPER_ADMIN`, `ADMIN`
- **Request Body:**
```json
{
  "targetMonth": "2026-10",
  "syncTabs": ["Daily_Meals", "Bazaar_Expenses", "Invoices", "Receipts"]
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "গুগল শিট সফলভাবে আপডেট হয়েছে।",
  "data": {
    "spreadsheetUrl": "https://docs.google.com/spreadsheets/d/1BxiMVs0XR...",
    "syncedRows": 450,
    "syncedAt": "2026-10-07T12:45:00+06:00"
  }
}
```

---

### 2.9 Module 9: Border Self-Service Mobile Portal (`/portal`)

#### 2.9.1 Border Mobile App Login
- **Endpoint:** `POST /api/v1/portal/login`
- **Access:** Public (Border Authentication)
- **Request Body:**
```json
{
  "identifier": "01722334455",
  "password": "SecurePassword123"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "সফলভাবে লগইন হয়েছে",
  "data": {
    "token": "brd_session_brd-001_1791360000000",
    "border": {
      "id": "brd-001",
      "name": "তানভীর হাসান (Tanvir Hasan)",
      "phone": "01722334455",
      "seatCode": "B1-F3A-R301-S1"
    }
  }
}
```

#### 2.9.2 Border Change Password
- **Endpoint:** `POST /api/v1/portal/change-password`
- **Access:** `BORDER`
- **Request Body:**
```json
{
  "borderId": "brd-001",
  "oldPassword": "CurrentPassword123",
  "newPassword": "NewStrongPassword456"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!"
}
```

#### 2.9.3 Get Border Profile & Mobile Dashboard
- **Endpoint:** `GET /api/v1/portal/me?borderId=brd-001`
- **Access:** `BORDER` (Or Authenticated Mobile Client)
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "border": {
      "id": "brd-001",
      "name": "তানভীর হাসান",
      "phone": "01722334455",
      "nidNumber": "19952691234567890",
      "institution": "BRAC Bank Ltd (অফিসার)",
      "emergencyContactName": "মোঃ আবুল কাশেম (বাবা)",
      "emergencyContactPhone": "01811223344"
    },
    "stay": {
      "buildingName": "Green View Building",
      "flatNumber": "Flat 3-A",
      "roomNumber": "Room 301",
      "seatCode": "B1-F3A-R301-S1",
      "seatLabel": "জানালা সিট",
      "agreedRent": 3500.00,
      "securityDeposit": 3500.00,
      "checkInDate": "2026-08-01"
    },
    "meals": {
      "today": { "breakfast": 1, "lunch": 1, "dinner": 1, "guest": 0 },
      "tomorrow": { "breakfast": 1, "lunch": 1, "dinner": 0, "guest": 0 },
      "totalMealsThisMonth": 42.5,
      "estimatedMealRate": 62.24
    },
    "finance": {
      "invoice": {
        "totalAmount": 7200.00,
        "paidAmount": 7200.00,
        "dueAmount": 0.00,
        "status": "PAID"
      }
    },
    "todayMenu": {
      "breakfast": "ডিম ভুনা, পরোটা (৩টি), স্পেশাল চা",
      "lunch": "রুই মাছ ভুনা, আলু-পটলের তরকারি, মসুর ডাল, গরম ভাত",
      "dinner": "সোনালি মুরগির মাংস, করলা ভাজি, ঘন ডাল, ভাত"
    }
  }
}
```

#### 2.9.2 Submit Maintenance / Issue Complaint
- **Endpoint:** `POST /api/v1/portal/submit-complaint`
- **Access:** `BORDER`
- **Request Body:**
```json
{
  "borderId": "brd-001",
  "category": "বৈদ্যুতিক (ফ্যান/লাইট/সুইচ)",
  "description": "রুমের সিলিং ফ্যানে সমস্যা হচ্ছে, আওয়াজ করে।"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "আপনার অভিযোগটি মেস ম্যানেজারের নিকট জমা হয়েছে।"
}
```


---

## 3. API Error Catalog & Troubleshooting

| HTTP Status | Error Code | Description (বাংলা) | Description (EN) |
| :---: | :--- | :--- | :--- |
| `401` | `INVALID_CREDENTIALS` | ভুল ফোন নম্বর বা পাসওয়ার্ড। | Incorrect phone or password. |
| `401` | `TOKEN_EXPIRED` | সেশনের মেয়াদ শেষ হয়েছে, পুনরায় লগইন করুন। | Access token expired. |
| `403` | `FORBIDDEN_ACTION` | আপনার এই কাজটি করার অনুমতি নেই। | Insufficient role permissions. |
| `400` | `CUTOFF_WINDOW_EXCEEDED` | রাত ১০:০০ টার পর পরদিনের মিল পরিবর্তন বন্ধ। | 10:00 PM cutoff window exceeded. |
| `400` | `SEAT_NOT_AVAILABLE` | নির্বাচিত সিটটি ইতিমধ্যে বরাদ্দকৃত বা বুকড। | Seat is already occupied or booked. |
| `400` | `NEGATIVE_PAYMENT_AMOUNT` | টাকার পরিমাণ শূন্য বা নেগেটিভ হতে পারবে না। | Payment amount must be greater than zero. |
| `404` | `RESOURCE_NOT_FOUND` | কাঙ্ক্ষিত তথ্য পাওয়া যায়নি। | Resource not found in database. |
| `409` | `DUPLICATE_PHONE_OR_NID` | এই ফোন নম্বর বা এনআইডি ইতিমধ্যে নিবন্ধিত। | Phone or NID is already registered. |
| `422` | `VALIDATION_FAILED` | ইনপুট ফর্মে ভুল তথ্য দেওয়া হয়েছে। | Request schema validation failed. |

---

## 4. Next Steps in Architecture Execution

With `prd.md`, `system_architecture.md`, `database_design.md`, and `api_specifications.md` fully completed, the final blueprint document in this sequence is:
- **`ui_ux_architecture.md`** — Frontend Component Hierarchy, State Management, Screen Flow Wireframes, Bilingual i18n Dictionary Structure, and Color/Typography Tokens.
