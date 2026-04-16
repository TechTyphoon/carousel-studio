# Carousel Studio

A social media creative studio that turns a rough idea into a polished, ready-to-post carousel.

Type something like *"Carousel for parents about why kids forget what they learn — explain the forgetting curve — end with how spaced repetition fixes it"* and get back a multi-slide carousel ready to download.

## Features

- **Idea to visual** — describe a topic in plain language, get a structured carousel with hook, explanation, insight, and CTA slides
- **Formats** — Instagram Post (1:1) and Story (9:16)
- **AI image generation** — each slide gets a matching AI-generated visual via Pollinations
- **6 themes** — Vibrant, Cuemath, Ocean, Sunset, Minimal, Forest
- **Editable** — click any slide to tweak copy, then regenerate or save
- **Export** — download individual slides or the entire deck as PNG

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- React 19, TypeScript 5, Tailwind CSS 4
- Pollinations API (text + image generation, no key required)
- OpenRouter / OpenAI / HuggingFace / Together / xAI / Gemini (optional, via BYOK)
- html-to-image for PNG export

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.example` to `.env` and fill in any keys you want to use. All are optional — the app falls back to Pollinations (free, no key needed).

```bash
cp .env.example .env
```

## Deploy

```bash
npm run build
vercel --prod
```
