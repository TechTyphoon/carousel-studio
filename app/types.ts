export interface CarouselSlide {
  slideNumber: number;
  type: "hook" | "explanation" | "insight" | "cta";
  title: string;
  body: string;
  visual_hint: string;
  image_url?: string;
}

export type Format = "1:1" | "9:16";

export interface ThemeColors {
  hook: { bg: string; accent: string };
  explanation: { bg: string; accent: string };
  insight: { bg: string; accent: string };
  cta: { bg: string; accent: string };
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
}

export const THEMES: Theme[] = [
  {
    id: "vibrant",
    name: "Vibrant",
    colors: {
      hook: { bg: "from-purple-600 to-indigo-700", accent: "text-purple-200" },
      explanation: { bg: "from-slate-800 to-slate-900", accent: "text-slate-300" },
      insight: { bg: "from-emerald-600 to-teal-700", accent: "text-emerald-200" },
      cta: { bg: "from-orange-500 to-rose-600", accent: "text-orange-200" },
    },
  },
  {
    id: "cuemath",
    name: "Cuemath",
    colors: {
      hook: { bg: "from-[#f97316] to-[#ea580c]", accent: "text-orange-100" },
      explanation: { bg: "from-[#1e293b] to-[#0f172a]", accent: "text-slate-300" },
      insight: { bg: "from-[#f97316] to-[#dc2626]", accent: "text-orange-100" },
      cta: { bg: "from-[#ea580c] to-[#c2410c]", accent: "text-orange-100" },
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    colors: {
      hook: { bg: "from-cyan-500 to-blue-600", accent: "text-cyan-100" },
      explanation: { bg: "from-blue-800 to-indigo-900", accent: "text-blue-200" },
      insight: { bg: "from-teal-500 to-cyan-600", accent: "text-teal-100" },
      cta: { bg: "from-blue-500 to-violet-600", accent: "text-blue-100" },
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    colors: {
      hook: { bg: "from-rose-500 to-pink-600", accent: "text-rose-100" },
      explanation: { bg: "from-stone-800 to-stone-900", accent: "text-stone-300" },
      insight: { bg: "from-amber-500 to-orange-600", accent: "text-amber-100" },
      cta: { bg: "from-pink-500 to-rose-600", accent: "text-pink-100" },
    },
  },
  {
    id: "minimal",
    name: "Minimal",
    colors: {
      hook: { bg: "from-zinc-900 to-zinc-800", accent: "text-zinc-300" },
      explanation: { bg: "from-zinc-800 to-zinc-700", accent: "text-zinc-300" },
      insight: { bg: "from-zinc-900 to-zinc-800", accent: "text-zinc-300" },
      cta: { bg: "from-zinc-700 to-zinc-600", accent: "text-zinc-200" },
    },
  },
  {
    id: "forest",
    name: "Forest",
    colors: {
      hook: { bg: "from-green-700 to-emerald-800", accent: "text-green-200" },
      explanation: { bg: "from-stone-800 to-stone-900", accent: "text-stone-300" },
      insight: { bg: "from-lime-600 to-green-700", accent: "text-lime-100" },
      cta: { bg: "from-emerald-600 to-green-700", accent: "text-emerald-100" },
    },
  },
];
