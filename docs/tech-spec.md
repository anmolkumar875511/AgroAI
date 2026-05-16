# AgroAI — Technical Specification

## Dependencies

### Core Framework
| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.3.1 | UI framework |
| react-dom | ^18.3.1 | DOM renderer |
| react-router-dom | ^6.28.0 | Client-side routing (Landing + 5 app pages) |
| typescript | ^5.6.3 | Type safety |
| vite | ^6.0.0 | Build tool |
| @vitejs/plugin-react | ^4.3.0 | React support for Vite |

### Styling & UI
| Package | Version | Purpose |
|---------|---------|---------|
| tailwindcss | ^3.4.0 | Utility CSS framework |
| postcss | ^8.4.0 | CSS processing |
| autoprefixer | ^10.4.0 | CSS vendor prefixes |
| clsx | ^2.1.1 | Conditional class composition |
| tailwind-merge | ^2.6.0 | Tailwind class deduplication |
| class-variance-authority | ^0.7.1 | Component variant management |

### shadcn/ui & Radix
| Package | Version | Purpose |
|---------|---------|---------|
| @radix-ui/react-accordion | ^1.2.0 | Expandable AI recommendation cards |
| @radix-ui/react-avatar | ^1.1.0 | User avatars |
| @radix-ui/react-dialog | ^1.1.0 | Mobile sidebar drawer, AI chat |
| @radix-ui/react-dropdown-menu | ^2.1.0 | Territory selector, filters, user menu |
| @radix-ui/react-progress | ^1.1.0 | Progress rings, score circles |
| @radix-ui/react-scroll-area | ^1.1.0 | Scrollable sidebar, chat panel |
| @radix-ui/react-select | ^2.1.0 | Form dropdowns |
| @radix-ui/react-separator | ^1.1.0 | Dividers |
| @radix-ui/react-slot | ^1.1.0 | Polymorphic components |
| @radix-ui/react-switch | ^1.1.0 | Dark mode toggle |
| @radix-ui/react-tabs | ^1.1.0 | Risk analyzer tabs, map tabs |
| @radix-ui/react-tooltip | ^1.1.0 | Tooltip hints |

### Animation
| Package | Version | Purpose |
|---------|---------|---------|
| framer-motion | ^11.15.0 | React component animations, page transitions, mobile sidebar, AI chat drawer, AnimatePresence |
| gsap | ^3.12.0 | Core animation engine — timelines, tweens |
| lenis | ^1.1.0 | Smooth scroll with inertia |

### Charts
| Package | Version | Purpose |
|---------|---------|---------|
| recharts | ^2.15.0 | All dashboard charts (AreaChart, BarChart, LineChart, PieChart, RadarChart, ComposedChart) |

### Icons & Fonts
| Package | Version | Purpose |
|---------|---------|---------|
| lucide-react | ^0.460.0 | All icons (150+ icons used across the app) |
| @fontsource/inter | ^5.0.0 | Primary font (weights: 400, 500, 600, 700, 800) |
| @fontsource/jetbrains-mono | ^5.0.0 | Monospace font for data values (weights: 400, 500) |

### Utilities
| Package | Version | Purpose |
|---------|---------|---------|
| react-countup | ^6.5.0 | Animated stat counters on landing page |

## Component Inventory

### Layout Components (shared across app pages)

| Component | Source | Notes |
|-----------|--------|-------|
| AppLayout | Custom | Wraps all dashboard pages: TopNavbar + Sidebar + main content area with Lenis scroll |
| TopNavbar | Custom | Fixed 64px, search bar, territory selector, notifications, user avatar. Hamburger for mobile. |
| Sidebar | Custom | 260px desktop / slide-out drawer mobile. 8 nav items with active state. Bottom sync indicator. |
| MobileSidebarDrawer | Custom + Dialog | Framer-motion slide-in from left, 280px, backdrop tap-to-close |
| AIFloatingButton | Custom | Fixed FAB, opens AI chat drawer. Glowing border pulse animation. |
| AIChatDrawer | Custom + Dialog | Slide-up panel from bottom, chat interface with liquid glass styling |

### Page Sections — Landing Page

| Component | Source | Notes |
|-----------|--------|-------|
| HeroSection | Custom | Full-viewport with background video, gradient overlay, floating liquid-glass cards, stats row |
| TrustedBySection | Custom | CSS marquee of partner badges, grayscale logos |
| FeaturesSection | Custom | 3-column feature cards with scroll-triggered entrance, mini charts/heatmaps inside |
| DashboardPreviewSection | Custom | Large dashboard mockup image with scroll-triggered scale animation, floating insight bubbles |
| ImpactStatisticsSection | Custom | Background video, topographic SVG lines, 4 stat cards with CountUp animation |
| HowItWorksSection | Custom | 4 alternating steps with scroll-triggered reveals, step numbers, images |
| TestimonialsSection | Custom | 3D carousel (HorizontalCarousel component) with 5 testimonial cards |
| CTASection | Custom | Botanical parallax background, dark overlay, centered CTA |
| Footer | Custom | 4-column link grid, social icons, attribution |

### Page Sections — Dashboard

| Component | Source | Notes |
|-----------|--------|-------|
| DashboardGreeting | Custom | Greeting + date + weather widget |
| KPICard | Custom | 4 instances. Icon + trend badge + value + label + mini sparkline chart. Uses GlowingBorderPulse for critical cards. |
| AIRecommendationsFeed | Custom | Card with badge header + vertical list of RecommendationItem |
| RecommendationItem | Custom | Priority dot + crop info + message + meta row + action button |
| MapWidget | Custom | Card with tabs + mock map area + pulse dots + legend |
| WeeklyPerformanceChart | Custom | Recharts ComposedChart (bars + 2 lines) inside card |

### Page Sections — Visit Planner

| Component | Source | Notes |
|-----------|--------|-------|
| VisitPlannerHeader | Custom | Title + subtitle + filter pills + sort dropdown |
| PriorityCard | Custom | Progress ring (SVG) + info + tags + action buttons + AI reason panel |
| RouteVisualization | Custom | Card with SVG animated route line + numbered stops + recalculate button |

### Page Sections — AI Recommendations

| Component | Source | Notes |
|-----------|--------|-------|
| ExplainableAICard | Custom + Accordion | Expandable card: collapsed (badge+score+title) / expanded (detail grid + action + timeline + explainable section) |
| ReasoningCard | Custom | Small card for "Why this recommendation?" section — icon + title + explanation |

### Page Sections — Risk Analyzer

| Component | Source | Notes |
|-----------|--------|-------|
| RiskAnalyzerTabs | Custom + Tabs | Tab bar: Heatmap / NDVI / Weather / Pest Map |
| HeatmapGrid | Custom | 20x15 CSS grid, colored cells, hover tooltips, pulse on critical cells |
| AIInsightsPanel | Custom | Floating panel with 3 insight items |
| NDVIPanel | Custom | Recharts LineChart with 3 lines + area fills |

### Page Sections — Analytics

| Component | Source | Notes |
|-----------|--------|-------|
| AnalyticsHeader | Custom | Title + date range picker |
| FieldEfficiencyChart | Custom | Recharts BarChart |
| RevenuePerVisitChart | Custom | Recharts ComposedChart |
| RecommendationAcceptanceChart | Custom | Recharts PieChart (donut) |
| RegionalPerformanceChart | Custom | Recharts RadarChart |
| CropRiskTrendsChart | Custom | Recharts AreaChart (stacked) |
| StockUtilizationChart | Custom | Recharts BarChart (horizontal) |

### Reusable Components

| Component | Source | Used By |
|-----------|--------|---------|
| LiquidGlassCard | Custom | Feature cards, stat cards, insight bubbles, floating elements. 3-layer DOM structure with dynamic cursor glow. |
| ProgressRing | Custom | Priority cards, score circles. SVG with animated stroke-dashoffset. |
| GlowingBorderPulse | Custom (CSS) | High-priority KPI cards, critical alerts. CSS keyframe animation. |
| TopographicLines | Custom | Hero, Impact Statistics, CTA sections. SVG paths with GSAP morph + scroll parallax. |
| HorizontalCarousel | Custom | Testimonials section. GSAP ScrollTrigger-driven 3D carousel. |
| MiniSparkline | Custom | KPI cards. Recharts AreaChart (200x50). |
| SkeletonCard | Custom (CSS) | Loading states. CSS shimmer animation. |
| WeatherWidget | Custom | Dashboard greeting. Icon + temp + location. |
| PriorityBadge | Custom | Various. Pill badge with color based on priority level. |
| TrendIndicator | Custom | KPI cards. Up/down arrow + percentage pill. |

### Hooks

| Hook | Purpose |
|------|---------|
| useLenis | Initialize Lenis smooth scroll, integrate with GSAP ScrollTrigger |
| useScrollReveal | GSAP ScrollTrigger-based scroll reveal (fade + translate) |
| useTopographicLines | GSAP path morphing animation for SVG contour lines |
| useLiquidGlassCursor | Mouse-tracking cursor glow for liquid glass cards |
| useDarkMode | Theme toggle with localStorage persistence + system preference |
| useMediaQuery | Responsive breakpoints (mobile/tablet/desktop) |

## Animation Implementation

| Animation | Library | Implementation Approach | Complexity |
|-----------|---------|------------------------|------------|
| **Smooth scrolling** | Lenis | Global Lenis instance in useLenis hook. `lerp: 0.1`. Sync with GSAP via `lenis.on('scroll', ScrollTrigger.update)`. | Low |
| **Hero floating cards drift** | CSS @keyframes | `float` keyframe with translateY oscillation. Each card has different animation-delay and amplitude via inline transform. 6s ease-in-out infinite. | Low |
| **Hero entrance sequence** | GSAP timeline | Single timeline: overline fade-in (0.2s) → H1 fade+slideUp (0.5s) → subtitle (0.3s) → CTAs (0.3s) → stats stagger (0.4s). Triggered on mount. | Medium |
| **TrustedBy marquee** | CSS @keyframes | `translateX(0)` to `translateX(-50%)` on duplicated content. 30s linear infinite. | Low |
| **Feature cards scroll reveal** | GSAP ScrollTrigger | Batch: fade+translateY(40→0), stagger 0.15s. Trigger at viewport 80%. `power3.out`, 0.8s. | Medium |
| **Dashboard preview scale** | GSAP ScrollTrigger | Scale 0.9→1.0 + opacity 0→1. `scrub: true` over section scroll range. | Low |
| **Impact stat counters** | react-countup | CountUp component with `end` prop. Start on ScrollTrigger enter. Duration 2s. | Low |
| **Topographic line morph** | GSAP | Animate SVG path `d` attribute control points. 5 layers, 8-15s duration, `sine.inOut`, yoyo, repeat:-1, stagger 1.5s. Scroll parallax: `scrub: 1`, translateY ±30px. | High |
| **HowItWorks step reveals** | GSAP ScrollTrigger | Each step: fade+translateX(±30→0) based on alternating layout. Trigger at 75%. `power3.out`, 0.9s. | Medium |
| **3D testimonial carousel** | GSAP ScrollTrigger | ScrollTrigger drives progress 0→1. Calculate activeIndex. Apply 3D transforms: translateZ(cos*400), rotateY(offset*25°), translateX(offset*120), opacity, scale. `scrub: 0.5`. | High |
| **CTA botanical parallax** | GSAP ScrollTrigger | Background image `yPercent` at 0.5x scroll speed. `scrub: true`. | Low |
| **Page load sequence (dashboard)** | GSAP timeline | Navbar fade (0.3s) → sidebar slide from left (0.4s, `power2.out`) → content cards stagger fade+translateY(20→0) (0.1s stagger, 0.5s). | Medium |
| **Card hover lift** | CSS transition | `translateY(-2px)` + shadow transition. 0.2s ease. Pure Tailwind `hover:` classes. | Low |
| **Progress ring fill** | GSAP | Animate `stroke-dashoffset` from full circumference to target. 1.2s, `power2.out`. Triggered on viewport entry. | Medium |
| **Chart animations** | Recharts built-in | Default Recharts animations. `animationDuration={800}`, `animationEasing="ease-out"`. | Low |
| **Skeleton shimmer** | CSS @keyframes | `background-position` shift on gradient. 1.5s infinite. | Low |
| **Notification badge pulse** | CSS @keyframes | Scale 1→1.3→1. 2s infinite. | Low |
| **Glowing border pulse** | CSS @keyframes | box-shadow oscillation. 3s ease-in-out infinite. Two variants: green and red. | Low |
| **Map pulse dots** | CSS @keyframes | Scale 1→1.5→1 + opacity oscillation. 2s infinite, different delays per dot. | Low |
| **Route line draw** | CSS @keyframes | SVG `stroke-dashoffset` from full to 0. 2s ease-out. Triggered on viewport entry. | Low |
| **Mobile sidebar slide** | Framer Motion | `AnimatePresence` + `motion.div` with `x: -280→0`, opacity fade. Backdrop `opacity: 0→0.5`. Spring transition. | Medium |
| **AI chat drawer slide** | Framer Motion | `AnimatePresence` + `motion.div` with `y: 100%→0`. Spring transition with damping. | Medium |
| **Dark mode transition** | CSS | `transition-colors duration-300` on all themed elements. Toggle `data-theme` attribute. | Low |
| **Heatmap cell hover** | CSS transition | Background color shift + tooltip fade-in. 0.15s ease. | Low |
| **Recommendation expand/collapse** | Framer Motion | `AnimatePresence` with `height: auto` animation. Content fades + slides in. 0.3s spring. | Medium |
| **Liquid glass cursor glow** | Custom (rAF) | Track mouse position relative to card. Update radial-gradient background on a throttled rAF loop (60fps). | Medium |

## State & Logic Plan

### Theme Management
- **Dark mode** managed via React context (`ThemeProvider`)
- Stores preference in `localStorage` with key `agroai-theme`
- Defaults to `prefers-color-scheme: dark` on first visit
- Applies `data-theme="dark"` or `data-theme="light"` to `<html>` element
- All themed colors use CSS custom properties that switch based on the data attribute
- Transition: `transition-colors duration-300 ease-out` on `html` and all themed elements

### Routing Structure
- `/` — Landing Page (hero, features, stats, testimonials, CTA, footer)
- `/dashboard` — Main Dashboard (KPIs, recommendations, map, charts)
- `/visit-planner` — AI Visit Planner (priority cards, route)
- `/recommendations` — AI Recommendations (explainable cards)
- `/risk-analyzer` — Crop Risk Analyzer (heatmap, NDVI)
- `/analytics` — Manager Analytics (6 chart types)
- `/*` — Redirect to `/dashboard`

Landing page has its own layout (no sidebar/navbar). App pages share `AppLayout` with sidebar + navbar.

### Responsive Breakpoint Strategy
- **Desktop**: `>= 1024px` — Full sidebar (260px), multi-column grids
- **Tablet**: `768px - 1023px` — Icon-only sidebar (64px), 2-column grids
- **Mobile**: `< 768px` — Hidden sidebar (drawer), single column, swipeable KPI cards
- Implemented via `useMediaQuery` hook with Tailwind breakpoints

### Mock Data Architecture
All dashboard data is mocked in a central `src/data/mockData.ts` file with typed interfaces:
- `KPIData[]` — 4 KPI cards with values, trends, chart data
- `Recommendation[]` — AI recommendations with priority, crop, risk, weather, product
- `PriorityVisit[]` — Visit planner cards with scores, locations, tags, AI reasons
- `HeatmapCell[]` — 300 cells (20x15) with risk levels and village names
- `NDVIData[]` — 30-day NDVI readings for 3 crop types
- `AnalyticsData` — Aggregated data for all 6 analytics charts
- `Testimonial[]` — 5 testimonials with quotes, names, roles
- `SidebarItem[]` — Navigation items with icons, labels, paths

### Offline Sync Indicator
- Mock state: `isOnline: boolean`, `pendingSync: number`
- Cycles between online/offline every 30s for demo purposes
- Shows appropriate icon (Wifi/CloudOff) and status text
- Bottom of sidebar on desktop, bottom of mobile drawer

## Project Structure

```
/mnt/agents/output/app/
├── public/
│   ├── videos/
│   │   ├── aerial-fields.mp4
│   │   └── farmer-hands.mp4
│   └── images/
│       ├── dashboard-mockup.jpg
│       ├── botanical-rice.png
│       ├── farmer-amit.jpg
│       ├── farmer-sunita.jpg
│       ├── illustration-data.jpg
│       ├── illustration-ai.jpg
│       ├── illustration-field.jpg
│       └── cta-leaf.jpg
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components (auto-generated)
│   │   │   ├── accordion.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── tooltip.tsx
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx      # Sidebar + Navbar + content wrapper
│   │   │   ├── TopNavbar.tsx      # Fixed navbar
│   │   │   ├── Sidebar.tsx        # Desktop sidebar + mobile drawer
│   │   │   ├── MobileSidebarDrawer.tsx
│   │   │   ├── AIFloatingButton.tsx
│   │   │   └── AIChatDrawer.tsx
│   │   ├── shared/
│   │   │   ├── LiquidGlassCard.tsx
│   │   │   ├── ProgressRing.tsx
│   │   │   ├── GlowingBorderPulse.tsx
│   │   │   ├── TopographicLines.tsx
│   │   │   ├── HorizontalCarousel.tsx
│   │   │   ├── MiniSparkline.tsx
│   │   │   ├── SkeletonCard.tsx
│   │   │   ├── WeatherWidget.tsx
│   │   │   ├── PriorityBadge.tsx
│   │   │   └── TrendIndicator.tsx
│   │   └── landing/
│   │       ├── HeroSection.tsx
│   │       ├── TrustedBySection.tsx
│   │       ├── FeaturesSection.tsx
│   │       ├── DashboardPreviewSection.tsx
│   │       ├── ImpactStatisticsSection.tsx
│   │       ├── HowItWorksSection.tsx
│   │       ├── TestimonialsSection.tsx
│   │       ├── CTASection.tsx
│   │       └── Footer.tsx
│   ├── pages/
│   │   ├── LandingPage.tsx        # Composes all landing sections
│   │   ├── DashboardPage.tsx
│   │   ├── VisitPlannerPage.tsx
│   │   ├── RecommendationsPage.tsx
│   │   ├── RiskAnalyzerPage.tsx
│   │   └── AnalyticsPage.tsx
│   ├── sections/
│   │   ├── dashboard/
│   │   │   ├── DashboardGreeting.tsx
│   │   │   ├── KPICard.tsx
│   │   │   ├── AIRecommendationsFeed.tsx
│   │   │   ├── RecommendationItem.tsx
│   │   │   ├── MapWidget.tsx
│   │   │   └── WeeklyPerformanceChart.tsx
│   │   ├── visit-planner/
│   │   │   ├── VisitPlannerHeader.tsx
│   │   │   ├── PriorityCard.tsx
│   │   │   └── RouteVisualization.tsx
│   │   ├── recommendations/
│   │   │   ├── ExplainableAICard.tsx
│   │   │   └── ReasoningCard.tsx
│   │   ├── risk-analyzer/
│   │   │   ├── HeatmapGrid.tsx
│   │   │   ├── AIInsightsPanel.tsx
│   │   │   └── NDVIPanel.tsx
│   │   └── analytics/
│   │       ├── FieldEfficiencyChart.tsx
│   │       ├── RevenuePerVisitChart.tsx
│   │       ├── RecommendationAcceptanceChart.tsx
│   │       ├── RegionalPerformanceChart.tsx
│   │       ├── CropRiskTrendsChart.tsx
│   │       └── StockUtilizationChart.tsx
│   ├── hooks/
│   │   ├── useLenis.ts
│   │   ├── useScrollReveal.ts
│   │   ├── useTopographicLines.ts
│   │   ├── useLiquidGlassCursor.ts
│   │   ├── useDarkMode.ts
│   │   └── useMediaQuery.ts
│   ├── data/
│   │   └── mockData.ts            # All typed mock data
│   ├── types/
│   │   └── index.ts               # TypeScript interfaces
│   ├── lib/
│   │   └── utils.ts               # cn() helper, etc.
│   ├── App.tsx                    # Router setup + theme provider
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Global styles, CSS variables, keyframes, font imports
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── components.json                # shadcn/ui config
└── package.json
```

## Key Implementation Notes

### Liquid Glass Card Architecture
Each liquid glass card requires this DOM structure:
```
<div class="relative overflow-hidden rounded-2xl">
  <!-- Base blur layer -->
  <div class="absolute inset-0 backdrop-blur-[16px] bg-[rgba(27,94,32,0.06)] rounded-2xl" />
  <!-- Edge highlight layer -->
  <div class="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent rounded-2xl mix-blend-overlay pointer-events-none" />
  <!-- Cursor glow layer (dynamic) -->
  <div class="absolute inset-0 pointer-events-none rounded-2xl" style="background: radial-gradient(...)" />
  <!-- Content -->
  <div class="relative z-10 p-6">...</div>
</div>
```
On mobile: reduce `backdrop-blur` to `8px` for performance.

### Topographic Lines SVG
Generate 5 cubic bezier paths per section. Each path:
```
M0,[y] C[width*0.25],[y+offset] [width*0.5],[y-offset] [width],[y]
```
GSAP animates the control point Y offsets with continuous yoyo. Use `MorphSVGPlugin` or manually interpolate `d` attribute if plugin unavailable.

### 3D Carousel Implementation
The carousel uses a tall wrapper with `overflow-y: auto` and a hidden inner track. GSAP ScrollTrigger drives a progress value 0→1. Each card's 3D transform is calculated from its offset to the `activeIndex`:
- `translateZ = Math.cos(angle) * 400`
- `rotateY = offset * 25`
- `translateX = offset * 120`
- `opacity = 1 when offset === 0 else 0.4`
- `scale = 1 when offset === 0 else 0.85`

### Chart Color Mapping (Dark Mode)
When dark mode is active, Recharts charts need adjusted colors:
- Grid lines: `rgba(255,255,255,0.1)`
- Axis text: `rgba(255,255,255,0.6)`
- Tooltip background: `#1A1D18`
- Maintain brand colors (Deep Green, Lime Green, Yellow) for data elements

### Video Performance
- Use `<video preload="metadata" autoplay muted loop playsinline>`
- Provide poster images for mobile (low-bandwidth fallback)
- Videos auto-pause when not in viewport (IntersectionObserver)
- Replace with static images on mobile if needed

### Font Loading Strategy
- Import `@fontsource/inter/400.css` through `800.css` in `main.tsx`
- Import `@fontsource/jetbrains-mono/400.css` and `500.css`
- Apply via Tailwind config fontFamily
