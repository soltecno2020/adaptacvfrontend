---
name: Obsidian Precision
colors:
  surface: '#111318'
  surface-dim: '#111318'
  surface-bright: '#37393e'
  surface-container-lowest: '#0c0e12'
  surface-container-low: '#1a1c20'
  surface-container: '#1e2024'
  surface-container-high: '#282a2e'
  surface-container-highest: '#333539'
  on-surface: '#e2e2e8'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#e2e2e8'
  inverse-on-surface: '#2f3035'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#7bd0ff'
  on-secondary: '#00354a'
  secondary-container: '#00a6e0'
  on-secondary-container: '#00374d'
  tertiary: '#ffb783'
  on-tertiary: '#4f2500'
  tertiary-container: '#d97721'
  on-tertiary-container: '#452000'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#c4e7ff'
  secondary-fixed-dim: '#7bd0ff'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#004c69'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#ffb783'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#703700'
  background: '#111318'
  on-background: '#e2e2e8'
  surface-variant: '#333539'
typography:
  display-hero:
    fontFamily: Geist
    fontSize: 56px
    fontWeight: '600'
    lineHeight: 64px
    letterSpacing: -0.035em
  display-hero-mobile:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-xl:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: -0.005em
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  mono-code:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: -0.01em
  mono-label:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system targets an elite tier of senior engineering leadership, systems architects, and technical founders. The visual narrative balances clinical precision with quiet digital luxury, drawing aesthetic cues from high-performance developer environments such as Linear, Raycast, and Vercel.

The design movement is **Technical Minimalism with Refined Glassmorphism**. The interface prioritizes extreme clarity, disciplined restraint, high visual information density, and microscopic tactile feedback. It avoids noisy decorative textures or dramatic glowing accents in favor of razor-thin 1px borders, subtle deep-space tonal layering, and typographic rigor. 

The emotional response evoked is quiet competence, institutional trustworthiness, and uncompromising engineering discipline.

## Colors

The palette is engineered specifically for immersive, high-contrast dark mode interfaces.

- **Background Canvas & Tonal Hierarchy:** The core foundation uses deep obsidian tones. Base canvas is `#0a0c10`. Elevated surfaces progress through dark zinc-infused obsidian: `#0f1218` (Surface Ground), `#151922` (Surface Elevated), and `#1e2430` (Surface Overlay).
- **Accents:** The primary accent (`#6366f1`, Electric Indigo) is applied with severe discipline—reserved strictly for primary call-to-actions, active commit/build states, and terminal execution cues. Secondary cyan (`#38bdf8`) functions exclusively as an informational metadata or syntax-highlight highlight.
- **Text & Contrast:** Content strictly follows high-legibility typographic grades: Primary text sits at `#f1f5f9` (Slate 100), secondary context at `#94a3b8` (Slate 400), and muted labels or disabled metadata at `#64748b` (Slate 500).
- **Borders:** Structural grid lines and card borders rely on sub-perceptual hairline strokes: `rgba(255, 255, 255, 0.08)` for static boundaries, advancing to `rgba(255, 255, 255, 0.16)` on active or focused states.

## Typography

Typography establishes an architectural order on screen.

- **Primary & Headline Pairing:** **Geist** provides an unadorned, hyper-clean grotesque structure engineered specifically for digital precision. Tight negative tracking on large headlines imparts a crisp, machined finish.
- **Monospaced Utility:** **JetBrains Mono** is utilized for code blocks, commit hashes, release versions, metric labels, category indicators, and tabular numbers.
- **Capitalization:** Use uppercase styling strictly in combination with `mono-label` and expanded letter spacing for status pills, table columns, and badge elements.

## Layout & Spacing

The layout is anchored on a rigid 12-column fixed-maximum grid system capped at a maximum width of 1200px, flanked by auto-centering safety margins.

- **Desktop (1024px+):** 12 columns with a 24px (`gutter`) gap and 32px canvas margins. Structural sections enforce strict visual vertical cadence using multiples of 64px or 80px.
- **Tablet (768px – 1023px):** 8 columns, 20px gutters, and 24px margins. Two-column project showcase cards scale down to single-column blocks.
- **Mobile (< 768px):** 4 columns, 16px gutters, and 16px margins. Complex tabular specs and architectural charts collapse into vertically stacked list items.
- **Rhythm:** Spacing follows a 4px/8px incremental rhythm. Component padding strictly maps to `space-sm` (dense controls), `space-md` (standard buttons/inputs), and `space-xl` (card and modal boundaries).

## Elevation & Depth

Visual depth is achieved through structural layering, frosted glass translucency, and micro-borders rather than standard cast drop shadows.

- **Backdrop Diffusion:** Glass surfaces apply `backdrop-filter: blur(12px)` over backgrounds using `rgba(15, 18, 24, 0.7)`. This gives floating navbars and flyout palettes a clinical, frosted appearance.
- **Micro-Borders:** All elevated containers utilize an explicit 1px inner stroke: `box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08)`.
- **Directional Gradient Overlays:** Floating panels and high-priority cards feature an ultra-subtle top-to-bottom surface sheen: a linear gradient of `rgba(255, 255, 255, 0.04)` at the top edge fading to `rgba(255, 255, 255, 0)` at the bottom edge.
- **Ambient Floor Shadows:** For floating popovers and dialogs, drop shadows are broad, dark, and muted: `0 16px 40px -8px rgba(0, 0, 0, 0.6)`. No colored or neon ambient glows are permitted.

## Shapes

The design system employs a refined geometric curve discipline: `roundedness: 1` (Soft).

- **Standard Elements (Buttons, Inputs, Badges):** 4px (`0.25rem`) border radius, delivering an intentional, engineered look.
- **Containers (Cards, Dialogs, Code Blocks):** 8px (`0.5rem`) border radius via `rounded-lg`.
- **Large Viewports (Modal overlays, Canvas previews):** 12px (`0.75rem`) border radius via `rounded-xl`.
- Circular geometry is strictly prohibited except for status indicators, active connection pings, and author avatar clips.

## Components

### Buttons
- **Primary:** Solid `#f1f5f9` (Slate 100) background with `#0a0c10` typography, 1px transparent border, and 4px radius. On hover, background shifts subtly to `#e2e8f0`.
- **Secondary / Ghost:** `rgba(255, 255, 255, 0.04)` fill with a 1px `rgba(255, 255, 255, 0.08)` border and `#f1f5f9` text. Hover state brightens fill to `rgba(255, 255, 255, 0.08)` and border to `rgba(255, 255, 255, 0.16)`.
- **Accent Action:** Reserved for execution states (`Run`, `Deploy`). Uses `#6366f1` with white text, transitioning to `#4f46e5` on hover.

### Cards & Project Showcases
- Surface background set to `#0f1218` with a 1px border of `rgba(255, 255, 255, 0.08)`.
- Hover interactions trigger an instantaneous border transition to `rgba(255, 255, 255, 0.2)` accompanied by an invisible ambient highlight gradient following the cursor coordinates.

### Inputs & Search Bars
- Background set to `#0a0c10` with a 1px border of `rgba(255, 255, 255, 0.12)`.
- Focus state removes standard browser rings, replacing them with a crisp 1px stroke of `#6366f1` and an optional inset glow (`inset 0 0 0 1px #6366f1`).
- Typography uses `mono-code` or `body-md` with `#64748b` placeholder text.

### Chips & Metadata Tags
- Built using `mono-label` typography, 4px border radius, 4px vertical by 8px horizontal padding.
- Neutral tags use `rgba(255, 255, 255, 0.04)` background with `rgba(255, 255, 255, 0.1)` border and `#94a3b8` text.
- Status chips (e.g., "Active", "Shipped") include a 6px circular dot indicator with green (`#10b981`) or cyan (`#38bdf8`).

### Selection Controls (Checkboxes & Radios)
- Square 16px footprint with 3px radius for checkboxes; circular 16px for radios.
- Unchecked: `#0f1218` fill with 1px `rgba(255, 255, 255, 0.2)` border.
- Checked: `#6366f1` solid fill containing a crisp white vector icon.

### Specialized Developer Components
- **Command Palette (Cmd+K):** Centered floating dialog featuring glassmorphism (`rgba(15, 18, 24, 0.85)` + 16px backdrop blur), razor hairline dividers between search input and categorical result sections, with keyboard shortcut pills rendered in `mono-label`.
- **Code Snippet / Terminal Blocks:** Top utility bar displaying filename in `mono-label`, terminal circle controls, copy button, and syntax styling using subdued slate tones with electric indigo/cyan tokens.