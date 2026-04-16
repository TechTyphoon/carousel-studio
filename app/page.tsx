"use client";

import { useState } from "react";
import IdeaInput from "./components/IdeaInput";
import type { AIProvider } from "./components/IdeaInput";
import CarouselPreview from "./components/CarouselPreview";
import { CarouselSlide, Format, Theme, THEMES } from "./types";

export default function Home() {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [originalIdea, setOriginalIdea] = useState("");
  const [format, setFormat] = useState<Format>("1:1");
  const [theme, setTheme] = useState<Theme>(THEMES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);

  const handleGenerate = async (idea: string, apiKey?: string, provider?: AIProvider) => {
    setLoading(true);
    setError(null);
    setSource(null);
    setOriginalIdea(idea);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, apiKey, provider }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Generation failed. Please try again.");
        return;
      }

      setSlides(data.slides);
      setSource(data.source || null);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const hasSlides = slides.length > 0;
  const sourceLabel =
    source === "fallback"
      ? "Template fallback"
      : source === "pollinations (public)"
        ? "AI · public fallback"
        : source
          ? `AI · ${source}`
          : "Ready for generation";

  return (
    <div className="studio-shell min-h-screen overflow-hidden">
      <header className="border-b border-white/60 bg-white/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 p-2.5 text-lg text-white shadow-lg shadow-orange-500/25">
              ✦
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
                Carousel Studio
              </h1>
              <p className="text-xs text-slate-500">Idea → structure → polish → export</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
              source === "fallback"
                ? "bg-amber-100 text-amber-700"
                : source
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
            }`}>
              {sourceLabel}
            </span>
            {hasSlides && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {slides.length} slides
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <section className="reveal-up">
          <IdeaInput
            onGenerate={handleGenerate}
            loading={loading}
            format={format}
            onFormatChange={setFormat}
            theme={theme}
            onThemeChange={setTheme}
          />
        </section>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <section>
          <CarouselPreview
            slides={slides}
            originalIdea={originalIdea}
            onSlidesChange={setSlides}
            theme={theme}
            format={format}
          />
        </section>
      </main>

      <footer className="border-t border-white/60 bg-white/45 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>Carousel Studio — Built for Cuemath</span>
          <span>Idea → structure → polish → export</span>
        </div>
      </footer>
    </div>
  );
}
