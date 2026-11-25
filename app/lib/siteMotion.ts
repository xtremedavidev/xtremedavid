/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Shared motion for the home page and /concepts:
 * Lenis smooth scroll, custom cursor (event-delegated so it works on
 * elements rendered after init), scroll progress bar, [data-reveal]
 * reveals, light/dark surface tracking for the cursor + navbar, and
 * (optionally) the Three.js hero particle field.
 */
import { initHeroScene } from "./heroScene";

export function initSiteMotion(opts: { hero?: boolean } = {}): () => void {
  const w = window as any;
  const gsap = w.gsap;
  const ScrollTrigger = w.ScrollTrigger;
  const Lenis = w.Lenis;
  const cleanups: (() => void)[] = [];

  /* ---- Reveal on scroll (no GSAP dependency) ---- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).dataset.reveal = "in";
          io.unobserve(e.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );
  const observeReveals = () =>
    document.querySelectorAll<HTMLElement>('[data-reveal=""]').forEach((el) => io.observe(el));
  observeReveals();
  const mo = new MutationObserver(observeReveals);
  mo.observe(document.body, { childList: true, subtree: true });
  cleanups.push(() => {
    io.disconnect();
    mo.disconnect();
  });

  /* ---- Surface tracking: body[data-surface] = light | dark ---- */
  const surfaces = document.querySelectorAll<HTMLElement>("[data-surface]");
  const sio = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) document.body.dataset.surface = (e.target as HTMLElement).dataset.surface;
      });
    },
    { rootMargin: "-48% 0px -48% 0px" }
  );
  surfaces.forEach((el) => sio.observe(el));
  cleanups.push(() => {
    sio.disconnect();
    delete document.body.dataset.surface;
  });

  if (!gsap) return () => cleanups.forEach((f) => f());

  /* ---- Lenis ---- */
  if (Lenis) {
    const lenis = new Lenis({ duration: 1.1, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    w.__lenis = lenis;
    if (ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      lenis.on("scroll", ScrollTrigger.update);
    }
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Smooth in-page anchor links
    const onAnchor = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const target = document.querySelector(a.getAttribute("href")!);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -64 });
    };
    document.addEventListener("click", onAnchor);

    cleanups.push(() => {
      document.removeEventListener("click", onAnchor);
      gsap.ticker.remove(tick);
      lenis.destroy();
      w.__lenis = undefined;
    });
  }

  /* ---- Progress bar ---- */
  const bar = document.getElementById("progress-bar");
  if (bar) {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    cleanups.push(() => removeEventListener("scroll", onScroll));
  }

  /* ---- Cursor (delegated) ---- */
  const dot = document.getElementById("cursor-dot");
  const ring = document.getElementById("cursor-ring");
  if (dot && ring && matchMedia("(pointer: fine)").matches) {
    const onMove = (e: MouseEvent) => {
      gsap.set(dot, { x: e.clientX, y: e.clientY });
      gsap.to(ring, { x: e.clientX, y: e.clientY, duration: 0.35, ease: "power2.out" });
    };
    const hoverSel = 'a, button, label, input, [data-cursor="hover"]';
    const onOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest?.(hoverSel)) {
        gsap.to(ring, { scale: 2.2, opacity: 0.35, duration: 0.3 });
        gsap.to(dot, { scale: 1.4, duration: 0.3 });
      }
    };
    const onOut = (e: MouseEvent) => {
      const from = (e.target as HTMLElement).closest?.(hoverSel);
      const to = (e.relatedTarget as HTMLElement | null)?.closest?.(hoverSel);
      if (from && from !== to) {
        gsap.to(ring, { scale: 1, opacity: 0.6, duration: 0.3 });
        gsap.to(dot, { scale: 1, duration: 0.3 });
      }
    };
    const onDown = () => gsap.to([dot, ring], { scale: 0.8, duration: 0.1 });
    const onUp = () => gsap.to([dot, ring], { scale: 1, duration: 0.3, ease: "elastic.out(1,0.3)" });
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);
    cleanups.push(() => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
    });
  }

  /* ---- Hero ---- */
  if (opts.hero) {
    const dispose = initHeroScene();
    if (typeof dispose === "function") cleanups.push(dispose);
  }

  return () => cleanups.forEach((f) => f());
}
