# Forever Water v2

A clean, editorial redesign of the Forever Water brand website. Built from scratch with a focus on minimalism, confident typography, and purposeful whitespace.

## Design Philosophy

- **No glass morphism** — solid surfaces, clean edges
- **No decorative gradients** — pure black, warm white, one accent
- **No cluttered effects** — single purposeful animations only
- **Editorial typography** — Playfair Display headlines, Geist body
- **Asymmetric grids** — magazine-quality layouts
- **Full-bleed media** — videos and images breathe without overlays

## Color Palette

| Token | Value | Role |
|-------|-------|------|
| Ink | `#000000` | Background |
| Paper | `#f5f5f0` | Text |
| Water | `#6B9B8A` | Single accent |
| Stone | `#1a1a1a` | Card surfaces |
| Ash | `#2a2a2a` | Subtle surfaces |
| Slate | `#888888` | Secondary text |

## Structure

```
├── Hero          Full-viewport video, bottom-aligned text
├── Collection    Asymmetric editorial product grid
├── ImageBreak    Full-bleed photograph moment
├── Approach      Three principles in 12-column grid
├── Contact       Two-column: info + minimal form
└── Footer        Simple, confident
```

## Tech Stack

- Next.js 16 (App Router, Static Export)
- Tailwind CSS v4
- TypeScript
- Intersection Observer for scroll reveals
- Zero animation libraries — pure CSS transitions

## Build

```bash
npm install
npm run build
```

Output is in `out/` as a fully static site.

## Assets

Copied from parent project:
- `/public/images/` — Product photography
- `/public/videos/` — Hero background video
