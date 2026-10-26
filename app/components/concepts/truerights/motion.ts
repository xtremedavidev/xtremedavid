import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText);

const STEP_TEXT: [string, string][] = [
  ["Register", "Protect your likeness, content & IP in one verified registry."],
  ["Value", "TrueRates turns reach, category and usage into a fair price."],
  ["Deal", "AI-assisted terms, shared with the brand in minutes."],
  ["Licence", "Scoped usage — which platform, what use, for how long."],
  ["Monitor", "Every generation is checked against the deal in real time."],
  ["Enforce", "Breaches are flagged and takedowns filed for you."],
  ["Earn", "Performance-based payments, with revenue recovery built in."],
];

/** Draw `img` into a w×h box like CSS object-fit: cover + object-position (px, py in 0..1). */
function coverDraw(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number, px = 0.5, py = 0.5) {
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
  ctx.drawImage(img, (w - dw) * px, (h - dh) * py, dw, dh);
}
const ready = (img: HTMLImageElement) => (img.complete && img.naturalWidth ? Promise.resolve() : new Promise<void>((r) => { img.addEventListener("load", () => r(), { once: true }); img.addEventListener("error", () => r(), { once: true }); }));

/** SplitText masks clip glyphs on tight tracking/line-height (sliced right edges, cut descenders) — give each mask room on the sides and below without moving layout. */
const unclip = (sp: SplitText) => { for (const m of ((sp as unknown as { masks?: HTMLElement[] }).masks || [])) { m.style.padding = "0 0.14em 0.16em"; m.style.margin = "0 -0.14em -0.16em"; } return sp; };

export function initTrueRightsMotion(root: HTMLElement): () => void {
  const $ = <T extends Element = HTMLElement>(sel: string, r: ParentNode = root) => r.querySelector<T>(sel)!;
  const $$ = <T extends Element = HTMLElement>(sel: string, r: ParentNode = root) => [...r.querySelectorAll<T>(sel)];
  const splits: SplitText[] = [];
  const timers: ReturnType<typeof setInterval>[] = [];
  const rafs = new Set<number>();
  const listeners: Array<[EventTarget, string, EventListener, AddEventListenerOptions?]> = [];
  const on = (el: EventTarget, ev: string, fn: EventListener, o?: AddEventListenerOptions) => { el.addEventListener(ev, fn, o); listeners.push([el, ev, fn, o]); };
  // Reduced motion (e.g. Samsung "Remove animations") = calmer, not frozen: scroll-driven storytelling still runs,
  // but smooth-scroll hijacking, the intro sequence, cursor/magnetic effects and parallax drift are switched off.
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const isDesk = () => window.innerWidth > 760;
  let alive = true;

  const fmt = (el: HTMLElement, v: number) => {
    const dec = +(el.dataset.dec || 0);
    el.textContent = (el.dataset.prefix || "") + v.toLocaleString("en-GB", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + (el.dataset.suffix || "");
  };

  /* ---------- halftone "copy" (same photo rendered as dots) — used in both motion and reduced modes ---------- */
  const halftone = () => {
    const c = $<HTMLCanvasElement>("[data-halftone]"), box = $("[data-compare]"), img = $<HTMLImageElement>("[data-compare] img");
    if (!c || !box || !img) return;
    ready(img).then(() => {
      if (!alive || !img.naturalWidth) return;
      const w = box.clientWidth, h = box.clientHeight, d = Math.min(devicePixelRatio, 2);
      c.width = w * d; c.height = h * d;
      const g = c.getContext("2d")!; g.scale(d, d);
      const off = document.createElement("canvas"); off.width = w; off.height = h;
      const og = off.getContext("2d", { willReadFrequently: true })!; coverDraw(og, img, w, h);
      const px = og.getImageData(0, 0, w, h).data;
      g.fillStyle = "#020B06"; g.fillRect(0, 0, w, h);
      const step = w > 700 ? 9 : 7;
      g.fillStyle = "#57EF9D";
      for (let y = step / 2; y < h; y += step) for (let x = step / 2; x < w; x += step) {
        const i = ((y | 0) * w + (x | 0)) * 4, l = (0.3 * px[i] + 0.59 * px[i + 1] + 0.11 * px[i + 2]) / 255;
        const r = (step / 2) * Math.pow(l, 0.9) * 1.05;
        if (r > 0.35) { g.globalAlpha = 0.35 + l * 0.65; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); }
      }
      g.globalAlpha = 1;
    });
  };


  const lenis = reduce ? null : new Lenis({ lerp: 0.085, smoothWheel: true });
  const tick = (t: number) => lenis?.raf(t * 1000);
  lenis?.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  let refreshT: ReturnType<typeof setTimeout> | undefined;
  const queueRefresh = () => { clearTimeout(refreshT); refreshT = setTimeout(() => ScrollTrigger.refresh(), 160); };
  $$<HTMLImageElement>("img").forEach((im) => { if (!im.complete) on(im, "load", queueRefresh, { once: true }); });

  const mm = gsap.matchMedia();
  const ctx = gsap.context(() => {
    const EASE = "expo.out";
    const nav = $("[data-nav]");

    /* ---------- global: cursor, magnetic, nav, anchors ---------- */
    const cur = $("[data-cursor]");
    if (!reduce && matchMedia("(hover: hover)").matches) {
      const xTo = gsap.quickTo(cur, "x", { duration: 0.45, ease: "power3.out" }), yTo = gsap.quickTo(cur, "y", { duration: 0.45, ease: "power3.out" });
      on(window, "pointermove", (e) => { const p = e as PointerEvent; xTo(p.clientX); yTo(p.clientY); cur.style.opacity = "1"; });
      $$("a, button, [data-flow], [data-compare]").forEach((el) => { on(el, "pointerenter", () => cur.setAttribute("data-big", "")); on(el, "pointerleave", () => cur.removeAttribute("data-big")); });
    }
    if (!reduce) $$("[data-magnetic]").forEach((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" }), yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
      on(el, "pointermove", (e) => { const r = el.getBoundingClientRect(), p = e as PointerEvent; xTo((p.clientX - r.left - r.width / 2) * 0.25); yTo((p.clientY - r.top - r.height / 2) * 0.35); });
      on(el, "pointerleave", () => { xTo(0); yTo(0); });
    });
    $$<HTMLAnchorElement>('a[href^="#"]').forEach((a) => on(a, "click", (e) => { const id = a.getAttribute("href"); if (!id || id.length < 2) return; const t = root.querySelector<HTMLElement>(id); if (!t) return; e.preventDefault(); if (lenis) lenis.scrollTo(t, { offset: -40, duration: 1.8 }); else window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 40 }); }));
    ScrollTrigger.create({ start: "top -80", end: "max", onUpdate(self) { gsap.to(nav, { yPercent: self.direction === 1 && self.scroll() > 900 ? -160 : 0, duration: 0.6, ease: "power3.out", overwrite: "auto" }); } });

    /* ---------- generic reveals ---------- */
    const lines = (el: Element, vars: gsap.TweenVars) => { const sp = unclip(SplitText.create([...el.children] as HTMLElement[], { type: "lines", mask: "lines" })); splits.push(sp); return gsap.from(sp.lines, { yPercent: 110, duration: 1.3, stagger: 0.09, ease: EASE, ...vars }); };
    $$("[data-lines]").forEach((el) => lines(el, { scrollTrigger: { trigger: el, start: "top 86%" } }));
    $$("[data-rise]").forEach((el) => { if (el.closest("[data-hero]")) return; gsap.from(el, { y: 30, opacity: 0, duration: 1.1, ease: EASE, scrollTrigger: { trigger: el, start: "top 90%" } }); });
    $$("[data-count]").forEach((el) => { if (el.closest("[data-case]")) return; const to = +el.dataset.count!; const o = { v: 0 }; fmt(el, 0);
      gsap.to(o, { v: to, duration: 2.2, ease: "power3.out", onUpdate: () => fmt(el, o.v), scrollTrigger: { trigger: el, start: "top 88%" } }); });

    /* ---------- intro ---------- */
    const intro = $("[data-intro]");
    const h1 = unclip(SplitText.create($$("[data-h1] > span:not([data-grad])"), { type: "chars", mask: "chars" })); splits.push(h1);
    const tl = gsap.timeline({ delay: 0.15 });
    tl.fromTo($("svg", intro), { scale: 0.6, opacity: 0, rotate: -90 }, { scale: 1, opacity: 1, rotate: 0, duration: 0.9, ease: "back.out(1.6)" }, 0)
      .to($("svg", intro), { scale: 14, opacity: 0, duration: 0.9, ease: "expo.in" }, 0.95)
      .to(intro, { clipPath: "inset(0 0 100% 0)", duration: 1, ease: "expo.inOut", onComplete: () => intro.remove() }, 1.25)
      .from("[data-hero-img]", { scale: 1.25, filter: "blur(14px)", duration: 2.2, ease: EASE }, 1.2)
      .from(nav, { y: -90, opacity: 0, duration: 1, ease: EASE }, 1.6)
      .from(h1.chars, { yPercent: 110, filter: "blur(10px)", duration: 1.3, stagger: 0.025, ease: EASE }, 1.6)
      .fromTo("[data-grad]", { clipPath: "inset(-10% 100% -20% 0)", x: -40, filter: "blur(12px)" }, { clipPath: "inset(-10% -2% -20% 0)", x: 0, filter: "blur(0px)", duration: 1.6, ease: EASE, clearProps: "clipPath,filter" }, 1.85)
      .from("[data-hero] [data-rise]", { y: 26, opacity: 0, duration: 1, stagger: 0.08, ease: EASE }, 1.9)
      .from("[data-brackets] i", { scale: 1.8, opacity: 0, duration: 0.8, stagger: 0.06, ease: "back.out(2)" }, 2.1)
      .from("[data-hero] [data-float]", { y: 40, opacity: 0, duration: 1.1, stagger: 0.12, ease: EASE }, 2.2);
    if (reduce) tl.progress(1);

    /* ---------- B01 · particle dissolve ---------- */
    const hero = $("[data-hero]"), heroImg = $<HTMLImageElement>("[data-hero-img]"), canvas = $<HTMLCanvasElement>("[data-particles]");
    const P = { p: 0, mx: -9999, my: -9999, vis: true };
    // the portrait is never shown whole: it starts part-dissolved and scroll carries it the rest of the way
    const BASE = isDesk() ? 0.1 : 0.16;
    const edgeAt = (p: number, w: number, e0: number) => e0 + (w - e0 + 120) * (BASE + p * (1 - BASE)) * 1.15;
    const setMask = (edge: number) => { const m = `linear-gradient(90deg, transparent ${edge - 60}px, #000 ${edge + 40}px)`; heroImg.style.setProperty("-webkit-mask-image", m); heroImg.style.setProperty("mask-image", m); };
    setMask(edgeAt(0, hero.clientWidth, hero.clientWidth * (isDesk() ? 0.5 : 0.25)));
    type Pt = { x: number; y: number; c: string; s: number; t: number };
    let pts: Pt[] = [], amb: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = [], W = 0, H = 0, edge0 = 0;
    const g = canvas.getContext("2d")!;
    const build = () => {
      if (!heroImg.naturalWidth) return;
      W = hero.clientWidth; H = hero.clientHeight; const d = Math.min(devicePixelRatio, 1.5);
      canvas.width = W * d; canvas.height = H * d; g.setTransform(d, 0, 0, d, 0, 0);
      const off = document.createElement("canvas"); off.width = W; off.height = H;
      const og = off.getContext("2d", { willReadFrequently: true })!; const desk = isDesk();
      coverDraw(og, heroImg, W, H, desk ? 0.7 : 0.82, desk ? 0.4 : 0.3);
      const data = og.getImageData(0, 0, W, H).data, step = desk ? 5 : 6;
      edge0 = W * (desk ? 0.5 : 0.25); pts = [];
      for (let y = 0; y < H; y += step) for (let x = edge0; x < W; x += step) {
        const i = ((y | 0) * W + (x | 0)) * 4, l = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
        if (l < 34) continue;
        pts.push({ x, y, c: `rgb(${data[i]},${data[i + 1]},${data[i + 2]})`, s: Math.random(), t: Math.random() });
      }
      if (pts.length > 16000) pts = pts.filter((_, i) => i % Math.ceil(pts.length / 16000) === 0);
      amb = Array.from({ length: desk ? 420 : 160 }, () => ({ x: Math.random() * W * 0.65, y: Math.random() * H, vx: -0.15 - Math.random() * 0.4, vy: (Math.random() - 0.5) * 0.2, r: 0.6 + Math.random() * 1.8, a: 0.25 + Math.random() * 0.6 }));
    };
    const draw = () => {
      const id = requestAnimationFrame(draw); rafs.clear(); rafs.add(id);
      if (!P.vis || !W) return;
      g.clearRect(0, 0, W, H);
      const edge = edgeAt(P.p, W, edge0), T = performance.now() / 1000;
      setMask(edge);
      // ambient stream
      g.fillStyle = "#57EF9D";
      for (const a of amb) {
        a.x += a.vx; a.y += a.vy; if (a.x < -10) { a.x = W * 0.65; a.y = Math.random() * H; }
        const dx = a.x - P.mx, dy = a.y - P.my, dd = dx * dx + dy * dy;
        if (dd < 14400) { const f = (1 - Math.sqrt(dd) / 120) * 6; a.x += (dx / 120) * f; a.y += (dy / 120) * f; }
        g.globalAlpha = a.a; g.fillRect(a.x, a.y, a.r, a.r);
      }
      // released face particles
      {
        for (const q of pts) {
          if (q.x > edge + 40) continue;
          const k = Math.min(1, Math.max(0, (edge - q.x) / (W * 0.55)));
          // released particles keep drifting on their own, so the dissolve feels alive before any scroll
          let x = q.x - k * W * (0.25 + q.s * 0.5) + Math.sin(q.t * 20 + T * 0.9) * k * 10, y = q.y + Math.sin(q.t * 12 + k * 6 + T * 0.7) * k * 90 - k * 40;
          const dx = x - P.mx, dy = y - P.my, dd = dx * dx + dy * dy;
          if (dd < 14400) { const f = (1 - Math.sqrt(dd) / 120) * 40; x += (dx / 120) * f; y += (dy / 120) * f; }
          g.globalAlpha = Math.max(0, 1 - k * 1.1);
          g.fillStyle = k > 0.25 ? "#57EF9D" : q.c;
          const r = 1.2 + q.s * 2.2 * (1 - k * 0.4);
          g.fillRect(x, y, r, r);
        }
      }
      g.globalAlpha = 1;
    };
    ready(heroImg).then(() => { if (!alive) return; build(); draw(); });
    on(window, "resize", () => { build(); halftone(); });
    on(hero, "pointermove", (e) => { const r = hero.getBoundingClientRect(), p = e as PointerEvent; P.mx = p.clientX - r.left; P.my = p.clientY - r.top; });
    on(hero, "pointerleave", () => { P.mx = P.my = -9999; });
    ScrollTrigger.create({ trigger: hero, start: "top top", end: "bottom top", scrub: true, onUpdate: (s) => { P.p = s.progress; }, onToggle: (s) => { P.vis = s.isActive || s.progress < 1; } });
    gsap.to($("[data-h1]"), { yPercent: -30, opacity: 0.2, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    // pointer parallax on floating glass
    const floats = $$("[data-hero] [data-float]").map((el) => ({ el, d: +(el.dataset.depth || 1), x: gsap.quickTo(el, "x", { duration: 1, ease: "power3.out" }), y: gsap.quickTo(el, "y", { duration: 1, ease: "power3.out" }) }));
    if (!reduce) on(hero, "pointermove", (e) => { const p = e as PointerEvent, nx = p.clientX / innerWidth - 0.5, ny = p.clientY / innerHeight - 0.5; floats.forEach((f) => { f.x(nx * -40 * f.d); f.y(ny * -30 * f.d); }); });
    if (!reduce) gsap.to("[data-hero] [data-float]", { y: (i) => -120 - i * 60, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });

    /* ---------- B02 · manifesto word scrub ---------- */
    const man = $("[data-manifesto]");
    const ms = SplitText.create($$("span", man).filter((s) => !s.hasAttribute("data-pill")), { type: "words", wordsClass: "w" }); splits.push(ms);
    const seq = $$(".w, [data-pill]", man);
    gsap.set(ms.words, { opacity: 0.15 }); gsap.set($$("[data-pill]", man), { scale: 0, opacity: 0 });
    const mtl = gsap.timeline({ scrollTrigger: { trigger: man, start: "top 78%", end: "bottom 45%", scrub: 0.6 } });
    seq.forEach((el, i) => mtl.to(el, el.hasAttribute("data-pill") ? { scale: 1, opacity: 1, duration: 1, ease: "back.out(2)" } : { opacity: 1, duration: 1 }, i * 0.5));

    /* ---------- B03 · seal + orbit (pinned) ---------- */
    const sealPin = $("[data-seal-pin]"), disc = $("[data-seal-disc]"), steps = $$("[data-ostep]"), bars = $$("[data-sbar]"), uis = $$("[data-sui]");
    const sNum = $("[data-snum]"), sTitle = $("[data-stitle]"), sDesc = $("[data-sdesc]");
    let active = -1;
    const place = (p: number) => {
      const stage = $("[data-seal] [data-tilt]"), w = stage.clientWidth, h = stage.clientHeight, ry = h * 0.275;
      // keep every orbit label inside the viewport on narrow screens
      const widest = Math.max(...steps.map((el) => el.offsetWidth)), rx = Math.min(w * 0.79, innerWidth / 2 - widest / 2 - 12);
      const ring = $("[data-orbit]"); if (ring) ring.style.width = `${((rx * 2) / w) * 100}%`;
      // touch screens have no pointer tilt, and a flat spin of a ring-shaped seal reads as static —
      // so scroll also tilts it in 3D, making the turn unmistakable
      if (!canHover && disc) gsap.set(disc, { rotateX: Math.sin(p * Math.PI * 2) * 26, rotateY: Math.sin(p * Math.PI * 3 + 0.6) * 34 });
      steps.forEach((el, i) => {
        const a = Math.PI / 2 + (i / 7) * Math.PI * 2 - p * (6 / 7) * Math.PI * 2, sn = Math.sin(a), depth = (sn + 1) / 2;
        gsap.set(el, { x: Math.cos(a) * rx - el.offsetWidth / 2, y: sn * ry - el.offsetHeight / 2, scale: 0.78 + depth * 0.32, zIndex: Math.round(depth * 10), opacity: 0.45 + depth * 0.55 });
      });
      const idx = Math.min(6, Math.round(p * 6));
      if (idx !== active) {
        active = idx;
        steps.forEach((el, i) => el.toggleAttribute("data-on", i === idx)); bars.forEach((el, i) => el.toggleAttribute("data-on", i <= idx)); uis.forEach((el, i) => el.toggleAttribute("data-on", i === idx));
        sNum.textContent = `${String(idx + 1).padStart(2, "0")} / 07`;
        gsap.fromTo([sTitle, sDesc], { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: "power3.out", overwrite: true, onStart: () => { sTitle.textContent = STEP_TEXT[idx][0]; sDesc.textContent = STEP_TEXT[idx][1]; } });
      }
    };
    place(0);
    gsap.timeline({ scrollTrigger: { trigger: sealPin, start: "top top", end: () => `+=${innerHeight * (isDesk() ? 3 : 2.4)}`, pin: true, scrub: 0.8, onUpdate: (s) => place(s.progress), invalidateOnRefresh: true } })
      .fromTo(disc, { rotate: -40 }, { rotate: 320, ease: "none" }, 0);
    gsap.from(disc, { scale: 0.6, opacity: 0, rotateX: 50, duration: 1.6, ease: EASE, scrollTrigger: { trigger: sealPin, start: "top 70%" } });

    /* ---------- 3D tilt (seal + passport) ---------- */
    if (canHover) $$("[data-tilt]").forEach((wrap) => {
      const tgt = (wrap.querySelector("[data-pass]") || wrap.querySelector("[data-seal-disc]")) as HTMLElement;
      const rx = gsap.quickTo(tgt, "rotateX", { duration: 0.8, ease: "power3.out" }), ry = gsap.quickTo(tgt, "rotateY", { duration: 0.8, ease: "power3.out" });
      on(wrap, "pointermove", (e) => { const r = wrap.getBoundingClientRect(), p = e as PointerEvent; ry(((p.clientX - r.left) / r.width - 0.5) * 18); rx(-((p.clientY - r.top) / r.height - 0.5) * 14); });
      on(wrap, "pointerleave", () => { rx(0); ry(0); });
    });

    /* ---------- B04 · landscape + passport ---------- */
    gsap.fromTo("[data-land-img]", { scale: 1.22, yPercent: -6 }, { scale: 1, yPercent: 4, ease: "none", scrollTrigger: { trigger: "[data-land]", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.from("[data-pass]", { y: 140, opacity: 0, rotateX: 28, duration: 1.6, ease: EASE, scrollTrigger: { trigger: "[data-pass]", start: "top 92%" } });
    gsap.to("[data-sheen]", { xPercent: 120, duration: 2.6, ease: "power2.inOut", repeat: -1, repeatDelay: 1.6 });
    gsap.from("[data-marker]", { scale: 0, opacity: 0, duration: 0.9, stagger: 0.2, ease: "back.out(1.8)", scrollTrigger: { trigger: "[data-land]", start: "top 40%" } });

    /* ---------- B05 · bento ---------- */
    gsap.from("[data-bento] > *", { y: 80, opacity: 0, duration: 1.3, stagger: 0.1, ease: EASE, scrollTrigger: { trigger: "[data-bento]", start: "top 80%" } });
    gsap.from("[data-bar]", { scaleY: 0, transformOrigin: "bottom", duration: 1.2, stagger: 0.06, ease: EASE, scrollTrigger: { trigger: "[data-bento]", start: "top 70%" } });
    gsap.from("[data-fill]", { scaleX: 0, duration: 1.6, ease: EASE, scrollTrigger: { trigger: "[data-fill]", start: "top 85%" } });
    gsap.from("[data-reticle]", { scale: 1.4, opacity: 0, duration: 0.8, stagger: 0.18, ease: "back.out(2)", scrollTrigger: { trigger: "[data-bento]", start: "top 60%" } });
    $$<SVGPathElement>("[data-draw]").forEach((p) => { const L = p.getTotalLength(); gsap.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 2, ease: "power2.inOut", scrollTrigger: { trigger: p, start: "top 88%" } }); });

    /* ---------- B06 · consent ---------- */
    const togs = $$("[data-mtog]");
    const ctl = gsap.timeline({ scrollTrigger: { trigger: "[data-consent]", start: "top 55%" } });
    togs.forEach((t) => t.removeAttribute("data-on"));
    togs.forEach((t, i) => ctl.call(() => { if (t.dataset.mtog === "1") t.setAttribute("data-on", ""); }, [], 0.5 + i * 0.28));
    ctl.from("[data-req]", { y: 30, opacity: 0, scale: 0.9, duration: 0.9, ease: "back.out(1.6)" }, 1.6);
    const earn = $("[data-earn]"); const eo = { v: 1520.0 }; ctl.to(eo, { v: 1780.4, duration: 2.4, ease: "power2.out", onUpdate: () => { earn.textContent = "£" + eo.v.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); } }, 0.4);
    const logBox = $("[data-log]"); let clock = 41 * 60 + 7, logOn = false;
    ScrollTrigger.create({ trigger: logBox, start: "top bottom", end: "bottom top", onToggle: (s) => (logOn = s.isActive) });
    timers.push(setInterval(() => {
      if (!logOn) return;
      const last = logBox.lastElementChild as HTMLElement; if (!last) return;
      clock += 3 + Math.floor(Math.random() * 6); const m = Math.floor(clock / 60) % 60, sx = clock % 60;
      const tEl = last.querySelector("span"); if (tEl) tEl.textContent = `09:${String(m).padStart(2, "0")}:${String(sx).padStart(2, "0")}`;
      logBox.prepend(last);
      gsap.fromTo(last, { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: EASE });
      gsap.fromTo([...logBox.children].slice(1), { y: -60 }, { y: 0, duration: 0.7, ease: EASE });
    }, 2400));

    /* ---------- B07 · compare sweep + drag ---------- */
    halftone();
    const cmp = $("[data-compare]"), copy = $("[data-copy]"), line = $("[data-divider]");
    const setX = (pct: number) => { copy.style.clipPath = `inset(0 0 0 ${pct}%)`; line.style.left = `${pct}%`; };
    const sweep = { v: 100 }; setX(100);
    gsap.to(sweep, { v: 50, ease: "none", onUpdate: () => setX(sweep.v), scrollTrigger: { trigger: cmp, start: "top 75%", end: "center 45%", scrub: 0.6 } });
    gsap.from("[data-readout]", { y: 40, opacity: 0, duration: 1, ease: EASE, scrollTrigger: { trigger: cmp, start: "center 60%" } });
    let dragging = false;
    const dragTo = (e: Event) => { const r = cmp.getBoundingClientRect(), p = e as PointerEvent; setX(Math.max(4, Math.min(96, ((p.clientX - r.left) / r.width) * 100))); };
    on(cmp, "pointerdown", (e) => { dragging = true; dragTo(e); });
    on(window, "pointermove", (e) => { if (dragging) dragTo(e); });
    on(window, "pointerup", () => { dragging = false; });

    /* ---------- B08 · case ---------- */
    const big = $("[data-case] [data-count]"); const bo = { v: 0 }; fmt(big, 0);
    const caseTl = gsap.timeline({ scrollTrigger: { trigger: "[data-case]", start: "top 65%" } });
    caseTl.to(bo, { v: 340, duration: 2.4, ease: "power3.out", onUpdate: () => fmt(big, bo.v) })
      .from("[data-beam]", { scaleX: 0, duration: 2.4, ease: "power2.inOut" }, 0.3)
      .from("[data-tdot]", { scale: 0, duration: 0.6, stagger: 0.5, ease: "back.out(3)" }, 0.6)
      .from("[data-event]", { y: 40, opacity: 0, duration: 0.9, stagger: 0.25, ease: EASE }, 0.6);

    /* ---------- B09 · coverflow ---------- */
    const flow = $("[data-flow]"), cards = $$("[data-card]"), fIdx = $("[data-findex]"); const F = { pos: 2 };
    const layout = () => {
      const gap = isDesk() ? 270 : 170;
      cards.forEach((c, i) => { const o = i - F.pos, a = Math.abs(o);
        gsap.set(c, { x: o * gap, z: -a * 160, rotateY: -o * 22, scale: 1 - Math.min(a, 2) * 0.08, opacity: 1 - Math.min(a, 2) * 0.32, zIndex: 10 - Math.round(a * 2) }); });
      fIdx.textContent = `${String(Math.round(F.pos) + 1).padStart(2, "0")} / 04`;
    };
    layout();
    const snap = (to: number) => gsap.to(F, { pos: Math.max(0, Math.min(cards.length - 1, to)), duration: 0.9, ease: "expo.out", onUpdate: layout, overwrite: true });
    let sx0 = 0, p0 = 0, down = false, moved = 0;
    on(flow, "pointerdown", (e) => { const p = e as PointerEvent; down = true; moved = 0; sx0 = p.clientX; p0 = F.pos; gsap.killTweensOf(F); });
    on(window, "pointermove", (e) => { if (!down) return; const p = e as PointerEvent; moved = Math.abs(p.clientX - sx0); F.pos = Math.max(-0.4, Math.min(cards.length - 0.6, p0 - (p.clientX - sx0) / (isDesk() ? 270 : 170))); layout(); });
    on(window, "pointerup", () => { if (!down) return; down = false; snap(Math.round(F.pos)); });
    cards.forEach((c) => on(c, "click", (e) => { if (moved > 6) e.preventDefault(); }));
    on($("[data-prev]"), "click", () => snap(Math.round(F.pos) - 1));
    on($("[data-next]"), "click", () => snap(Math.round(F.pos) + 1));
    gsap.from(F, { pos: -1.2, duration: 2, ease: "expo.out", onUpdate: layout, scrollTrigger: { trigger: flow, start: "top 80%" } });

    /* ---------- B10 · chaos → control ---------- */
    const knob = $("[data-knob]");
    gsap.set(knob, { x: 0 }); gsap.set("[data-crow]", { opacity: 0.12, x: -20 });
    mm.add("(min-width: 761px)", () => {
      const t = gsap.timeline({ scrollTrigger: { trigger: "[data-cc-pin]", start: "top top", end: "+=130%", pin: true, scrub: 0.8 } });
      t.to(knob, { x: 68, duration: 1, ease: "power2.inOut" }, 0.2)
        .to("[data-note]", { y: () => 300 + Math.random() * 200, rotate: () => (Math.random() - 0.5) * 50, opacity: 0, filter: "blur(8px)", duration: 1.4, stagger: 0.12, ease: "power2.in" }, 0.4)
        .to("[data-crow]", { opacity: 1, x: 0, duration: 0.8, stagger: 0.18, ease: "power2.out" }, 0.8);
    });
    mm.add("(max-width: 760px)", () => {
      // phones: no pin — the switch flips from Without to With, each problem straightens, greys out and is struck through,
      // and the With TrueRights list lights up. Nothing disappears, so the section never reads as an empty box.
      const travel = () => { const sw = knob.parentElement!; return sw.clientWidth - knob.offsetWidth - 12; };
      const t = gsap.timeline({ scrollTrigger: { trigger: "[data-cc]", start: "top 45%", end: "bottom 75%", scrub: 0.6, invalidateOnRefresh: true } });
      t.to(knob, { x: travel, duration: 1, ease: "power2.inOut" }, 0)
        .to("[data-note]", { rotate: 0, opacity: 0.42, filter: "grayscale(1)", scale: 0.97, duration: 1, stagger: 0.15, ease: "power2.out" }, 0.1)
        .to("[data-note] b", { backgroundSize: "100% 1.5px", duration: 0.8, stagger: 0.15, ease: "power2.inOut" }, 0.2)
        .to("[data-crow]", { opacity: 1, x: 0, duration: 0.8, stagger: 0.14, ease: "power2.out" }, 0.6);
    });

    /* ---------- B11 · CTA ---------- */
    gsap.fromTo("[data-cta-seal]", { rotate: -120, scale: 0.55, opacity: 0, rotateX: 60 }, { rotate: 0, scale: 1, opacity: 1, rotateX: 0, ease: "none", scrollTrigger: { trigger: "[data-cta]", start: "top bottom", end: "center center", scrub: 0.8 } });
    $$("[data-cta] [data-from]").forEach((el) => gsap.fromTo(el, { xPercent: +el.dataset.from! * 40, opacity: 0 }, { xPercent: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: "[data-cta]", start: "top 85%", end: "center 60%", scrub: 0.6 } }));

    /* ---------- B12 · wordmark ---------- */
    gsap.fromTo("[data-wordmark]", { clipPath: "inset(0% 0% 100% 0%)", yPercent: 40, filter: "blur(10px)" }, { clipPath: "inset(-10% -2% -10% -2%)", yPercent: 0, filter: "blur(0px)", duration: 1.6, ease: EASE, clearProps: "clipPath,filter", scrollTrigger: { trigger: "[data-wordmark]", start: "top 98%" } });
  }, root);

  return () => {
    alive = false;
    rafs.forEach((id) => cancelAnimationFrame(id));
    timers.forEach(clearInterval); clearTimeout(refreshT);
    listeners.forEach(([el, ev, fn, o]) => el.removeEventListener(ev, fn, o));
    splits.forEach((s) => s.revert());
    mm.revert(); ctx.revert();
    gsap.ticker.remove(tick); lenis?.destroy();
    root.querySelector<HTMLElement>("[data-orbit]")?.style.removeProperty("width");
    root.querySelector<HTMLElement>("[data-hero-img]")?.style.removeProperty("mask-image");
    root.querySelector<HTMLElement>("[data-hero-img]")?.style.removeProperty("-webkit-mask-image");
  };
}
