# PORT — Galcon concept → `/concept/galcon`

You are porting a finished, verified reference page into this Next.js 16 (App Router) portfolio.
**Source of truth:** `reference/galcon/index.html` (layout, copy, CSS, and every GSAP timeline).
**Assets:** already in `public/concepts/galcon/` (15 files). In Next they are served at `/concepts/galcon/<file>`.

> Rule #1: **Port, don't redesign.** Same DOM structure, class names, copy, CSS values, GSAP timings, eases, staggers, ScrollTrigger start/end/pin/scrub values. Do not "simplify" or "improve" animations. If something can't be ported 1:1, stop and tell me.

---

## 0. Isolation rules — every page in this portfolio is standalone

**Do NOT edit `app/globals.css`, any existing page, or any existing component** (except the one line in `PortfolioShell.tsx` below, which is already done). Scoping or re-specifying global rules (e.g. `body[data-portfolio] *`, `body[data-portfolio] .hero`) raises their specificity and silently breaks margins, paddings, links and images on the other pages.

- `PortfolioShell.tsx` already returns `<body data-concept="">{children}</body>` for `/concept/*` (no cursor, noise, navbar, chapter number). Leave `/admin` exactly as it is.
- The concept neutralises the few global rules that reach it **from inside its own CSS Module**, never by editing globals:
  ```css
  /* galcon.module.css */
  :global(body[data-concept]) { background:#F2F2EF; color:#121412; cursor:auto; font-family:inherit; }
  :global(body[data-concept]) a, :global(body[data-concept]) button { cursor:pointer; }
  ```
  These selectors only match when the concept body is rendered, so they can't affect other pages.
- Global class names `.hero` and `.stat` exist in `globals.css`. That's why the concept CSS must be a **CSS Module** (hashed class names) — never a plain global `.css` import, which also lingers after client-side navigation in the App Router.
- The portfolio pages create their own Lenis instances. The concept creates its own (see §3) and **must destroy it on unmount**. Never two Lenis instances at once.

## 1. Files to create

```
app/lib/concepts.ts                         (already exists — keep the galcon entry in sync)
app/concept/[id]/page.tsx                   server: generateStaticParams, generateMetadata, generateViewport, render map
app/concept/[id]/concepts.map.ts            { galcon: dynamic(() => import("@/app/components/concepts/galcon/Galcon")) }
app/components/concepts/ConceptBadge.tsx
app/components/concepts/galcon/Galcon.tsx   "use client" — the page markup (JSX of reference <header>, <main>, <footer>)
app/components/concepts/galcon/galcon.module.css   the reference <style> block as a CSS Module (see §2)
app/components/concepts/galcon/motion.ts    the reference <script> as `export function initGalconMotion(root: HTMLElement): () => void`
```

## 2. Markup + CSS

- Convert the reference HTML to JSX 1:1 (`class` → `className`, `style="left:9%;top:26%"` → `style={{ left: "9%", top: "26%" }}`, `&amp;` etc.). Keep **all `data-*` attributes** — motion.ts selects by them.
- Image `src="../../public/concepts/galcon/x.jpg"` → `src="/concepts/galcon/x.jpg"`. Use plain `<img>` (not `next/image`) so GSAP transforms and object-fit behave exactly like the reference. Add `loading="eager"` to hero images (`field.jpg`, `moss.jpg`, `galileo-cloud.png`, `logo.png`), `loading="lazy"` to the rest.
- CSS: copy the whole `<style>` block into `galcon.module.css`. Put `className={styles.root}` on one root `<div>` wrapping header/main/footer/badge. Convert: `:root{…}` → `.root{…}` (the CSS variables), `body{…}` → `.root{…}` (+ `min-height:100vh`), delete `html{…}`, `*{…}` → `.root *{…}`, `img`/`a`/`button` element rules → `.root img` etc. Every class becomes `styles.x` in JSX (`styles["stage__glass"]` for BEM names, or rename to camelCase consistently). Multi-class elements: `` className={`${styles.btn} ${styles["btn--dark"]}`} ``. Keep media queries inside the module. Add the two `:global(body[data-concept])` rules from §0.
- motion.ts selects by `data-*` attributes and a few class names (`.l1`, `.l2`, `.fill`, `.stat`, `.prod`, `.prod__stage img`, `.area__more`, `.slide__label`, `.slide__chev`, `.foot__top`, `.foot`, `.badge`, `.progress`, `.sec__head .lead`, `.soil__copy .lead`, `.app__copy .lead`, `.countries span`). With CSS Modules those class names are hashed, so **add a `data-*` hook for each of them in the JSX and update the selectors in motion.ts to the data hooks** (e.g. `data-l1`, `data-l2`, `data-prod`, `data-lead`…). The `.fill` class that motion.ts adds at runtime must be written as `:global(.fill)` inside the module (`.root .l2 :global(.fill){…}`).
- Font: load **Geist** via `next/font/google` (`Geist`, weights 400/500/600) and apply its className on the root `<div>`; replace the `font-family` value with the font's CSS variable. Delete the Google Fonts `<link>`.
- Keep the progress bar and badge inside the root `<div>`. Replace the reference badge with `<ConceptBadge company="Galcon" />` that renders the exact same markup/classes.

## 3. Motion (`motion.ts`)

- `npm` already has `gsap@^3.15` (includes ScrollTrigger, SplitText, Draggable — all free) and `lenis@^1.3`. Import, don't use CDN:
  ```ts
  import gsap from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";
  import { SplitText } from "gsap/SplitText";
  import { Draggable } from "gsap/Draggable";
  import Lenis from "lenis";
  gsap.registerPlugin(ScrollTrigger, SplitText, Draggable);
  ```
- Paste the body of the reference IIFE into `initGalconMotion(root)`. Change `$`/`$$` to query inside `root`, not `document`. Keep every block, comment and number.
- Wrap all tweens/ScrollTriggers in `const ctx = gsap.context(() => { … }, root);` and return a cleanup:
  ```ts
  return () => { ctx.revert(); mm.revert(); lenis.destroy(); gsap.ticker.remove(raf); splits.forEach(s => s.revert()); draggables.forEach(d => d.kill()); };
  ```
  (store the ticker callback in `raf`, push every `SplitText.create` result into `splits`, every `Draggable.create(...)[0]` into `draggables`, and remove the pointer/click/keydown listeners you add.)
- In `Galcon.tsx`:
  ```tsx
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => initGalconMotion(root.current!), { scope: root });
  ```
  (`useGSAP` from `@gsap/react` — it calls the returned cleanup on unmount.)
- Wait for fonts before splitting lines: run the init inside `document.fonts.ready.then(...)` (SplitText line breaks depend on the font). Call `ScrollTrigger.refresh()` after all images load.
- `prefers-reduced-motion`: keep the early return exactly as in the reference.

## 4. Metadata (`app/concept/[id]/page.tsx`)

From `app/lib/concepts.ts` → `galcon.meta`:
- `title`, `description`, `robots: { index: false, follow: false }`, `openGraph.images: ["/og/galcon.png"]`, `twitter.card: "summary_large_image"`.
- `generateViewport` → `themeColor: "#F2F2EF"`.
- OG image: export the Figma frame **"OG — galcon (1200×630)"** to `public/og/galcon.png` (I'll do this if you can't).

## 5. Done = parity

Open `reference/galcon/index.html` (via a static server, e.g. `npx serve .` from the repo root → `/reference/galcon/`) side by side with `localhost:3000/concept/galcon` at **1440×900** and **390×844**, and check:

1. Load: nav drops in, headline lines rise, grey line fills in, cards unfold, Galileo drops onto the moss and settles, glass card un-blurs, "120" counts up.
2. Hover the product stage: three layers move at different depths. Nav pill glides between links. Buttons are magnetic.
3. Scroll: hairline progress bar, nav hides on scroll down / returns on scroll up.
4. Area cards: rounded reveal; hover expands copy and turns "+" into "×".
5. App section pins (desktop): phone rises, numbers tick, knob slides, state becomes "Irrigating…", bar fills.
6. Soil: blue probe line descends, three readings pop and count.
7. Proof: photo parallax, card slides in, countries stagger, stats count.
8. CTA: card + oval open like an aperture, product drops, the slide knob is draggable (>80% → "Opening contact…"), Enter key works.
9. No console errors; navigating away and back doesn't duplicate animations (cleanup works).
10. **Every other page looks exactly as before** (home, about, projects, work, contact, admin) — `git diff app/globals.css` must be empty.

Do not delete `reference/`. It stays as the spec.
