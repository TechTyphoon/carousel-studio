"use client";

import { useState } from "react";
import { CarouselSlide } from "../types";

interface SlideEditorProps {
  slide: CarouselSlide;
  onSave: (updated: CarouselSlide) => void;
  onRegenerate: () => void;
  onClose: () => void;
}

export default function SlideEditor({
  slide,
  onSave,
  onRegenerate,
  onClose,
}: SlideEditorProps) {
  const [title, setTitle] = useState(slide.title);
  const [body, setBody] = useState(slide.body);
  const [visualHint, setVisualHint] = useState(slide.visual_hint);

  const handleSave = () => {
    onSave({ ...slide, title, body, visual_hint: visualHint });
  };

  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,250,245,0.9))] shadow-[0_40px_120px_-55px_rgba(15,23,42,0.9)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Slide Editor</p>
            <h3 className="font-display mt-2 text-2xl font-semibold text-slate-950">Edit Slide {slide.slideNumber}</h3>
            <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              {slide.type}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-2 text-xl leading-none text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
          >
            ×
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-4 px-6 py-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-[18px] border border-slate-200 bg-white/90 px-3 py-3 text-sm text-slate-900 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.45)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Slide title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Body
              <span className={`ml-2 text-xs ${wordCount > 20 ? "text-red-500" : "text-slate-400"}`}>
                {wordCount}/20 words
              </span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-[18px] border border-slate-200 bg-white/90 px-3 py-3 text-sm text-slate-900 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.45)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Slide body text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Visual Hint
            </label>
            <input
              type="text"
              value={visualHint}
              onChange={(e) => setVisualHint(e.target.value)}
              className="w-full rounded-[18px] border border-slate-200 bg-white/90 px-3 py-3 text-sm text-slate-900 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.45)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Describe the visual"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 border-t border-slate-100 bg-white/60 px-6 py-5 backdrop-blur-sm">
          <button
            onClick={onRegenerate}
            className="rounded-[18px] bg-amber-100 px-4 py-2.5 text-sm font-medium text-amber-700 transition hover:bg-amber-200"
          >
            ✦ Regenerate
          </button>
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="rounded-[18px] bg-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-[18px] bg-gradient-to-r from-slate-950 to-orange-500 px-4 py-2.5 text-sm font-medium text-white shadow-[0_22px_50px_-34px_rgba(249,115,22,0.85)] transition hover:-translate-y-0.5"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
