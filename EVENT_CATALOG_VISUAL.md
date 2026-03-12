# 🎨 Event Catalog Visual Guide

## EventCard Component Anatomy

```
┌─────────────────────────────────────────────┐
│  ┌───────────────────────────────────────┐  │ ← Glowing border (on hover)
│  │                                       │  │
│  │  ┌─────────────────────────────────┐ │  │
│  │  │     [Status Badge]              │ │  │ ← Top-right: Available/Limited/Sold Out
│  │  │                                 │ │  │
│  │  │    Banner Image (Unsplash)      │ │  │ ← 192px height, zoom on hover
│  │  │      (scales 110% on hover)     │ │  │
│  │  │                                 │ │  │
│  │  │  ┌──────────────┐               │ │  │
│  │  │  │ ⚡ 0.05 ETH  │               │ │  │ ← Bottom-left: Price badge
│  │  │  └──────────────┘               │ │  │
│  │  └─────────────────────────────────┘ │  │
│  │                                       │  │
│  │  Event Title (gradient on hover)     │  │ ← Bold, 20px
│  │                                       │  │
│  │  📅 March 15, 2026 • 2:00 PM GMT     │  │ ← Calendar icon + date
│  │                                       │  │
│  │  👥 150 / 500 tickets remaining      │  │ ← Users icon + quota
│  │                                       │  │
│  │  ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░               │  │ ← Animated progress bar
│  │                                       │  │
│  │  ┌─────────────────────────────────┐ │  │
│  │  │      Get Tickets                │ │  │ ← CTA Button (gradient)
│  │  └─────────────────────────────────┘ │  │
│  │                                       │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## Hover State Transformation

### Before Hover (Resting State)
```
┌─────────────────┐
│   Event Card    │  ← Normal size, no glow
│   scale: 1.0    │
│   y: 0          │
│   border: white │
└─────────────────┘
```

### During Hover (Active State)
```
     ┌─────────────────┐
    ╱│   Event Card    │╲  ← Glowing border (purple→pink→cyan)
   ╱ │   scale: 1.05   │ ╲
  ╱  │   y: -8px       │  ╲
 ╱   │   border: purple│   ╲
╱    └─────────────────┘    ╲
```

**Effects Applied**:
1. ⬆️ Lifts up 8px
2. 🔍 Scales to 105%
3. ✨ Glowing gradient border appears
4. 🖼️ Image zooms to 110%
5. 🎨 Title becomes gradient
6. 💜 Border color changes to purple

## Status Badge States

### Available (Green)
```
┌─────────────┐
│ • Available │  ← Green background, solid
└─────────────┘
```
**Condition**: `availableQuota > totalQuota * 0.2`

### Limited (Orange)
```
┌──────────┐
│ • Limited│  ← Orange background, pulsing animation
└──────────┘
```
**Condition**: `0 < availableQuota ≤ totalQuota * 0.2`

### Sold Out (Red)
```
┌──────────────┐
│ • Sold Out   │  ← Red background, static
└──────────────┘
```
**Condition**: `availableQuota === 0`

## Progress Bar Colors

```
Available:  ▓▓▓▓▓▓▓▓▓▓░░░░░  (Purple → Cyan gradient)
Limited:    ▓▓▓░░░░░░░░░░░░  (Orange)
Sold Out:   ▓░░░░░░░░░░░░░░  (Red)
```

## Responsive Layout

### Mobile (< 768px)
```
┌────────────────┐
│   Event Card   │
└────────────────┘
┌────────────────┐
│   Event Card   │
└────────────────┘
┌────────────────┐
│   Event Card   │
└────────────────┘
```
**1 column**, full width

### Tablet (768px - 1024px)
```
┌──────────────┐  ┌──────────────┐
│  Event Card  │  │  Event Card  │
└──────────────┘  └──────────────┘
┌──────────────┐
│  Event Card  │
└──────────────┘
```
**2 columns**, ~50% width each

### Desktop (> 1024px)
```
┌──────────┐  ┌──────────┐  ┌──────────┐
│  Event   │  │  Event   │  │  Event   │
│  Card    │  │  Card    │  │  Card    │
└──────────┘  └──────────┘  └──────────┘
```
**3 columns**, ~33% width each

## Animation Timeline

```
Time    Action
────    ──────────────────────────────────
0.0s    User scrolls to section
        ↓
0.0s    Section header fades in
        ↓
0.2s    Card 1 slides up + fades in
        ↓
0.4s    Card 2 slides up + fades in
        ↓
0.6s    Card 3 slides up + fades in
        ↓
1.0s    Progress bars animate (fill)
        ↓
∞       Hover effects ready

User hovers card:
───────────────
0.0s    Hover starts
        ├─→ Card scales to 1.05
        ├─→ Card lifts -8px
        ├─→ Glow fades in (0→100% opacity)
        ├─→ Image scales to 1.1
        ├─→ Title gradient appears
        └─→ Border color changes
        
0.3s    All effects complete

User leaves:
───────────
0.0s    Mouse out
0.3s    Returns to normal state
```

## Color Palette Used

### Primary Colors
```css
Purple Deep:   #6b21a8  ████
Purple Light:  #a855f7  ████
Blue Deep:     #1e3a8a  ████
Blue Neon:     #3b82f6  ████
Cyan Accent:   #06b6d4  ████
Pink:          #ec4899  ████
```

### Status Colors
```css
Green:   #22c55e  ████  (Available)
Orange:  #f97316  ████  (Limited)
Red:     #ef4444  ████  (Sold Out)
Gray:    #6b7280  ████  (Disabled)
```

### Glass Effect
```css
Background: rgba(255, 255, 255, 0.05)  ▒▒▒▒
Backdrop:   blur(10px)                  ≈≈≈≈
Border:     rgba(255, 255, 255, 0.1)   ────
```

## Interactive Elements

### Get Tickets Button

**Normal State**
```
┌──────────────────────────────┐
│     Get Tickets              │  ← Gradient background
│  (Purple → Blue gradient)    │     White text
└──────────────────────────────┘
```

**Hover State**
```
┌──────────────────────────────┐
│     Get Tickets              │  ← Shadow glow appears
│  (Slightly larger)           │     Scale: 1.02
└──────────────────────────────┘
        ╲│╱
         ▼
   Purple glow shadow
```

**Sold Out State**
```
┌──────────────────────────────┐
│     Sold Out                 │  ← Gray background
│  (Disabled, no hover)        │     Gray text
└──────────────────────────────┘
```

## Section Layout

```
┌─────────────────────────────────────────────────┐
│                                                 │
│            ✨ FEATURED EVENTS ✨                │
│                                                 │
│        Discover Amazing Events                  │
│   Explore upcoming events, mint your NFT...     │
│                                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ Event 1 │  │ Event 2 │  │ Event 3 │        │
│  │  Card   │  │  Card   │  │  Card   │        │
│  └─────────┘  └─────────┘  └─────────┘        │
│                                                 │
│         ┌───────────────────┐                  │
│         │  View All Events  │                  │
│         └───────────────────┘                  │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Mock Event Details

### Event 1: Web3 Innovation Summit
```
Image:    Conference room, tech setup
Status:   Available (30% remaining)
Price:    0.05 ETH (~$125 USD)
Date:     March 15, 2026
Quota:    150 / 500 tickets
Badge:    Green "Available"
```

### Event 2: NFT Art Gallery Opening
```
Image:    Digital art, NFT artwork
Status:   Limited (22.5% remaining)
Price:    0.08 ETH (~$200 USD)
Date:     March 22, 2026
Quota:    45 / 200 tickets
Badge:    Orange "Limited" (pulsing)
```

### Event 3: Blockchain Developer Conference
```
Image:    Coding, developers
Status:   Available (32% remaining)
Price:    0.12 ETH (~$300 USD)
Date:     April 5, 2026
Quota:    320 / 1000 tickets
Badge:    Green "Available"
```

## CSS Class Breakdown

### Card Container
```css
.glass                        /* Glassmorphism base */
.rounded-2xl                  /* 16px border radius */
.overflow-hidden              /* Clips content */
.cursor-pointer               /* Hand cursor */
group                         /* Parent for hover states */
```

### Hover Classes
```css
.group-hover:scale-110        /* Image zoom */
.group-hover:opacity-100      /* Glow appear */
.group-hover:border-purple    /* Border color */
.group-hover:text-transparent /* Title gradient */
```

### Motion Classes
```typescript
whileHover={{ scale: 1.05, y: -8 }}  // Card lift
whileTap={{ scale: 0.98 }}           // Button press
whileInView={{ opacity: 1, y: 0 }}   // Scroll reveal
```

---

## Key Features Summary

✅ **Glassmorphism design** - Modern, premium look
✅ **Premium hover effects** - Scale, lift, glow, zoom
✅ **Dynamic status badges** - Available, Limited, Sold Out
✅ **Animated progress bars** - Visual quota representation
✅ **High-quality images** - Unsplash integration
✅ **Responsive grid** - 1/2/3 columns based on screen
✅ **Smooth animations** - Framer Motion powered
✅ **Interactive states** - Hover, tap, disabled
✅ **Price in ETH** - Web3 native pricing
✅ **Calendar integration** - Date/time display

---

This visual guide helps you understand every detail of the Event Catalog! 🎨
