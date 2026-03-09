"use client";

import { useEffect, useState } from "react";

import { ProductCard } from "@/components/ProductCard";
import { getStorefront, Storefront } from "@/lib/api";

interface ArtisanStorefrontPageProps {
  params: {
    id: string;
  };
}

export default function ArtisanStorefrontPage({ params }: ArtisanStorefrontPageProps) {
  const [storefront, setStorefront] = useState<Storefront | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStorefront(params.id)
      .then((data) => setStorefront(data))
      .catch(() => setError("Unable to load this storefront."))
      .finally(() => setIsLoading(false));
  }, [params.id]);

  if (isLoading) {
    return <p className="text-sm text-slate">Loading storefront...</p>;
  }

  if (error || !storefront) {
    return <p className="text-sm text-red-600">{error ?? "Storefront not found."}</p>;
  }

  return (
    <section className="space-y-8">
      <div className="rounded-[1.25rem] border border-slate-200 bg-white p-6 shadow-card sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">Artisan</p>
        <h1 className="mt-1 font-[var(--font-heading)] text-3xl font-bold text-ink">
          {storefront.artisan.name}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate">
          {storefront.artisan.bio ?? "No artisan bio available yet."}
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs font-medium uppercase tracking-wide text-slate">
          <span className="rounded-full border border-slate-200 px-3 py-1">
            {storefront.artisan.craft_type ?? "Craft"}
          </span>
          {storefront.artisan.location ? (
            <span className="rounded-full border border-slate-200 px-3 py-1">
              {storefront.artisan.location}
            </span>
          ) : null}
          <span className="rounded-full border border-slate-200 px-3 py-1">
            {storefront.artisan.verified ? "Verified" : "Unverified"}
          </span>
        </div>
      </div>

      <div>
        <h2 className="font-[var(--font-heading)] text-2xl font-bold text-ink">Products</h2>
        {storefront.products.length ? (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {storefront.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate">No products uploaded yet.</p>
        )}
      </div>

      <div>
        <h2 className="font-[var(--font-heading)] text-2xl font-bold text-ink">Reels</h2>
        {storefront.reels.length ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {storefront.reels.map((reel) => (
              <article
                key={reel.id}
                className="overflow-hidden rounded-card border border-slate-200 bg-white shadow-card"
              >
                <video
                  src={reel.video_url}
                  controls
                  className="aspect-[9/16] w-full bg-black object-cover"
                />
                <p className="p-3 text-sm text-slate">
                  {reel.caption ?? "No caption provided."}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate">No reels published yet.</p>
        )}
      </div>
    </section>
  );
}

