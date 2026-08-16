# MaalyPlus Lead Generation Backend API

A standalone Node.js (Express) REST API for managing finance request form submissions and lead generation for MaalyPlus, backed by an embedded SQLite database.

---

## 🌟 Key Features

- **RESTful Endpoints**: Ingests Individual (`فرد`) and Enterprise (`منشأة`) leads, provides lead retrieval by reference and paginated lead listings.
- **SQLite Persistence**: Embedded database with automatic initialization, migrations, and performance indexing.
- **Robust Validation**: Powered by Zod for comprehensive payload validation, type coercion, and user-friendly error formatting.
- **Reference Number Generation**: Automatically creates standardized tracking identifiers (`MP-YYMM-XXXX`).
- **Flexible Ingestion**: Accepts both `application/json` and `application/x-www-form-urlencoded` payloads.
- **Automated Verification**: Full automated test suite for HTTP API endpoints and direct SQLite database verification.

---

## 🏗️ Architecture & Layout

```
backend/
├── package.json
├── .env.example
├── .gitignore
├── README.md
├── data/
│   └── leads.db               # SQLite database file (auto-generated)
├── src/
│   ├── app.js                 # Express application & middleware configuration
│   ├── server.js              # Server bootstrapper & graceful shutdown
│   ├── config/
│   │   └── database.js        # SQLite database connection & schema setup
│   ├── controllers/
│   │   └── leadsController.js # Route controller logic
│   ├── routes/
│   │   ├── index.js           # API root router
│   │   ├── health.js          # Health check route
│   │   └── leads.js           # Leads CRUD routes
│   ├── services/
│   │   └── leadService.js     # Data access and business logic
│   └── validators/
│       └── leadValidator.js   # Zod validation schemas & middleware
└── test/
    ├── helpers/
    │   └── testDb.js          # Test database helper
    ├── health.test.js         # Liveness & DB connectivity test
    ├── leads.test.js          # Ingestion & validation integration tests
    └── db.test.js             # Direct SQLite row persistence assertions
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Run Automated Tests
```bash
npm test
```

---

## 📡 API Reference

### 1. Health Check
`GET /api/health`

**Response (`200 OK`)**:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-08-16T12:45:00.000Z",
  "version": "1.0.0"
}
```

---

### 2. Submit Individual Lead
`POST /api/leads` (or `POST /api/finance-request`)

**Headers**: `Content-Type: application/json` or `application/x-www-form-urlencoded`

**Request Payload**:
```json
{
  "applicant_type": "فرد",
  "ind_product": "قرض شخصي",
  "ind_amount": 10000,
  "ind_tenor": 5,
  "ind_sharia": "لا يهمّني",
  "ind_income": 800,
  "ind_obligations": 100,
  "ind_employment": "قطاع خاص",
  "ind_job_years": "أكثر من 5 سنوات",
  "ind_transfer": "نعم",
  "full_name": "أحمد محمود",
  "phone": "0791234567",
  "email": "ahmad@example.com",
  "governorate": "عمّان",
  "notes": "أفضّل بنكاً في منطقة الشميساني",
  "consent": true
}
```

**Response (`201 Created`)**:
```json
{
  "success": true,
  "message": "Lead received and registered successfully",
  "data": {
    "id": 1,
    "ref": "MP-2608-8412",
    "applicant_type": "فرد",
    "status": "pending",
    "created_at": "2026-08-16T12:45:00.000Z"
  }
}
```

---

### 3. Submit Enterprise Lead
`POST /api/leads`

**Request Payload**:
```json
{
  "applicant_type": "منشأة",
  "biz_name": "شركة الأمل للتجارة العامة",
  "biz_legal": "شركة ذات مسؤولية محدودة",
  "biz_sector": "تجارة جملة وتجزئة",
  "biz_purpose": "رأس مال عامل وسيولة",
  "biz_amount": 50000,
  "biz_tenor": 3,
  "doc_cr": "نعم",
  "doc_license": "نعم",
  "full_name": "سارة الخالد",
  "phone": "0789876543",
  "email": "sara@alamal.com",
  "governorate": "إربد",
  "consent": true
}
```

---

### 4. Query Lead by Reference
`GET /api/leads/:ref`

**Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "ref": "MP-2608-8412",
    "applicant_type": "فرد",
    "status": "pending",
    "full_name": "أحمد محمود",
    "phone": "0791234567",
    "email": "ahmad@example.com",
    "governorate": "عمّان",
    "ind_product": "قرض شخصي",
    "ind_amount": 10000,
    "ind_tenor": 5,
    "created_at": "2026-08-16T12:45:00.000Z"
  }
}
```

---

### 5. List Leads (Admin / Portal)
`GET /api/leads?status=pending&applicant_type=فرد&limit=20`

**Response (`200 OK`)**:
```json
{
  "success": true,
  "total": 1,
  "count": 1,
  "data": [
    {
      "id": 1,
      "ref": "MP-2608-8412",
      "applicant_type": "فرد",
      "status": "pending",
      "full_name": "أحمد محمود",
      "phone": "0791234567",
      "email": "ahmad@example.com",
      "governorate": "عمّان"
    }
  ]
}
```
