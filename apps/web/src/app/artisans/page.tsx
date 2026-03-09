"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getArtisans, ArtisanProfile } from "@/lib/api";

export default function ArtisansPage() {
  const [artisans, setArtisans] = useState<ArtisanProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getArtisans()
      .then((data) => setArtisans(data))
      .catch(() => setError("Failed to load artisans."))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">Directory</p>
        <h1 className="mt-1 font-[var(--font-heading)] text-3xl font-bold text-ink">
          Artisan Profiles
        </h1>
      </div>

      {isLoading ? <p className="text-sm text-slate">Loading artisans...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {artisans.map((artisan) => (
          <Link
            key={artisan.id}
            href={`/artisan/${artisan.id}`}
            className="rounded-card border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-1"
          >
            <h2 className="text-lg font-semibold text-ink">{artisan.name}</h2>
            <p className="mt-1 text-sm text-slate">
              {artisan.craft_type ?? "Crafts"} {artisan.location ? `• ${artisan.location}` : ""}
            </p>
            <p className="mt-3 line-clamp-2 text-sm text-slate">
              {artisan.bio ?? "No bio provided yet."}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

