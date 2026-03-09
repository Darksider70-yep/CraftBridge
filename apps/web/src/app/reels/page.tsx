"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ReelPlayer } from "@/components/ReelPlayer";
import { Reel, getReelsFeed, likeReel, viewReel } from "@/lib/api";

export default function ReelsPage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getReelsFeed(30)
      .then((data) => setReels(data))
      .catch(() => setError("Unable to load reels feed."))
      .finally(() => setIsLoading(false));
  }, []);

  const onLike = async (reelId: string) => {
    setReels((current) =>
      current.map((reel) =>
        reel.id === reelId ? { ...reel, likes: reel.likes + 1 } : reel,
      ),
    );
    try {
      const updated = await likeReel(reelId);
      setReels((current) =>
        current.map((reel) => (reel.id === reelId ? updated : reel)),
      );
    } catch {
      setReels((current) =>
        current.map((reel) =>
          reel.id === reelId ? { ...reel, likes: Math.max(reel.likes - 1, 0) } : reel,
        ),
      );
    }
  };

  const onView = async (reelId: string) => {
    setReels((current) =>
      current.map((reel) =>
        reel.id === reelId ? { ...reel, views: reel.views + 1 } : reel,
      ),
    );
    try {
      const updated = await viewReel(reelId);
      setReels((current) =>
        current.map((reel) => (reel.id === reelId ? updated : reel)),
      );
    } catch {
      // Keep optimistic count if tracking endpoint fails.
    }
  };

  if (isLoading) {
    return <p className="text-sm text-slate">Loading reels...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">Reels</p>
          <h1 className="mt-1 font-[var(--font-heading)] text-3xl font-bold text-ink">
            Craft Stories Feed
          </h1>
        </div>
        <p className="text-sm text-slate">{reels.length} videos</p>
      </div>

      <div className="h-[calc(100vh-180px)] snap-y snap-mandatory space-y-6 overflow-y-auto pr-1">
        {reels.map((reel) => (
          <article
            key={reel.id}
            className="snap-start rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-card"
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,460px)_1fr]">
              <ReelPlayer reel={reel} onVisible={() => void onView(reel.id)} />
              <div className="flex flex-col gap-3">
                <p className="text-sm text-slate">
                  Posted by <span className="font-semibold text-ink">{reel.artisan_name ?? "Artisan"}</span>
                </p>
                <p className="text-sm text-slate">
                  {reel.caption ?? "Traditional making process in motion."}
                </p>
                <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-wide text-slate">
                  <span>{reel.likes} likes</span>
                  <span>{reel.views} views</span>
                </div>

                <button
                  type="button"
                  onClick={() => void onLike(reel.id)}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                >
                  Like
                </button>

                {reel.product_id ? (
                  <Link
                    href={`/product/${reel.product_id}`}
                    className="inline-flex w-fit rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Visit Product
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-fit rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-400"
                  >
                    Visit Product
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

