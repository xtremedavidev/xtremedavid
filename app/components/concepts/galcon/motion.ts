import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Draggable } from "gsap/Draggable";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText, Draggable);

export function initGalconMotion(root: HTMLElement): () => void {
  const $ = <T extends HTMLElement = HTMLElement>(sel: string, r: ParentNode = root) => r.querySelector<T>(sel)!;
  const $$ = <T extends HTMLElement = HTMLElement>(sel: string, r: ParentNode = root) => [...r.querySelectorAll<T>(sel)];
  const splits: SplitText[] = [];
  const draggables: Draggable[] = [];
  const listeners: Array<[EventTarget, string, EventListener]> = [];
  const on = (el: EventTarget, ev: string, fn: EventListener) => {
    el.addEventListener(ev, fn);
    listeners.push([el, ev, fn]);
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    $$("[data-count]").forEach((el) => (el.textContent = el.dataset.count!));
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

    $$("[data-count]").forEach((el) => (el.textContent = "0"));

    /* ---- 00 Smooth scroll (Lenis → ScrollTrigger) ---- */
    $$('a[href^="#"]').forEach((a) =>
      on(a, "click", (e: Event) => {
        const id = a.getAttribute("href");
        if (!id || id.length < 2) return;
        const t = $(id);
        if (!t) return;
        e.preventDefault();
        lenis.scrollTo(t, { offset: -80, duration: 1.4 });
      })
    );

    /* ---- 00 Scroll progress hairline ---- */
    gsap.to("[data-progress]", {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
    });

    /* ---- 00 Nav: shrink + hide on scroll down, return on scroll up ---- */
    const nav = $("[data-nav]");
    ScrollTrigger.create({
      start: "top -80",
      end: "max",
      onUpdate(self) {
        nav.toggleAttribute("data-scrolled", self.scroll() > 80);
        gsap.to(nav, {
          yPercent: self.direction === 1 && self.scroll() > 600 ? -120 : 0,
          duration: 0.6,
          ease: "power3.out",
          overwrite: "auto",
        });
      },
    });

    /* ---- 00 Nav: liquid hover pill that glides between links ---- */
    const pill = $("[data-navpill]"),
      links = $$<HTMLElement>("[data-navlinks] a");
    if (pill && links.length) {
      const active = $("[data-navlinks] a[data-active]") || links[0];
      const moveTo = (a: HTMLElement, d = 0.5) =>
        gsap.to(pill, {
          x: a.offsetLeft,
          width: a.offsetWidth,
          duration: d,
          ease: "power3.out",
        });
      gsap.set(pill, { x: active.offsetLeft, width: active.offsetWidth });
      links.forEach((a) => on(a, "mouseenter", () => moveTo(a)));
      on($("[data-navlinks]"), "mouseleave", () => moveTo(active, 0.7));
    }

    /* ---- 00 Magnetic buttons (quiet: 25% pull) ---- */
    $$("[data-magnetic]").forEach((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
      on(el, "pointermove", (e: Event) => {
        const pe = e as PointerEvent;
        const r = el.getBoundingClientRect();
        xTo((pe.clientX - r.left - r.width / 2) * 0.25);
        yTo((pe.clientY - r.top - r.height / 2) * 0.35);
      });
      on(el, "pointerleave", () => {
        xTo(0);
        yTo(0);
      });
    });

    /* ---- 00 Count-up helper ---- */
    const countUp = (el: HTMLElement | null, dur = 1.4) => {
      if (!el) return;
      const end = +(el.dataset.count || 0),
        o = { v: 0 };
      return gsap.to(o, {
        v: end,
        duration: dur,
        ease: "power3.out",
        onUpdate: () => (el.textContent = Math.round(o.v).toString()),
      });
    };

    /* ---- 01 Page load: lines rise, cards unfold, product settles on the moss ---- */
    const h1 = $("[data-hero-title]");
    const splitTwo = (h: HTMLElement) => {
      const s = SplitText.create(h.querySelectorAll("[data-l1], [data-l2]"), {
        type: "lines",
        mask: "lines",
      });
      splits.push(s);
      const fills = s.lines.filter((l) => l.closest("[data-l2]"));
      fills.forEach((l) => l.classList.add("fill"));
      return { lines: s.lines, fills };
    };
    const split = splitTwo(h1);
    gsap.set("[data-hero-card]", {
      clipPath: "inset(12% 6% 0% 6% round 36px)",
      y: 80,
      opacity: 0,
    });
    gsap.set("[data-product]", { y: -140, opacity: 0, rotate: -4 });
    gsap.set("[data-shadow]", { scale: 0.3, opacity: 0 });
    gsap.set("[data-glass]", { opacity: 0, y: 40, filter: "blur(14px)" });
    gsap.set("[data-hero-photo]", { scale: 1.25 });
    const intro = gsap.timeline({ defaults: { ease: EASE }, delay: 0.15 });
    intro
      .from("[data-nav] > *", { y: -24, opacity: 0, duration: 1, stagger: 0.08 })
      .from(split.lines, { yPercent: 105, duration: 1.2, stagger: 0.09 }, 0.1)
      .to(
        split.fills,
        {
          backgroundPosition: "0% 0",
          duration: 1.6,
          ease: "power2.inOut",
          stagger: 0.1,
        },
        0.5
      )
      .from(
        "[data-hero-aside] > *",
        { y: 20, opacity: 0, duration: 1, stagger: 0.08 },
        0.4
      )
      .to(
        "[data-hero-card]",
        {
          clipPath: "inset(0% 0% 0% 0% round 36px)",
          y: 0,
          opacity: 1,
          duration: 1.4,
          stagger: 0.12,
          ease: "expo.inOut",
        },
        0.45
      )
      .to("[data-hero-photo]", { scale: 1, duration: 2.2, ease: "expo.out" }, 0.6)
      .to(
        "[data-product]",
        {
          y: 0,
          opacity: 1,
          rotate: 0,
          duration: 1.1,
          ease: "back.out(1.6)",
        },
        1.15
      )
      .to(
        "[data-shadow]",
        { scale: 1, opacity: 1, duration: 1.1, ease: "back.out(1.6)" },
        1.15
      )
      .to(
        "[data-glass]",
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.2 },
        1.35
      )
      .add(() => countUp($("[data-glass] [data-count]"), 1.2), 1.4);

    /* ---- 02 Product stage: idle float + pointer depth parallax (3 layers) ---- */
    gsap.to("[data-product]", {
      y: "-=8",
      duration: 2.4,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: 2.4,
    });
    gsap.to("[data-shadow]", {
      scaleX: 0.88,
      opacity: 0.7,
      duration: 2.4,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: 2.4,
    });
    const stage = $("[data-stage]");
    const layers = $$("[data-depth]", stage).map((el) => ({
      el,
      d: +(el.dataset.depth || 0),
      x: gsap.quickTo(el, "xPercent", { duration: 1, ease: "power3.out" }),
      r: gsap.quickTo(el, "rotateY", { duration: 1, ease: "power3.out" }),
    }));
    on(stage, "pointermove", (e: Event) => {
      const pe = e as PointerEvent;
      const r = stage.getBoundingClientRect();
      const nx = (pe.clientX - r.left) / r.width - 0.5;
      layers.forEach((l) => {
        l.x(nx * 4 * l.d);
        l.r(nx * 6 * l.d);
      });
    });
    on(stage, "pointerleave", () =>
      layers.forEach((l) => {
        l.x(0);
        l.r(0);
      })
    );

    /* ---- 03 Hero → scroll: photo slow zoom, cards sink back slightly (depth) ---- */
    gsap
      .timeline({
        scrollTrigger: {
          trigger: "[data-hero-cards]",
          start: "top 60%",
          end: "bottom top",
          scrub: 1,
        },
      })
      .to("[data-hero-photo]", { scale: 1.12, ease: "none" }, 0)
      .to("[data-glass]", { yPercent: -18, ease: "none" }, 0)
      .to("[data-hero-cards]", { scale: 0.96, ease: "none" }, 0);

    /* ---- 04 Signature: grey line "fills in" as each heading enters ---- */
    $$("[data-fill]").forEach((h) => {
      const s = splitTwo(h);
      gsap
        .timeline({ scrollTrigger: { trigger: h, start: "top 85%" } })
        .from(s.lines, { yPercent: 105, duration: 1.1, stagger: 0.08, ease: EASE });
      gsap.to(s.fills, {
        backgroundPosition: "0% 0",
        ease: "none",
        stagger: 0.15,
        scrollTrigger: { trigger: h, start: "top 80%", end: "top 35%", scrub: 0.6 },
      });
    });
    $$("[data-lead]").forEach((p) =>
      gsap.from(p, {
        y: 24,
        opacity: 0,
        duration: 1,
        ease: EASE,
        scrollTrigger: { trigger: p, start: "top 88%" },
      })
    );

    /* ---- 05 Area cards: rounded clip reveal + image settle; hover reveals copy ---- */
    $$("[data-area]").forEach((card, i) => {
      const img = card.querySelector("img");
      gsap
        .timeline({ scrollTrigger: { trigger: card, start: "top 85%" } })
        .fromTo(
          card,
          { clipPath: "inset(30% 0% 0% 0% round 32px)", y: 60 },
          {
            clipPath: "inset(0% 0% 0% 0% round 32px)",
            y: 0,
            duration: 1.4,
            ease: "expo.inOut",
            delay: i * 0.1,
          }
        )
        .fromTo(img, { scale: 1.3 }, { scale: 1, duration: 1.8, ease: EASE }, "<");
      const more = card.querySelector("[data-more]"),
        plus = card.querySelector("[data-plus]");
      const hover = gsap
        .timeline({
          paused: true,
          defaults: { duration: 0.7, ease: "power3.out" },
        })
        .to(more, { height: "auto" }, 0)
        .to(plus, { rotate: 45 }, 0)
        .to(img, { scale: 1.05 }, 0);
      on(card, "mouseenter", () => hover.play());
      on(card, "mouseleave", () => hover.reverse());
    });

    /* ---- 06 App spotlight: pinned scene — phone rises, program runs ---- */
    mm.add("(min-width: 761px)", () => {
      const knob = $("[data-phone-knob]"),
        slide = $("[data-phone-slide]");
      const travel = () => slide.offsetWidth - knob.offsetWidth - 8;
      const state = $("[data-phone-state]"),
        label = $("[data-phone-label]");
      const nums = { min: 20, water: 4.2, moist: 31 };
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: "[data-app]",
          start: "top top+=40",
          end: "+=140%",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          onUpdate(self) {
            const onState = self.progress > 0.62;
            state.textContent = onState ? "Irrigating…" : "Irrigation";
            label.textContent = onState ? "Running · V-01–04" : "Start irrigation";
          },
        },
      });
      tl.fromTo(
        "[data-phone]",
        { yPercent: 45, scale: 0.92 },
        { yPercent: 0, scale: 1, duration: 0.35, ease: "power2.out" },
        0
      )
        .fromTo("[data-app-bg]", { scale: 1.08 }, { scale: 1, duration: 0.5 }, 0)
        .fromTo(
          "[data-phone-product]",
          { y: 40, rotate: -6 },
          { y: 0, rotate: 0, duration: 0.35, ease: "power2.out" },
          0.05
        )
        .to(
          nums,
          {
            min: 18,
            water: 4.6,
            moist: 34,
            duration: 0.25,
            onUpdate() {
              $("[data-min]").textContent = Math.round(nums.min).toString();
              $("[data-water]").textContent = nums.water.toFixed(1);
              $("[data-moist]").textContent = Math.round(nums.moist).toString();
            },
          },
          0.3
        )
        .to(knob, { x: () => travel(), duration: 0.18, ease: "power2.inOut" }, 0.45)
        .to("[data-phone-bar]", { scaleX: 1, duration: 0.35 }, 0.62)
        .to("[data-phone-product]", { y: -6, duration: 0.35 }, 0.62);
      ScrollTrigger.create({
        trigger: "[data-app]",
        start: "top 70%",
        once: true,
        onEnter: () => {
          $$("[data-app-stats] [data-count]").forEach((el) => countUp(el));
          gsap.from("[data-app-stats] [data-stat]", {
            y: 24,
            opacity: 0,
            stagger: 0.1,
            duration: 1,
            ease: EASE,
          });
        },
      });
    });
    mm.add("(max-width: 760px)", () => {
      gsap.from("[data-phone]", {
        y: 120,
        autoAlpha: 0,
        duration: 1.2,
        ease: EASE,
        scrollTrigger: { trigger: "[data-phone]", start: "top 85%" },
      });
      $$("[data-app-stats] [data-count]").forEach((el) =>
        ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          once: true,
          onEnter: () => countUp(el),
        })
      );
    });

    /* ---- 07 Product rail: pinned horizontal travel; each product tilts upright as it arrives ---- */
    const rail = $("[data-rail]");
    mm.add("(min-width: 1101px)", () => {
      const dist = () => Math.max(0, rail.scrollWidth - rail.parentElement!.clientWidth);
      if (dist() < 10) {
        gsap.from("[data-prod]", {
          y: 60,
          opacity: 0,
          stagger: 0.08,
          duration: 1.1,
          ease: EASE,
          scrollTrigger: { trigger: rail, start: "top 85%" },
        });
        gsap.from("[data-prod-img]", {
          rotate: -8,
          y: 30,
          stagger: 0.08,
          duration: 1.4,
          ease: EASE,
          scrollTrigger: { trigger: rail, start: "top 85%" },
        });
        return;
      }
      gsap.to(rail, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          trigger: '[data-section="products"]',
          start: "top top",
          end: () => "+=" + dist(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    });
    mm.add("(max-width: 1100px)", () => {
      rail.parentElement!.style.overflowX = "auto";
      gsap.from("[data-prod]", {
        y: 60,
        opacity: 0,
        stagger: 0.08,
        duration: 1.1,
        ease: EASE,
        scrollTrigger: { trigger: rail, start: "top 85%" },
      });
    });
    const step = (dir: number) => {
      const w = 272;
      rail.parentElement?.scrollBy
        ? rail.parentElement.scrollBy({ left: dir * w, behavior: "smooth" })
        : 0;
    };
    on($("[data-prev]"), "click", () => step(-1));
    on($("[data-next]"), "click", () => step(1));

    /* ---- 08 Soil: card settles, probe line descends, readings pop at each depth ---- */
    gsap.fromTo(
      "[data-soil-img]",
      { scale: 1.12 },
      {
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: "[data-soil]",
          start: "top bottom",
          end: "center center",
          scrub: 1,
        },
      }
    );
    const soilTl = gsap.timeline({
      scrollTrigger: { trigger: "[data-soil]", start: "top 60%" },
    });
    soilTl.to("[data-soil-line]", { scaleY: 1, duration: 1.6, ease: "power2.inOut" });
    $$("[data-reading]").forEach((r, i) => {
      soilTl
        .fromTo(
          r,
          { scale: 0.7, opacity: 0, y: 10 },
          { scale: 1, opacity: 1, y: 0, duration: 0.7, ease: "back.out(1.8)" },
          0.25 + i * 0.45
        )
        .add(() => countUp(r.querySelector<HTMLElement>("[data-count]"), 1), "<");
    });
    $$("[data-feat]").forEach((f, i) =>
      gsap.from(f, {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: EASE,
        delay: i * 0.08,
        scrollTrigger: { trigger: f, start: "top 90%" },
      })
    );

    /* ---- 09 Proof: photo parallax, glass card slides in, chips + stats ---- */
    gsap.fromTo(
      "[data-proof-img]",
      { yPercent: -6 },
      {
        yPercent: 6,
        ease: "none",
        scrollTrigger: {
          trigger: "[data-proof]",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );
    gsap
      .timeline({ scrollTrigger: { trigger: "[data-proof]", start: "top 65%" } })
      .from("[data-proof-card]", { x: -40, opacity: 0, duration: 1.1, ease: EASE })
      .add(() => countUp($("[data-proof-card] [data-count]"), 1), "<0.2")
      .from(
        "[data-countries] span",
        { y: 12, opacity: 0, stagger: 0.04, duration: 0.6, ease: "power3.out" },
        "<0.2"
      );
    ScrollTrigger.create({
      trigger: "[data-proof-stats]",
      start: "top 90%",
      once: true,
      onEnter: () => {
        $$("[data-proof-stats] [data-count]").forEach((el) => countUp(el));
        gsap.from("[data-proof-stats] > div", {
          y: 20,
          opacity: 0,
          stagger: 0.08,
          duration: 1,
          ease: EASE,
        });
      },
    });

    /* ---- 10 CTA: oval opens like an aperture, product drops in, slide-to-contact ---- */
    gsap
      .timeline({ scrollTrigger: { trigger: "[data-cta]", start: "top 70%" } })
      .from("[data-cta]", {
        clipPath: "inset(8% 4% 8% 4% round 40px)",
        duration: 1.4,
        ease: "expo.inOut",
      })
      .from(
        "[data-cta-oval]",
        { clipPath: "circle(12% at 50% 50%)", duration: 1.6, ease: "expo.inOut" },
        0.15
      )
      .from("[data-cta-oval] img", { scale: 1.35, duration: 2, ease: EASE }, 0.15)
      .from(
        "[data-cta-product]",
        { y: -120, opacity: 0, rotate: 8, duration: 1.1, ease: "back.out(1.5)" },
        0.9
      );
    const cKnob = $("[data-cta-knob]"),
      cSlide = $("[data-cta-slide]");
    const max = () => cSlide.offsetWidth - cKnob.offsetWidth - 10;
    const done = () => {
      gsap.to(cKnob, { x: max(), duration: 0.4, ease: "power3.out" });
      cSlide.querySelector<HTMLElement>("[data-slide-label]")!.textContent =
        "Opening contact…";
    };
    const d = Draggable.create(cKnob, {
      type: "x",
      bounds: { minX: 0, maxX: max() },
      onDrag() {
        gsap.set(cSlide.querySelector<HTMLElement>("[data-slide-chev]")!, {
          opacity: 0.5 * (1 - this.x / max()),
        });
      },
      onDragEnd() {
        this.x > max() * 0.8
          ? done()
          : gsap.to(cKnob, {
              x: 0,
              duration: 0.6,
              ease: "elastic.out(1, 0.6)",
            });
      },
    })[0];
    if (d) draggables.push(d);
    on(cSlide, "keydown", (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key === "Enter" || ke.key === " ") {
        ke.preventDefault();
        done();
      }
    });
    gsap.to(cKnob, {
      x: 14,
      duration: 0.9,
      ease: "sine.inOut",
      yoyo: true,
      repeat: 3,
      repeatDelay: 0.3,
      scrollTrigger: { trigger: cSlide, start: "top 85%" },
    });

    /* ---- 11 Footer ---- */
    gsap.from("[data-foot-top] > *", {
      y: 30,
      opacity: 0,
      stagger: 0.06,
      duration: 1,
      ease: EASE,
      scrollTrigger: { trigger: "[data-foot]", start: "top 85%" },
    });

    /* ---- 12 Badge ---- */
    gsap.from("[data-badge]", { y: 80, opacity: 0, duration: 1, ease: EASE, delay: 2.2 });
  }, root);

  const onLoad = () => ScrollTrigger.refresh();
  window.addEventListener("load", onLoad);
  requestAnimationFrame(() => ScrollTrigger.refresh());

  return () => {
    listeners.forEach(([el, ev, fn]) => el.removeEventListener(ev, fn));
    window.removeEventListener("load", onLoad);
    draggables.forEach((d) => d.kill());
    splits.forEach((sp) => sp.revert());
    mm.revert();
    ctx.revert();
    gsap.ticker.remove(raf);
    lenis.destroy();
  };
}
