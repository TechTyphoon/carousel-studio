"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { CarouselSlide, Theme, Format } from "../types";
import { regenerateSlide } from "../regenerateSlide";
import { exportSlideAsImage } from "../exportSlide";
import { attachPollinationsImages } from "../slideVisual";
import SlideCard from "./SlideCard";
import SlideEditor from "./SlideEditor";

interface CarouselPreviewProps {
  slides: CarouselSlide[];
  originalIdea: string;
  onSlidesChange: (slides: CarouselSlide[]) => void;
  theme: Theme;
  format: Format;
}

export default function CarouselPreview({
  slides,
  originalIdea,
  onSlidesChange,
  theme,
  format,
}: CarouselPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [exportMode, setExportMode] = useState<"current" | "all" | null>(null);

  const visibleSlideRef = useRef<HTMLDivElement | null>(null);

  const goTo = (index: number) => {
    if (index >= 0 && index < slides.length) setCurrentIndex(index);
  };

  const handleSave = (updated: CarouselSlide) => {
    const next = attachPollinationsImages(
      slides.map((s, i) => (i === editingIndex ? updated : s)),
      originalIdea
    );
    onSlidesChange(next);
    setEditingIndex(null);
  };

  const handleRegenerate = () => {
    if (editingIndex === null) return;
    const regenerated = regenerateSlide(slides[editingIndex]);
    const next = attachPollinationsImages(
      slides.map((s, i) => (i === editingIndex ? regenerated : s)),
      originalIdea
    );
    onSlidesChange(next);
    setEditingIndex(null);
  };

  const handleDownloadCurrent = async () => {
    const node = visibleSlideRef.current;
    if (!node) return;
    setExportMode("current");
    try {
      await exportSlideAsImage(node, `carousel-slide-${currentIndex + 1}.png`, format);
    } catch {
      alert("Export failed. Please try again.");
    } finally {
      setExportMode(null);
    }
  };

  const handleDownloadAll = async () => {
    setExportMode("all");
    const savedIndex = currentIndex;
    const savedSlides = slides;
    let exported = 0;
    try {
      // Strip image URLs so SlideCard never renders <img> during export
      const strippedSlides = slides.map((s) => ({ ...s, image_url: undefined }));
      onSlidesChange(strippedSlides);

      for (let i = 0; i < strippedSlides.length; i++) {
        flushSync(() => setCurrentIndex(i));
        // Let React paint the slide without images
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => setTimeout(resolve, 100))
        );
        const node = visibleSlideRef.current;
        if (!node) continue;
        try {
          await exportSlideAsImage(node, `carousel-slide-${i + 1}.png`, format, { skipInlineImages: true });
          exported++;
        } catch {
          // Skip slides whose capture fails
        }
        // Small delay between downloads so browser doesn't block them
        await new Promise((r) => setTimeout(r, 300));
      }
      if (exported === 0) throw new Error("No slides exported");
    } catch {
      alert("Export failed. Please try again.");
    } finally {
      // Restore original slides with images
      onSlidesChange(savedSlides);
      setCurrentIndex(savedIndex);
      setExportMode(null);
    }
  };

  const exporting = exportMode !== null;

  if (slides.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-200 px-6 py-20 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-400">
          ✦
        </div>
        <p className="mt-4 text-sm font-medium text-slate-600">
          Your carousel will appear here
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Describe an idea above and hit Generate
        </p>
      </div>
    );
  }

  const totalSlides = slides.length;
  const currentSlide = slides[currentIndex];

  return (
    <div className="space-y-4">
      {/* Main preview area */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-slate-900">Preview</h3>
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
              {currentIndex + 1} / {totalSlides}
            </span>
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">{format === "1:1" ? "1:1" : "9:16"}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditingIndex(currentIndex)}
              className="rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800"
            >
              Edit slide
            </button>
            <button
              onClick={handleDownloadCurrent}
              disabled={exporting}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {exporting ? "Exporting…" : "Download"}
            </button>
            <button
              onClick={handleDownloadAll}
              disabled={exporting}
              className="rounded-lg bg-gradient-to-r from-slate-950 to-orange-500 px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {exporting ? "Exporting…" : "Download All"}
            </button>
          </div>
        </div>

        <div className="relative mt-4 rounded-xl bg-slate-50 px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto flex w-full max-w-[460px] justify-center">
            <SlideCard
              ref={visibleSlideRef}
              slide={currentSlide}
              theme={theme}
              format={format}
              totalSlides={totalSlides}
            />
          </div>
          {exporting && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70 backdrop-blur-sm">
              <span className="rounded-lg bg-slate-950 px-3 py-1.5 text-sm font-medium text-white">
                Exporting…
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => goTo(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Prev
          </button>
          <div className="flex items-center gap-1.5">
            {slides.map((slide, i) => (
              <button
                key={slide.slideNumber}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentIndex
                    ? "w-6 bg-slate-950"
                    : "w-2 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => goTo(currentIndex + 1)}
            disabled={currentIndex === slides.length - 1}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Slide grid */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">All Slides</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {slides.map((slide, i) => {
            const isActive = i === currentIndex;

            return (
              <button
                key={slide.slideNumber}
                onClick={() => goTo(i)}
                className={`rounded-xl border px-3 py-3 text-left transition ${
                  isActive
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className={`flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest ${
                  isActive ? "text-white/45" : "text-slate-400"
                }`}>
                  <span>{String(slide.slideNumber).padStart(2, "0")}</span>
                  <span>{slide.type}</span>
                </div>
                <p className="mt-1.5 text-sm font-medium leading-tight">{slide.title}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor modal */}
      {editingIndex !== null && (
        <SlideEditor
          slide={slides[editingIndex]}
          onSave={handleSave}
          onRegenerate={handleRegenerate}
          onClose={() => setEditingIndex(null)}
        />
      )}
    </div>
  );
}
