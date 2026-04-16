import { NextRequest, NextResponse } from "next/server";
import { CarouselSlide } from "../../types";
import { attachPollinationsImages } from "../../slideVisual";

type AIProvider = "auto" | "openai" | "openrouter" | "huggingface" | "together" | "xai" | "gemini";
type ProviderKind = Exclude<AIProvider, "auto">;
type Provider = { name: string; url: string; key: string; model: string };

const OPENROUTER_MODELS = [
  "openai/gpt-oss-20b:free",
  "google/gemma-4-26b-a4b-it:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
  "z-ai/glm-4.5-air:free",
  "arcee-ai/trinity-large-preview:free",
  "google/gemma-4-31b-it:free",
  "openai/gpt-oss-120b:free",
];

const TOGETHER_MODELS = [
  "openai/gpt-oss-20b",
  "google/gemma-3n-E4B-it",
  "Qwen/Qwen3.5-9B",
];

const HUGGINGFACE_MODELS = [
  "openai/gpt-oss-20b:cheapest",
  "openai/gpt-oss-120b:fastest",
  "deepseek-ai/DeepSeek-R1:fastest",
];

const XAI_MODELS = ["grok-4"];
const GEMINI_MODELS = ["gemini-2.0-flash"];
const POLLINATIONS_MODELS = ["openai-fast", "openai"];

const SYSTEM_PROMPT = `You are an expert social media content strategist. Given a raw, messy idea from a user, generate a structured Instagram carousel with exactly 7 slides.

RULES:
- Slide 1: Hook (attention-grabbing, make people stop scrolling)
- Slides 2-4: Explanation (break the concept down simply, one idea per slide)
- Slides 5-6: Insight/takeaway (the "aha" moment, why this matters)
- Slide 7: CTA (call to action — save, share, follow)

Each slide MUST have:
- title: short, punchy (2-5 words)
- body: max 20 words, clear and engaging
- visual_hint: describe the ideal image/illustration for this slide

Return ONLY a valid JSON array. No markdown, no explanation. Example format:
[{"slideNumber":1,"type":"hook","title":"...","body":"...","visual_hint":"..."},...]

Types must be exactly: "hook", "explanation", "insight", or "cta".`;

function trimWords(text: string, maxWords = 20) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length > maxWords ? `${words.slice(0, maxWords).join(" ")}…` : text.trim();
}

function trimText(text: string, maxLength: number) {
  return text.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function fallbackGenerate(idea: string): CarouselSlide[] {
  const cleaned = idea.trim().replace(/\s+/g, " ");
  const sentences = cleaned.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);

  const topic = trimWords(sentences[0] || cleaned, 10);

  return [
    {
      slideNumber: 1, type: "hook",
      title: "Did you know?",
      body: trimWords(sentences[0] || topic),
      visual_hint: "Bold text on vibrant background with eye-catching icon",
    },
    {
      slideNumber: 2, type: "explanation",
      title: "Here's the thing",
      body: trimWords(sentences[1] || `The core idea behind ${topic}`),
      visual_hint: "Simple diagram or numbered list illustration",
    },
    {
      slideNumber: 3, type: "explanation",
      title: "Breaking it down",
      body: trimWords(sentences[2] || "Let's simplify this into something you can use right now"),
      visual_hint: "Comparison graphic or side-by-side visual",
    },
    {
      slideNumber: 4, type: "explanation",
      title: "One more thing",
      body: trimWords(sentences[3] || "Here's a detail most people overlook"),
      visual_hint: "Minimal icon-based infographic",
    },
    {
      slideNumber: 5, type: "insight",
      title: "Key Takeaway",
      body: trimWords(sentences[4] || `The biggest insight about ${topic}`),
      visual_hint: "Lightbulb or brain illustration with highlight color",
    },
    {
      slideNumber: 6, type: "insight",
      title: "Why It Matters",
      body: trimWords(sentences[5] || "This changes how you think about it going forward"),
      visual_hint: "Person reflecting or growth chart visual",
    },
    {
      slideNumber: 7, type: "cta",
      title: "Take Action",
      body: "Save this post and share it with someone who needs to hear this!",
      visual_hint: "Arrow pointing forward with brand colors and share icons",
    },
  ];
}

function parseSlidesFromContent(content: string, idea: string): CarouselSlide[] | null {
  let jsonStr = content;

  jsonStr = jsonStr.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

  const fenceMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) {
    jsonStr = fenceMatch[1].trim();
  }

  if (!jsonStr.startsWith("[")) {
    const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      jsonStr = arrayMatch[0];
    }
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    return null;
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return null;
  }

  const fallbackSlides = fallbackGenerate(idea);

  const normalized = fallbackSlides.map((fallbackSlide, index) => {
    const candidate = parsed[index];
    const candidateRecord = candidate && typeof candidate === "object" ? candidate as Record<string, unknown> : null;

    return {
      slideNumber: index + 1,
      type: fallbackSlide.type,
      title: trimText(String(candidateRecord?.title || fallbackSlide.title), 50),
      body: trimWords(String(candidateRecord?.body || fallbackSlide.body), 20),
      visual_hint: trimText(String(candidateRecord?.visual_hint || fallbackSlide.visual_hint), 180),
    } satisfies CarouselSlide;
  });

  return attachPollinationsImages(normalized, idea);
}

function inferProviderFromKey(apiKey: string): ProviderKind | null {
  if (apiKey.startsWith("sk-or-")) return "openrouter";
  if (apiKey.startsWith("hf_")) return "huggingface";
  if (apiKey.startsWith("xai-")) return "xai";
  if (apiKey.startsWith("AIza")) return "gemini";
  if (apiKey.startsWith("key_")) return "together";
  if (apiKey.startsWith("sk-")) return "openai";
  return null;
}

function pushProviderChain(
  chain: Provider[],
  provider: ProviderKind,
  apiKey: string,
  sourceLabel: string,
) {
  if (!apiKey) return;

  if (provider === "openai") {
    chain.push({
      name: `openai (${sourceLabel})`,
      url: "https://api.openai.com/v1/chat/completions",
      key: apiKey,
      model: "gpt-4o-mini",
    });
    return;
  }

  if (provider === "openrouter") {
    for (const model of OPENROUTER_MODELS) {
      chain.push({
        name: `openrouter:${model.split("/")[0]} (${sourceLabel})`,
        url: "https://openrouter.ai/api/v1/chat/completions",
        key: apiKey,
        model,
      });
    }
    return;
  }

  if (provider === "huggingface") {
    for (const model of HUGGINGFACE_MODELS) {
      chain.push({
        name: `huggingface:${model.split(":")[0].split("/")[0]} (${sourceLabel})`,
        url: "https://router.huggingface.co/v1/chat/completions",
        key: apiKey,
        model,
      });
    }
    return;
  }

  if (provider === "together") {
    for (const model of TOGETHER_MODELS) {
      chain.push({
        name: `together:${model.split("/")[0]} (${sourceLabel})`,
        url: "https://api.together.xyz/v1/chat/completions",
        key: apiKey,
        model,
      });
    }
    return;
  }

  if (provider === "xai") {
    for (const model of XAI_MODELS) {
      chain.push({
        name: `xai:${model} (${sourceLabel})`,
        url: "https://api.x.ai/v1/chat/completions",
        key: apiKey,
        model,
      });
    }
    return;
  }

  for (const model of GEMINI_MODELS) {
    chain.push({
      name: `gemini:${model} (${sourceLabel})`,
      url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      key: apiKey,
      model,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { idea, apiKey: userApiKey, provider } = await request.json();

    if (!idea || typeof idea !== "string" || idea.trim().length < 5) {
      return NextResponse.json(
        { error: "Please provide an idea with at least 5 characters." },
        { status: 400 }
      );
    }

    const trimmedIdea = idea.trim();
    const serverOpenAIKey = process.env.OPENAI_API_KEY;
    const serverOpenRouterKey = process.env.OPENROUTER_API_KEY;
    const serverHuggingFaceKey = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;
    const serverTogetherKey = process.env.TOGETHER_API_KEY;
    const serverXaiKey = process.env.XAI_API_KEY;
    const serverGeminiKey = process.env.GEMINI_API_KEY;

    const chain: Provider[] = [];

    const safeProvider = (typeof provider === "string" ? provider : "auto") as AIProvider;
    const safeUserKey = typeof userApiKey === "string" ? userApiKey.trim() : "";

    const inferredUserProvider = safeUserKey ? inferProviderFromKey(safeUserKey) : null;
    const selectedUserProvider = safeProvider === "auto" ? inferredUserProvider : safeProvider;

    if (safeUserKey && selectedUserProvider) {
      pushProviderChain(chain, selectedUserProvider, safeUserKey, "your key");
    }

    const serverProviders: Array<{ kind: ProviderKind; key: string | undefined }> = [
      { kind: "openai", key: serverOpenAIKey },
      { kind: "openrouter", key: serverOpenRouterKey },
      { kind: "huggingface", key: serverHuggingFaceKey },
      { kind: "together", key: serverTogetherKey },
      { kind: "xai", key: serverXaiKey },
      { kind: "gemini", key: serverGeminiKey },
    ];

    for (const serverProvider of serverProviders) {
      if (!serverProvider.key) continue;
      if (safeProvider !== "auto" && safeProvider !== serverProvider.kind) continue;
      pushProviderChain(chain, serverProvider.kind, serverProvider.key, "server");
    }

    // Try each provider in order (stop at first success)
    for (const prov of chain) {
      if (!prov.key) continue;

      try {
        const result = await callProvider(prov.url, prov.key, prov.model, trimmedIdea);
        if (result) {
          return NextResponse.json({ slides: result, source: prov.name });
        }
      } catch (e) {
        console.error(`Provider ${prov.name} failed:`, e);
      }
    }

    const publicResult = await callPollinations(trimmedIdea);
    if (publicResult) {
      return NextResponse.json({ slides: publicResult, source: "pollinations (public)" });
    }

    const slides = attachPollinationsImages(fallbackGenerate(trimmedIdea), trimmedIdea);
    return NextResponse.json({ slides, source: "fallback" });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

async function callProvider(
  url: string,
  apiKey: string,
  model: string,
  idea: string,
): Promise<CarouselSlide[] | null> {
  const isOpenRouter = url.includes("openrouter.ai");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  if (isOpenRouter) {
    headers["HTTP-Referer"] = "https://carousel-studio-taupe.vercel.app";
    headers["X-Title"] = "Carousel Studio";
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    signal: AbortSignal.timeout(15000), // 15s per provider attempt
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Create a carousel about: ${idea}` },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    console.error(`${model} returned ${response.status}`);
    return null;
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) return null;

  return parseSlidesFromContent(content, idea);
}

async function callPollinations(idea: string): Promise<CarouselSlide[] | null> {
  for (const model of POLLINATIONS_MODELS) {
    try {
      const response = await fetch("https://text.pollinations.ai/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(20000),
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `Create a carousel about: ${idea}` },
          ],
          temperature: 0.8,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        console.error(`Pollinations ${model} returned ${response.status}`);
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      if (!content) {
        continue;
      }

      const slides = parseSlidesFromContent(content, idea);
      if (slides) {
        return slides;
      }
    } catch (error) {
      console.error(`Pollinations ${model} failed:`, error);
    }
  }

  return null;
}
