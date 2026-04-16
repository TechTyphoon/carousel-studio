import { CarouselSlide } from "./types";

const slideTemplates: Record<
  CarouselSlide["type"],
  { titles: string[]; bodies: string[]; hints: string[] }
> = {
  hook: {
    titles: [
      "Wait, what?!",
      "Did you know?",
      "Stop scrolling!",
      "Here's something wild",
      "Most people miss this",
    ],
    bodies: [
      "This one thing could change how you think about everything",
      "What if everything you believed about this was wrong?",
      "The truth might surprise you — keep reading",
      "You won't believe how simple the answer really is",
      "This changes everything once you see it",
    ],
    hints: [
      "Bold text on vibrant background with eye-catching icon",
      "Dramatic close-up with overlay text",
      "Neon highlight on dark background",
      "Question mark or exclamation visual with bold type",
      "Split screen: myth vs reality",
    ],
  },
  explanation: {
    titles: [
      "Here's how it works",
      "Let's break it down",
      "The key detail",
      "What this means",
      "Simply put",
    ],
    bodies: [
      "The core mechanism is surprisingly straightforward once explained",
      "Breaking this into steps makes it easy to follow and remember",
      "Think of it like a simple chain reaction with clear causes",
      "Each piece connects to the next in a logical way",
      "Once you see the pattern, it all clicks into place",
    ],
    hints: [
      "Simple diagram or numbered list illustration",
      "Comparison graphic or side-by-side visual",
      "Minimal icon-based infographic",
      "Flowchart or step-by-step visual",
      "Before and after comparison graphic",
    ],
  },
  insight: {
    titles: [
      "Key Takeaway",
      "Why It Matters",
      "The bigger picture",
      "Here's the real insight",
      "What to remember",
    ],
    bodies: [
      "This is the one thing worth remembering from everything above",
      "Understanding this gives you an edge most people don't have",
      "This single shift in thinking can lead to real change",
      "The impact is bigger than it looks on the surface",
      "Once you internalize this, your approach changes forever",
    ],
    hints: [
      "Lightbulb or brain illustration with highlight color",
      "Person reflecting or growth chart visual",
      "Glowing key or unlock icon",
      "Mountain peak or achievement visual",
      "Magnifying glass revealing hidden detail",
    ],
  },
  cta: {
    titles: [
      "Ready to Start?",
      "Your turn!",
      "Take action now",
      "Don't just scroll past",
      "Let's make it happen",
    ],
    bodies: [
      "Save this post and share it with someone who needs to hear this!",
      "Follow for more insights like this — drop a comment below!",
      "Tag someone who should see this and hit that save button!",
      "Share this with your community and start the conversation!",
      "Bookmark this, come back to it, and take the first step today!",
    ],
    hints: [
      "Arrow or hand pointing forward, brand colors, follow/share icons",
      "Bright CTA button visual with social media icons",
      "Finger tapping share button illustration",
      "Megaphone or loudspeaker with action words",
      "Rocket launch or start line visual",
    ],
  },
};

function pickRandom(arr: string[], exclude?: string): string {
  const filtered = arr.filter((item) => item !== exclude);
  const pool = filtered.length > 0 ? filtered : arr;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function regenerateSlide(
  slide: CarouselSlide
): CarouselSlide {
  const templates = slideTemplates[slide.type];

  return {
    ...slide,
    title: pickRandom(templates.titles, slide.title),
    body: pickRandom(templates.bodies, slide.body),
    visual_hint: pickRandom(templates.hints, slide.visual_hint),
  };
}
