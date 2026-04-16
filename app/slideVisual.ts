import { CarouselSlide } from "./types";

function normalizeText(input: string, maxLength: number) {
  return input
    .trim()
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/[^\w\s.,!?'-]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, maxLength);
}

export function buildSlideImagePrompt(slide: CarouselSlide, idea: string) {
  const topic = normalizeText(idea, 70);
  const title = normalizeText(slide.title, 48);
  const visualHint = normalizeText(slide.visual_hint, 100);

  return [
    "Editorial social media illustration.",
    `Topic: ${topic || "Learning and parenting"}.`,
    `Slide: ${slide.type}.`,
    `Title: ${title}.`,
    `Visual: ${visualHint}.`,
    "Bright modern composition, no text, no watermark.",
  ].join(" ");
}

export function buildPollinationsImageUrl(prompt: string) {
  const params = new URLSearchParams({
    model: "flux",
    width: "1200",
    height: "1200",
    enhance: "true",
    nologo: "true",
    safe: "true",
  });

  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params.toString()}`;
}

export function attachPollinationsImages(slides: CarouselSlide[], idea: string) {
  return slides.map((slide) => ({
    ...slide,
    image_url: buildPollinationsImageUrl(buildSlideImagePrompt(slide, idea)),
  }));
}