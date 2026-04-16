"use client";

import { useState } from "react";
import { Format, Theme, THEMES } from "../types";

export type AIProvider = "auto" | "openai" | "openrouter" | "huggingface" | "together" | "xai" | "gemini";

interface IdeaInputProps {
  onGenerate: (idea: string, apiKey?: string, provider?: AIProvider) => void;
  loading: boolean;
  format: Format;
  onFormatChange: (f: Format) => void;
  theme: Theme;
  onThemeChange: (t: Theme) => void;
}

const EXAMPLE_IDEAS = [
  {
    label: "Parents + forgetting curve",
    value: "Carousel for parents about why kids forget what they learn \u2014 explain the forgetting curve \u2014 end with how spaced repetition fixes it",
  },
  {
    label: "Science-backed mornings",
    value: "5 morning habits that boost productivity \u2014 backed by science \u2014 end with a simple challenge",
  },
  {
    label: "Diet mindset shift",
    value: "Why most people fail at dieting \u2014 the psychology behind it \u2014 and a mindset shift that actually works",
  },
];

export default function IdeaInput({
  onGenerate,
  loading,
  format,
  onFormatChange,
  theme,
  onThemeChange,
}: IdeaInputProps) {
  const [idea, setIdea] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [userApiKey, setUserApiKey] = useState("");
  const [provider, setProvider] = useState<AIProvider>("auto");

  const providerPlaceholder =
    provider === "openrouter"
      ? "sk-or-v1-..."
      : provider === "openai"
        ? "sk-..."
        : provider === "huggingface"
          ? "hf_..."
          : provider === "together"
            ? "key_..."
            : provider === "xai"
              ? "xai-..."
              : provider === "gemini"
                ? "AIza..."
                : "Paste a supported provider key";

  const providerHelpText =
    provider === "openrouter"
      ? "OpenRouter key for open-source model routing."
      : provider === "openai"
        ? "OpenAI key for GPT models."
        : provider === "huggingface"
          ? "Hugging Face token for the hosted multi-provider router."
          : provider === "together"
            ? "Together AI key for hosted open-source models like Qwen, Gemma, and GPT-OSS."
            : provider === "xai"
              ? "xAI key for Grok models. This is hosted, but not open-source."
              : provider === "gemini"
                ? "Google Gemini API key via the OpenAI-compatible endpoint."
                : "Auto-detects OpenAI, OpenRouter, Hugging Face, Together, xAI, or Gemini from the pasted key when possible.";

  const handleSubmit = () => {
    if (idea.trim().length >= 5)
      onGenerate(idea.trim(), userApiKey.trim() || undefined, provider);
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200/80 bg-white/90 px-5 py-5 shadow-sm sm:px-8 sm:py-8">
      <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
        {/* Left: Settings + Generate */}
        <div className="space-y-4">
          <div className="rounded-xl bg-slate-950 px-5 py-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50">Settings</p>

            <div className="mt-5">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-white/50">Format</label>
              <div className="grid gap-2">
                {(["1:1", "9:16"] as Format[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => onFormatChange(f)}
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                      format === f
                        ? "border-white/20 bg-white/16 text-white shadow-lg"
                        : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    <span className="block text-sm font-semibold">
                      {f === "1:1" ? "Post / Carousel" : "Story"}
                    </span>
                    <span className="mt-1 block text-xs text-white/55">
                      {f === "1:1" ? "Square deck for feed posts" : "Tall layout for vertical stories"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-white/50">Theme</label>
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onThemeChange(t)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition ${
                      theme.id === t.id
                        ? "border-white/20 bg-white/16 text-white"
                        : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    <span className={`h-7 w-7 rounded-lg bg-gradient-to-br ${t.colors.hook.bg}`} />
                    <span className="text-sm font-semibold">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || idea.trim().length < 5}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-950 to-orange-500 px-4 py-3.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Carousel"
            )}
          </button>
        </div>

        {/* Right: Idea + API key */}
        <div className="space-y-6">
          <div>
            <h3 className="font-display text-xl font-semibold text-slate-950">
              What&apos;s this carousel about?
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Describe the topic, audience, and angle. The more specific, the better the slides.
            </p>
          </div>

          <div>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              rows={7}
              placeholder='e.g. "Carousel for parents about why kids forget what they learn - explain the forgetting curve - end with how spaced repetition fixes it"'
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 resize-none focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {EXAMPLE_IDEAS.map((example) => (
                <button
                  key={example.label}
                  onClick={() => setIdea(example.value)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                >
                  {example.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm text-slate-600 transition hover:bg-slate-50/80"
            >
              <span className="flex items-center gap-2">
                <span className="font-medium">Use your own API key</span>
                <span className="text-xs text-slate-400">optional</span>
              </span>
              <span className={`text-xs transition-transform ${showKeyInput ? "rotate-180" : ""}`}>{"\u25BC"}</span>
            </button>

            {showKeyInput && (
              <div className="space-y-3 border-t border-slate-100 px-4 pb-4">
                <div className="pt-3">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Provider</label>
                  <div className="flex flex-wrap gap-2">
                    {([
                      { id: "auto" as AIProvider, label: "Auto (try all)" },
                      { id: "openai" as AIProvider, label: "OpenAI" },
                      { id: "openrouter" as AIProvider, label: "OpenRouter" },
                      { id: "huggingface" as AIProvider, label: "Hugging Face" },
                      { id: "together" as AIProvider, label: "Together" },
                      { id: "xai" as AIProvider, label: "xAI / Grok" },
                      { id: "gemini" as AIProvider, label: "Gemini" },
                    ]).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setProvider(p.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          provider === p.id
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">API Key</label>
                  <input
                    type="password"
                    value={userApiKey}
                    onChange={(e) => setUserApiKey(e.target.value)}
                    placeholder={providerPlaceholder}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <p className="text-xs text-slate-400 mt-1.5">{providerHelpText}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
