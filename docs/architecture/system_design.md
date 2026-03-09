# CraftBridge System Design

## 1. Overview
CraftBridge is a microservices-based marketplace platform with FastAPI API Gateway, PostgreSQL, Redis, and Next.js web frontend.

## 2. Stable Architecture Constraints
- Backend framework: FastAPI
- Primary database: PostgreSQL
- Frontend framework: Next.js (App Router + TypeScript)
- Local runtime: Docker Compose

## 3. Core Services
- API Gateway (`services/api-gateway`)
- Media Service (`services/media-service`)
- Recommendation Service (`services/recommendation-service`)
- Supporting services: logistics, payments, notifications, AI engine (future use)

## 4. Backend Layering
API Gateway keeps the layered contract:
- Routes -> Controllers -> Services -> Database

Implemented domains:
- Auth
- Artisan profiles
- Products
- Reels
- Orders
- Storefront aggregation

## 5. Phase 4 Marketplace Engine
As of March 9, 2026, marketplace engine and media-processing behaviors are integrated.

### 5.1 Order System
Implemented in API Gateway:
- `POST /api/v1/orders`
- `GET /api/v1/orders/{id}`
- `GET /api/v1/users/{id}/orders`

Order lifecycle statuses:
- `pending`
- `confirmed`
- `shipped`
- `delivered`

### 5.2 Reel Engagement and Ranking
Reel model now includes:
- `likes`
- `views`
- `thumbnail_url`

New APIs:
- `POST /api/v1/reels/{id}/like`
- `POST /api/v1/reels/{id}/view`

Feed ranking formula:
- `score = (likes * 3) + (views * 1) + freshness_factor`

Ranking logic reference:
- `services/recommendation-service/feed-generator/feedEngine.py`

### 5.3 Media Processing Pipeline
Reel upload flow includes:
1. Upload video file.
2. Transcode to standardized output (FFmpeg).
3. Generate preview thumbnail.
4. Persist video/thumbnail URLs and reel metadata.

Media storage directories:
- `/storage/images`
- `/storage/videos`
- `/storage/thumbnails`

Pipeline implementation files:
- `services/media-service/video-processing/transcoding/transcoder.py`
- `services/media-service/workers/media_storage.py`
- `services/media-service/image-processing/optimization/optimizer.py`
- `services/api-gateway/app/services/file_upload.py`

## 6. Frontend Architecture (Phase 4)
Web app location:
- `apps/web`

Key routes:
- `/discover` marketplace masonry feed with hover quick-view
- `/reels` vertical feed with likes/views interactions
- `/product/[id]` product details + related reels + Buy Now
- `/artisan/[id]` storefront
- `/upload` product upload

Frontend API integration is centralized in:
- `apps/web/src/lib/api.ts`

## 7. Runtime Topology
`docker compose up --build` runs:
- `web` (Next.js)
- `api-gateway` (FastAPI)
- `postgres`
- `redis`

## 8. Phase 5 Artisan Mobile Application
As of March 9, 2026, CraftBridge includes an artisan-only Expo mobile app.

Location:
- `apps/artisan-mobile`

Mobile design priorities:
- Large tap targets
- Simple forms for low-tech users
- Readable typography and high-contrast cards

Implemented modules:
- Navigation shell: `apps/artisan-mobile/app/App.tsx`
- Screens:
  - `HomeScreen` (dashboard summary + recent orders)
  - `UploadProductScreen` (camera/gallery upload)
  - `UploadReelScreen` (video upload + product linking + preview)
  - `StorefrontScreen` (profile, products, reels)
  - `SalesScreen` (revenue, order count, top product, recent orders)
- API client: `apps/artisan-mobile/services/api.ts`
- Offline queue:
  - `apps/artisan-mobile/offline/queue/uploadQueue.ts`
  - `apps/artisan-mobile/offline/sync/syncManager.ts`

## 9. Phase 5 Dashboard and Sales APIs
New protected artisan endpoints:
- `GET /api/v1/artisan/dashboard`
- `GET /api/v1/artisan/sales`

Backend layering remains unchanged:
- Routes -> Controllers -> Services -> Database

Files:
- `services/api-gateway/app/routes/dashboard.py`
- `services/api-gateway/app/controllers/dashboardController.py`
- `services/api-gateway/app/services/dashboardService.py`
- `services/api-gateway/app/schemas/dashboardSchema.py`

## 10. Phase 6 - Frontend UI/UX Architecture (March 10, 2026)

### 10.1 Design System
CraftBridge implements a comprehensive craft-inspired design system across all frontend platforms.

**Color Palette:**
- Primary (Terracotta/Clay): `#c75f47` - Used for CTAs, highlights, and key elements
- Secondary (Warm Beige/Sand): `#e8dcc8` - Used for accents and backgrounds
- Accent (Deep Indigo): `#1f3447` - Used for secondary CTAs and branding
- Neutrals: Grays from `#6b7280` (slate) to `#1a1a1a` (ink)
- Semantic: Success `#10b981`, Warning `#f59e0b`, Error `#ef4444`

**Typography:**
- Heading font: Plus Jakarta Sans (600, 700, 800 weights)
- Body font: Manrope (400, 500, 600, 700 weights)
- Large readable sizes (16px+ base, 28px+ for headings)

**Spacing & Dimensions:**
- Base unit: 4px (used for margins, padding, gaps)
- Border radius: 20px (web), 16px (mobile) for cards and components
- Box shadows:
  - `soft`: 0 2px 8px rgba(0,0,0,0.06)
  - `card`: 0 4px 12px rgba(0,0,0,0.08)
  - `cardHover`: 0 12px 32px rgba(199,95,71,0.12)

### 10.2 Web Platform Architecture (Next.js 14+ App Router)

**Core Layout:**
- `apps/web/src/app/layout.tsx` - Global layout with responsive max-width (7xl), sticky navigation, footer
- `apps/web/src/components/Navbar.tsx` - Sticky header with search, auth, upload, mobile menu (AnimatePresence)
- `apps/web/src/components/Footer.tsx` - Linked footer with company info, navigation, legal

**Page Hierarchy:**
1. **Home (`/`)** 
   - Animated hero section with floating blob effects
   - Benefits cards with hover lift animations
   - Featured products grid (0-8 products)
   - CTA section for artisans
   - "How It Works" section (3-step process with connecting lines)

2. **Discover (`/discover`)**
   - Responsive grid layout (1-2-3-4 columns based on breakpoint)
   - Infinite scroll pagination (PAGE_SIZE: 12)
   - Enhanced ProductCard components with animations
   - Loading skeleton grid, error states, empty states

3. **Reels (`/reels`)**
   - Video player container with ReelPlayer component
   - Artisan profile section with follow button
   - Engagement metrics (likes, views)
   - Like button and "View Product" CTA
   - Artisan CTA section at bottom

4. **Product Detail (`/product/[id]`)**
   - Product image carousel/gallery
   - Detailed product information
   - Artisan profile section
   - Buy button and related products

5. **Artisan Storefront (`/artisan/[id]`)**
   - Profile banner and biography
   - Product grid section
   - Reels section

**Component Library:**
- `ProductCard.tsx` - Reusable product display with hover animations, zoom effects, rating stars
- `ReelPlayer.tsx` - Video player component for reel content
- Custom hooks in `apps/web/src/hooks/`

**Animation Framework:**
- Framer Motion for all animations
- Variants for staggered children animations
- `whileHover`, `whileTap`, `animate`, `initial`, `exit` states
- Smooth transitions with spring physics (stiffness: 300, damping: 30)

### 10.3 Mobile Platform Architecture (React Native + Expo)

**Components Library:**
- `Card.tsx` - Variants: elevated (shadows), outlined (borders), filled (background)
- `StatCard.tsx` - Metric display with icon containers, color variants (primary, success, accent, warning)
- `PrimaryButton.tsx` - CTA button with loading state
- `FormField.tsx` - Reusable input fields
- Additional components in `apps/artisan-mobile/components/`

**Screen Hierarchy:**
1. **HomeScreen** - Artisan dashboard with:
   - Greeting header
   - Metrics grid (Products, Orders, Total Sales)
   - Quick action buttons (Upload Product, Create Reel)
   - Performance stats (Conversion rate, Avg order value)
   - Recent orders list (scrollable)
   - Help/Pro tips section
   - Refresh control integration

2. **UploadProductScreen** - Product creation with:
   - Image picker integration
   - Form fields for title, description, price, category
   - Preview before submission
   - Success/error handling

3. **UploadReelScreen** - Video upload with:
   - Video selection from device
   - Video preview
   - Caption input
   - Product selector dropdown
   - Upload progress bar

4. **StorefrontScreen** - Artisan profile display:
   - Profile header with bio
   - Products grid
   - Reels list
   - Edit profile button (if own storefront)

5. **SalesScreen** - Analytics dashboard:
   - Revenue metrics cards
   - Monthly sales bar chart
   - Revenue trend line chart
   - Order summary
   - Top selling products list

**Styling System:**
- StyleSheet.create() for all styles
- Consistent colors from design system
- Elevation/shadow values: 2-4 (mobile standard)
- Responsive spacing: 16px padding (standard), 12px component gaps

**API Integration:**
- Centralized API client: `apps/artisan-mobile/services/api.ts`
- Offline support: `apps/artisan-mobile/offline/`
- Async storage for app state

### 10.4 Responsive Design Strategy

**Web Breakpoints:**
- Mobile: < 640px (sm)
- Tablet: 640px - 1024px (md, lg)
- Desktop: 1024px+ (xl)

**Mobile-First Approach:**
- Start with mobile layout, enhance for larger screens
- Hidden navigation on mobile (hamburger menu)
- Single column layouts on mobile, multi-column on desktop
- Touch-friendly tap targets (minimum 44px)

### 10.5 Performance & Accessibility

**Performance:**
- Image optimization with Next.js Image component (planned)
- Code splitting with dynamic imports (planned)
- Lazy loading of below-fold content
- Optimistic UI updates for interactions

**Accessibility:**
- WCAG 2.1 AA compliance target
- Proper semantic HTML (nav, section, article)
- ARIA labels for icons and buttons
- Keyboard navigation support
- Color contrast ratios > 4.5:1
- Focus visible states on all interactive elements
- Alt text for all images

### 10.6 Key Frontend Dependencies

**Web:**
- `next` 16.1.6 - Framework
- `react` 19.2.4, `react-dom` 19.2.4 - UI library
- `framer-motion` 12.35.2 - Animations
- `tailwindcss` 3.4.13 - Styling
- `axios` 1.13.6 - HTTP client

**Mobile:**
- `expo` ~55.0.5 - Framework
- `react` ^19.2.0, `react-native` ^0.83.2 - Native framework
- `@react-navigation` 7.1.33+ - Navigation
- `react-native-safe-area-context` 5.6.0 - Safe area handling
- `expo-image-picker`, `expo-video` - Media handling
- `axios` 1.13.6 - HTTP client

### 10.7 Pixel-Perfect Consistency

All components follow:
- Consistent button size: 44px minimum height (mobile), 40-48px (web)
- Consistent card corners: 20px border-radius (web), 16px (mobile)
- Consistent spacing base: 4px unit
- Consistent typography scale: 12px (smallest), 14px (body), 16px (body large), 18px+ (headings)
- Consistent shadow depth: Soft shadows for cards, elevated shadows for modals
- Consistent color usage: Primary for CTAs, accent for secondary actions, slate for text
