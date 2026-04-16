import { toPng } from "html-to-image";
import { Format } from "./types";

/* 1 × 1 transparent PNG used when an image can't be fetched (CORS / 500) */
const TRANSPARENT_PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIHWNgAAIABQABNjN9GQAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAAA0lEQVQI12NgYPgPAAEDAQA8bk8qAAAAAElFTkSuQmCC";

function getDimensions(format: Format) {
  return format === "9:16"
    ? { width: 1080, height: 1920 }
    : { width: 1080, height: 1080 };
}

/**
 * Replace every <img> src with an inline data-URI so toPng never
 * hits a cross-origin fetch.  Falls back to a transparent pixel on error.
 */
async function inlineImages(node: HTMLElement) {
  const images = Array.from(node.querySelectorAll("img"));

  await Promise.all(
    images.map(async (img) => {
      if (!img.src || img.src.startsWith("data:")) return;
      try {
        const res = await fetch(img.src);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        img.src = dataUrl;
      } catch {
        img.src = TRANSPARENT_PIXEL;
      }
    })
  );
}

export async function exportSlideAsImage(
  node: HTMLElement,
  filename: string,
  format: Format = "1:1",
  { skipInlineImages = false }: { skipInlineImages?: boolean } = {}
): Promise<void> {
  const { width, height } = getDimensions(format);
  if (!skipInlineImages) await inlineImages(node);
  const dataUrl = await toPng(node, {
    width,
    height,
    pixelRatio: 2,
    cacheBust: true,
  });

  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
