"use client";

import { useEffect, useRef, useState } from "react";

import { Reel } from "@/lib/api";

interface ReelPlayerProps {
  reel: Reel;
  onVisible?: () => void;
  showDeleteButton?: boolean;
  onDelete?: (reelId: string) => void;
}

export function ReelPlayer({ reel, onVisible, showDeleteButton = false, onDelete }: ReelPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const hasTrackedViewRef = useRef(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onDelete && window.confirm("Delete this reel? This action cannot be undone.")) {
      onDelete(reel.id);
    }
  };

  useEffect(() => {
    if (!wrapperRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        setInView(entries[0]?.isIntersecting ?? false);
      },
      {
        threshold: 0.65,
      },
    );

    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (inView) {
      void video.play().catch(() => null);
      return;
    }

    video.pause();
  }, [inView]);

  useEffect(() => {
    if (!inView || hasTrackedViewRef.current || !onVisible) {
      return;
    }
    hasTrackedViewRef.current = true;
    onVisible();
  }, [inView, onVisible]);

  return (
    <div
      ref={wrapperRef}
      className="relative h-[75vh] overflow-hidden rounded-[1.25rem] border border-slate-200 bg-black shadow-card"
    >
      <video
        ref={videoRef}
        src={reel.video_url}
        loop
        muted
        playsInline
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4 text-white">
        <p className="text-sm font-semibold">{reel.artisan_name ?? "Artisan"}</p>
        <p className="mt-1 line-clamp-2 text-sm text-white/90">
          {reel.caption ?? "No caption provided."}
        </p>
        {showDeleteButton && onDelete && (
          <button
            onClick={handleDelete}
            className="mt-3 px-4 py-2 bg-red-500/90 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
          >
            Delete Reel
          </button>
        )}
      </div>
    </div>
  );
}

