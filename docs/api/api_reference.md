# CraftBridge API Reference (Phase 4)

## Base Conventions
- Base path: `/api/v1`
- Health endpoints: `GET /`, `GET /health`
- Protected APIs require `Authorization: Bearer <jwt>`
- Upload APIs use `multipart/form-data`

## Authentication
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` (protected)

## Artisan and Product APIs
- `POST /artisans/create` (protected)
- `GET /artisans/{id}`
- `GET /artisans`
- `GET /artisan/{id}/storefront`
- `POST /products` (protected, artisan role)
- `GET /products`
- `GET /products/{id}`

`GET /products/{id}` now includes:
- image list
- artisan name
- `related_reels[]` (video URL, caption, likes, views)

## Order APIs
- `POST /orders` (protected)
  - Body:
    ```json
    {
      "product_id": "<product-id>",
      "quantity": 1
    }
    ```
  - Response contains `status` values from:
    - `pending`
    - `confirmed`
    - `shipped`
    - `delivered`

- `GET /orders/{id}` (protected)
- `GET /users/{id}/orders` (protected)

## Reel APIs
- `POST /reels/upload` (protected, artisan role)
- `GET /reels/feed`
- `POST /reels/{id}/like`
- `POST /reels/{id}/view`

`Reel` response fields include:
- `video_url`
- `thumbnail_url`
- `caption`
- `likes`
- `views`

## Feed Ranking
`GET /reels/feed` uses ranking score:

`score = (likes * 3) + (views * 1) + freshness_factor`

Reels are sorted by score descending.

## Media Processing Notes
Reel upload processing now performs:
- video compression
- resolution standardization
- thumbnail generation

Stored paths:
- videos: `/storage/videos/`
- thumbnails: `/storage/thumbnails/`
- images: `/storage/images/`

## Product Purchase Flow
1. User discovers product in `GET /products`.
2. User opens product detail via `GET /products/{id}`.
3. User places order with `POST /orders`.
4. Order is persisted and retrievable via `GET /orders/{id}`.
