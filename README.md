# CraftBridge

CraftBridge is an AI-powered craft marketplace platform connecting rural artisans with customers through intelligent storefront creation, short-form discovery, and fulfillment orchestration.

This repository is currently in **Phase 5: Artisan Mobile Application and Sales Dashboard**.

## Features
- AI Storefront Generator
- AI Product Listing Generator
- Story-Based Discovery Feed
- Short-form Craft Reels
- Smart Logistics Coordination
- Craft Authenticity Tracking
- Recommendation Engine
- Offline-first Artisan Mobile App

## Architecture Overview
CraftBridge uses a microservices architecture with a FastAPI API Gateway entry point.

High-level stack:
- Clients: Web Marketplace (Next.js), Artisan Mobile App (React Native), Admin Dashboard
- Core Services: Product, Reel, Recommendation, Media Processing, Logistics, Payment, Notification
- AI Services: Listing Generator, Image Enhancement, Recommendation Model
- Infrastructure: PostgreSQL, Redis, Object Storage (S3/R2), Docker, Kubernetes, CDN

Detailed architecture docs:
- [System Design](docs/architecture/system_design.md)
- [API Reference](docs/api/api_reference.md)
- [AI Model Docs](docs/ai-models/model_docs.md)
- [Deployment Guide](docs/deployment/deployment_guide.md)

## Artisan Mobile App Architecture
`apps/artisan-mobile` is an Expo React Native app dedicated to artisan operations.

Phase 5 mobile capabilities:
- Bottom tab navigation: `Home`, `Upload Product`, `Upload Reel`, `Storefront`, `Sales`
- Product upload with camera/gallery image capture (`expo-image-picker`)
- Reel upload with optional product linking and preview playback
- Storefront management view (profile, product grid, reel list)
- Sales analytics view (revenue, order count, top product, recent orders)
- Offline upload queue with AsyncStorage persistence and automatic retry on reconnect

Mobile API client:
- `apps/artisan-mobile/services/api.ts`
- Base URL from `EXPO_PUBLIC_API_BASE_URL`

Offline sync modules:
- `apps/artisan-mobile/offline/queue/uploadQueue.ts`
- `apps/artisan-mobile/offline/sync/syncManager.ts`

## Project Structure
```text
apps/
  web/                 # Next.js marketplace
  artisan-mobile/      # React Native artisan app (offline-first)
  admin-dashboard/     # Admin and moderation surfaces
services/
  api-gateway/
  ai-engine/
  media-service/
  recommendation-service/
  logistics-service/
  payment-service/
  notification-service/
packages/
  database/            # SQL schema, migrations, seed data
  shared/              # shared constants/types/helpers
  sdk/                 # client SDK modules
docs/
  architecture/
  api/
  ai-models/
  deployment/
infrastructure/
  docker/
  kubernetes/
```

## Development Instructions
### 1. Prerequisites
- Docker Engine + Docker Compose
- Node.js 20+
- Python 3.11+

### 2. Start Local Stack
```bash
docker compose up --build
```

### 3. Reference Documentation
Use the docs in `docs/` as the contract baseline before implementing business logic in later phases.

## Phase 5 Deliverables Included
- Marketplace flows, reels discovery, and order engine.
- FFmpeg-backed local media processing for uploads.
- Artisan mobile app screens for product/reel uploads, storefront, and sales.
- Dashboard and sales APIs for artisan analytics.
- Integration coverage for artisan dashboard and sales calculations.
