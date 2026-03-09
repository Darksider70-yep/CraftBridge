"use client";

import { useEffect, useRef, useState } from "react";

import { Reel } from "@/lib/api";

interface ReelPlayerProps {
  reel: Reel;
  onVisible?: () => void;
}

export function ReelPlayer({ reel, onVisible }: ReelPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const hasTrackedViewRef = useRef(false);

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
      </div>
    </div>
  );
}

