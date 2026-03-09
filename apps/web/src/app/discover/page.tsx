"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { ProductCard } from "@/components/ProductCard";
import { getProducts, Product } from "@/lib/api";

const PAGE_SIZE = 8;

export default function DiscoverPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    getProducts()
      .then((data) => {
        setProducts(data);
      })
      .catch(() => {
        setError("Unable to load discovery products right now.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) {
          return;
        }

        setVisibleCount((current) => Math.min(current + PAGE_SIZE, products.length));
      },
      {
        rootMargin: "300px",
      },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [products.length]);

  const visibleProducts = useMemo(
    () => products.slice(0, visibleCount),
    [products, visibleCount],
  );

  if (isLoading) {
    return <p className="text-sm text-slate">Loading marketplace...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">Discover</p>
          <h1 className="mt-1 font-[var(--font-heading)] text-3xl font-bold text-ink">
            Marketplace Feed
          </h1>
        </div>
        <p className="text-sm text-slate">{products.length} listings</p>
      </div>

      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4">
        {visibleProducts.map((product, index) => (
          <motion.div
            key={product.id}
            className="group relative mb-5 break-inside-avoid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.2) }}
          >
            <ProductCard product={product} showDescription />
            <button
              type="button"
              onClick={() => setQuickViewProduct(product)}
              className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink opacity-0 shadow transition group-hover:opacity-100"
            >
              Quick view
            </button>
          </motion.div>
        ))}
      </div>

      <div ref={loadMoreRef} className="h-8" />
      {visibleCount < products.length ? (
        <p className="text-center text-sm text-slate">Loading more products...</p>
      ) : (
        <p className="text-center text-sm text-slate">You reached the end of the feed.</p>
      )}

      {quickViewProduct ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4">
          <div className="w-full max-w-2xl rounded-[1.25rem] border border-slate-200 bg-white p-6 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                  Quick View
                </p>
                <h2 className="mt-1 text-2xl font-bold text-ink">{quickViewProduct.title}</h2>
                <p className="mt-1 text-sm text-slate">
                  {quickViewProduct.artisan_name ?? "Artisan"} • {quickViewProduct.category}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuickViewProduct(null)}
                className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
              >
                Close
              </button>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="overflow-hidden rounded-card border border-slate-200 bg-slate-100">
                {quickViewProduct.images[0]?.image_url ? (
                  <img
                    src={quickViewProduct.images[0].image_url}
                    alt={quickViewProduct.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-56 items-center justify-center text-sm text-slate">
                    No image
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <p className="text-sm text-slate">
                  {quickViewProduct.description ?? "No description for this product yet."}
                </p>
                <p className="text-xl font-bold text-accent">${quickViewProduct.price.toFixed(2)}</p>
                <Link
                  href={`/product/${quickViewProduct.id}`}
                  className="inline-flex rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
                >
                  Open Product
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

