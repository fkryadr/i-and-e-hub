# Event Update & Delete API - Complete

## ✅ Dynamic API Route Created

**File**: `app/api/events/[id]/route.ts`

A complete REST API endpoint for managing individual events with GET, PUT/PATCH, and DELETE operations.

---

## 📍 API Endpoints

### Base URL: `/api/events/[id]`

Where `[id]` is the UUID of the event from the database.

---

## 🔍 GET - Fetch Single Event

### Endpoint:
```
GET /api/events/[id]
```

### Purpose:
Retrieve detailed information about a specific event by its ID.

### Authentication:
- ❌ Not required (public endpoint)

### Request:
```bash
curl http://localhost:3000/api/events/123e4567-e89b-12d3-a456-426614174000
```

### Response (Success - 200):
```json
{
  "event": {
    "_id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Web3 Summit 2026",
    "description": "Annual blockchain conference",
    "date": "March 15, 2026 • 2:00 PM GMT",
    "event_date": "2026-03-15T14:00:00.000Z",
    "priceInPOL": "5.5",
    "price_pol": 5.5,
    "quota": 100,
    "totalQuota": 100,
    "availableQuota": 100,
    "banner_url": "https://...",
    "bannerImage": "https://...",
    "is_active": true,
    "created_at": "2026-02-27T10:00:00.000Z"
  }
}
```

### Response (Not Found - 404):
```json
{
  "error": "Event not found"
}
```

---

## ✏️ PUT/PATCH - Update Event

### Endpoint:
```
PUT /api/events/[id]
PATCH /api/events/[id]
```

### Purpose:
Update an existing event's details. Both PUT and PATCH work identically (partial updates supported).

### Authentication:
- ✅ **Required**: Admin session cookie (`admin_session`)

### Request Body:
```json
{
  "title": "Updated Event Title",
  "description": "Updated description",
  "event_date": "2026-04-01T10:00:00Z",
  "price_pol": 7.5,
  "quota": 150,
  "banner_url": "https://new-banner.jpg",
  "is_active": true
}
```

**Notes:**
- All fields are optional (partial updates supported)
- At least one field must be provided
- Only provided fields will be updated

### Field Validation:

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `title` | String | No | Trimmed |
| `description` | String | No | Trimmed |
| `event_date` | ISO String | No | Valid date format |
| `price_pol` | Number | No | Parsed as float |
| `quota` | Number | No | Parsed as integer |
| `banner_url` | String | No | Trimmed |
| `is_active` | Boolean | No | Converted to boolean |

### Example Request:
```bash
curl -X PUT http://localhost:3000/api/events/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -H "Cookie: admin_session=..." \
  -d '{
    "title": "Updated Web3 Summit",
    "price_pol": 7.5,
    "quota": 150
  }'
```

### Response (Success - 200):
```json
{
  "success": true,
  "message": "Event updated successfully",
  "event": {
    "_id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Updated Web3 Summit",
    "description": "Annual blockchain conference",
    "date": "2026-03-15T14:00:00.000Z",
    "priceInPOL": "7.5",
    "totalQuota": 150,
    "availableQuota": 150,
    "bannerImage": "https://...",
    "is_active": true
  }
}
```

### Response (Unauthorized - 401):
```json
{
  "error": "Unauthorized. Admin login required."
}
```

### Response (Not Found - 404):
```json
{
  "error": "Event not found"
}
```

### Response (Bad Request - 400):
```json
{
  "error": "At least one field must be provided for update"
}
```

or

```json
{
  "error": "Invalid event_date format"
}
```

---

## 🗑️ DELETE - Delete Event

### Endpoint:
```
DELETE /api/events/[id]
```

### Purpose:
Delete an event from the database. Uses smart deletion strategy:
- **Hard Delete**: If no tickets/certificates exist
- **Soft Delete**: If tickets/certificates exist (sets `is_active = false`)

### Authentication:
- ✅ **Required**: Admin session cookie (`admin_session`)

### Request:
```bash
curl -X DELETE http://localhost:3000/api/events/123e4567-e89b-12d3-a456-426614174000 \
  -H "Cookie: admin_session=..."
```

### Response (Hard Delete - 200):
```json
{
  "success": true,
  "message": "Event deleted successfully",
  "deletedId": "123e4567-e89b-12d3-a456-426614174000"
}
```

### Response (Soft Delete - 200):
```json
{
  "success": true,
  "message": "Event deactivated successfully (soft delete)",
  "note": "Event has related tickets/certificates, so it was deactivated instead of deleted",
  "event": {
    "_id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Web3 Summit 2026",
    "is_active": false
  }
}
```

### Response (Unauthorized - 401):
```json
{
  "error": "Unauthorized. Admin login required."
}
```

### Response (Not Found - 404):
```json
{
  "error": "Event not found"
}
```

### Response (Conflict - 409):
```json
{
  "error": "Cannot delete event due to existing references",
  "note": "This event has related records. Please deactivate it instead."
}
```

---

## 🛡️ Smart Deletion Logic

### Decision Tree:

```
DELETE Request
    │
    ├─ Check if event exists
    │   └─ No → Return 404
    │
    ├─ Check for related records
    │   ├─ Has ticket transactions? → Soft Delete
    │   ├─ Has certificates? → Soft Delete
    │   └─ No related records → Hard Delete
    │
    └─ Return success response
```

### Soft Delete:
```typescript
// Sets is_active to false
await prisma.tb_event.update({
  where: { id },
  data: { is_active: false },
});
```

**When:**
- Event has ticket transactions in `tb_transaksi_tiket`
- Event has certificates in `tb_sertifikat`

**Why:**
- Preserves data integrity
- Maintains transaction history
- Allows reactivation if needed

### Hard Delete:
```typescript
// Permanently removes from database
await prisma.tb_event.delete({
  where: { id },
});
```

**When:**
- No ticket transactions
- No certificates
- Safe to permanently remove

---

## 🔐 Authentication

All write operations (PUT, PATCH, DELETE) require admin authentication:

```typescript
const isAdmin = await verifyAdminSession();
if (!isAdmin) {
  return NextResponse.json(
    { error: "Unauthorized. Admin login required." },
    { status: 401 }
  );
}
```

**How it works:**
1. Reads `admin_session` cookie from request
2. Verifies HMAC signature
3. Checks expiration timestamp
4. Returns `true` if valid, `false` otherwise

---

## 🗄️ Database Operations

### Update Query:
```typescript
await prisma.tb_event.update({
  where: { id },
  data: {
    title: "Updated Title",
    price_pol: 7.5,
    quota: 150,
    // ... other fields
  },
});
```

### Delete Query (with relations check):
```typescript
const event = await prisma.tb_event.findUnique({
  where: { id },
  include: {
    ticketTransactions: true,
    certificates: true,
  },
});

// Check if has relations
if (event.ticketTransactions.length > 0 || event.certificates.length > 0) {
  // Soft delete
} else {
  // Hard delete
  await prisma.tb_event.delete({ where: { id } });
}
```

---

## 🎯 Use Cases

### 1. Edit Event Details
**Scenario**: Admin wants to update event price and quota

```bash
PUT /api/events/[id]
{
  "price_pol": 8.0,
  "quota": 200
}
```

### 2. Deactivate Event
**Scenario**: Admin wants to hide event from public

```bash
PUT /api/events/[id]
{
  "is_active": false
}
```

### 3. Update Banner Image
**Scenario**: Admin wants to change event banner

```bash
PATCH /api/events/[id]
{
  "banner_url": "https://new-image.jpg"
}
```

### 4. Delete Unused Event
**Scenario**: Admin created event by mistake, no tickets sold

```bash
DELETE /api/events/[id]
```
→ Hard delete (permanent removal)

### 5. Delete Event with Tickets
**Scenario**: Admin wants to delete event, but tickets were sold

```bash
DELETE /api/events/[id]
```
→ Soft delete (sets `is_active = false`)

---

## 🧪 Testing

### Test Update Event:
```bash
# 1. Login as admin
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 2. Update event (save cookie from step 1)
curl -X PUT http://localhost:3000/api/events/[id] \
  -H "Content-Type: application/json" \
  -H "Cookie: admin_session=..." \
  -d '{"title":"Updated Title","price_pol":10.5}'

# 3. Verify update
curl http://localhost:3000/api/events/[id]
```

### Test Delete Event:
```bash
# 1. Login as admin
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 2. Delete event
curl -X DELETE http://localhost:3000/api/events/[id] \
  -H "Cookie: admin_session=..."

# 3. Verify deletion (should return 404)
curl http://localhost:3000/api/events/[id]
```

---

## 📊 Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | Success | Operation completed successfully |
| 400 | Bad Request | Invalid data or missing required fields |
| 401 | Unauthorized | Admin session invalid or missing |
| 404 | Not Found | Event with given ID doesn't exist |
| 409 | Conflict | Foreign key constraint violation |
| 500 | Server Error | Database or server error |

---

## 🔄 Related Tables

### Foreign Key Relationships:

```
tb_event
    ├─ tb_transaksi_tiket (ticket transactions)
    │   └─ onDelete: Cascade
    │
    └─ tb_sertifikat (certificates)
        └─ onDelete: Cascade
```

**Cascade Delete:**
- When event is hard deleted, related tickets and certificates are automatically deleted
- This is why we check for relations before hard delete

---

## 🚨 Error Handling

### Foreign Key Constraint (P2003):
```typescript
if (error.code === "P2003") {
  return NextResponse.json(
    { 
      error: "Cannot delete event due to existing references",
      note: "This event has related records. Please deactivate it instead.",
    },
    { status: 409 }
  );
}
```

### Event Not Found:
```typescript
if (!existingEvent) {
  return NextResponse.json(
    { error: "Event not found" },
    { status: 404 }
  );
}
```

### Invalid Date Format:
```typescript
if (isNaN(eventDate.getTime())) {
  return NextResponse.json(
    { error: "Invalid event_date format" },
    { status: 400 }
  );
}
```

---

## ✅ Features

**GET Endpoint:**
- ✅ Public access (no auth required)
- ✅ Returns formatted event data
- ✅ Includes both raw and formatted dates
- ✅ 404 handling for non-existent events

**PUT/PATCH Endpoint:**
- ✅ Admin authentication required
- ✅ Partial updates supported
- ✅ Field validation
- ✅ Trimming of string fields
- ✅ Type conversion (string → number, etc.)
- ✅ Date format validation
- ✅ 404 handling for non-existent events

**DELETE Endpoint:**
- ✅ Admin authentication required
- ✅ Smart deletion (hard vs soft)
- ✅ Checks for related records
- ✅ Foreign key constraint handling
- ✅ Preserves data integrity
- ✅ Clear response messages

---

## 📝 Summary

**Complete CRUD API for Events:**

| Operation | Method | Auth | Description |
|-----------|--------|------|-------------|
| Create | POST `/api/events` | ✅ Admin | Create new event |
| Read All | GET `/api/events` | ❌ Public | List all active events |
| Read One | GET `/api/events/[id]` | ❌ Public | Get single event |
| Update | PUT/PATCH `/api/events/[id]` | ✅ Admin | Update event |
| Delete | DELETE `/api/events/[id]` | ✅ Admin | Delete/deactivate event |

**All event management endpoints are production-ready!** 🚀
