"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { ProductCard } from "@/components/ProductCard";
import { getProducts, Product } from "@/lib/api";

const PAGE_SIZE = 12;
const REFRESH_INTERVAL_MS = 10_000;

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DiscoverPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Fetch products
  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const data = await getProducts();
        if (!active) return;
        setProducts(data);
        setError(null);
      } catch {
        if (!active) return;
        setError("Unable to load discovery products right now.");
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  // Background refresh
  useEffect(() => {
    let active = true;

    const refresh = async () => {
      try {
        const data = await getProducts();
        if (!active) return;
        setProducts(data);
        setError(null);
      } catch {
        // Keep existing content on background refresh failures
      }
    };

    const onFocusOrVisible = () => {
      if (document.visibilityState !== "visible") return;
      void refresh();
    };

    const interval = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void refresh();
    }, REFRESH_INTERVAL_MS);

    window.addEventListener("focus", onFocusOrVisible);
    document.addEventListener("visibilitychange", onFocusOrVisible);

    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocusOrVisible);
      document.removeEventListener("visibilitychange", onFocusOrVisible);
    };
  }, []);

  // Infinite scroll
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setVisibleCount((current) => Math.min(current + PAGE_SIZE, products.length));
      },
      { rootMargin: "300px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [products.length]);

  const visibleProducts = useMemo(
    () => products.slice(0, visibleCount),
    [products, visibleCount],
  );

  // Loading state
  if (isLoading) {
    return (
      <section className="space-y-8">
        {/* Header skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="h-6 w-32 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-10 w-64 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-5 w-40 bg-slate-200 rounded-lg animate-pulse" />
        </motion.div>

        {/* Loading masonry grid */}
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-80 rounded-card bg-gradient-to-br from-slate-200 to-slate-100"
            />
          ))}
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-2">Discover</p>
          <h1 className="font-[var(--font-heading)] text-4xl font-bold text-ink mb-2">
            Marketplace Feed
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 rounded-card border-2 border-error/20 bg-error/5"
        >
          <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <p className="text-xl font-semibold text-ink mb-2">Unable to Load Marketplace</p>
          <p className="text-base text-slate mb-8 max-w-md text-center">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primaryDark transition-all duration-200 hover:shadow-cardHover active:scale-95"
          >
            Try Again
          </button>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="space-y-10">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-3"
      >
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Marketplace</p>
        <h1 className="font-[var(--font-heading)] text-4xl sm:text-5xl font-bold text-ink">
          Discover Handcrafted Treasures
        </h1>
        <p className="text-lg text-slate">
          {products.length} authentic artisan products · Curated collections from creators worldwide
        </p>
      </motion.div>

      {/* Products Grid or Empty State */}
      {products.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 rounded-card border-2 border-dashed border-slate-200 bg-slate-50/50"
        >
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
            <span className="text-5xl">🎨</span>
          </div>
          <p className="text-2xl font-[var(--font-heading)] font-bold text-ink mb-3">
            Coming Soon
          </p>
          <p className="text-base text-slate text-center max-w-sm">
            Amazing artisan crafts are being added. Check back soon to explore our collection!
          </p>
        </motion.div>
      ) : (
        <>
          {/* Masonry Grid Layout */}
          <motion.div
            className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {visibleProducts.map((product, index) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard product={product} showDescription />
              </motion.div>
            ))}
          </motion.div>

          {/* Load More Trigger */}
          <div ref={loadMoreRef} className="h-4" />

          {/* Loading/Completion Indicator */}
          {visibleCount < products.length ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center py-8"
            >
              <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-slate-50 border border-slate-200">
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2 h-2 bg-primary rounded-full"
                />
                <p className="text-sm font-medium text-slate">Loading more treasures...</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center py-8"
            >
              <p className="text-base text-slate font-medium">
                ✨ You've explored all our featured crafts · Discover amazing artisans
              </p>
            </motion.div>
          )}
        </>
      )}
    </section>
  );
}

