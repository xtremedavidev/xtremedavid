import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText);

// Order the doctor "says" things in the chart chapter → statuses applied to teeth.
const CHART_STEPS: [number[], string][] = [[[18, 28], "O"], [[46], "P"], [[26], "K"], [[36], "C"]];

export function initUnumMotion(root: HTMLElement): () => void {
  const $ = <T extends Element = HTMLElement>(sel: string, r: ParentNode = root) => r.querySelector<T>(sel)!;
  const $$ = <T extends Element = HTMLElement>(sel: string, r: ParentNode = root) => [...r.querySelectorAll<T>(sel)];
  const splits: SplitText[] = [];
  const intervals: ReturnType<typeof setInterval>[] = [];
  const listeners: Array<[EventTarget, string, EventListener]> = [];
  const on = (el: EventTarget, ev: string, fn: EventListener) => { el.addEventListener(ev, fn); listeners.push([el, ev, fn]); };
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const teeth = new Map<number, Element>($$("[data-chart] [data-tooth]").map((g) => [+g.getAttribute("data-tooth")!, g]));
  const setTeeth = (upto: number) => { teeth.forEach((g) => g.removeAttribute("data-st")); CHART_STEPS.slice(0, upto).forEach(([ns, st]) => ns.forEach((n) => teeth.get(n)?.setAttribute("data-st", st))); };

  if (reduce) {
    setTeeth(4);
    $$("[data-hghost]").forEach((g) => g.remove());
    $$("[data-tline]").forEach((l) => l.setAttribute("data-on", ""));
    $$("[data-vfield]").forEach((l) => l.setAttribute("data-on", ""));
    $("[data-pcard='1']").setAttribute("data-on", "");
    return () => {};
  }

  const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  const raf = (t: number) => lenis.raf(t * 1000);
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);

  const mm = gsap.matchMedia();
  const ctx = gsap.context(() => {
    const EASE = "expo.out";
    const nav = $("[data-nav]");

    $$<HTMLAnchorElement>('a[href^="#"]').forEach((a) => on(a, "click", (e) => { const id = a.getAttribute("href"); if (!id || id.length < 2) return; const t = root.querySelector<HTMLElement>(id); if (!t) return; e.preventDefault(); lenis.scrollTo(t, { offset: -60, duration: 1.6 }); }));
    gsap.to("[data-progress]", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
    ScrollTrigger.create({ start: "top -80", end: "max", onUpdate(self) { gsap.to(nav, { yPercent: self.direction === 1 && self.scroll() > 700 ? -130 : 0, duration: 0.6, ease: "power3.out", overwrite: "auto" }); } });
    $$("[data-dark]").forEach((sec) => ScrollTrigger.create({ trigger: sec, start: "top 64", end: "bottom 64", onToggle: (s) => nav.toggleAttribute("data-dark", s.isActive) }));
    $$("[data-magnetic]").forEach((el) => { const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" }), yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
      on(el, "pointermove", (e) => { const r = el.getBoundingClientRect(), p = e as PointerEvent; xTo((p.clientX - r.left - r.width / 2) * 0.22); yTo((p.clientY - r.top - r.height / 2) * 0.3); });
      on(el, "pointerleave", () => { xTo(0); yTo(0); }); });

    const lines = (el: Element, vars: gsap.TweenVars) => { const sp = SplitText.create([...el.children] as HTMLElement[], { type: "lines", mask: "lines" }); splits.push(sp); return gsap.from(sp.lines, { yPercent: 110, duration: 1.2, stagger: 0.08, ease: EASE, ...vars }); };
    const heroH = $("[data-hero] [data-lines]");
    $$("[data-lines]").forEach((el) => { if (el !== heroH) lines(el, { scrollTrigger: { trigger: el, start: "top 85%" } }); });
    $$("[data-stamp]").forEach((el) => { if (el.closest("[data-hero]")) return; gsap.from(el, { y: 16, opacity: 0, scale: 0.9, duration: 0.9, ease: "back.out(1.6)", scrollTrigger: { trigger: el, start: "top 88%" } }); });
    $$("[data-rise]").forEach((el) => { if (el.closest("[data-hero]")) return; gsap.from(el, { y: 26, opacity: 0, duration: 1, ease: EASE, scrollTrigger: { trigger: el, start: "top 90%" } }); });

    /* ---------- 01 HERO: the record fills itself while she talks ---------- */
    const fields = $$("[data-hfield]");
    gsap.set(fields, { opacity: 0, y: 14 });
    gsap.set("[data-hcheck]", { scale: 0 });
    gsap.set("[data-aichip]", { opacity: 0, y: 20 });
    const qs = SplitText.create("[data-quote]", { type: "words" }); splits.push(qs);
    gsap.set(qs.words, { opacity: 0.18 });
    const intro = gsap.timeline({ delay: 0.1 });
    intro.from(nav.children, { y: -16, opacity: 0, duration: 0.9, stagger: 0.05, ease: EASE })
      .from("[data-hero] [data-stamp]", { y: 16, opacity: 0, scale: 0.9, duration: 0.9, ease: "back.out(1.6)" }, 0.1)
      .add(lines(heroH, { duration: 1.4, stagger: 0.14 }), 0.2)
      .from("[data-hero] [data-rise]", { y: 24, opacity: 0, duration: 1, stagger: 0.08, ease: EASE }, 0.55)
      .from("[data-stage]", { clipPath: "inset(18% 12% 0% 12% round 28px)", duration: 1.6, ease: "expo.inOut" }, 0.6)
      .from("[data-stage-img]", { scale: 1.2, duration: 2, ease: EASE }, 0.6)
      .from("[data-dict]", { y: 40, opacity: 0, duration: 1, ease: EASE }, 1.6)
      .from("[data-mcard]", { x: 60, opacity: 0, duration: 1.1, ease: EASE }, 1.7)
      .to(qs.words, { opacity: 1, duration: 0.25, stagger: 0.09, ease: "none" }, 2.0);
    fields.forEach((f, i) => {
      const at = 2.2 + i * 0.75, val = $("[data-hval]", f), ghost = $("[data-hghost]", f);
      const sp = SplitText.create(val, { type: "words,chars" }); splits.push(sp);
      gsap.set(sp.chars, { opacity: 0 });
      intro.to(f, { opacity: 1, y: 0, duration: 0.6, ease: EASE }, at)
        .to(ghost, { opacity: 1, duration: 0.2 }, at)
        .to(ghost, { opacity: 0, duration: 0.2 }, at + 0.3)
        .to(sp.chars, { opacity: 1, duration: 0.01, stagger: 0.012 }, at + 0.3)
        .to($("[data-hcheck]", f), { scale: 1, duration: 0.5, ease: "back.out(2.5)" }, at + 0.55);
    });
    intro.to("[data-aichip]", { opacity: 1, y: 0, duration: 0.8, ease: EASE }, 5.4);
    // waveform keeps breathing while the hero is on screen
    const bars = $$<SVGRectElement>("[data-wave] [data-bar]");
    const waveTl = gsap.to(bars, { scaleY: () => 0.25 + Math.random() * 0.9, duration: 0.18, ease: "sine.inOut", stagger: { each: 0.01, from: "random", repeat: -1, yoyo: true, repeatRefresh: true } });
    let sec = 42; const clock = $("[data-clock]");
    intervals.push(setInterval(() => { sec = (sec + 1) % 60; clock.textContent = String(sec).padStart(2, "0"); }, 1000));
    ScrollTrigger.create({ trigger: "[data-stage]", start: "top bottom", end: "bottom top", onToggle: (s) => (s.isActive ? waveTl.resume() : waveTl.pause()) });
    gsap.to("[data-stage-img]", { yPercent: 8, ease: "none", scrollTrigger: { trigger: "[data-stage]", start: "top 30%", end: "bottom top", scrub: true } });

    /* ---------- 02 PROBLEM ---------- */
    const two = $("[data-two]"); const o2 = { v: 0 };
    gsap.timeline({ scrollTrigger: { trigger: "[data-big]", start: "top 80%" } })
      .from("[data-big]", { y: 40, opacity: 0, duration: 1.2, ease: EASE })
      .to(o2, { v: 2, duration: 1.4, ease: "power3.out", onUpdate: () => { two.textContent = o2.v < 1.95 ? o2.v.toFixed(1).replace(".", root.lang === "ru" ? "," : ".") : "2"; } }, 0.1)
      .from("[data-bar-a]", { scaleX: 0, duration: 1.2, ease: "expo.out" }, 0.5)
      .from("[data-bar-b]", { scaleX: 0, duration: 1.8, ease: "expo.out" }, 0.7);

    /* ---------- 03 VOICE → CARD (pinned) ---------- */
    const tls = $$("[data-tline]"), flows = $$<SVGPathElement>("[data-flow]"), vfields = $$("[data-vfield]");
    flows.forEach((p) => { const L = p.getTotalLength(); gsap.set(p, { strokeDasharray: `${L}`, strokeDashoffset: L }); });
    const vsplits = vfields.map((f) => { const sp = SplitText.create($("[data-vval]", f), { type: "words" }); splits.push(sp); gsap.set(sp.words, { opacity: 0 }); return sp; });
    const shown = new Set<number>();
    const voiceStep = (k: number) => { tls.forEach((l, i) => l.toggleAttribute("data-on", i < k));
      for (let i = 0; i < k; i++) { const f = +tls[i].getAttribute("data-tline")!; if (!shown.has(f)) { shown.add(f); vfields[f].setAttribute("data-on", ""); gsap.to(vsplits[f].words, { opacity: 1, duration: 0.3, stagger: 0.04 }); } } };
    mm.add("(min-width: 1101px)", () => {
      const vt = gsap.timeline({ scrollTrigger: { trigger: "[data-voice-pin]", start: "top top", end: "+=180%", pin: true, scrub: 1, anticipatePin: 1, onUpdate: (s) => voiceStep(Math.round(s.progress * 7.4)) } });
      flows.forEach((p, i) => vt.to(p, { strokeDashoffset: 0, duration: 0.6, ease: "power1.inOut" }, i * 0.9));
    });
    mm.add("(max-width: 1100px)", () => {
      tls.forEach((l, i) => ScrollTrigger.create({ trigger: l, start: "top 75%", once: true, onEnter: () => voiceStep(i + 1) }));
    });

    /* ---------- 04 DENTAL CHART (pinned, statuses follow the speech) ---------- */
    const toothGs = $$<SVGGElement>("[data-chart] [data-tooth]"), says = $$("[data-say]");
    gsap.from(toothGs, { opacity: 0, scale: 0.6, transformOrigin: "50% 50%", duration: 0.7, ease: "back.out(1.6)", stagger: { each: 0.025, from: "center" }, scrollTrigger: { trigger: "[data-chart]", start: "top 80%" } });
    let chartAt = -1;
    const sayStep = (k: number) => { if (k === chartAt) return; chartAt = k; setTeeth(k); says.forEach((s, i) => gsap.to(s, { opacity: i === k - 1 ? 1 : 0, y: i === k - 1 ? 0 : 10, duration: 0.4, overwrite: true })); };
    ScrollTrigger.create({ trigger: "[data-chart-pin]", start: "top top", end: "+=160%", pin: true, scrub: true, anticipatePin: 1, onUpdate: (s) => sayStep(Math.min(4, Math.floor(s.progress * 5))) });

    /* ---------- 05 DIAGNOSIS ---------- */
    const conf = $("[data-conf]"), oc = { v: 0 };
    gsap.timeline({ scrollTrigger: { trigger: "[data-dcard]", start: "top 70%" } })
      .from("[data-dcard]", { y: 60, opacity: 0, duration: 1.1, ease: EASE })
      .from("[data-conf-bar]", { scaleX: 0, duration: 1.4, ease: "expo.out" }, 0.4)
      .to(oc, { v: 93, duration: 1.4, ease: "expo.out", onUpdate: () => { conf.textContent = String(Math.round(oc.v)); } }, 0.4)
      .from("[data-alt], [data-why]", { x: -12, opacity: 0, stagger: 0.08, duration: 0.6, ease: EASE }, 0.7)
      .to("[data-confirm]", { scale: 0.96, duration: 0.15, yoyo: true, repeat: 1 }, 2.1)
      .to("[data-confirmed]", { yPercent: -100, duration: 0.5, ease: "power3.out" }, 2.3);
    gsap.from("[data-dphoto]", { clipPath: "inset(100% 0 0 0 round 24px)", duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: "[data-dphoto]", start: "top 80%" } });

    /* ---------- 06 PLAN ---------- */
    const pcards = $$("[data-pcard]");
    gsap.timeline({ scrollTrigger: { trigger: "[data-plans]", start: "top 75%" } })
      .from(pcards, { y: 60, opacity: 0, duration: 1, stagger: 0.12, ease: EASE })
      .add(() => $$("[data-total]").forEach((el) => { const to = +el.dataset.total!, o = { v: 0 }; gsap.to(o, { v: to, duration: 1.2, ease: "power3.out", onUpdate: () => { el.textContent = Math.round(o.v / 100) * 100 >= to ? to.toLocaleString("ru-RU") : (Math.round(o.v / 100) * 100).toLocaleString("ru-RU"); } }); }), 0.4)
      .add(() => pcards[0].setAttribute("data-on", ""), 1.2)
      .add(() => { pcards[0].removeAttribute("data-on"); pcards[1].setAttribute("data-on", ""); }, 1.9);
    const sig = $<SVGPathElement>("[data-sig]"); const SL = sig.getTotalLength(); gsap.set(sig, { strokeDasharray: SL, strokeDashoffset: SL });
    gsap.timeline({ scrollTrigger: { trigger: "[data-sign]", start: "top 70%" } })
      .from("[data-sign]", { clipPath: "inset(10% 6% 10% 6% round 28px)", duration: 1.4, ease: "expo.inOut" })
      .from("[data-signcard]", { y: 40, opacity: 0, duration: 0.9, ease: EASE }, 0.6)
      .to(sig, { strokeDashoffset: 0, duration: 1.4, ease: "power1.inOut" }, 1.0)
      .from("[data-signed]", { scale: 0.85, opacity: 0, duration: 0.6, ease: "back.out(2)" }, 2.3);
    gsap.to("[data-sign-img]", { yPercent: 10, ease: "none", scrollTrigger: { trigger: "[data-sign]", start: "top bottom", end: "bottom top", scrub: true } });

    /* ---------- 07 HISTORY ---------- */
    gsap.timeline({ scrollTrigger: { trigger: "[data-hcard]", start: "top 70%" } })
      .from("[data-hcard]", { y: 50, opacity: 0, duration: 1, ease: EASE })
      .to("[data-tl-fill]", { scaleX: 1, duration: 1.6, ease: "power2.inOut" }, 0.3)
      .from("[data-tl-ev]", { y: 12, opacity: 0, stagger: 0.25, duration: 0.6, ease: EASE }, 0.3)
      .to("[data-scan]", { xPercent: 680, duration: 1.8, ease: "power1.inOut" }, 0.8)
      .from("[data-mark]", { scale: 0.6, opacity: 0, stagger: 0.18, duration: 0.6, ease: "back.out(2)" }, 1.6)
      .from("[data-doc]", { x: 30, opacity: 0, stagger: 0.1, duration: 0.7, ease: EASE }, 0.6);

    /* ---------- 08 SECURITY: live audit log ---------- */
    gsap.from("[data-space]", { y: 30, opacity: 0, stagger: 0.1, duration: 0.9, ease: EASE, scrollTrigger: { trigger: "[data-iso]", start: "top 75%" } });
    gsap.from("[data-iso] [data-pt]", { scale: 0, stagger: { each: 0.015, from: "random" }, duration: 0.4, ease: "back.out(2)", scrollTrigger: { trigger: "[data-iso]", start: "top 70%" } });
    gsap.to("[data-lock]", { scale: 1.08, duration: 1.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
    const rowsBox = $("[data-log-rows]");
    gsap.from("[data-row]", { y: 20, opacity: 0, stagger: 0.08, duration: 0.7, ease: EASE, scrollTrigger: { trigger: rowsBox, start: "top 75%" } });
    let logOn = false; let tick = 0;
    ScrollTrigger.create({ trigger: rowsBox, start: "top 85%", end: "bottom top", onToggle: (s) => { logOn = s.isActive; } });
    intervals.push(setInterval(() => {
      if (!logOn) return; const rows = $$("[data-row]", rowsBox); const last = rows[rows.length - 1];
      rows.forEach((r) => r.removeAttribute("data-on"));
      const time = last.firstElementChild as HTMLElement; tick += 7; const d = new Date(2026, 9, 23, 9, 24, 12 + tick);
      time.textContent = d.toTimeString().slice(0, 8);
      rowsBox.prepend(last); last.setAttribute("data-on", "");
      gsap.fromTo(last, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, ease: EASE });
    }, 2600));

    /* ---------- 09 SPECIALTIES: rows drift in opposite directions with scroll ---------- */
    $$("[data-marq]").forEach((tr, i) => gsap.fromTo(tr, { xPercent: i ? -30 : -5 }, { xPercent: i ? -5 : -30, ease: "none", scrollTrigger: { trigger: tr, start: "top bottom", end: "bottom top", scrub: 1 } }));

    /* ---------- 10 FOCUS ---------- */
    gsap.from("[data-focus-img]", { clipPath: "inset(0 0 100% 0 round 28px)", duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: "[data-focus-img]", start: "top 80%" } });
    gsap.to("[data-focus-img] img", { yPercent: -10, ease: "none", scrollTrigger: { trigger: "[data-focus-img]", start: "top bottom", end: "bottom top", scrub: true } });

    /* ---------- 11 CTA + FOOTER ---------- */
    gsap.from("[data-cta]", { clipPath: "inset(12% 8% 12% 8% round 32px)", duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: "[data-cta]", start: "top 85%" } });
    gsap.to("[data-cta-img]", { yPercent: 8, ease: "none", scrollTrigger: { trigger: "[data-cta]", start: "top bottom", end: "bottom top", scrub: true } });
    const wm = SplitText.create("[data-wordmark]", { type: "chars" }); splits.push(wm);
    gsap.from(wm.chars, { yPercent: 100, opacity: 0, stagger: 0.04, duration: 1, ease: EASE, scrollTrigger: { trigger: "[data-wordmark]", start: "top 90%" } });

    gsap.from("[data-badge]", { y: 80, opacity: 0, duration: 1, ease: EASE, delay: 3 });
  }, root);

  const onLoad = () => ScrollTrigger.refresh();
  window.addEventListener("load", onLoad);
  let refreshT: ReturnType<typeof setTimeout> | undefined;
  const queueRefresh = () => { clearTimeout(refreshT); refreshT = setTimeout(() => ScrollTrigger.refresh(), 150); };
  $$<HTMLImageElement>("img").forEach((img) => { if (!img.complete) on(img, "load", queueRefresh); });

  return () => {
    listeners.forEach(([el, ev, fn]) => el.removeEventListener(ev, fn));
    window.removeEventListener("load", onLoad);
    intervals.forEach((i) => clearInterval(i));
    clearTimeout(refreshT);
    splits.forEach((sp) => sp.revert());
    mm.revert();
    ctx.revert();
    gsap.ticker.remove(raf);
    lenis.destroy();
  };
}
