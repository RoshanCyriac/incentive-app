# Toyota Smart Incentive Calculator - Design System

## Overview
The Smart Incentive Calculator has been redesigned with Toyota's professional design language, featuring a corporate aesthetic suitable for dealer management systems.

## Brand Colors

### Primary
- **Toyota Red** (#EB0A1E) - Main CTA, active states, highlights
- Used for: buttons, active navigation, accent borders, hero sections

### Secondary  
- **Deep Charcoal** (#1A1A1A) - Text, dark surfaces, sidebars
- Used for: headings, body text, sidebar background

### Neutral
- **Off-White** (#F8F8F8) - Page backgrounds, zebra striping
- **Pure White** (#FFFFFF) - Cards, modals, content surfaces
- **Silver-Gray** (#C8C8C8) - Borders, dividers, subtle separators

### Status
- **Active** - #10B981 (green)
- **Inactive** - #6B7280 (gray)
- **Pending** - #F59E0B (amber)
- **Error** - #EF4444 (red)
- **Success** - #10B981 (green)

## Typography

### Font Family
- **Primary**: Inter or DM Sans (system fallback: sans-serif)

### Weights & Sizes
- **Headers** (h1, h2, h3): 600 weight
- **Body Text**: 400 weight
- **Labels & Small Text**: 500 weight

### Sizing
- H1: 2rem (32px)
- H2: 1.5rem (24px)
- Body: 1rem (16px)
- Small: 0.875rem (14px)
- Tiny: 0.75rem (12px)

## Components

### Button
```jsx
<Button variant="primary" size="md">Save Changes</Button>
```
**Variants**: primary, secondary, ghost, icon
**Sizes**: sm, md (default)
**Features**: 
- Toyota Red background for primary
- White text on dark backgrounds
- 6px border radius
- Subtle scale(0.98) on click
- 150ms transition

### Input
```jsx
<Input 
  label="Email" 
  name="email" 
  type="email"
  error="Invalid email"
  required
/>
```
**Features**:
- 2px border with Silver-Gray
- Red focus ring (2px, 20% opacity)
- Form label with required indicator (*)
- Inline validation error display
- Disabled state support

### Badge
```jsx
<Badge status="active" label="Active" />
```
**Status Options**: active, inactive, pending

### Modal
```jsx
<Modal 
  isOpen={true}
  title="Confirm Action"
  onClose={handleClose}
  actions={[cancelBtn, confirmBtn]}
>
  Modal content here
</Modal>
```
**Features**:
- Centered overlay with 50% opacity backdrop
- Card-style content with shadow
- Header with close button
- Footer with action buttons
- 150ms fade-in animation

### Alert
```jsx
<Alert 
  type="warning" 
  title="Configuration Issues"
  message="Some settings may affect calculations"
/>
```
**Types**: error, warning, success, info
**Features**:
- Left border accent (4px)
- Icon indicator
- Dismissible option

### Toast
```jsx
<Toast 
  message="Changes saved successfully" 
  type="success" 
  autoClose={4000}
/>
```
**Auto-dismiss**: 4 seconds (default)
**Position**: Top-right, fixed
**Types**: success, error, warning, info

### Sidebar
- 240px width (collapsible to 80px)
- Deep Charcoal background
- Toyota Red left border (4px)
- Logo with red accent circle
- Active item: Toyota Red background + left white border

### Header
- 60px height (sticky)
- White background with Silver-Gray bottom border
- Page title left-aligned
- User avatar + role badge right-aligned

### StatCard
```jsx
<StatCard 
  icon="🚗" 
  label="Total Cars Sold" 
  value="156"
  trend="up"
  trendLabel="↑ 12% from last month"
/>
```
**Features**:
- Icon, label, value display
- Optional trend indicator
- Toyota Red accent bottom border

### Table
- Sticky header with Off-White background
- Zebra striping: white + off-white alternating
- Hover highlight: light red tint (#FFF5F5)
- 16px grid gap between cells

### SkeletonLoader
- Shimmer animation (1.5s)
- Gray gradient moving left-to-right
- Used during data fetching

### EmptyState
- Centered layout with large icon
- Title + message text
- Optional CTA button (red primary)

## Layout Standards

### Sidebar + Main Content
```
┌─────────┬──────────────────┐
│ Sidebar │    Main Content  │
│ (240px) │                  │
│         ├──────────────────┤
│         │ Header (60px)    │
│         ├──────────────────┤
│         │ Content Area     │
│         │ (p-8, max-7xl)   │
│         │                  │
└─────────┴──────────────────┘
```

### Content Grid
- **Max Width**: 1280px (max-w-7xl)
- **Padding**: 32px (p-8) on all sides
- **Grid Gap**: 32px (gap-8)
- **Responsive**: 2-column on lg+, 1-column on md-

## Spacing System

Used consistently throughout:
- 4px (0.25rem)
- 6px (0.375rem) - button radius
- 8px (0.5rem)
- 12px (0.75rem)
- 16px (1rem) - standard padding/gap
- 20px (1.25rem) - card padding
- 24px (1.5rem)
- 32px (2rem) - section padding
- 48px (3rem)
- 64px (4rem)

## Animations

### Transitions
- **Default**: 150ms ease-in-out
- **Page Load**: 150ms fade-in
- **Interactions**: 150ms scale + color change
- **Modals**: 150ms fade-in

### Keyframes
- **spin**: 1s linear infinite (loading)
- **fadeIn**: 150ms ease-in
- **pulseSubtle**: 2s for real-time update feedback
- **shimmer**: 1.5s for skeleton loading

## Shadows

- **Card**: `0 1px 3px rgba(0, 0, 0, 0.08)` - subtle
- **Hover**: Card shadow on table row hover
- **No Shadows**: On input fields or interactive elements
- **Flat Aesthetic**: Shadows are minimal, only for depth hierarchy

## Responsive Breakpoints

- **xs**: 0px (mobile)
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### Sidebar Behavior
- **Desktop (lg+)**: 240px sidebar visible, content adjusts
- **Tablet (md)**: 80px collapsed sidebar
- **Mobile (sm)**: Full-width, sidebar as bottom navigation (future enhancement)

## Form Standards

### Text Inputs
- Label above input (form-label)
- Required indicator (*) in Toyota Red
- 2px border, rounded-md
- Focus: Red outline ring

### Validation
- Inline error text below field (red)
- Error state: red border + light red background
- Clear errors when user starts typing

### Buttons in Forms
- "Save" primary button (Toyota Red)
- "Cancel" secondary button (white with charcoal border)

## Data Tables

### Header
- Off-White background
- Bold labels (font-header)
- Sticky on scroll

### Rows
- Alternating white / off-white
- Hover: light red tint (#FFF5F5)
- 150ms transition
- Left border on active/selected rows (optional)

### Actions
- Edit/Delete buttons as ghost variants
- Icons + text for clarity
- Gap between action buttons

## Micro-Interactions

### Button Click
- scale(0.98) for 150ms
- Color transition on hover

### Input Focus
- Red outline ring (2px, 20% opacity)
- Border color changes to red
- 150ms smooth transition

### Status Updates
- Pulse animation for saving state
- Success checkmark on save complete
- Auto-dismiss after 1.5s

### Page Transitions
- 150ms fade-in on new page load

## Accessibility

- Semantic HTML (button, input, label, etc.)
- ARIA labels on icon-only buttons
- Color not sole indicator (icons + text)
- Sufficient contrast ratios
- Focus indicators on all interactive elements
- Keyboard navigation support

## Best Practices

1. **Use brand colors sparingly** - Red for critical actions only
2. **Maintain whitespace** - 16px minimum between major sections
3. **Consistent sizing** - Use predefined sizes (sm, md, lg)
4. **Avoid gradients** - Flat design preferred
5. **Minimal shadows** - Only for hierarchy, not decoration
6. **Clear labels** - Every input and control should be labeled
7. **Loading states** - Always show spinner during async operations
8. **Error feedback** - Alert users immediately to issues
9. **Confirmation modals** - For destructive actions
10. **Empty states** - Helpful message + CTA for empty lists

## File Structure

```
frontend/src/
├── components/
│   ├── Button.jsx
│   ├── Input.jsx
│   ├── Badge.jsx
│   ├── Modal.jsx
│   ├── Alert.jsx
│   ├── Toast.jsx
│   ├── Sidebar.jsx
│   ├── Header.jsx
│   ├── StatCard.jsx
│   ├── SkeletonLoader.jsx
│   ├── EmptyState.jsx
│   └── index.js (exports all)
├── pages/
│   ├── Login.jsx (split layout)
│   ├── AdminDashboard.jsx
│   ├── OfficerDashboard.jsx
│   └── admin/
│       ├── CarInventoryTab.jsx
│       ├── SlabEngineTab.jsx
│       └── OfficersTab.jsx
├── index.css (custom animations + @apply classes)
└── tailwind.config.js (colors, fonts, shadows)
```

## Color Palette Export

```css
--toyota-red: #EB0A1E;
--charcoal: #1A1A1A;
--off-white: #F8F8F8;
--silver-gray: #C8C8C8;
--status-active: #10B981;
--status-inactive: #6B7280;
--status-pending: #F59E0B;
--status-error: #EF4444;
--status-success: #10B981;
```

This design system ensures consistency, professionalism, and an excellent user experience across all screens in the Smart Incentive Calculator application.
