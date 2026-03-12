# Admin Event Edit & Delete UI - Complete

## ✅ Features Added

The Admin Event Listing page now includes full CRUD functionality with Edit and Delete actions for each event.

---

## 📁 File Modified

**`app/admin/dashboard/events/page.tsx`**

---

## 🎯 New Features

### 1. **Edit Event** ✏️

**Icon**: Pencil (blue)  
**Action**: Opens pre-filled form to update event

**Flow:**
1. Admin clicks Edit button (pencil icon)
2. System fetches full event details from `/api/events/[id]`
3. Sheet opens with form pre-filled with event data
4. Admin modifies desired fields
5. Clicks "Update Event"
6. Sends PUT request to `/api/events/[id]`
7. Success toast appears
8. Sheet closes automatically
9. Table refreshes with updated data

**Code:**
```typescript
const handleEdit = async (event: Event) => {
  try {
    // Fetch full event details
    const response = await fetch(`/api/events/${event.id}`);
    const data = await response.json();

    if (response.ok) {
      const fullEvent = data.event;
      
      // Convert ISO date to YYYY-MM-DD format for date input
      const eventDate = new Date(fullEvent.event_date);
      const dateString = eventDate.toISOString().split('T')[0];

      setFormData({
        title: fullEvent.title,
        description: fullEvent.description || "",
        date: dateString,
        priceInPOL: fullEvent.price_pol.toString(),
        quota: fullEvent.quota.toString(),
        bannerUrl: fullEvent.banner_url || "",
      });
      setEditingEventId(event.id);
      setIsEditMode(true);
      setIsSheetOpen(true);
    }
  } catch (error) {
    toast.error("Failed to load event details");
  }
};
```

---

### 2. **Delete Event** 🗑️

**Icon**: Trash2 (red)  
**Action**: Deletes or deactivates event

**Flow:**
1. Admin clicks Delete button (trash icon)
2. Browser confirm dialog appears: "Apakah Anda yakin ingin menghapus event ini?"
3. If canceled → No action
4. If confirmed → Sends DELETE request to `/api/events/[id]`
5. Backend decides: Hard delete or soft delete
6. Success toast appears with appropriate message
7. Table refreshes with updated data

**Code:**
```typescript
const handleDelete = async (event: Event) => {
  const confirmed = window.confirm("Apakah Anda yakin ingin menghapus event ini?");
  
  if (!confirmed) return;

  try {
    const response = await fetch(`/api/events/${event.id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to delete event");
    }

    // Check if it was a soft delete or hard delete
    if (data.note) {
      toast.success("Event Deactivated", {
        description: data.note,
      });
    } else {
      toast.success("Event Deleted Successfully!", {
        description: `${event.title} has been removed.`,
      });
    }

    // Refresh events table
    await fetchEvents();
  } catch (error) {
    toast.error("Failed to delete event", {
      description: error instanceof Error ? error.message : "Please try again.",
    });
  }
};
```

---

## 🎨 UI Components

### Actions Column

**Table Header:**
```
| Title | Date | Quota | Price | Status | Aksi |
```

**Action Buttons:**
```
┌─────────────────────────────────┐
│  [✏️ Edit]  [🗑️ Delete]        │
└─────────────────────────────────┘
```

**Button Styles:**
- **Edit**: Blue icon, blue hover background
- **Delete**: Red icon, red hover background
- Both use ghost variant for minimal look

---

## 📝 Form Behavior

### Create Mode (Default)
- Sheet title: "Create New Event"
- Description: "Fill in the details below to publish a new event..."
- Submit button: "Save & Publish Event"
- All fields empty
- POST to `/api/events`

### Edit Mode
- Sheet title: "Edit Event"
- Description: "Update the event details below..."
- Submit button: "Update Event"
- All fields pre-filled with event data
- PUT to `/api/events/[id]`

### Form Reset
When sheet closes:
- `isEditMode` → `false`
- `editingEventId` → `null`
- All form fields → empty strings
- Ready for next create/edit operation

---

## 🔄 State Management

### New State Variables:
```typescript
const [isEditMode, setIsEditMode] = useState(false);
const [editingEventId, setEditingEventId] = useState<string | null>(null);
```

### Updated Event Interface:
```typescript
interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  event_date?: string;      // ISO format for API
  quota: number;
  totalQuota: number;
  priceInPOL: string;
  banner_url?: string;
  status: "active" | "completed" | "cancelled";
}
```

---

## 🎬 User Flows

### Edit Event Flow:

```
1. Admin views event list
   ↓
2. Clicks Edit button (pencil icon)
   ↓
3. System fetches event details
   ↓
4. Sheet opens with pre-filled form
   ↓
5. Admin modifies fields (e.g., price, quota)
   ↓
6. Clicks "Update Event"
   ↓
7. PUT /api/events/[id] with updated data
   ↓
8. Success toast: "Event Updated Successfully!"
   ↓
9. Sheet closes, table refreshes
   ↓
10. Updated event visible in table
```

### Delete Event Flow:

```
1. Admin views event list
   ↓
2. Clicks Delete button (trash icon)
   ↓
3. Confirm dialog: "Apakah Anda yakin ingin menghapus event ini?"
   ↓
4a. Cancel → No action
   ↓
4b. OK → DELETE /api/events/[id]
   ↓
5. Backend checks for related records
   ↓
6a. No tickets/certificates → Hard delete
    Toast: "Event Deleted Successfully!"
   ↓
6b. Has tickets/certificates → Soft delete
    Toast: "Event Deactivated (soft delete)"
   ↓
7. Table refreshes
   ↓
8. Event removed or deactivated
```

---

## 🎯 API Integration

### Fetch Event Details (for Edit):
```typescript
GET /api/events/[id]

Response:
{
  "event": {
    "_id": "uuid",
    "title": "Web3 Summit",
    "description": "...",
    "event_date": "2026-03-15T14:00:00.000Z",
    "price_pol": 5.5,
    "quota": 100,
    "banner_url": "https://...",
    ...
  }
}
```

### Update Event:
```typescript
PUT /api/events/[id]

Body:
{
  "title": "Updated Title",
  "description": "Updated description",
  "event_date": "2026-04-01T10:00:00Z",
  "price_pol": 7.5,
  "quota": 150,
  "banner_url": "https://...",
  "is_active": true
}

Response:
{
  "success": true,
  "message": "Event updated successfully",
  "event": { ... }
}
```

### Delete Event:
```typescript
DELETE /api/events/[id]

Response (Hard Delete):
{
  "success": true,
  "message": "Event deleted successfully",
  "deletedId": "uuid"
}

Response (Soft Delete):
{
  "success": true,
  "message": "Event deactivated successfully (soft delete)",
  "note": "Event has related tickets/certificates, so it was deactivated instead of deleted",
  "event": { ... }
}
```

---

## 🎨 Toast Notifications

### Create Event:
```
✅ Event Published Successfully!
   Web3 Summit has been added to the event catalog.
```

### Update Event:
```
✅ Event Updated Successfully!
   Web3 Summit has been updated.
```

### Delete Event (Hard):
```
✅ Event Deleted Successfully!
   Web3 Summit has been removed.
```

### Delete Event (Soft):
```
✅ Event Deactivated
   Event has related tickets/certificates, so it was deactivated instead of deleted
```

### Error:
```
❌ Failed to update event
   Please try again.
```

---

## 🔐 Security

All operations require admin authentication:
- Edit: Requires `admin_session` cookie
- Delete: Requires `admin_session` cookie
- Backend verifies session before allowing operations

---

## 🧪 Testing

### Test Edit:
1. Login as admin
2. Navigate to Events page
3. Click Edit (pencil) on any event
4. Modify title and price
5. Click "Update Event"
6. ✅ Sheet closes
7. ✅ Toast appears
8. ✅ Table shows updated data

### Test Delete (No Tickets):
1. Create a new event
2. Click Delete (trash) on that event
3. Confirm deletion
4. ✅ Event removed from table
5. ✅ Toast: "Event Deleted Successfully!"

### Test Delete (With Tickets):
1. Find event with sold tickets
2. Click Delete (trash)
3. Confirm deletion
4. ✅ Event still in table but deactivated
5. ✅ Toast: "Event Deactivated (soft delete)"

### Test Cancel Delete:
1. Click Delete (trash)
2. Click "Cancel" in confirm dialog
3. ✅ No action taken
4. ✅ Event remains unchanged

---

## 📊 Complete CRUD Operations

| Operation | Button | Icon | Color | API | Status |
|-----------|--------|------|-------|-----|--------|
| Create | "Tambah Event Baru" | Plus | Purple | POST `/api/events` | ✅ Done |
| Read | Table display | - | - | GET `/api/events` | ✅ Done |
| Update | Edit | Pencil | Blue | PUT `/api/events/[id]` | ✅ **NEW** |
| Delete | Delete | Trash2 | Red | DELETE `/api/events/[id]` | ✅ **NEW** |

---

## ✨ Key Features

**Edit Functionality:**
- ✅ Fetches full event details
- ✅ Pre-fills form with existing data
- ✅ Converts ISO date to input format
- ✅ Reuses same form component
- ✅ Dynamic sheet title and button text
- ✅ PUT request to update
- ✅ Success toast notification
- ✅ Auto-refresh table

**Delete Functionality:**
- ✅ Browser confirm dialog (Indonesian)
- ✅ Handles soft delete (with tickets)
- ✅ Handles hard delete (no tickets)
- ✅ Different toast messages
- ✅ Error handling
- ✅ Auto-refresh table

**Form Management:**
- ✅ Single form for create & edit
- ✅ Mode detection (`isEditMode`)
- ✅ Auto-reset on close
- ✅ Loading states
- ✅ Validation
- ✅ Error handling

---

## 🎉 Summary

**Admin Event Management is now complete!**

Admins can now:
- ✅ Create new events
- ✅ View all events in table
- ✅ Edit existing events (pre-filled form)
- ✅ Delete events (with smart deletion)
- ✅ See real-time updates
- ✅ Get clear feedback via toasts

**All CRUD operations are production-ready!** 🚀
