# CraftBridge AI Model Documentation (Phase 1)

## 1. Image Enhancement Model
### Purpose
Improve artisan-uploaded product images for marketplace quality while preserving product authenticity.

### Input
- `image_uri`: object storage path to original product image
- `metadata`:
  - product category
  - craft type
  - capture context (indoor/outdoor, low-light flag)

### Output
- `enhanced_image_uri`: path to enhanced asset
- `thumbnail_uri`: optimized thumbnail for feed and catalog
- `quality_scores`:
  - sharpness score
  - exposure score
  - background clarity score
- `processing_report`: optional warnings (for example blur too high)

## 2. Listing Generation Model
### Purpose
Generate first-draft product copy for artisans to reduce listing effort and improve discoverability.

### Input
- `product_image`: one or more image URIs
- `metadata`:
  - artisan name
  - craft type
  - material
  - size/dimensions
  - target customer segment
  - optional price band

### Output
- `title`: concise, marketplace-ready product title
- `description`: narrative + utility-focused product description
- `tags`: searchable keyword set
- `price_suggestion`: recommended price range with confidence score

Example output:
```json
{
  "title": "Handwoven Jute Basket - Natural Finish",
  "description": "A durable handwoven basket crafted from natural jute fibers, ideal for storage and decor.",
  "tags": ["handwoven", "jute", "storage", "sustainable", "home-decor"],
  "price_suggestion": {
    "currency": "INR",
    "min": 550,
    "max": 700,
    "confidence": 0.81
  }
}
```

## 3. Recommendation Model
### Purpose
Serve personalized product and reel recommendations for home feed, product detail cross-sell, and discovery surfaces.

### Inputs
- User browsing history:
  - viewed products/reels
  - dwell time
  - likes/saves/cart actions
  - recent purchase events
- Product and reel embeddings:
  - multimodal embeddings from text + image/video metadata
  - artisan-level style vectors
- Context features:
  - session recency
  - device/app channel
  - feed position/context type

### Output
- Ranked list of candidate entities (`product` or `reel`)
- Per-item relevance score
- Lightweight explanation label for observability/debugging

### Training Strategy
- Candidate generation stage: approximate nearest-neighbor retrieval over product/reel embeddings.
- Ranking stage: supervised learning-to-rank model trained on implicit feedback (click, watch completion, add-to-cart, purchase).
- Training cadence: daily incremental updates with weekly full refresh.
- Cold start handling: blend popularity, artisan diversity, and contextual priors until user behavior history is sufficient.
- Evaluation:
  - Offline: NDCG@K, Recall@K, calibration checks
  - Online: CTR uplift, watch-time uplift, conversion lift, and guardrails for diversity/fair exposure.
- Model lifecycle: versioned artifacts with shadow deployment before full rollout.
