# CraftBridge API Reference (Phase 3)

## Base Conventions
- API version base path: `/api/v1`
- Public system endpoints: `GET /`, `GET /health`
- Protected endpoints require `Authorization: Bearer <jwt>`
- Payload formats:
  - `application/json` for auth/profile reads
  - `multipart/form-data` for media uploads

## Phase 3 Vertical Slice Endpoints

### Product Upload API
`POST /api/v1/products` (protected, artisan role)

Multipart fields:
- `title` (string, required)
- `description` (string, optional)
- `price` (number, required)
- `category` (string, required)
- `images` (file[], optional)

Example response:
```json
{
  "id": "d7f87600-5d5c-4b30-b2f3-c6a6d35cba1e",
  "artisan_id": "904781fc-42e3-4ed5-b623-cacbc828a101",
  "artisan_name": "Phase2 Artisan",
  "title": "Handwoven Basket",
  "description": "Natural fiber artisan basket",
  "price": 59.99,
  "category": "Home Decor",
  "created_at": "2026-03-09T08:12:44.533039Z",
  "images": [
    {
      "id": "8f3b8f16-6f93-4a8e-b349-4b11f9f9c5c2",
      "image_url": "https://storage.local/craftbridge-local/products/9f63774f-8f70-4f18-aec3-332f5f7f8d8b.jpg"
    }
  ]
}
```

### Product Discovery APIs
- `GET /api/v1/products`
  - Used by discovery feed and marketplace cards.
- `GET /api/v1/products/{id}`
  - Used by product detail page.

Both include `artisan_name` and image list for frontend rendering.

### Storefront API
`GET /api/v1/artisan/{id}/storefront`

Optional query params:
- `product_limit` (default `20`)
- `reel_limit` (default `20`)

Response contains:
- `artisan` profile
- `products[]`
- `reels[]`

### Reel Upload API
`POST /api/v1/reels/upload` (protected, artisan role)

Multipart fields:
- `video` (file, required)
- `product_id` (string, optional)
- `caption` (string, optional)

### Reel Feed API
`GET /api/v1/reels/feed`

Query params:
- `limit` (default `20`)

Example response item:
```json
{
  "id": "11f5ef14-0b5c-4a1f-a2a8-ef9dc2d1218f",
  "artisan_id": "904781fc-42e3-4ed5-b623-cacbc828a101",
  "artisan_name": "Phase2 Artisan",
  "product_id": "d7f87600-5d5c-4b30-b2f3-c6a6d35cba1e",
  "video_url": "https://storage.local/craftbridge-local/reels/5de75762-6365-4420-9627-4f6d465ca04e.mp4",
  "caption": "Basket weaving process",
  "created_at": "2026-03-09T08:14:10.961025Z"
}
```

## Authentication APIs
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me` (protected)

## Artisan Profile APIs
- `POST /api/v1/artisans/create` (protected)
- `GET /api/v1/artisans/{id}`
- `GET /api/v1/artisans`

## Auth Flow
1. `POST /api/v1/auth/login` returns `access_token`.
2. Frontend stores token in client storage.
3. Token is attached to protected upload routes.
4. `GET /api/v1/auth/me` is used to resolve current login state.

## Product Upload Vertical Flow
1. Artisan logs in and creates artisan profile.
2. Web upload form posts multipart request to `POST /api/v1/products`.
3. API stores product + image URLs in PostgreSQL.
4. Listing appears in:
   - `GET /api/v1/products` discovery grid
   - `GET /api/v1/artisan/{id}/storefront` artisan page
   - `GET /api/v1/products/{id}` detail page

## Reel Feed Vertical Flow
1. Artisan uploads reel to `POST /api/v1/reels/upload`.
2. API stores object URL and metadata.
3. Web reels page requests `GET /api/v1/reels/feed` for vertical scrolling UI.

