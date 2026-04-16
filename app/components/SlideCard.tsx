"use client";

import { forwardRef, useEffect, useState } from "react";
import { CarouselSlide, Theme, Format, THEMES } from "../types";

const typeIcons: Record<CarouselSlide["type"], string> = {
  hook: "✨",
  explanation: "📌",
  insight: "💡",
  cta: "🚀",
};

interface SlideCardProps {
  slide: CarouselSlide;
  theme?: Theme;
  format?: Format;
  totalSlides?: number;
}

const SlideCard = forwardRef<HTMLDivElement, SlideCardProps>(
  function SlideCard({ slide, theme, format = "1:1", totalSlides = 7 }, ref) {
    const activeTheme = theme ?? THEMES[0];
    const colors = activeTheme.colors[slide.type];
    const icon = typeIcons[slide.type];
    const [imageFailed, setImageFailed] = useState(false);

    const aspectClass = format === "9:16" ? "aspect-[9/16]" : "aspect-square";
    const hasImage = Boolean(slide.image_url) && !imageFailed;

    useEffect(() => {
      setImageFailed(false);
    }, [slide.image_url]);

    return (
      <div
        ref={ref}
        className={`bg-gradient-to-br ${colors.bg} ${aspectClass} w-full max-w-[420px] rounded-[32px] border border-white/15 flex flex-col justify-between text-white shadow-[0_42px_120px_-48px_rgba(15,23,42,0.95)] select-none overflow-hidden relative`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.24),transparent_38%)] pointer-events-none" />

        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={`dots-${slide.slideNumber}`} x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="15" cy="15" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#dots-${slide.slideNumber})`} />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-between h-full p-8 sm:p-9">
          {/* Top: slide counter + type badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium opacity-70">
              {slide.slideNumber} / {totalSlides}
            </span>
            <span className={`rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${colors.accent}`}>
              {slide.type}
            </span>
          </div>

          <div className={`flex-1 ${format === "9:16" ? "my-8" : "my-4"}`}>
            <div className={`relative h-full min-h-[240px] overflow-hidden rounded-[28px] border border-white/15 ${format === "9:16" ? "aspect-[4/5]" : "aspect-[4/3]"}`}>
              {hasImage ? (
                <>
                  <img
                    src={slide.image_url}
                    alt={slide.visual_hint}
                    className="h-full w-full object-cover"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    loading="eager"
                    draggable={false}
                    onError={() => setImageFailed(true)}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.06),rgba(15,23,42,0.42))]" />
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 bg-white/8 px-6 text-center">
                  <span className={format === "9:16" ? "text-7xl" : "text-5xl"}>{icon}</span>
                  <div className="max-w-[85%] rounded-xl border border-dashed border-white/30 px-4 py-3 text-center">
                    <p className={`text-xs italic ${colors.accent}`}>
                      🎨 {slide.visual_hint}
                    </p>
                  </div>
                </div>
              )}

              <div className="absolute left-4 top-4 inline-flex rounded-full bg-slate-950/45 px-3 py-1.5 text-lg backdrop-blur-sm">
                {icon}
              </div>
              <div className="absolute inset-x-4 bottom-4 rounded-[20px] border border-white/15 bg-slate-950/35 px-4 py-3 backdrop-blur-md">
                <p className={`text-[11px] font-medium uppercase tracking-[0.22em] ${colors.accent}`}>
                  Visual Direction
                </p>
                <p className="mt-2 text-sm leading-5 text-white/88">
                  {slide.visual_hint}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom: title + body */}
          <div className={`space-y-2 text-center ${format === "9:16" ? "pb-4" : ""}`}>
            <h2 className={`font-display font-semibold leading-tight ${format === "9:16" ? "text-3xl" : "text-[2rem]"}`}>
              {slide.title}
            </h2>
            <p className={`leading-relaxed opacity-85 ${format === "9:16" ? "text-base" : "text-sm"}`}>
              {slide.body}
            </p>
          </div>
        </div>
      </div>
    );
  }
);

export default SlideCard;
