"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

import { ProductCard } from "@/components/ProductCard";
import { getStorefront, Storefront } from "@/lib/api";

const REFRESH_INTERVAL_MS = 10_000;

export default function ArtisanStorefrontPage() {
  const params = useParams<{ id?: string | string[] }>();
  const artisanId = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const [storefront, setStorefront] = useState<Storefront | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!artisanId) {
      return;
    }

    let active = true;

    const load = async () => {
      try {
        const data = await getStorefront(artisanId);
        if (!active) {
          return;
        }
        setStorefront(data);
        setError(null);
      } catch {
        if (!active) {
          return;
        }
        setError("Unable to load this storefront.");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [artisanId]);

  useEffect(() => {
    if (!artisanId) {
      return;
    }

    let active = true;

    const refresh = async () => {
      try {
        const data = await getStorefront(artisanId);
        if (!active) {
          return;
        }
        setStorefront(data);
        setError(null);
      } catch {
        // Keep existing storefront content on background refresh failures.
      }
    };

    const onFocusOrVisible = () => {
      if (document.visibilityState !== "visible") {
        return;
      }
      void refresh();
    };

    const interval = window.setInterval(() => {
      if (document.visibilityState !== "visible") {
        return;
      }
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
  }, [artisanId]);

  if (isLoading) {
    return (
      <section className="space-y-8">
        <div className="h-60 rounded-card bg-slate-200 animate-pulse" />
        <div className="h-96 rounded-card bg-slate-200 animate-pulse" />
      </section>
    );
  }

  if (error || !storefront) {
    return (
      <section className="space-y-8">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-lg font-semibold text-ink mb-2">Storefront not found</p>
          <p className="text-sm text-slate mb-6">{error ?? "This artisan's storefront doesn't exist."}</p>
          <Link href="/artisans" className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primaryDark transition">
            Browse Artisans
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-10">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-card border border-slate-200 bg-primary/5 p-8 shadow-soft"
      >
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-4xl font-bold">
            {storefront.artisan.name[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="font-[var(--font-heading)] text-3xl font-bold text-ink">
                {storefront.artisan.name}
              </h1>
              {storefront.artisan.verified && (
                <span className="px-3 py-1 bg-success text-white text-xs font-semibold rounded-full">
                  ✓ Verified
                </span>
              )}
            </div>
            <p className="mt-2 max-w-3xl text-base text-slate leading-relaxed">
              {storefront.artisan.bio ?? "Talented artisan creating beautiful handmade products."}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {storefront.artisan.craft_type && (
                <span className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-ink">
                  🎨 {storefront.artisan.craft_type}
                </span>
              )}
              {storefront.artisan.location && (
                <span className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate">
                  📍 {storefront.artisan.location}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Products Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-[var(--font-heading)] text-2xl font-bold text-ink">
            Products
          </h2>
          <p className="text-sm text-slate">{storefront.products.length} items</p>
        </div>

        {storefront.products.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {storefront.products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard product={product} showDescription />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate">No products uploaded yet.</p>
          </div>
        )}
      </motion.div>

      {/* Reels Section */}
      {storefront.reels.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-[var(--font-heading)] text-2xl font-bold text-ink">
              Craft Stories
            </h2>
            <p className="text-sm text-slate">{storefront.reels.length} videos</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {storefront.reels.map((reel, index) => (
              <motion.article
                key={reel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="overflow-hidden rounded-card border border-slate-200 bg-white shadow-soft hover:shadow-card transition-shadow"
              >
                <video
                  src={reel.video_url}
                  controls
                  className="aspect-[9/16] w-full bg-black object-cover"
                />
                <p className="p-4 text-sm text-slate">
                  {reel.caption ?? "No caption provided."}
                </p>
              </motion.article>
            ))}
          </div>
        </motion.div>
      )}
    </section>
  );
}
