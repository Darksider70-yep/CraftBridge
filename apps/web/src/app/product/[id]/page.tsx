"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { createOrder, getProductDetails, Product } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

interface ProductDetailPageProps {
  params: {
    id: string;
  };
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { token, isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getProductDetails(params.id)
      .then((data) => {
        setProduct(data);
        setSelectedImage(0);
      })
      .catch(() => setError("Product not found."))
      .finally(() => setIsLoading(false));
  }, [params.id]);

  const primaryImage = useMemo(() => {
    if (!product || !product.images.length) {
      return null;
    }
    return product.images[Math.min(selectedImage, product.images.length - 1)];
  }, [product, selectedImage]);

  const onBuyNow = async () => {
    if (!product || !token) {
      setOrderMessage("Please login to place an order.");
      return;
    }

    setIsCreatingOrder(true);
    setOrderMessage(null);
    try {
      const order = await createOrder(
        {
          product_id: product.id,
          quantity,
        },
        token,
      );
      setOrderMessage(`Order created successfully. Order ID: ${order.id}`);
    } catch {
      setOrderMessage("Unable to create order right now.");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-slate">Loading product...</p>;
  }

  if (!product || error) {
    return <p className="text-sm text-red-600">{error ?? "Product not found."}</p>;
  }

  return (
    <section className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white shadow-card">
            {primaryImage ? (
              <img
                src={primaryImage.image_url}
                alt={product.title}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center bg-slate-100 text-sm text-slate">
                No image
              </div>
            )}
          </div>
          {product.images.length > 1 ? (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`overflow-hidden rounded-lg border ${
                    selectedImage == index ? "border-accent" : "border-slate-200"
                  }`}
                >
                  <img
                    src={image.image_url}
                    alt={`${product.title} ${index + 1}`}
                    className="h-16 w-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <article className="rounded-[1.25rem] border border-slate-200 bg-white p-6 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">Product</p>
          <h1 className="mt-1 font-[var(--font-heading)] text-3xl font-bold text-ink">
            {product.title}
          </h1>
          <p className="mt-2 text-sm text-slate">
            by <span className="font-semibold text-ink">{product.artisan_name ?? "Artisan"}</span>
          </p>
          <p className="mt-4 text-2xl font-bold text-accent">
            {currencyFormatter.format(product.price)}
          </p>
          <p className="mt-4 text-sm text-slate">
            {product.description ?? "No description available for this listing."}
          </p>

          <div className="mt-6 flex items-center gap-3">
            <label className="text-sm font-medium text-ink" htmlFor="quantity">
              Qty
            </label>
            <input
              id="quantity"
              type="number"
              min={1}
              max={10}
              value={quantity}
              onChange={(event) => setQuantity(Math.max(Number(event.target.value), 1))}
              className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <button
            type="button"
            onClick={() => void onBuyNow()}
            disabled={isCreatingOrder}
            className="mt-5 rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {isCreatingOrder ? "Placing Order..." : "Buy Now"}
          </button>
          {!isAuthenticated ? (
            <p className="mt-2 text-xs text-slate">Login is required to place orders.</p>
          ) : null}
          {orderMessage ? (
            <p className="mt-2 text-sm text-slate-700">{orderMessage}</p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/artisan/${product.artisan_id}`}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Visit Artisan Storefront
            </Link>
            <Link
              href="/discover"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Back to Discover
            </Link>
          </div>
        </article>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-ink">Related Reels</h2>
        {product.related_reels.length ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {product.related_reels.map((reel) => (
              <article
                key={reel.id}
                className="overflow-hidden rounded-card border border-slate-200 bg-white shadow-card"
              >
                <video
                  src={reel.video_url}
                  controls
                  className="aspect-[9/16] w-full bg-black object-cover"
                />
                <div className="space-y-2 p-3">
                  <p className="line-clamp-2 text-sm text-slate">
                    {reel.caption ?? "No caption provided."}
                  </p>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate">
                    {reel.likes} likes • {reel.views} views
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate">No related reels for this product yet.</p>
        )}
      </div>
    </section>
  );
}

