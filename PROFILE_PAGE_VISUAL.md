# 📊 Profile Page Visual Flow & Component Guide

## 🔄 Complete User Journey

```
User Navigation Flow:
────────────────────

Start → Click "Profile" in Navbar
  │
  ├─→ Wallet NOT Connected?
  │   │
  │   └─→ Show Warning Card
  │       ├─→ "Connect Your Wallet" heading
  │       ├─→ Wallet icon (animated entry)
  │       ├─→ Helpful instructions
  │       └─→ Orange alert box
  │           └─→ Points to navbar button
  │
  └─→ Wallet IS Connected?
      │
      └─→ Show Full Dashboard
          ├─→ Header with address
          ├─→ Profile form
          └─→ Tabs (Tickets/Certificates)
```

---

## 🎨 Component Hierarchy

```
ProfilePage (Client Component)
│
├─→ useActiveAccount() hook
│   └─→ Checks wallet connection
│
├─→ Conditional Rendering
│   │
│   ├─→ IF !account:
│   │   └─→ Warning Card
│   │       ├─→ Wallet icon
│   │       ├─→ Title (gradient)
│   │       ├─→ Description
│   │       └─→ Alert message
│   │
│   └─→ IF account:
│       │
│       ├─→ Header Section
│       │   ├─→ Title (gradient)
│       │   └─→ Wallet address (truncated)
│       │
│       ├─→ Profile Form Card
│       │   ├─→ CardHeader
│       │   │   ├─→ Mail icon + title
│       │   │   └─→ Description
│       │   │
│       │   └─→ CardContent
│       │       ├─→ Form element
│       │       │   ├─→ Label (Email)
│       │       │   ├─→ Input (email field)
│       │       │   ├─→ Helper text
│       │       │   ├─→ Success banner (conditional)
│       │       │   └─→ Button (Save)
│       │       │
│       │       └─→ onSubmit handler
│       │           ├─→ Validate email
│       │           ├─→ Show loading
│       │           ├─→ Simulate save
│       │           └─→ Show success
│       │
│       └─→ Tabs Component
│           ├─→ TabsList (2 triggers)
│           │   ├─→ My Tickets
│           │   └─→ My Certificates
│           │
│           ├─→ TabsContent (Tickets)
│           │   └─→ Empty State Card
│           │       ├─→ Purple ticket icon
│           │       ├─→ "No Tickets Yet"
│           │       ├─→ Description
│           │       └─→ Browse Events button
│           │
│           └─→ TabsContent (Certificates)
│               └─→ Empty State Card
│                   ├─→ Cyan award icon
│                   ├─→ "No Certificates Yet"
│                   ├─→ Description
│                   └─→ Email reminder box
```

---

## 🎭 State Machine

```
Profile Page States:
───────────────────

┌─────────────────┐
│  Initial Load   │
└────────┬────────┘
         │
         ▼
    Check Wallet
         │
    ┌────┴────┐
    │         │
    ▼         ▼
NOT CONN   CONNECTED
    │         │
    │         ▼
    │    ┌────────────┐
    │    │ Show Form  │
    │    └─────┬──────┘
    │          │
    │     User enters
    │     email & clicks
    │     "Save Profile"
    │          │
    │          ▼
    │    ┌─────────────┐
    │    │ Validating  │
    │    └─────┬───────┘
    │          │
    │     ┌────┴────┐
    │     │         │
    │  Valid?   Invalid?
    │     │         │
    │     ▼         ▼
    │  ┌────┐   ┌──────┐
    │  │Save│   │Error │
    │  └─┬──┘   │Toast │
    │    │      └──────┘
    │    ▼
    │  ┌────────────┐
    │  │  Loading   │
    │  │ (1.5s sim) │
    │  └─────┬──────┘
    │        │
    │        ▼
    │  ┌──────────────┐
    │  │   Success!   │
    │  │ Toast + Banner│
    │  └──────────────┘
    │
    ▼
┌──────────────┐
│ Show Warning │
│     Card     │
└──────────────┘
```

---

## 💬 Toast Notifications

### Success Toast
```
┌────────────────────────────────┐
│ ✅ Profile saved successfully! │
│                                │
│ You'll receive notifications   │
│ when certificates are issued.  │
└────────────────────────────────┘
```

### Error Toast (Empty Email)
```
┌────────────────────────────────┐
│ ❌ Please enter your email     │
│    address                     │
└────────────────────────────────┘
```

### Error Toast (Invalid Format)
```
┌────────────────────────────────┐
│ ❌ Please enter a valid email  │
│    address                     │
└────────────────────────────────┘
```

---

## 🎨 Form States

### Empty State
```
┌────────────────────────────────┐
│ Email Address *                │
│ ┌────────────────────────────┐ │
│ │ your.email@example.com     │ │ (placeholder)
│ └────────────────────────────┘ │
│ We'll only use your email...   │
│                                │
│ ┌────────────────────────────┐ │
│ │   💾 Save Profile          │ │ (enabled)
│ └────────────────────────────┘ │
└────────────────────────────────┘
```

### Typing State
```
┌────────────────────────────────┐
│ Email Address *                │
│ ┌────────────────────────────┐ │
│ │ john.doe@example.c|        │ │ (cursor)
│ └────────────────────────────┘ │
│ We'll only use your email...   │
│                                │
│ ┌────────────────────────────┐ │
│ │   💾 Save Profile          │ │ (enabled)
│ └────────────────────────────┘ │
└────────────────────────────────┘
```

### Loading State
```
┌────────────────────────────────┐
│ Email Address *                │
│ ┌────────────────────────────┐ │
│ │ john.doe@example.com       │ │
│ └────────────────────────────┘ │
│ We'll only use your email...   │
│                                │
│ ┌────────────────────────────┐ │
│ │  ⟳ Saving...               │ │ (disabled, spinner)
│ └────────────────────────────┘ │
└────────────────────────────────┘
```

### Success State
```
┌────────────────────────────────┐
│ Email Address *                │
│ ┌────────────────────────────┐ │
│ │ john.doe@example.com       │ │
│ └────────────────────────────┘ │
│ We'll only use your email...   │
│                                │
│ ┌────────────────────────────┐ │
│ │ ✅ Profile saved!          │ │ (green banner)
│ └────────────────────────────┘ │
│                                │
│ ┌────────────────────────────┐ │
│ │   💾 Save Profile          │ │ (enabled)
│ └────────────────────────────┘ │
└────────────────────────────────┘
```

---

## 📑 Tabs Interaction

### My Tickets Tab (Active)
```
┌─────────────────────────────────────┐
│ [🎫 My Tickets] [🏆 My Certificates]│
│  ← Active       ← Inactive          │
│  (Gradient bg)  (Transparent)       │
├─────────────────────────────────────┤
│                                     │
│         [Ticket Icon - Large]       │
│                                     │
│          No Tickets Yet             │
│                                     │
│   You haven't purchased any         │
│   event tickets yet...              │
│                                     │
│      [📥 Browse Events]             │
│                                     │
└─────────────────────────────────────┘
```

### My Certificates Tab (Active)
```
┌─────────────────────────────────────┐
│ [🎫 My Tickets] [🏆 My Certificates]│
│  ← Inactive     ← Active            │
│  (Transparent)  (Gradient bg)       │
├─────────────────────────────────────┤
│                                     │
│         [Award Icon - Large]        │
│                                     │
│        No Certificates Yet          │
│                                     │
│   Attend events to earn...          │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📧 Make sure to complete... │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## 🎬 Animation Timeline

```
Time    Action                          Duration
────    ──────────────────────────────  ────────
0.0s    User navigates to /profile
        ↓
0.0s    Component mounts
        ↓
0.0s    Check wallet connection
        │
        ├─→ Not Connected?
        │   │
        │   0.0-0.6s  Warning card fades in
        │   └─→ Complete!
        │
        └─→ Connected?
            │
            0.0-0.6s   Header fades in
            ↓
            0.1-0.7s   Profile card fades in
            ↓
            0.2-0.8s   Tabs fade in
            └─→ Complete!

User Interactions:
─────────────────
Save Button Click:
  0.0s    Click
  0.0s    Validation runs
  0.0s    Loading state starts (spinner)
  1.5s    Simulation completes
  1.5s    Success state
  1.5s    Toast appears
  1.5s    Green banner fades in (0.3s)
  1.8s    Complete!

Tab Switch:
  0.0s    Click tab
  0.0-0.2s Content cross-fades
  0.2s    Complete!
```

---

## 🎯 Interactive Elements Map

```
ProfilePage
├─→ Clickable Elements:
│   ├─→ [Save Profile] Button
│   │   └─→ Triggers: Form submission
│   │
│   ├─→ [Browse Events] Button
│   │   └─→ Triggers: Navigate to home
│   │
│   ├─→ [My Tickets] Tab
│   │   └─→ Triggers: Show tickets content
│   │
│   └─→ [My Certificates] Tab
│       └─→ Triggers: Show certificates content
│
├─→ Input Elements:
│   └─→ Email Input Field
│       ├─→ onChange: Updates state
│       ├─→ Validation: On submit
│       └─→ Type: email (HTML5)
│
└─→ Hover Effects:
    ├─→ Buttons: Gradient intensity
    ├─→ Tabs: Background transition
    └─→ Cards: Subtle border glow
```

---

## 📱 Responsive Behavior

### Desktop (> 1024px)
```
┌────────────────────────────────────┐
│          Navbar (fixed)            │
├────────────────────────────────────┤
│                                    │
│   ┌────────────────────────────┐  │
│   │     My Profile             │  │
│   │     Connected: 0x1234...   │  │
│   │                            │  │
│   │  [Complete Profile Card]   │  │
│   │  (Full width, max 5xl)     │  │
│   │                            │  │
│   │  [───────Tabs──────────]   │  │
│   │  [   Tab Content        ]  │  │
│   │  [                      ]  │  │
│   └────────────────────────────┘  │
│                                    │
└────────────────────────────────────┘
```

### Tablet (768px - 1024px)
```
┌──────────────────────────────┐
│      Navbar (fixed)          │
├──────────────────────────────┤
│                              │
│  ┌────────────────────────┐ │
│  │   My Profile           │ │
│  │   0x1234...            │ │
│  │                        │ │
│  │ [Complete Profile]     │ │
│  │                        │ │
│  │ [──────Tabs───────]    │ │
│  │ [  Tab Content     ]   │ │
│  └────────────────────────┘ │
│                              │
└──────────────────────────────┘
```

### Mobile (< 768px)
```
┌──────────────────┐
│  Navbar (fixed)  │
├──────────────────┤
│                  │
│ ┌──────────────┐│
│ │ My Profile   ││
│ │ 0x12...      ││
│ │              ││
│ │ [Complete    ││
│ │  Profile]    ││
│ │              ││
│ │ [───Tabs──]  ││
│ │ [Tab Cont]   ││
│ │ [ent Here]   ││
│ └──────────────┘│
│                  │
└──────────────────┘
```

---

## 🧪 Test Scenarios

### Scenario 1: No Wallet
```
Action: Visit /profile without wallet
Expected:
  ✅ Warning card displays
  ✅ Centered on screen
  ✅ Animation plays smoothly
  ✅ Instructions are clear
  ✅ Alert box visible
```

### Scenario 2: Connect Wallet
```
Action: Connect wallet from navbar
Expected:
  ✅ Page updates automatically
  ✅ Dashboard appears
  ✅ Address shows truncated
  ✅ Animations play
```

### Scenario 3: Empty Email Submit
```
Action: Click Save without email
Expected:
  ✅ Toast error appears
  ✅ "Please enter email" message
  ✅ No loading state
  ✅ Form not submitted
```

### Scenario 4: Invalid Email
```
Action: Enter "invalid.email" and save
Expected:
  ✅ Toast error appears
  ✅ "Valid email" message
  ✅ Form not submitted
```

### Scenario 5: Valid Email Save
```
Action: Enter valid email and save
Expected:
  ✅ Button shows loading
  ✅ Spinner appears
  ✅ 1.5s delay
  ✅ Success toast
  ✅ Green banner
  ✅ Button re-enables
```

### Scenario 6: Tab Switching
```
Action: Click between tabs
Expected:
  ✅ Content changes
  ✅ Active tab highlighted
  ✅ Gradient appears on active
  ✅ Smooth transition
  ✅ Empty states show
```

---

## 🎨 Color Coding System

### Status Colors
```css
Success:  #22c55e (Green)  - Profile saved
Warning:  #f97316 (Orange) - Connect wallet alert
Info:     #06b6d4 (Cyan)   - Certificates tab
Primary:  #a855f7 (Purple) - Tickets tab, borders
Error:    #ef4444 (Red)    - Validation errors
```

### Element Colors
```css
Headers:     Gradient (purple→cyan)
Text:        White (#ffffff)
Muted:       Gray (#6b7280)
Borders:     Purple/30 (rgba)
Backgrounds: Black/40 with blur
Icons:       Purple/Cyan accent
```

---

## 🔗 Integration Points

### Future Backend Integration
```typescript
// Profile save endpoint
POST /api/profile
Body: {
  walletAddress: string,
  email: string
}

// Fetch user profile
GET /api/profile?address={walletAddress}
Response: {
  email: string,
  createdAt: string
}

// Fetch user tickets
GET /api/tickets?owner={walletAddress}
Response: Ticket[]

// Fetch user certificates
GET /api/certificates?owner={walletAddress}
Response: Certificate[]
```

---

This visual guide provides a complete understanding of the Profile Page's behavior and interaction patterns! 🎨
