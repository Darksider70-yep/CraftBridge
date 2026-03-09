"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { ReelPlayer } from "@/components/ReelPlayer";
import { Reel, getReelsFeed, likeReel, viewReel } from "@/lib/api";

const REFRESH_INTERVAL_MS = 10_000;

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

export default function ReelsPage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const data = await getReelsFeed(30);
        if (!active) return;
        setReels(data);
        setError(null);
      } catch {
        if (!active) return;
        setError("Unable to load craft stories.");
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const refresh = async () => {
      try {
        const data = await getReelsFeed(30);
        if (!active) return;
        setReels(data);
        setError(null);
      } catch {
        // Keep existing feed on background refresh failures
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
      // Keep optimistic count if tracking endpoint fails
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Reels</p>
          <h1 className="font-[var(--font-heading)] text-4xl sm:text-5xl font-bold text-ink">
            Craft Stories
          </h1>
          <p className="text-lg text-slate">
            Short-form videos showcasing artisan techniques and creativity
          </p>
        </motion.div>

        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-primary"
            />
            <p className="text-base text-slate font-medium">Loading craft stories...</p>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Reels</p>
          <h1 className="font-[var(--font-heading)] text-4xl sm:text-5xl font-bold text-ink">
            Craft Stories
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 rounded-card border-2 border-error/20 bg-error/5"
        >
          <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center mb-5">
            <span className="text-4xl">⚠️</span>
          </div>
          <p className="text-xl font-semibold text-ink mb-2">Unable to Load Stories</p>
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
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Reels</p>
        <h1 className="font-[var(--font-heading)] text-4xl sm:text-5xl font-bold text-ink">
          Craft Stories
        </h1>
        <p className="text-lg text-slate">
          {reels.length} inspiring videos showcasing artisan techniques, behind-the-scenes, and craft journeys
        </p>
      </motion.div>

      {/* Empty State */}
      {reels.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 rounded-card border-2 border-dashed border-slate-200 bg-slate-50/50"
        >
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
            <span className="text-5xl">🎬</span>
          </div>
          <p className="text-2xl font-[var(--font-heading)] font-bold text-ink mb-3">
            Coming Soon
          </p>
          <p className="text-base text-slate text-center max-w-sm">
            Craft stories are being created. Check back soon to watch artisans share their creative journey!
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {reels.map((reel, index) => (
            <motion.article
              key={reel.id}
              variants={itemVariants}
              className="group rounded-[2rem] border border-slate-200/50 bg-white overflow-hidden hover:border-primary/30 transition-all duration-300 shadow-soft hover:shadow-card"
            >
              <div className="grid gap-6 lg:gap-8 lg:grid-cols-[minmax(0,560px)_1fr] p-6 lg:p-8">
                {/* Video Player Container */}
                <motion.div
                  className="rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50 aspect-video lg:aspect-auto"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <ReelPlayer reel={reel} onVisible={() => void onView(reel.id)} />
                </motion.div>

                {/* Reel Information */}
                <div className="flex flex-col justify-between py-2">
                  {/* Content */}
                  <div className="space-y-5">
                    {/* Artisan Profile */}
                    <div className="flex items-center gap-4">
                      <motion.div
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primaryDark flex items-center justify-center text-sm font-bold text-white shadow-card flex-shrink-0"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {(reel.artisan_name?.[0] || "A").toUpperCase()}
                      </motion.div>
                      <div className="flex-1">
                        <p className="font-[var(--font-heading)] font-bold text-lg text-ink">
                          {reel.artisan_name ?? "Artisan"}
                        </p>
                        <p className="text-sm text-slate font-medium">Content Creator</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 rounded-lg bg-primary/10 text-primary font-semibold text-sm hover:bg-primary hover:text-white transition-all duration-200"
                      >
                        Follow
                      </motion.button>
                    </div>

                    {/* Caption */}
                    {reel.caption && (
                      <div className="space-y-3">
                        <p className="text-base lg:text-lg leading-relaxed text-ink font-medium">
                          {reel.caption}
                        </p>
                      </div>
                    )}

                    {/* Engagement Stats */}
                    <div className="flex gap-8 text-sm">
                      <motion.div
                        className="flex items-center gap-2"
                        whileHover={{ scale: 1.1 }}
                      >
                        <span className="text-xl">❤️</span>
                        <span className="font-bold text-ink">{reel.likes.toLocaleString()}</span>
                        <span className="text-slate">Likes</span>
                      </motion.div>
                      <motion.div
                        className="flex items-center gap-2"
                        whileHover={{ scale: 1.1 }}
                      >
                        <span className="text-xl">👁️</span>
                        <span className="font-bold text-ink">{reel.views.toLocaleString()}</span>
                        <span className="text-slate">Views</span>
                      </motion.div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200/50">
                    <motion.button
                      type="button"
                      onClick={() => void onLike(reel.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 rounded-lg border-2 border-primary/50 text-primary font-bold py-3 hover:bg-primary hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <span className="text-xl">❤️</span>
                      <span>Like This</span>
                    </motion.button>

                    {reel.product_id ? (
                      <Link
                        href={`/product/${reel.product_id}`}
                        className="flex-1"
                      >
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full rounded-lg bg-gradient-to-r from-primary to-primaryDark text-white font-bold py-3 hover:shadow-cardHover transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <span>View Product</span>
                          <span className="text-xl">→</span>
                        </motion.button>
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      )}

      {/* Footer CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-[2rem] bg-accent-gradient pt-16 pb-20 px-8 text-white text-center mt-12"
      >
        <h3 className="text-3xl font-[var(--font-heading)] font-bold mb-4">
          Create Your Own Story
        </h3>
        <p className="text-lg text-white/95 mb-8 max-w-2xl mx-auto">
          Showcase your craft with short-form videos. Upload reels directly from the artisan mobile app.
        </p>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-accent font-bold rounded-lg hover:shadow-cardHover transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <span>Start Creating</span>
          <span>→</span>
        </Link>
      </motion.div>
    </section>
  );
}

