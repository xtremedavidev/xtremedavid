# PORT-ecolit.md — complete instructions for building `/concept/ecolit` (v2)

**How to use:** in Antigravity, say: *"Read `reference/ecolit/PORT-ecolit.md` and follow it exactly, step by step. Stop and ask me if anything can't be done as written."*

You are adding a second standalone concept page. **Galcon is already ported and working.** Use its files as the pattern:
`app/components/concepts/galcon/Galcon.tsx`, `galcon.module.css`, `motion.ts`.

- **Spec (source of truth):** `reference/ecolit/index.html` — layout, copy, CSS, inline SVGs, map data and every GSAP timeline.
- **Assets:** `public/concepts/ecolit/` → served at `/concepts/ecolit/<file>`:
  `logo.svg`, `logo-ink.svg`, `frame-6.jpg`, `frame-3.jpg`, `rivet.jpg`, `frame-on-wall.jpg`, `cert-us.jpg`, `cert-de.jpg`, `cert-uae.jpg`, `cert-jamaica.jpg`, `cert-labc.jpg`, `cert-premier.jpg`, and nine `partner-*.jpg`.
  OG image: `public/og/ecolit.png`.
- **Already installed:** `gsap` (ScrollTrigger, SplitText), `@gsap/react`, `lenis`. Install nothing.

---

## Rule 1 — Port, don't redesign
Keep the same DOM structure, copy, CSS values, inline SVG paths, GSAP timings, eases, staggers and ScrollTrigger start/end/pin/scrub values. Don't simplify, "improve" or re-draw the SVGs. If something can't be ported 1:1, stop and tell me.

## Rule 2 — Every page is standalone. Touch nothing that exists.
- **Do NOT edit `app/globals.css`, `PortfolioShell.tsx`, `app/concept/[id]/page.tsx`, `ConceptBadge.tsx`, any existing page, or anything in `app/components/concepts/galcon/`.**
- The only existing files you may edit are the two additions in Step 1 (`concepts.ts`, `registry.ts`).
- No plain `.css` files and no global selectors except the two `:global(body[data-concept])` rules in Step 3.
- When you're finished, check all of these:
  - `git diff app/globals.css app/components/PortfolioShell.tsx app/components/concepts/galcon` is empty.
  - `/concept/galcon` still works exactly as before.
  - Home, about, projects, work, contact and admin look unchanged.

---

## Step 1 — Register the concept (two small additions)

`app/lib/concepts.ts`: append to the `concepts` array. Keep the type and the galcon entry as they are.
```ts
  {
    id: "ecolit",
    name: "ECOLIT",
    meta: {
      title: "ECOLIT — Homes from light steel, anywhere. · Concept by David Adebayo",
      description:
        "An unsolicited homepage concept for ECOLIT: cold-formed steel homes, a global partner network, and a business you can open in your city.",
      ogImage: "/og/ecolit.png",
      themeColor: "#ECEDEA",
    },
  },
```

`app/components/concepts/registry.ts`: add one line to the map.
```ts
  ecolit: dynamic(() => import("./ecolit/Ecolit")),
```

## Step 2 — New files (only these three)
```
app/components/concepts/ecolit/Ecolit.tsx          "use client" page (JSX of the reference <body>)
app/components/concepts/ecolit/ecolit.module.css   the reference <style> as a CSS Module
app/components/concepts/ecolit/motion.ts           the reference <script> as initEcolitMotion(root, s)
```

## Step 3 — `ecolit.module.css`
Copy the entire reference `<style>` block, then apply these conversions:
1. **Root rules:**
   - Rename `:root{…}` to `.root{…}`.
   - Merge `body{…}` into `.root{…}` and add `min-height:100vh`.
   - Delete `html{…}`.
2. **Global selectors:**
   - `*{…}` becomes `.root, .root *{…}`.
   - Any bare element selectors at the top level (`img`, `a`, `button`, `svg`) get the `.root ` prefix.
3. **Fonts:** replace every `font-family:"Montserrat",sans-serif` with `font-family:var(--font-montserrat),sans-serif`, and every `font-family:"Michroma",sans-serif` with `font-family:var(--font-michroma),sans-serif`.
4. **State classes stay as classes.** `.is-on`, `.is-done`, `.is-pulse`, `.is-us`, `.is-last`, `.pin`, `.mate` are toggled or created from JS. Keep them as normal module classes; Step 5 makes the JS use the hashed names. `@keyframes pulse` stays in this file.
5. **Media queries:** keep both blocks (`max-width:1100px`, `max-width:760px`) exactly as written, including the CTA bar rules at the end of the 760px block.
6. **Concept-only body rules:** append these two (same as Galcon; they only match on concept pages).
   ```css
   :global(body[data-concept]) { background:#ECEDEA; color:#0F1210; cursor:auto; }
   :global(body[data-concept]) a, :global(body[data-concept]) button, :global(body[data-concept]) [role="button"], :global(body[data-concept]) input { cursor:pointer; }
   ```
7. **Badge:** keep the `.badge` rules. Pass `s.badge` to `ConceptBadge`, as Galcon does.

## Step 4 — `Ecolit.tsx`
Use the same structure as `Galcon.tsx`, with these fonts:
```tsx
import { Michroma, Montserrat } from "next/font/google";
const michroma = Michroma({ subsets: ["latin"], weight: "400", variable: "--font-michroma" });
const montserrat = Montserrat({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-montserrat" });
const cx = (...names: string[]) => names.map((n) => s[n]).filter(Boolean).join(" ");
// root: <div ref={root} className={`${s.root} ${michroma.variable} ${montserrat.variable}`}>
// useGSAP → document.fonts.ready → initEcolitMotion(root.current, s) → return cleanup (exactly like Galcon)
```
Convert the reference `<body>` to JSX 1:1:
- **Classes:** `class="a b"` becomes `className={cx("a","b")}`, including on `<svg>` elements.
- **Data attributes:** keep every `data-*` attribute exactly as in the reference, with an empty string for valueless ones (`data-nav=""`).
- **Inline styles:** `style="left:…;top:…"` becomes `style={{ left: "…", top: "…" }}`.
- **SVG attributes:** convert to camelCase (`stroke-width` → `strokeWidth`, `stroke-linecap` → `strokeLinecap`, `text-anchor` → `textAnchor`, `font-family` → `fontFamily`, `font-size` → `fontSize`, `viewBox` stays).
  - Keep every path `d` string byte-for-byte.
  - The SVGs are large; paste them as-is.
- **Image paths:**
  - `../../public/concepts/ecolit/x` becomes `/concepts/ecolit/x`.
  - Use plain `<img>`.
  - Use `loading="eager"` for `logo.svg` and the hero founder photo, and `lazy` for the rest.
- **Badge:** replace the reference badge `<div class="badge">…</div>` with `<ConceptBadge company="ECOLIT" className={s.badge} />`.
- **Head tags:** drop the reference `<link>` and `<script src>` tags (fonts come from next/font; GSAP and Lenis are imports).
- **Lenis CSS:** the reference loads `lenis.css`. Add its rules to the module instead:
  ```css
  :global(html.lenis), :global(html.lenis body) { height:auto; }
  :global(.lenis.lenis-smooth) { scroll-behavior:auto !important; }
  ```
  These are the only other `:global` rules allowed. They only apply while Lenis is running on this page.

## Step 5 — `motion.ts`

**1. Wrapper.** Copy the wrapper from `app/components/concepts/galcon/motion.ts`: imports, `$`/`$$`, `splits`, `listeners`/`on`, the reduced-motion return, Lenis + ticker, `mm`, `gsap.context`, load refresh and cleanup.
- This concept does **not** use Draggable. Remove its import and registration, and the `draggables` array.
- Change the signature to:
```ts
export function initEcolitMotion(root: HTMLElement, s: Record<string, string>): () => void
```

**2. Class-name translator.** Add these right after `$`/`$$`. CSS Module classes are hashed, so every class name used in JS must go through `s`:
```ts
const q = (sel: string) => sel.replace(/\.([a-zA-Z][\w-]*)/g, (m, n) => (s[n] ? "." + s[n] : m));
const $ = <T extends HTMLElement = HTMLElement>(sel: string, r: ParentNode = root) => r.querySelector<T>(q(sel))!;
const $$ = <T extends HTMLElement = HTMLElement>(sel: string, r: ParentNode = root) => [...r.querySelectorAll<T>(q(sel))];
const k = (n: string) => s[n] ?? n; // class name for classList / className
```

**3. Paste the script body.** Paste the reference `<script>` body into the `gsap.context(() => { … }, root)` and apply all of these:
1. **Delete what the wrapper already does:** the reference's own `gsap.registerPlugin`, `$`/`$$`, the `reduce` check, the Lenis/ticker lines, and the final `window.addEventListener('load', …)`.
   - **Keep** `const mm = gsap.matchMedia()` out (the wrapper's `mm` is used).
   - **Move** the reference's reduced-motion branch into the wrapper's reduced-motion return. It needs `drawMap()` with every dot fully drawn, and `[data-count]` set to its final value. To make that work, build `MAP`, `dots`, `drawMap`, the pins/cards/leaders **before** the reduced-motion check, and register their listeners with `on`.
2. **Selector strings passed straight to GSAP:** every string selector passed to `gsap.to/from/fromTo/set` or to `scrollTrigger.trigger` must be wrapped in `q()`. For example:
   - `gsap.to('.progress', …)` becomes `gsap.to(q('.progress'), …)`.
   - `.from('.hero__stat, .hero__foot .note', …)` becomes `.from(q('.hero__stat, .hero__foot .note'), …)`.
   - `trigger: '[data-device]'` is fine as-is: `q()` only touches `.class` tokens, so wrapping all of them is safe.
3. **Class names in JS:**
   - `pin.className = 'pin'` becomes `pin.className = k('pin')`.
   - `card.className = 'mate'` becomes `card.className = k('mate')`.
   - Every `classList.add/remove/toggle('is-…')` uses `k('is-…')`: `is-on`, `is-done`, `is-pulse`.
4. **Pins and partner cards built from `PINS`:**
   - Their `card.innerHTML` uses plain `<img>`, `<b>`, `<small>`. Keep it; the CSS targets them as `.mate img`, `.mate b`, `.mate small`, which stay correct because `.mate` resolves to `k('mate')`.
   - Change `const ASSET = '../../public/concepts/ecolit/'` to `const ASSET = '/concepts/ecolit/'`.
5. **Event listeners:** every `addEventListener` becomes `on(...)`. That includes `window` resize (`on(window, 'resize', drawMap)`) and the pointer listeners on hero, cards, CTA bar and magnetic elements. There are 9 call sites.
6. **SplitText:** push every `SplitText.create(...)` result into `splits`. There are 2 call sites: the `statement()` helper and the CTA bar text (`type: 'words,chars'`).
7. **Badge:** `gsap.from('.badge', …)` becomes `gsap.from('[data-badge]', …)` (ConceptBadge already renders `data-badge`).
8. **Inline map data:** keep `MAP` (with its long `rle` string) and `PINS` exactly as written.
9. **Delayed calls:** track the `setTimeout` calls in the pin pulse so cleanup can clear them (`const timers:number[]=[]` and `clearTimeout` each one in cleanup).

## Step 6 — Verify parity, then verify nothing else changed
Run `npm run dev` and serve the reference (`npx serve .` → `/reference/ecolit/`). Compare them side by side at **1440×900** and **390×844**:
1. **Load:**
   - The nav drops in and the rules draw.
   - The statement lines rise: "Heavy construction / is slow and wasteful. / We build homes from / light steel — anywhere."
   - The isometric house **draws itself layer by layer**: slab → ground floor → floor → green first floor → roof → dimensions, then the dimension labels fade in.
   - The neon **E** block pops, the founder card rises, and the stats count up (20 · 25 · 1500+ · 17).
2. **Hero pointer:** the drawing and the founder card drift in opposite directions. On scroll, the drawing parallaxes.
3. **02 Reality (desktop):**
   - The section pins and the drawing re-draws.
   - A circular aperture opens into the real frame photo, and the strokes turn white.
   - The statement and machine card come in, and the ticks complete one by one.
   - On mobile there's no pin; the photo is fully open.
4. **03 Network:** grey dots sweep in, the green ECOLIT countries light up, the pins pop and pulse, and leader lines draw to the partner cards. Hovering a card re-pulses its pin.
5. **04 Portal:** the device rises in 3D. Scrolling runs the demo: the segments move, the slider and area count, the preview house draws, kit rows tick, and the "Quote requested" toast appears.
6. **05 Engineered:** the C-profile draws (outline → green holes → dimensions → labels), and the spec rows reveal with their hairlines.
7. **06 Energy:** the big number counts **280 → 15** while changing colour, and the bars grow in sequence.
8. **07 Approvals (desktop):** the certificates start stacked and **fan out** with rotation and blur as you scroll. The list rows reveal.
9. **08 Partnership:**
   - The photo parallaxes and the Paul Stephenson card slides in.
   - The title lines rise and the four steps reveal.
   - The neon CTA bar **wipes in** left→right, the faces slide in, "Become an ECOLIT partner" types up by character, and the arrow spins in.
   - The arrow follows the pointer magnetically.
   - On mobile, only 5 faces show and the bar stacks.
10. **09 Footer:** the construction lines draw, then the wordmark fills in.
11. **No console errors.** Navigate `/` → `/concept/ecolit` → `/concept/galcon` → back. Check that animations aren't duplicated, no smooth scroll is left over, and nothing logs after unmount.
12. **Reduced motion** (OS setting on): the page is fully visible and static, the map is drawn, and the numbers are final.
13. **Isolation:**
    - `git diff app/globals.css app/components/PortfolioShell.tsx app/components/concepts/galcon` is empty.
    - Galcon and every portfolio page look exactly as before.

Don't delete or edit anything in `reference/`.
