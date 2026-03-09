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

## 4. Phase 2 Core Platform Foundation (Implemented)
As of March 9, 2026, the API Gateway implements backend foundation features without introducing AI behaviors.

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
- `User`: account and role identity
- `Artisan`: artisan profile linked one-to-one with user
- `Product`: artisan listing metadata
- `ProductImage`: product image URLs
- `Reel`: artisan short-video metadata
- `Order`: base purchase record model

### 4.4 Authentication and Authorization
- JWT utility in `services/api-gateway/core/security/jwt_handler.py`
- Bcrypt password hashing in auth service
- Protected route dependencies in `app/middleware/authMiddleware.py`
- Implemented auth endpoints:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `GET /api/v1/auth/me`

Authentication flow:
1. Client registers account.
2. Client logs in and receives JWT.
3. Client sends bearer token on protected APIs.
4. Gateway verifies token and resolves user identity/role.

### 4.5 Product and Media Foundation
- Artisan profile endpoints:
  - `POST /api/v1/artisans/create`
  - `GET /api/v1/artisans/{id}`
  - `GET /api/v1/artisans`
- Product endpoints:
  - `POST /api/v1/products`
  - `GET /api/v1/products`
  - `GET /api/v1/products/{id}`
- Reel endpoints:
  - `POST /api/v1/reels/upload`
  - `GET /api/v1/reels/feed`
- Storefront endpoint:
  - `GET /api/v1/artisan/{id}/storefront`

Product upload flow:
1. Authenticated artisan creates profile (if not existing).
2. Artisan uploads product metadata + images.
3. Files are sent through S3-compatible storage abstraction.
4. Metadata and media URLs are persisted in PostgreSQL.
5. Storefront endpoint aggregates artisan profile, products, and reels.

### 4.6 Layered Backend Structure
Implemented pattern across the gateway:
- Routes -> Controllers -> Services -> Database

Representative modules:
- `app/routes/products.py`
- `app/controllers/productController.py`
- `app/services/productService.py`

## 5. Local Runtime Topology
`docker compose up` starts:
- API Gateway
- PostgreSQL
- Redis
