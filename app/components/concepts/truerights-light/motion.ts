import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText);

/** Where the steps become swipeable cards instead of the pinned stage (keep in sync with light.module.css). */
const STEP_CARDS = "(max-width: 1024px), (pointer: coarse), (max-height: 700px)";
const STEP_PIN = "(min-width: 1025px) and (min-height: 701px) and (pointer: fine)";

const STEP_NAMES = ["Register", "Value", "Deal", "Licence", "Monitor", "Enforce", "Earn"];

/** SplitText masks clip glyphs on tight tracking/line-height (sliced right edges, cut descenders) — give each mask room on the sides and below without moving layout. */
const unclip = (sp: SplitText) => { for (const m of ((sp as unknown as { masks?: HTMLElement[] }).masks || [])) { m.style.padding = "0 0.14em 0.16em"; m.style.margin = "0 -0.14em -0.16em"; } return sp; };

export function initTrueRightsLightMotion(root: HTMLElement): () => void {
  const $ = <T extends Element = HTMLElement>(sel: string, r: ParentNode = root) => r.querySelector<T>(sel);
  const $$ = <T extends Element = HTMLElement>(sel: string, r: ParentNode = root) => [...r.querySelectorAll<T>(sel)];
  const splits: SplitText[] = [];
  const timers: ReturnType<typeof setInterval>[] = [];
  const ctxCleanups: Array<() => void> = [];
  const listeners: Array<[EventTarget, string, EventListener, AddEventListenerOptions?]> = [];
  const on = (el: EventTarget | null, ev: string, fn: EventListener, o?: AddEventListenerOptions) => { if (!el) return; el.addEventListener(ev, fn, o); listeners.push([el, ev, fn, o]); };
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pad = (n: number) => String(n).padStart(2, "0");

  const fmt = (el: HTMLElement, v: number) => {
    const dec = +(el.dataset.dec || 0);
    el.textContent = (el.dataset.prefix || "") + v.toLocaleString("en-GB", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + (el.dataset.suffix || "");
  };

  /* shared state setters (used by both motion and reduced branches) */
  const stepEls = $$("[data-step]"), stepUis = $$("[data-sui]"), stepBars = $$("[data-sbar]");
  let curStep = -1;
  const setStep = (i: number) => {
    if (i === curStep) return; curStep = i;
    stepEls.forEach((el, k) => el.toggleAttribute("data-on", k === i));
    stepUis.forEach((el, k) => el.toggleAttribute("data-on", k === i));
    stepBars.forEach((el, k) => el.toggleAttribute("data-on", k <= i));
    const t = $("[data-stitle]"), n = $("[data-snum]");
    if (t) t.textContent = `Step ${pad(i + 1)} — ${STEP_NAMES[i]}`;
    if (n) n.textContent = `${pad(i + 1)} / ${pad(STEP_NAMES.length)}`;
  };

  const modeBtn = $("[data-mode]"), cvcSec = $("[data-cvc]");
  let without = false, touched = false;
  const setMode = (w: boolean, instant = false) => {
    without = w;
    modeBtn?.setAttribute("data-ready", "");
    modeBtn?.toggleAttribute("data-without", w);
    cvcSec?.toggleAttribute("data-without", w);
    modeBtn?.setAttribute("aria-pressed", String(!w));
    const d = instant ? 0 : 0.75;
    gsap.to("[data-mknob]", { xPercent: w ? 0 : 100, duration: d, ease: "expo.out", overwrite: true });
    const act = w ? "[data-cwo]" : "[data-cwi]", idle = w ? "[data-cwi]" : "[data-cwo]";
    if (window.innerWidth > 760) {
      gsap.to(act, { opacity: 1, scale: 1, duration: d, ease: "power3.out", overwrite: true });
      gsap.to(idle, { opacity: 0.38, scale: 0.97, duration: d, ease: "power3.out", overwrite: true });
    } else gsap.set("[data-cwo], [data-cwi]", { clearProps: "opacity,scale" });
    if (!instant) gsap.fromTo(`${act} p`, { x: w ? -14 : 14 }, { x: 0, duration: 0.6, stagger: 0.04, ease: "power3.out", overwrite: "auto" });
  };
  const panels = $$("[data-panel]"), tabs = $$("[data-tab]");
  const openPanel = (i: number) => {
    panels.forEach((p, k) => p.toggleAttribute("data-open", k === i));
    tabs.forEach((t, k) => t.toggleAttribute("data-on", k === i));
  };
  panels.forEach((p, i) => { on(p, "mouseenter", () => { if (window.innerWidth > 760) openPanel(i); }); on(p, "click", () => openPanel(i)); });
  tabs.forEach((t, i) => on(t, "click", () => openPanel(i)));
  on(modeBtn, "click", () => { touched = true; setMode(!without); });

  /* rail arrows + progress work in every mode */
  const rail = $("[data-rail]"), railbar = $("[data-railbar]");
  const railProgress = () => {
    if (!rail || !railbar) return;
    const max = rail.scrollWidth - rail.clientWidth, vis = rail.clientWidth / rail.scrollWidth;
    gsap.set(railbar, { width: `${Math.max(vis, 0.12) * 100}%`, x: max > 0 ? (rail.scrollLeft / max) * (railbar.parentElement!.clientWidth * (1 - Math.max(vis, 0.12))) : 0 });
  };
  const railStep = (dir: number) => { if (!rail) return; const card = rail.firstElementChild as HTMLElement | null; rail.scrollBy({ left: dir * ((card?.offsetWidth || 400) + 24), behavior: reduce ? "auto" : "smooth" }); };
  on(rail, "scroll", railProgress, { passive: true });
  on($("[data-rprev]"), "click", () => railStep(-1));
  on($("[data-rnext]"), "click", () => railStep(1));
  on(window, "resize", railProgress);
  railProgress();

  if (reduce) {
    setStep(0); setMode(false, true);
    return () => { listeners.forEach(([el, ev, fn, o]) => el.removeEventListener(ev, fn, o)); gsap.killTweensOf(["[data-mknob]", "[data-cwo]", "[data-cwi]"]); gsap.set("[data-mknob], [data-cwo], [data-cwi]", { clearProps: "all" }); modeBtn?.removeAttribute("data-ready"); };
  }

  const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  const tick = (t: number) => lenis.raf(t * 1000);
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  let refreshT: ReturnType<typeof setTimeout> | undefined;
  const queueRefresh = () => { clearTimeout(refreshT); refreshT = setTimeout(() => ScrollTrigger.refresh(), 160); };
  $$<HTMLImageElement>("img").forEach((img) => { if (!img.complete) on(img, "load", queueRefresh, { once: true }); });

  const mm = gsap.matchMedia();
  const ctx = gsap.context(() => {
    const EASE = "expo.out";

    /* ---------- global: progress, nav, anchors, magnetic ---------- */
    gsap.to("[data-progress]", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
    const nav = $("[data-nav]");
    ScrollTrigger.create({ start: 40, end: "max", onToggle: (st) => nav?.toggleAttribute("data-scrolled", st.isActive) });
    $$<HTMLAnchorElement>("a[href^='#']").forEach((a) => on(a, "click", (e) => {
      const t = root.querySelector(a.getAttribute("href")!); if (!t) return;
      e.preventDefault(); lenis.scrollTo(t as HTMLElement, { offset: -20, duration: 1.4 });
      $$("[data-nav] a[data-on]").forEach((x) => x.removeAttribute("data-on")); if (a.closest("[data-nav]")) a.setAttribute("data-on", "");
    }));
    $$("[data-magnetic]").forEach((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" }), yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
      on(el, "pointermove", (e) => { const ev = e as PointerEvent, r = el.getBoundingClientRect(); xTo((ev.clientX - r.left - r.width / 2) * 0.25); yTo((ev.clientY - r.top - r.height / 2) * 0.35); });
      on(el, "pointerleave", () => { xTo(0); yTo(0); });
    });

    /* ---------- generic reveals ---------- */
    const heroRise = new Set($$("[data-hero] [data-rise]"));
    $$("[data-rise]").filter((el) => !heroRise.has(el)).forEach((el) =>
      gsap.from(el, { y: 36, opacity: 0, duration: 1.1, ease: EASE, scrollTrigger: { trigger: el, start: "top 88%" } }));
    $$("[data-lines]").forEach((el) => {
      const sp = unclip(SplitText.create(el, { type: "lines", mask: "lines", linesClass: "tr-line" })); splits.push(sp);
      gsap.from(sp.lines, { yPercent: 110, duration: 1.2, stagger: 0.09, ease: EASE, scrollTrigger: { trigger: el, start: "top 85%" } });
    });
    $$("[data-count]").filter((el) => !el.closest("[data-hero]")).forEach((el) => {
      const o = { v: 0 }, end = +el.dataset.count!; fmt(el, 0);
      gsap.to(o, { v: end, duration: 2, ease: "power3.out", onUpdate: () => fmt(el, o.v), scrollTrigger: { trigger: el, start: "top 90%" } });
    });
    $$<SVGPathElement>("[data-draw]").forEach((p) => {
      const len = p.getTotalLength(); gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(p, { strokeDashoffset: 0, duration: 1.8, ease: "power2.inOut", scrollTrigger: { trigger: p, start: "top 92%" } });
    });

    /* ---------- A01 · hero ---------- */
    const h1 = $("[data-h1]");
    const intro = gsap.timeline({ defaults: { ease: EASE } });
    if (h1) {
      const sp = unclip(SplitText.create(h1, { type: "words", mask: "words" })); splits.push(sp);
      intro.from(sp.words, { yPercent: 115, duration: 1.3, stagger: 0.06 }, 0.15);
    }
    intro.from("[data-facepill]", { scale: 0, rotate: -12, duration: 1.2, ease: "back.out(1.6)" }, 0.55)
      .from("[data-hero] [data-rise]", { y: 30, opacity: 0, duration: 1.1, stagger: 0.08 }, 0.35)
      .from("[data-nav]", { y: -30, opacity: 0, duration: 1 }, 0.1)
      .from("[data-stage]", { y: 120, opacity: 0, scale: 0.94, duration: 1.6 }, 0.6)
      .from("[data-app]", { y: 60, opacity: 0, duration: 1.4 }, 0.9)
      .from("[data-arow]", { x: -20, opacity: 0, duration: 0.8, stagger: 0.07 }, 1.15)
      .from("[data-ebar]", { scaleY: 0, duration: 0.9, stagger: 0.035, ease: "power3.out" }, 1.3)
      .from("[data-hero] [data-float]", { y: 60, opacity: 0, scale: 0.9, duration: 1.2, stagger: 0.12 }, 1.2);
    const earn = $("[data-earn]");
    if (earn) { const o = { v: 0 }; intro.to(o, { v: 1780.4, duration: 2.2, ease: "power3.out", onUpdate: () => { earn.textContent = "£" + o.v.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); } }, 1.2); }
    $$("[data-hero] [data-count]").forEach((el) => { const o = { v: 0 }, end = +el.dataset.count!; fmt(el, 0); intro.to(o, { v: end, duration: 2.2, ease: "power3.out", onUpdate: () => fmt(el, o.v) }, 1.4); });

    mm.add("(min-width: 761px)", () => {
      gsap.fromTo("[data-stage]", { scale: 0.9, borderRadius: 56 }, { scale: 1, borderRadius: 40, ease: "none", scrollTrigger: { trigger: "[data-stage]", start: "top bottom", end: "top 20%", scrub: 0.6 } });
      $$("[data-float]").forEach((el) => gsap.to(el, { y: () => -90 * +(el.dataset.depth || 1), ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: 0.8 } }));
      // idle bob + pointer tilt on hero floats
      const stage = $("[data-stage]");
      const fl = $$("[data-hero] [data-float]");
      fl.forEach((el, i) => gsap.to(el, { rotate: i % 2 ? 1.2 : -1.2, duration: 3 + i, yoyo: true, repeat: -1, ease: "sine.inOut" }));
      const app = $("[data-app]");
      if (stage && app) {
        gsap.set(app, { transformPerspective: 1600 });
        const rx = gsap.quickTo(app, "rotateX", { duration: 0.8, ease: "power3.out" }), ry = gsap.quickTo(app, "rotateY", { duration: 0.8, ease: "power3.out" });
        on(stage, "pointermove", (e) => { const ev = e as PointerEvent, r = stage.getBoundingClientRect(); ry(((ev.clientX - r.left) / r.width - 0.5) * 6); rx(-((ev.clientY - r.top) / r.height - 0.5) * 5); });
        on(stage, "pointerleave", () => { rx(0); ry(0); });
      }
    });

    /* ---------- A02 · locked ---------- */
    const locks = $$("[data-lock]");
    if (locks.length) {
      const t = gsap.timeline({ scrollTrigger: { trigger: "[data-locked]", start: "top 70%" } });
      t.from(locks, { y: 80, opacity: 0, rotate: (i) => (i - 2) * 3, duration: 1.2, stagger: 0.08, ease: EASE });
      locks.forEach((l, i) => {
        const sh = $("[data-shackle]", l);
        if (!sh) return;
        if (i < 4) t.fromTo(sh, { y: -3 }, { y: 0, duration: 0.35, ease: "back.in(3)" }, 0.6 + i * 0.12);
        else t.fromTo(sh, { rotate: 0, transformOrigin: "80% 100%" }, { rotate: 22, duration: 0.6, ease: "elastic.out(1,0.4)" }, 1.2)
          .fromTo(l, { x: 0 }, { x: 6, duration: 0.06, repeat: 5, yoyo: true, ease: "none" }, 1.25);
      });
    }

    /* ---------- A03 · bento ---------- */
    const bento = $("[data-bento]");
    if (bento) {
      gsap.from($$(":scope > *", bento), { y: 60, opacity: 0, duration: 1.2, stagger: 0.08, ease: EASE, scrollTrigger: { trigger: bento, start: "top 80%" } });
      gsap.from("[data-bar]", { scaleY: 0, transformOrigin: "bottom", duration: 1, stagger: 0.06, ease: "power3.out", scrollTrigger: { trigger: bento, start: "top 70%" } });
      gsap.from("[data-ret]", { left: "4%", opacity: 0, duration: 1.4, stagger: 0.15, ease: EASE, scrollTrigger: { trigger: bento, start: "top 70%" } });
      gsap.from("[data-fill]", { scaleX: 0, transformOrigin: "left", duration: 1.6, ease: "power3.out", scrollTrigger: { trigger: "[data-fill]", start: "top 90%" } });
    }

    /* ---------- A04 · steps ---------- */
    setStep(0);
    const strack = $("[data-strack]");
    mm.add(STEP_PIN, () => {
      const n = STEP_NAMES.length;
      ScrollTrigger.create({
        trigger: "[data-steps-pin]", start: "top top", end: () => `+=${window.innerHeight * 2.4}`, pin: true, scrub: true,
        onUpdate: (st) => { setStep(Math.min(n - 1, Math.floor(st.progress * n))); if (strack) gsap.set(strack, { scaleY: 1 / n + st.progress * (1 - 1 / n) }); },
      });
      return () => setStep(0);
    });
    mm.add(STEP_CARDS, () => {
      // touch / narrow / short screens: swipeable step cards — no pin, progress follows the swipe
      const list = $("[data-slist]"), bar = $("[data-smprog]");
      if (!list || !bar) return;
      const n = STEP_NAMES.length;
      const sync = () => { const max = list.scrollWidth - list.clientWidth, p = max > 0 ? list.scrollLeft / max : 0;
        bar.style.transform = `translateX(${p * (n - 1) * 100}%)`; setStep(Math.round(p * (n - 1))); };
      list.addEventListener("scroll", sync, { passive: true }); sync();
      const cards = $$("[data-step]", list);
      const tw = gsap.fromTo(cards, { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 1.1, stagger: 0.08, ease: "expo.out", scrollTrigger: { trigger: list, start: "top 85%" } });
      return () => { list.removeEventListener("scroll", sync); bar.style.removeProperty("transform"); tw.scrollTrigger?.kill(); tw.kill(); gsap.set(cards, { clearProps: "transform,opacity" }); setStep(0); };
    });
    gsap.from("[data-steps] [data-sui]", { scale: 1.04, duration: 1.6, ease: EASE, scrollTrigger: { trigger: "[data-steps]", start: "top 60%" } });

    /* ---------- A05 · switchboard ---------- */
    const consoleEl = $("[data-console]");
    if (consoleEl) {
      gsap.from(consoleEl, { y: 80, opacity: 0, scale: 0.97, duration: 1.4, ease: EASE, scrollTrigger: { trigger: consoleEl, start: "top 85%" } });
      gsap.from("[data-crow]", { x: -24, opacity: 0, duration: 0.9, stagger: 0.07, ease: EASE, scrollTrigger: { trigger: consoleEl, start: "top 70%" } });
      // toggles flick through on enter, then settle to their real state
      const togs = $$("[data-console] [data-tog]");
      ScrollTrigger.create({
        trigger: consoleEl, start: "top 60%", once: true,
        onEnter: () => togs.forEach((t, k) => {
          const end = t.dataset.tog === "1";
          t.toggleAttribute("data-on", !end);
          gsap.delayedCall(0.5 + k * 0.14, () => t.toggleAttribute("data-on", end));
        }),
      });
      // live query log
      const log = $("[data-log]");
      if (log) {
        const order = [...log.children];
        const stamps = order.map((r) => r.querySelector("span")?.textContent || "");
        ctxCleanups.push(() => { order.forEach((r, k) => { log.appendChild(r); const sp = r.querySelector("span"); if (sp) sp.textContent = stamps[k]; (r as HTMLElement).style.removeProperty("opacity"); (r as HTMLElement).style.removeProperty("transform"); }); });
        let live = false;
        ScrollTrigger.create({ trigger: log, start: "top bottom", end: "bottom top", onToggle: (s) => { live = s.isActive; } });
        timers.push(setInterval(() => {
          if (!live || document.hidden) return;
          const last = log.lastElementChild as HTMLElement | null; if (!last) return;
          const ts = last.querySelector<HTMLElement>("span");
          if (ts) { const d = new Date(); ts.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; }
          log.prepend(last);
          gsap.fromTo(last, { opacity: 0, y: -20, backgroundColor: "rgba(87,239,157,.18)" }, { opacity: 1, y: 0, backgroundColor: "rgba(255,255,255,.07)", duration: 0.7, ease: EASE, clearProps: "backgroundColor" });
        }, 2200));
      }
    }

    /* ---------- A06 · detection ---------- */
    const scan = $("[data-scan]");
    if (scan) {
      gsap.from(scan, { clipPath: "inset(12% 12% 12% 12% round 40px)", duration: 1.6, ease: EASE, scrollTrigger: { trigger: scan, start: "top 80%" } });
      gsap.fromTo("[data-scanline]", { top: "8%" }, { top: "88%", duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
      const dots = $$("[data-mesh] circle");
      gsap.from(dots, { scale: 0, transformOrigin: "center", opacity: 0, duration: 0.6, stagger: { each: 0.012, from: "center" }, ease: "back.out(2)", scrollTrigger: { trigger: scan, start: "top 65%" } });
      gsap.to(dots, { opacity: 0.35, duration: 0.9, stagger: { each: 0.02, repeat: -1, yoyo: true, from: "random" }, ease: "sine.inOut", delay: 2 });
      gsap.from("[data-meter]", { scaleX: 0, duration: 2, ease: "power3.out", scrollTrigger: { trigger: "[data-meter]", start: "top 92%" } });
    }
    const track = $("[data-marquee]");
    if (track) {
      [...track.children].forEach((c) => { const cl = c.cloneNode(true) as HTMLElement; cl.setAttribute("aria-hidden", "true"); cl.dataset.clone = ""; track.appendChild(cl); });
      const mq = gsap.to(track, { xPercent: -50, duration: 40, ease: "none", repeat: -1 });
      on(track, "pointerenter", () => gsap.to(mq, { timeScale: 0.15, duration: 0.6 }));
      on(track, "pointerleave", () => gsap.to(mq, { timeScale: 1, duration: 0.6 }));
    }

    /* ---------- A07 · case study ---------- */
    const caseEl = $("[data-case]");
    if (caseEl) {
      const big = $("[data-cbig]");
      const t = gsap.timeline({ scrollTrigger: { trigger: caseEl, start: "top 70%" } });
      if (big) { const o = { v: 0 }; t.to(o, { v: 340, duration: 2.2, ease: "power3.out", onUpdate: () => { big.textContent = `$${Math.round(o.v)}K`; } }, 0); }
      t.from("[data-tline]", { scaleX: 0, duration: 2.2, ease: "power2.inOut" }, 0.2)
        .from("[data-tev]", { opacity: 0, y: (i) => (i % 2 ? -20 : 20), duration: 0.8, stagger: 0.32, ease: EASE }, 0.5);
    }

    /* ---------- A08 · chaos vs control ---------- */
    setMode(true, true);
    ScrollTrigger.create({ trigger: "[data-cvc]", start: "top 35%", once: true, onEnter: () => { if (!touched) setMode(false); } });
    gsap.from("[data-wo], [data-wi]", { y: 20, opacity: 0, duration: 0.9, stagger: 0.05, ease: EASE, scrollTrigger: { trigger: "[data-cvc]", start: "top 75%" } });
    ctxCleanups.push(() => { setMode(false, true); gsap.set("[data-mknob], [data-cwo], [data-cwi]", { clearProps: "all" }); modeBtn?.removeAttribute("data-ready"); });

    /* ---------- A09 · creators rail (drag) ---------- */
    if (rail) {
      gsap.from($$(":scope > *", rail), { x: 120, opacity: 0, duration: 1.3, stagger: 0.08, ease: EASE, scrollTrigger: { trigger: rail, start: "top 85%" } });
      let down = false, sx = 0, sl = 0, moved = 0;
      on(rail, "pointerdown", (e) => { const ev = e as PointerEvent; if (ev.pointerType !== "mouse") return; down = true; moved = 0; sx = ev.clientX; sl = rail.scrollLeft; rail.style.scrollSnapType = "none"; rail.style.cursor = "grabbing"; });
      on(window, "pointermove", (e) => { if (!down) return; const dx = (e as PointerEvent).clientX - sx; moved = Math.abs(dx); rail.scrollLeft = sl - dx; });
      on(window, "pointerup", () => { if (!down) return; down = false; rail.style.removeProperty("scroll-snap-type"); rail.style.removeProperty("cursor"); });
      $$("a", rail).forEach((a) => on(a, "click", (e) => { if (moved > 6) e.preventDefault(); }));
    }

    /* ---------- A10 · panels ---------- */
    const pWrap = $("[data-panels]");
    if (pWrap) gsap.from(panels, { y: 80, opacity: 0, duration: 1.3, stagger: 0.1, ease: EASE, scrollTrigger: { trigger: pWrap, start: "top 80%" } });

    /* ---------- A11 · API code typing ---------- */
    const code = $("[data-code]");
    if (code) {
      gsap.from(code, { y: 80, rotateX: 12, transformPerspective: 1400, opacity: 0, duration: 1.5, ease: EASE, scrollTrigger: { trigger: code, start: "top 85%" } });
      const req = $("[data-type]", code), json = $("[data-json]", code);
      const full = req?.textContent || "";
      const lines = json ? [...json.children] as HTMLElement[] : [];
      if (req) req.textContent = "";
      gsap.set(lines, { opacity: 0, x: -8 });
      const o = { n: 0 };
      const t = gsap.timeline({ scrollTrigger: { trigger: code, start: "top 65%" } });
      t.to(o, { n: full.length, duration: full.length * 0.022, ease: "none", onUpdate: () => { if (req) req.textContent = full.slice(0, Math.round(o.n)); } })
        .to(lines, { opacity: 1, x: 0, duration: 0.35, stagger: 0.07, ease: "power2.out" }, "+=0.25");
      ctxCleanups.push(() => { if (req) req.textContent = full; });
    }

    /* ---------- A12 · quote word scrub ---------- */
    const q = $("[data-quote]");
    if (q) {
      const sp = SplitText.create(q, { type: "words" }); splits.push(sp);
      gsap.fromTo(sp.words, { opacity: 0.14 }, { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: q, start: "top 80%", end: "bottom 45%", scrub: 0.6 } });
    }

    /* ---------- A14 · CTA ---------- */
    const cta = $("[data-cta]");
    if (cta) {
      gsap.fromTo(cta, { scale: 0.92, borderRadius: 80 }, { scale: 1, borderRadius: 40, ease: "none", scrollTrigger: { trigger: cta, start: "top bottom", end: "top 30%", scrub: 0.6 } });
      gsap.from($$("h2 > span", cta), { yPercent: 60, opacity: 0, duration: 1.3, stagger: 0.1, ease: EASE, scrollTrigger: { trigger: cta, start: "top 65%" } });
      gsap.from($$("[data-float]", cta), { scale: 0.6, opacity: 0, duration: 1.2, stagger: 0.15, ease: "back.out(1.6)", scrollTrigger: { trigger: cta, start: "top 55%" } });
    }

    /* ---------- A15 · wordmark ---------- */
    const wmEl = $("[data-wordmark]");
    if (wmEl) {
      const wm = unclip(SplitText.create(wmEl, { type: "chars", mask: "chars" })); splits.push(wm);
      gsap.from(wm.chars, { yPercent: 105, duration: 1.4, stagger: 0.05, ease: EASE, scrollTrigger: { trigger: wmEl, start: "top 95%" } });
    }
  }, root);

  return () => {
    timers.forEach(clearInterval); clearTimeout(refreshT);
    listeners.forEach(([el, ev, fn, o]) => el.removeEventListener(ev, fn, o));
    splits.forEach((s) => s.revert());
    mm.revert(); ctx.revert();
    ctxCleanups.forEach((f) => f());
    $$("[data-marquee] [data-clone]").forEach((n) => n.remove());
    root.querySelector("[data-nav]")?.removeAttribute("data-scrolled");
    gsap.ticker.remove(tick); lenis.destroy();
  };
}

