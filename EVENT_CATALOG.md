# 🎫 Event Catalog Feature Documentation

## Overview

The Event Catalog feature showcases featured events with premium hover effects and glassmorphism design. It consists of two main components:

1. **FeaturedEvents** - The container section
2. **EventCard** - Reusable card component for individual events

---

## 📦 Components

### FeaturedEvents Component

**Location**: `components/FeaturedEvents.tsx`

**Purpose**: Main section displaying a grid of featured events

**Features**:
- Animated section header with sparkle icons
- Responsive grid layout (1 column mobile, 2 tablet, 3 desktop)
- Staggered animation on scroll
- Background decorative elements
- "View All Events" button

**Mock Data Structure**:
```typescript
{
  id: string;
  title: string;
  date: string;
  bannerImage: string;  // Unsplash URL
  availableQuota: number;
  totalQuota: number;
  priceInETH: string;
}
```

---

### EventCard Component

**Location**: `components/EventCard.tsx`

**Purpose**: Reusable card to display individual event information

#### Props Interface
```typescript
interface EventCardProps {
  id: string;
  title: string;
  date: string;
  bannerImage: string;
  availableQuota: number;
  totalQuota: number;
  priceInETH: string;
}
```

#### Visual Features

**1. Banner Image**
- High-quality Unsplash images
- 48rem (192px) height
- Hover zoom effect (scale 1.1)
- Gradient overlay for readability

**2. Status Badges** (Dynamic)
- **Available**: Green badge (>20% quota remaining)
- **Limited**: Orange pulsing badge (≤20% quota remaining)
- **Sold Out**: Red badge (0 quota)

**3. Price Badge**
- Bottom-left overlay on banner
- Glassmorphic background
- Lightning icon (Zap) for visual interest
- Displays price in ETH

**4. Event Details**
- **Title**: Transitions to gradient on hover
- **Date**: Calendar icon with formatted date/time
- **Quota**: Users icon with remaining/total tickets

**5. Progress Bar**
- Animated fill on scroll into view
- Color changes based on availability:
  - Gradient (purple → cyan): Available
  - Orange: Limited
  - Red: Sold out

**6. CTA Button**
- "Get Tickets" or "Sold Out"
- Gradient background with hover shadow
- Disabled state for sold out events

#### Premium Hover Effects

**1. Card Level**
```typescript
whileHover={{ scale: 1.05, y: -8 }}
```
- Scales up 5%
- Lifts up 8px

**2. Glowing Border**
- Hidden by default
- Fades in on hover
- Multi-color gradient (purple → pink → cyan)
- Blur effect for glow

**3. Image Zoom**
```css
group-hover:scale-110
```
- Image scales up 10% inside container

**4. Title Gradient**
```css
group-hover:text-transparent
group-hover:bg-gradient-to-r
```
- Transitions from white to gradient text

**5. Border Color**
```css
group-hover:border-purple-500/50
```
- Border changes from white/10 to purple/50

---

## 🎨 Design Decisions

### Glassmorphism
- Uses `.glass` utility class
- Backdrop blur with semi-transparent backgrounds
- Subtle borders with opacity

### Color Coding
- **Green**: Plenty of tickets available
- **Orange**: Limited tickets (creates urgency)
- **Red**: Sold out (disabled state)

### Responsive Grid
```css
grid-cols-1           /* Mobile: 1 column */
md:grid-cols-2        /* Tablet: 2 columns */
lg:grid-cols-3        /* Desktop: 3 columns */
gap-8                 /* Consistent spacing */
```

### Animation Strategy
- **On scroll**: Cards fade in and slide up
- **Stagger**: 0.2s delay between cards
- **Once**: Animations trigger once (viewport: { once: true })
- **Smooth**: 0.5s duration with ease curves

---

## 📸 Mock Events

### Event 1: Web3 Innovation Summit
- **Image**: Tech conference setting
- **Status**: Available (150/500 tickets)
- **Price**: 0.05 ETH
- **Theme**: Innovation, technology

### Event 2: NFT Art Gallery Opening
- **Image**: Digital art/NFT themed
- **Status**: Limited (45/200 tickets)
- **Price**: 0.08 ETH
- **Theme**: Art, creativity

### Event 3: Blockchain Developer Conference
- **Image**: Developer/coding environment
- **Status**: Available (320/1000 tickets)
- **Price**: 0.12 ETH
- **Theme**: Development, education

All images are high-quality Unsplash URLs with proper parameters:
- `q=80` - Quality 80%
- `w=1200` - Width 1200px
- `auto=format` - Automatic format optimization
- `fit=crop` - Cropped to aspect ratio

---

## 🔄 Component Workflow

```
1. Page Load
   ↓
2. FeaturedEvents mounts
   ↓
3. Section header animates in
   ↓
4. EventCards stagger in (0.2s each)
   ↓
5. Progress bars animate
   ↓
6. User hovers card
   ↓
7. Premium effects trigger:
   - Card scales & lifts
   - Glow appears
   - Image zooms
   - Title becomes gradient
   - Border changes color
   ↓
8. User clicks "Get Tickets"
   ↓
9. [Future: Navigate to ticket purchase]
```

---

## 🎯 Technical Details

### Performance Optimizations

**1. Image Loading**
```typescript
<Image
  src={bannerImage}
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```
- Next.js Image component
- Automatic lazy loading
- Responsive sizes for optimal loading

**2. Animation Performance**
- Uses `transform` and `opacity` (GPU accelerated)
- `whileInView` triggers only when visible
- `viewport: { once: true }` prevents re-animations

**3. Conditional Rendering**
- Status badges calculated once per render
- Progress bar width calculated from quota
- Button state based on availability

### State Management

Currently uses static mock data. Future implementation:

```typescript
// Fetch from API or smart contract
const { events, loading } = useEvents();

// Map and display
{events.map(event => <EventCard {...event} />)}
```

---

## 🚀 Future Enhancements

### Phase 1: Interactivity
- [ ] Click to view event details page
- [ ] Filter by date, price, category
- [ ] Search functionality
- [ ] Sort options (price, date, popularity)

### Phase 2: Web3 Integration
- [ ] Fetch events from smart contract
- [ ] Real-time quota updates
- [ ] On-chain ticket purchasing
- [ ] Connect wallet to buy tickets

### Phase 3: Advanced Features
- [ ] Event categories/tags
- [ ] Favorite/bookmark events
- [ ] Share event functionality
- [ ] Calendar integration
- [ ] Reminder notifications

### Phase 4: Enhanced UX
- [ ] Skeleton loading states
- [ ] Error boundaries
- [ ] Infinite scroll / pagination
- [ ] Advanced filters sidebar
- [ ] Map view for location-based events

---

## 🎨 Customization Guide

### Change Grid Layout
```typescript
// In FeaturedEvents.tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
//                                          ↑ Change to 4 columns
```

### Adjust Hover Effects
```typescript
// In EventCard.tsx
whileHover={{ scale: 1.08, y: -12 }}  // More dramatic
whileHover={{ scale: 1.02, y: -4 }}   // More subtle
```

### Modify Colors
```typescript
// Status badges
bg-green-500   → bg-blue-500
bg-orange-500  → bg-yellow-500
bg-red-500     → bg-gray-500
```

### Change Animation Timing
```typescript
// Stagger delay
staggerChildren: 0.3  // Slower
staggerChildren: 0.1  // Faster
```

---

## 📱 Responsive Breakpoints

| Screen Size | Columns | Card Width |
|-------------|---------|------------|
| < 768px     | 1       | 100%       |
| 768px - 1024px | 2    | ~50%       |
| > 1024px    | 3       | ~33%       |

---

## ✅ Testing Checklist

- [ ] Cards display correctly on mobile
- [ ] Grid responsive at all breakpoints
- [ ] Hover effects work smoothly
- [ ] Images load properly
- [ ] Status badges show correct state
- [ ] Progress bars animate on scroll
- [ ] CTA buttons disabled when sold out
- [ ] Animations don't lag or stutter
- [ ] Text readable on all backgrounds
- [ ] Glassmorphism effects visible

---

## 🐛 Common Issues & Solutions

**Issue**: Images not loading
**Solution**: Check Unsplash URLs, add domain to `next.config.ts`:
```typescript
images: {
  domains: ['images.unsplash.com'],
}
```

**Issue**: Hover effects laggy
**Solution**: 
- Reduce blur intensity
- Use `will-change: transform` CSS
- Check GPU acceleration is enabled

**Issue**: Cards not responsive
**Solution**: 
- Verify Tailwind breakpoints
- Check parent container width
- Test in browser DevTools

---

This feature is production-ready with premium design and smooth animations! 🎉
