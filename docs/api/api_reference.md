# CraftBridge API Reference (Phase 2)

## Base Conventions
- Versioned base path: `/api/v1`
- Public system endpoints: `GET /`, `GET /health`
- Auth scheme for protected routes: `Authorization: Bearer <jwt>`
- Content types:
  - `application/json` for auth and artisan profile operations
  - `multipart/form-data` for product and reel uploads

## Implemented Endpoints

### System
- `GET /health`
  - Returns service health status.
- `GET /`
  - Returns API Gateway running message.

### Authentication
- `POST /api/v1/auth/register`
  - Body:
    ```json
    {
      "email": "user@example.com",
      "password": "StrongPass123",
      "role": "buyer"
    }
    ```
  - Returns created user profile.

- `POST /api/v1/auth/login`
  - Body:
    ```json
    {
      "email": "user@example.com",
      "password": "StrongPass123"
    }
    ```
  - Returns bearer token and user profile.

- `GET /api/v1/auth/me` (protected)
  - Returns authenticated user profile resolved from JWT `sub` claim.

### Artisan Profiles
- `POST /api/v1/artisans/create` (protected)
  - Creates the artisan profile linked to the authenticated user.

- `GET /api/v1/artisans/{id}`
  - Returns one artisan profile.

- `GET /api/v1/artisans`
  - Returns all artisan profiles.

### Product APIs
- `POST /api/v1/products` (protected, artisan role)
  - Multipart fields:
    - `title` (string)
    - `description` (optional string)
    - `price` (number)
    - `category` (string)
    - `images` (optional repeated file field)
  - Creates product record and stores image URLs.

- `GET /api/v1/products`
  - Returns latest products.

- `GET /api/v1/products/{id}`
  - Returns one product including images.

### Reel APIs
- `POST /api/v1/reels/upload` (protected, artisan role)
  - Multipart fields:
    - `video` (file)
    - `product_id` (optional string)
    - `caption` (optional string)
  - Uploads reel video via storage abstraction and stores reel metadata.

- `GET /api/v1/reels/feed`
  - Returns latest reel feed.

### Storefront
- `GET /api/v1/artisan/{id}/storefront`
  - Query params:
    - `product_limit` (default 20)
    - `reel_limit` (default 20)
  - Returns artisan profile, products, and reels.

## Authentication Flow
1. Register user with `POST /api/v1/auth/register`.
2. Login with `POST /api/v1/auth/login` to receive JWT bearer token.
3. Send `Authorization: Bearer <token>` for protected routes.
4. Gateway verifies JWT and loads user for route dependencies.

## Product Upload Flow
1. Artisan creates profile using `POST /api/v1/artisans/create`.
2. Artisan submits multipart request to `POST /api/v1/products`.
3. API uploads image files through S3-compatible storage abstraction.
4. API persists product metadata and image URLs in PostgreSQL via SQLAlchemy.
5. Product is retrievable through `GET /api/v1/products`, `GET /api/v1/products/{id}`, and storefront endpoint.
