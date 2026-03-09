# CraftBridge API Reference (Phase 1 Contract Draft)

## Conventions
- Base URL: `/api/v1`
- Content type: `application/json`
- Auth: `Authorization: Bearer <token>` for protected routes
- IDs: UUID strings unless stated otherwise

---

## Product APIs

### POST `/products/upload`
Create a new product listing draft with uploaded image object keys.

Request schema:
```json
{
  "type": "object",
  "required": [
    "artisan_id",
    "title",
    "category",
    "price",
    "inventory_count",
    "image_keys"
  ],
  "properties": {
    "artisan_id": { "type": "string", "format": "uuid" },
    "title": { "type": "string", "maxLength": 160 },
    "description": { "type": "string" },
    "category": { "type": "string" },
    "craft_type": { "type": "string" },
    "material": { "type": "string" },
    "price": { "type": "number", "minimum": 0 },
    "currency": { "type": "string", "minLength": 3, "maxLength": 3 },
    "inventory_count": { "type": "integer", "minimum": 0 },
    "image_keys": {
      "type": "array",
      "minItems": 1,
      "items": { "type": "string" }
    },
    "ai_assist": { "type": "boolean" }
  }
}
```

Response schema:
```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "artisan_id": { "type": "string", "format": "uuid" },
    "status": { "type": "string", "enum": ["draft", "published"] },
    "title": { "type": "string" },
    "price": { "type": "number" },
    "currency": { "type": "string" },
    "image_urls": {
      "type": "array",
      "items": { "type": "string" }
    },
    "created_at": { "type": "string", "format": "date-time" }
  }
}
```

Example JSON:
```json
{
  "id": "8dfc5f9c-9e4b-43b2-bad0-31fb64e54db2",
  "artisan_id": "5a458889-a532-4b2f-bbe4-7d1658c34c10",
  "status": "draft",
  "title": "Handwoven Jute Basket",
  "price": 32.5,
  "currency": "INR",
  "image_urls": [
    "https://cdn.craftbridge.com/products/8dfc5f9c/img-1.jpg"
  ],
  "created_at": "2026-03-09T10:15:00Z"
}
```

### GET `/products`
List published products with filtering and cursor pagination.

Request schema (query params):
```json
{
  "type": "object",
  "properties": {
    "artisan_id": { "type": "string", "format": "uuid" },
    "category": { "type": "string" },
    "q": { "type": "string" },
    "cursor": { "type": "string" },
    "limit": { "type": "integer", "minimum": 1, "maximum": 50 }
  }
}
```

Response schema:
```json
{
  "type": "object",
  "properties": {
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string", "format": "uuid" },
          "title": { "type": "string" },
          "price": { "type": "number" },
          "currency": { "type": "string" },
          "thumbnail_url": { "type": "string" },
          "artisan_name": { "type": "string" }
        }
      }
    },
    "next_cursor": { "type": "string" }
  }
}
```

Example JSON:
```json
{
  "items": [
    {
      "id": "8dfc5f9c-9e4b-43b2-bad0-31fb64e54db2",
      "title": "Handwoven Jute Basket",
      "price": 32.5,
      "currency": "INR",
      "thumbnail_url": "https://cdn.craftbridge.com/products/8dfc5f9c/thumb.jpg",
      "artisan_name": "Savita Weaves"
    }
  ],
  "next_cursor": "eyJpZCI6IjhkZmM1In0="
}
```

### GET `/products/{id}`
Fetch product details for a product page or checkout.

Request schema:
```json
{
  "type": "object",
  "required": ["id"],
  "properties": {
    "id": { "type": "string", "format": "uuid" }
  }
}
```

Response schema:
```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "artisan_id": { "type": "string", "format": "uuid" },
    "title": { "type": "string" },
    "description": { "type": "string" },
    "category": { "type": "string" },
    "price": { "type": "number" },
    "currency": { "type": "string" },
    "inventory_count": { "type": "integer" },
    "images": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "url": { "type": "string" },
          "is_primary": { "type": "boolean" }
        }
      }
    },
    "authenticity_status": { "type": "string" }
  }
}
```

Example JSON:
```json
{
  "id": "8dfc5f9c-9e4b-43b2-bad0-31fb64e54db2",
  "artisan_id": "5a458889-a532-4b2f-bbe4-7d1658c34c10",
  "title": "Handwoven Jute Basket",
  "description": "Woven by hand using natural jute fibers.",
  "category": "Home Decor",
  "price": 32.5,
  "currency": "INR",
  "inventory_count": 18,
  "images": [
    {
      "url": "https://cdn.craftbridge.com/products/8dfc5f9c/img-1.jpg",
      "is_primary": true
    }
  ],
  "authenticity_status": "verified"
}
```

---

## Reel APIs

### POST `/reels/upload`
Register an uploaded reel for processing and publication.

Request schema:
```json
{
  "type": "object",
  "required": ["artisan_id", "video_key", "duration_seconds"],
  "properties": {
    "artisan_id": { "type": "string", "format": "uuid" },
    "product_id": { "type": "string", "format": "uuid" },
    "caption": { "type": "string", "maxLength": 500 },
    "video_key": { "type": "string" },
    "thumbnail_key": { "type": "string" },
    "duration_seconds": { "type": "integer", "minimum": 1 }
  }
}
```

Response schema:
```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "status": { "type": "string", "enum": ["processing", "published"] },
    "video_url": { "type": "string" },
    "thumbnail_url": { "type": "string" },
    "created_at": { "type": "string", "format": "date-time" }
  }
}
```

Example JSON:
```json
{
  "id": "a7fe7ef8-7603-4f62-aa38-a2f31f90536f",
  "status": "processing",
  "video_url": "https://cdn.craftbridge.com/reels/a7fe7ef8/master.m3u8",
  "thumbnail_url": "https://cdn.craftbridge.com/reels/a7fe7ef8/thumb.jpg",
  "created_at": "2026-03-09T10:20:00Z"
}
```

### GET `/reels/feed`
Get the discovery feed of reels with recommendation ranking.

Request schema (query params):
```json
{
  "type": "object",
  "properties": {
    "user_id": { "type": "string", "format": "uuid" },
    "cursor": { "type": "string" },
    "limit": { "type": "integer", "minimum": 1, "maximum": 50 }
  }
}
```

Response schema:
```json
{
  "type": "object",
  "properties": {
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "reel_id": { "type": "string", "format": "uuid" },
          "video_url": { "type": "string" },
          "thumbnail_url": { "type": "string" },
          "caption": { "type": "string" },
          "artisan": {
            "type": "object",
            "properties": {
              "id": { "type": "string", "format": "uuid" },
              "name": { "type": "string" }
            }
          },
          "engagement": {
            "type": "object",
            "properties": {
              "views": { "type": "integer" },
              "likes": { "type": "integer" }
            }
          }
        }
      }
    },
    "next_cursor": { "type": "string" }
  }
}
```

Example JSON:
```json
{
  "items": [
    {
      "reel_id": "a7fe7ef8-7603-4f62-aa38-a2f31f90536f",
      "video_url": "https://cdn.craftbridge.com/reels/a7fe7ef8/master.m3u8",
      "thumbnail_url": "https://cdn.craftbridge.com/reels/a7fe7ef8/thumb.jpg",
      "caption": "A glimpse into our weaving process.",
      "artisan": {
        "id": "5a458889-a532-4b2f-bbe4-7d1658c34c10",
        "name": "Savita Weaves"
      },
      "engagement": {
        "views": 1280,
        "likes": 214
      }
    }
  ],
  "next_cursor": "eyJyZWVsX2lkIjoiYTdmZSJ9"
}
```

---

## Storefront APIs

### GET `/artisan/{id}/storefront`
Return public storefront data for one artisan.

Request schema:
```json
{
  "type": "object",
  "required": ["id"],
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "product_limit": { "type": "integer", "minimum": 1, "maximum": 50 },
    "reel_limit": { "type": "integer", "minimum": 1, "maximum": 20 }
  }
}
```

Response schema:
```json
{
  "type": "object",
  "properties": {
    "artisan": {
      "type": "object",
      "properties": {
        "id": { "type": "string", "format": "uuid" },
        "display_name": { "type": "string" },
        "story": { "type": "string" },
        "location": { "type": "string" },
        "rating": { "type": "number" }
      }
    },
    "featured_products": {
      "type": "array",
      "items": { "type": "object" }
    },
    "featured_reels": {
      "type": "array",
      "items": { "type": "object" }
    }
  }
}
```

Example JSON:
```json
{
  "artisan": {
    "id": "5a458889-a532-4b2f-bbe4-7d1658c34c10",
    "display_name": "Savita Weaves",
    "story": "Third-generation weavers from Madhya Pradesh.",
    "location": "Bhopal, IN",
    "rating": 4.8
  },
  "featured_products": [
    {
      "id": "8dfc5f9c-9e4b-43b2-bad0-31fb64e54db2",
      "title": "Handwoven Jute Basket",
      "price": 32.5,
      "currency": "INR"
    }
  ],
  "featured_reels": [
    {
      "reel_id": "a7fe7ef8-7603-4f62-aa38-a2f31f90536f",
      "thumbnail_url": "https://cdn.craftbridge.com/reels/a7fe7ef8/thumb.jpg"
    }
  ]
}
```

---

## Order APIs

### POST `/orders`
Create an order and initialize payment flow.

Request schema:
```json
{
  "type": "object",
  "required": ["customer_id", "artisan_id", "items", "shipping_address"],
  "properties": {
    "customer_id": { "type": "string", "format": "uuid" },
    "artisan_id": { "type": "string", "format": "uuid" },
    "items": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["product_id", "quantity", "unit_price"],
        "properties": {
          "product_id": { "type": "string", "format": "uuid" },
          "quantity": { "type": "integer", "minimum": 1 },
          "unit_price": { "type": "number", "minimum": 0 }
        }
      }
    },
    "shipping_address": {
      "type": "object",
      "required": ["line1", "city", "state", "postal_code", "country"],
      "properties": {
        "line1": { "type": "string" },
        "line2": { "type": "string" },
        "city": { "type": "string" },
        "state": { "type": "string" },
        "postal_code": { "type": "string" },
        "country": { "type": "string" }
      }
    },
    "payment_method_token": { "type": "string" }
  }
}
```

Response schema:
```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "order_number": { "type": "string" },
    "status": {
      "type": "string",
      "enum": ["pending_payment", "confirmed", "processing", "shipped", "delivered"]
    },
    "amounts": {
      "type": "object",
      "properties": {
        "subtotal": { "type": "number" },
        "shipping_fee": { "type": "number" },
        "tax_amount": { "type": "number" },
        "total_amount": { "type": "number" },
        "currency": { "type": "string" }
      }
    },
    "payment_reference": { "type": "string" },
    "created_at": { "type": "string", "format": "date-time" }
  }
}
```

Example JSON:
```json
{
  "id": "6830144d-442a-4b30-87ab-88b497f5987a",
  "order_number": "CB-20260309-1022",
  "status": "pending_payment",
  "amounts": {
    "subtotal": 65,
    "shipping_fee": 5,
    "tax_amount": 3.9,
    "total_amount": 73.9,
    "currency": "INR"
  },
  "payment_reference": "pay_5fdbf278a721",
  "created_at": "2026-03-09T10:22:00Z"
}
```

### GET `/orders/{id}`
Get full order status including payment and logistics snapshot.

Request schema:
```json
{
  "type": "object",
  "required": ["id"],
  "properties": {
    "id": { "type": "string", "format": "uuid" }
  }
}
```

Response schema:
```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "order_number": { "type": "string" },
    "status": { "type": "string" },
    "items": {
      "type": "array",
      "items": { "type": "object" }
    },
    "payment": {
      "type": "object",
      "properties": {
        "status": { "type": "string" },
        "provider": { "type": "string" },
        "provider_payment_id": { "type": "string" }
      }
    },
    "logistics": {
      "type": "object",
      "properties": {
        "route_status": { "type": "string" },
        "tracking_number": { "type": "string" },
        "estimated_delivery_date": { "type": "string", "format": "date" }
      }
    }
  }
}
```

Example JSON:
```json
{
  "id": "6830144d-442a-4b30-87ab-88b497f5987a",
  "order_number": "CB-20260309-1022",
  "status": "confirmed",
  "items": [
    {
      "product_id": "8dfc5f9c-9e4b-43b2-bad0-31fb64e54db2",
      "quantity": 2,
      "unit_price": 32.5
    }
  ],
  "payment": {
    "status": "captured",
    "provider": "Razorpay",
    "provider_payment_id": "pay_5fdbf278a721"
  },
  "logistics": {
    "route_status": "planned",
    "tracking_number": "CBTRACK1022",
    "estimated_delivery_date": "2026-03-14"
  }
}
```

---

## Recommendation APIs

### GET `/recommendations`
Get personalized product and reel recommendations.

Request schema (query params):
```json
{
  "type": "object",
  "required": ["user_id"],
  "properties": {
    "user_id": { "type": "string", "format": "uuid" },
    "context": { "type": "string", "enum": ["home", "product_detail", "reel_feed"] },
    "product_id": { "type": "string", "format": "uuid" },
    "cursor": { "type": "string" },
    "limit": { "type": "integer", "minimum": 1, "maximum": 50 }
  }
}
```

Response schema:
```json
{
  "type": "object",
  "properties": {
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "entity_type": { "type": "string", "enum": ["product", "reel"] },
          "entity_id": { "type": "string", "format": "uuid" },
          "score": { "type": "number" },
          "reason": { "type": "string" }
        }
      }
    },
    "model_version": { "type": "string" },
    "next_cursor": { "type": "string" }
  }
}
```

Example JSON:
```json
{
  "items": [
    {
      "entity_type": "product",
      "entity_id": "8dfc5f9c-9e4b-43b2-bad0-31fb64e54db2",
      "score": 0.94,
      "reason": "Similar to recently viewed handmade basket collections."
    },
    {
      "entity_type": "reel",
      "entity_id": "a7fe7ef8-7603-4f62-aa38-a2f31f90536f",
      "score": 0.88,
      "reason": "High engagement among users with similar browsing history."
    }
  ],
  "model_version": "rec-v1.0.0",
  "next_cursor": "eyJvZmZzZXQiOjIwfQ=="
}
```
