# Backend API Routes - Complete Implementation

## ✅ Admin Login API

**File**: `app/api/admin/login/route.ts`

### POST `/api/admin/login`

**Purpose**: Authenticate admin users and create secure session

**Request Body**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Features**:
- ✅ Queries `tb_admin` table using Prisma
- ✅ Validates credentials using bcrypt password comparison
- ✅ Creates signed session token with HMAC-SHA256
- ✅ Sets HttpOnly cookie `admin_session` (24-hour expiry)
- ✅ Secure flag enabled in production
- ✅ SameSite: lax for CSRF protection

**Response** (Success - 200):
```json
{
  "success": true,
  "message": "Login successful"
}
```

**Response** (Error - 401):
```json
{
  "error": "Invalid credentials"
}
```

---

## ✅ Events API

**File**: `app/api/events/route.ts`

### GET `/api/events`

**Purpose**: Fetch all active events for public display

**Features**:
- ✅ Queries `tb_event` where `is_active = true`
- ✅ Ordered by `created_at` DESC (newest first)
- ✅ Formats dates to readable strings
- ✅ Returns frontend-compatible format

**Response** (200):
```json
{
  "events": [
    {
      "_id": "uuid-string",
      "title": "Web3 Summit 2026",
      "description": "Annual blockchain conference",
      "date": "March 15, 2026 • 2:00 PM GMT",
      "venue": "",
      "category": "conference",
      "priceInPOL": "5.5",
      "totalQuota": 100,
      "availableQuota": 100,
      "bannerImage": "https://..."
    }
  ]
}
```

---

### POST `/api/events`

**Purpose**: Create new event (Admin only)

**Authentication**: Requires valid `admin_session` cookie

**Request Body**:
```json
{
  "title": "Web3 Summit 2026",
  "description": "Annual blockchain conference",
  "event_date": "2026-03-15T14:00:00Z",
  "price_pol": 5.5,
  "quota": 100,
  "banner_url": "https://...",
  "is_active": true
}
```

**Features**:
- ✅ Protected by `verifyAdminSession()` middleware
- ✅ Validates required fields (title, event_date, price_pol, quota)
- ✅ Validates date format
- ✅ Inserts into `tb_event` using Prisma
- ✅ Returns created event with formatted data

**Response** (Success - 200):
```json
{
  "success": true,
  "message": "Event created successfully",
  "event": {
    "_id": "uuid-string",
    "title": "Web3 Summit 2026",
    "description": "Annual blockchain conference",
    "date": "2026-03-15T14:00:00.000Z",
    "priceInPOL": "5.5",
    "totalQuota": 100,
    "availableQuota": 100,
    "bannerImage": "https://...",
    "is_active": true
  }
}
```

**Response** (Unauthorized - 401):
```json
{
  "error": "Unauthorized. Admin login required."
}
```

**Response** (Validation Error - 400):
```json
{
  "error": "title, event_date, price_pol, and quota are required"
}
```

---

## 🔐 Admin Authentication Helper

**File**: `lib/admin-auth.ts`

### `verifyAdminSession()`

**Purpose**: Verify admin session cookie for protected routes

**Features**:
- ✅ Reads `admin_session` cookie
- ✅ Decodes Base64 token
- ✅ Verifies HMAC signature
- ✅ Checks expiration timestamp
- ✅ Returns boolean (true if valid)

**Usage**:
```typescript
import { verifyAdminSession } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  // ... protected logic
}
```

---

## 🗄️ Database Schema (Prisma 7)

**File**: `prisma/schema.prisma`

### Tables Used by APIs:

**`tb_admin`**:
- `id` (Int, PK)
- `username` (String, unique)
- `password` (String, hashed with bcrypt)
- `created_at` (DateTime)

**`tb_event`**:
- `id` (String UUID, PK)
- `title` (String)
- `description` (Text)
- `event_date` (DateTime)
- `price_pol` (Float)
- `quota` (Int)
- `banner_url` (String)
- `is_active` (Boolean, default: true)
- `created_at` (DateTime)

---

## 🔧 Configuration

### Environment Variables (`.env.local`):
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
ADMIN_SESSION_SECRET="your-secret-here"
```

### Prisma Client (`lib/prisma.ts`):
- ✅ Uses `@prisma/adapter-pg` (Prisma 7 requirement)
- ✅ Connection pooling via `pg` driver
- ✅ Singleton pattern for Next.js
- ✅ Development logging enabled

---

## 🧪 Testing

### Test Admin Login:
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Test Get Events:
```bash
curl http://localhost:3000/api/events
```

### Test Create Event (with admin session):
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -H "Cookie: admin_session=..." \
  -d '{
    "title": "Test Event",
    "description": "Test Description",
    "event_date": "2026-04-01T10:00:00Z",
    "price_pol": 3.5,
    "quota": 50,
    "banner_url": "https://example.com/banner.jpg"
  }'
```

---

## ✅ Status

- [x] Admin Login API with bcrypt + session cookies
- [x] Events GET API (public, ordered by created_at DESC)
- [x] Events POST API (admin-protected)
- [x] Session verification helper
- [x] Prisma 7 adapter configuration
- [x] Error handling & validation
- [x] TypeScript types

**All backend API routes are production-ready!** 🚀
