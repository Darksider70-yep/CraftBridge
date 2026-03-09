# CraftBridge System Design

## 1. System Overview
CraftBridge is a microservices-based marketplace platform for artisan commerce, with FastAPI API Gateway as the platform entry point.

## 2. Architecture Style
- Microservices architecture with clear domain boundaries.
- API Gateway mediates public HTTP access.
- Stateful components are externalized to managed infrastructure.

## 3. Core Components
- API Gateway (FastAPI)
- Product, Reel, Recommendation, Media, Logistics, Payment, Notification services
- PostgreSQL for relational system-of-record data
- Redis for cache and async coordination
- S3-compatible object storage for media assets
- CDN for media delivery

## 4. Phase 2 Backend Foundation (Implemented)
As of March 9, 2026, backend foundation supports account, artisan profile, product, reel, and storefront entities.

### 4.1 API Gateway Foundation
- `services/api-gateway/main.py` provides:
  - FastAPI app initialization
  - CORS middleware
  - automatic route registration from `app/routes`
  - `GET /health` and `GET /`

### 4.2 Database Integration
- SQLAlchemy ORM integration in `services/api-gateway/core/config/database.py`
- Environment-driven DB connection via `DATABASE_URL`
- PostgreSQL connection pooling for non-SQLite runtimes
- Request-scoped DB sessions (`get_db` dependency)

### 4.3 Core Data Model
Implemented SQLAlchemy entities in `services/api-gateway/app/models/`:
- `User`
- `Artisan`
- `Product`
- `ProductImage`
- `Reel`
- `Order`

### 4.4 Authentication and Authorization
- JWT utility in `services/api-gateway/core/security/jwt_handler.py`
- Bcrypt password hashing in auth service
- Protected route dependencies in `app/middleware/authMiddleware.py`

Implemented auth endpoints:
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

### 4.5 Layered Backend Structure
Implemented gateway pattern:
- Routes -> Controllers -> Services -> Database

## 5. Phase 3 First Vertical Slice (UI + Backend Integration)
As of March 9, 2026, the first end-to-end product and reels user flows are implemented in `apps/web` with direct API Gateway integration.

### 5.1 Frontend Architecture
- Framework: Next.js (App Router) + TypeScript + TailwindCSS
- Animation: Framer Motion
- HTTP: Axios via centralized API module

Frontend module boundaries:
- `apps/web/src/app/*`: page routes
- `apps/web/src/components/*`: reusable UI components
- `apps/web/src/lib/api.ts`: API client and typed endpoint wrappers
- `apps/web/src/hooks/useAuth.ts`: client auth state + JWT token handling

### 5.2 Implemented Web Routes
- `/` home landing
- `/discover` marketplace discovery grid with infinite scroll batching
- `/reels` vertical reels feed browsing experience
- `/upload` artisan product upload interface
- `/artisan/[id]` storefront page (artisan profile + products + reels)
- `/products/[id]` product detail page
- `/artisans` artisan directory
- `/login` login view for token-based session

### 5.3 Implemented Reusable Components
- `Navbar`: global navigation and login/logout action
- `ProductCard`: product image/title/price/artisan display for feeds and storefronts
- `ReelPlayer`: autoplay/pause with IntersectionObserver for vertical feed rendering

### 5.4 Vertical Slice Data Flow
1. Artisan logs in and opens `/upload`.
2. Upload form submits multipart product payload to `POST /api/v1/products`.
3. Backend persists listing + images; response includes `artisan_id`.
4. Frontend redirects to `/artisan/{id}` storefront.
5. Discover page loads `GET /api/v1/products`, rendering the uploaded product.
6. Reels page loads `GET /api/v1/reels/feed` for scrollable video feed.

## 6. Local Runtime Topology
`docker compose up` starts:
- API Gateway
- PostgreSQL
- Redis

Frontend web app runs separately from `apps/web` using Next.js runtime.

