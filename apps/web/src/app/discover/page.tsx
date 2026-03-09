"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { ProductCard } from "@/components/ProductCard";
import { getProducts, Product } from "@/lib/api";

const PAGE_SIZE = 8;

export default function DiscoverPage() {
  const [products, setProducts] = useState<Product[]>([]);
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
            className="mb-5 break-inside-avoid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.2) }}
          >
            <ProductCard product={product} showDescription />
          </motion.div>
        ))}
      </div>

      <div ref={loadMoreRef} className="h-8" />
      {visibleCount < products.length ? (
        <p className="text-center text-sm text-slate">Loading more products...</p>
      ) : (
        <p className="text-center text-sm text-slate">You reached the end of the feed.</p>
      )}
    </section>
  );
}

