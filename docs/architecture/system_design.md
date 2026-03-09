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
