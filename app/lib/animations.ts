import { initHeroScene } from "./heroScene";
import { initLiquidOverlay } from "./liquidOverlay";

export function initAnimations() {
  const gsap = (window as any).gsap;
  const ScrollTrigger = (window as any).ScrollTrigger;
  const Lenis = (window as any).Lenis;
  if (!gsap || !ScrollTrigger || !Lenis) return;

  gsap.registerPlugin(ScrollTrigger);

  // --- LENIS SMOOTH SCROLL ---
  const lenis = new Lenis({ duration: 1.2, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time: number) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // --- CUSTOM CURSOR ---
  initCursor(gsap);

  // --- THREE.JS HERO ---
  initHeroScene();

  // --- LIQUID RIPPLE OVERLAY ---
  initLiquidOverlay();

  // Logo hover
  const logo = document.querySelector(".navbar__logo");
  if (logo) {
    logo.addEventListener("mouseenter", () => gsap.to(logo, { skewX: -6, duration: 0.3, ease: "power2.out" }));
    logo.addEventListener("mouseleave", () => gsap.to(logo, { skewX: 0, duration: 0.3, ease: "power2.out" }));
  }

  // --- HERO ENTRANCE ---
  heroEntrance(gsap);

  // --- SCROLL INDICATOR LOOP ---
  gsap.to("#scroll-line-anim", { y: 12, opacity: 0, repeat: -1, duration: 1.4, ease: "power1.inOut", yoyo: false, repeatDelay: 0.2 });

  // --- HERO PIN + PARALLAX ---
  ScrollTrigger.create({
    trigger: "#hero",
    start: "top top",
    end: "+=150%",
    pin: true,
    onUpdate: (self: any) => {
      const p = self.progress;
      gsap.set("#hero-content", { y: -80 * p, opacity: p > 0.7 ? 1 - (p - 0.7) / 0.3 : 1 });
    },
  });

  // --- PROGRESS BAR ---
  gsap.to("#progress-bar", {
    width: "100%",
    ease: "none",
    scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 0.3 },
  });

  // --- SECTION 2: WORK ---
  initWorkSection(gsap, ScrollTrigger);

  // --- SECTION 3: CRAFT ---
  initCraftSection(gsap, ScrollTrigger);

  // --- SECTION 4: PERSON ---
  initPersonSection(gsap, ScrollTrigger);

  // --- SECTION 5: TESTIMONIES ---
  initTestimoniesSection(gsap, ScrollTrigger);

  // --- SECTION 6: CTA ---
  initCTASection(gsap, ScrollTrigger);

  // --- CHAPTER NUMBER ---
  initChapterUpdater(gsap, ScrollTrigger);

  // --- BODY BG TRANSITIONS ---
  initBgTransitions(gsap, ScrollTrigger);
}

function initCursor(gsap: any) {
  const dot = document.getElementById("cursor-dot");
  const ring = document.getElementById("cursor-ring");
  if (!dot || !ring) return;

  document.addEventListener("mousemove", (e) => {
    gsap.set(dot, { x: e.clientX, y: e.clientY });
    gsap.to(ring, { x: e.clientX, y: e.clientY, duration: 0.35, ease: "power2.out" });
  });

  const hoverTargets = document.querySelectorAll('a, button, [data-cursor="hover"]');
  hoverTargets.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      gsap.to(ring, { scale: 2.5, opacity: 0.3, duration: 0.3 });
      gsap.to(dot, { scale: 1.5, duration: 0.3 });
    });
    el.addEventListener("mouseleave", () => {
      gsap.to(ring, { scale: 1, opacity: 0.6, duration: 0.3, background: "transparent", borderColor: "#C8FF00" });
      gsap.to(dot, { scale: 1, duration: 0.3 });
    });
  });

  document.querySelectorAll("h2, h3").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      gsap.to(ring, { background: "rgba(200,255,0,0.08)", borderColor: "#C8FF00", duration: 0.3 });
    });
    el.addEventListener("mouseleave", () => {
      gsap.to(ring, { background: "transparent", duration: 0.3 });
    });
  });

  document.addEventListener("mousedown", () => {
    gsap.to([dot, ring], { scale: 0.8, duration: 0.1 });
  });
  document.addEventListener("mouseup", () => {
    gsap.to(dot, { scale: 1, duration: 0.3, ease: "elastic.out(1,0.3)" });
    gsap.to(ring, { scale: 1, duration: 0.3, ease: "elastic.out(1,0.3)" });
  });
}

function heroEntrance(gsap: any) {
  const tl = gsap.timeline({ delay: 0.2 });

  // Loader exit
  tl.to("#loader-progress", { width: "100%", duration: 0.8, ease: "power2.inOut" }, 0);
  tl.to("#page-loader", { yPercent: -100, duration: 1, ease: "expo.inOut" }, 0.8);

  // Canvas fade
  tl.from("#hero-canvas", { opacity: 0, duration: 1.2 }, 1.2);

  // Split chars — set visibility properly
  splitAndAnimate("#hero-name-david", tl, 1.5, gsap);
  splitAndAnimate("#hero-name-adebayo", tl, 1.75, gsap);

  tl.from("#hero-tagline", { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" }, 2.1);
  tl.from("#hero-subtagline", { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" }, 2.3);
  tl.to("#hero-line", { scaleX: 1, duration: 0.8, ease: "power3.out" }, 2.5);
  tl.from("#hero-scroll", { opacity: 0, y: 10, duration: 0.6 }, 2.7);
}

function splitAndAnimate(selector: string, tl: any, startTime: number, gsap: any) {
  const el = document.querySelector(selector);
  if (!el) return;
  const text = el.textContent || "";
  el.innerHTML = "";

  const chars: HTMLSpanElement[] = [];
  text.split("").forEach((c) => {
    const span = document.createElement("span");
    span.textContent = c;
    span.style.display = "inline-block";
    // Keep the element's styling (outline vs solid) by inheriting
    el.appendChild(span);
    chars.push(span);
  });

  // Use gsap.from — chars start visible, animate FROM hidden state
  tl.from(chars, {
    y: -120,
    opacity: 0,
    rotationX: 90,
    stagger: 0.04,
    duration: 0.8,
    ease: "expo.out",
  }, startTime);
}

function initWorkSection(gsap: any, ScrollTrigger: any) {
  ScrollTrigger.create({
    trigger: "#work",
    start: "top 80%",
    onEnter: () => {
      gsap.from("#work-word-1", { x: -100, clipPath: "inset(0 100% 0 0)", duration: 1, ease: "expo.out" });
      gsap.from("#work-word-2", { x: 100, clipPath: "inset(0 0 0 100%)", duration: 1, ease: "expo.out" });
    },
    once: true,
  });

  const track = document.getElementById("work-track");
  if (!track) return;
  const totalScroll = track.scrollWidth - window.innerWidth;

  gsap.to(track, {
    x: -totalScroll,
    ease: "none",
    scrollTrigger: {
      trigger: "#work",
      start: "top top",
      end: () => `+=${totalScroll}`,
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
    },
  });
}

function initCraftSection(gsap: any, ScrollTrigger: any) {
  // Dot grid bg fade
  ScrollTrigger.create({
    trigger: "#craft",
    start: "top 80%",
    onEnter: () => gsap.to("#craft-bg", { opacity: 1, duration: 1 }),
    onLeaveBack: () => gsap.to("#craft-bg", { opacity: 0, duration: 0.5 }),
  });

  // Heading — slot machine effect
  ScrollTrigger.create({
    trigger: "#craft-heading",
    start: "top 75%",
    onEnter: () => slotMachineReveal("#craft-heading", gsap),
    once: true,
  });

  // Copy words fade
  ScrollTrigger.create({
    trigger: "#craft-copy",
    start: "top 80%",
    onEnter: () => {
      const el = document.getElementById("craft-copy");
      if (!el) return;
      const text = el.textContent || "";
      el.innerHTML = "";
      const words: HTMLSpanElement[] = [];
      text.split(" ").forEach((w) => {
        if (!w.trim()) return;
        const span = document.createElement("span");
        span.textContent = w;
        span.style.display = "inline-block";
        span.style.opacity = "0";
        el.appendChild(span);
        el.appendChild(document.createTextNode(" "));
        words.push(span);
      });
      gsap.to(words, { opacity: 1, stagger: 0.02, duration: 0.3, ease: "power2.out" });
    },
    once: true,
  });

  // Tags — float in on scroll with parallax
  const tags = document.querySelectorAll(".skill-tag");
  tags.forEach((tag, i) => {
    const htmlTag = tag as HTMLElement;
    // Set initial random offset
    const randX = (Math.random() - 0.5) * 200;
    const randY = (Math.random() - 0.5) * 100;
    gsap.set(htmlTag, { x: randX, y: randY, opacity: 0, scale: 0.8 });

    ScrollTrigger.create({
      trigger: "#craft-tags",
      start: "top 85%",
      onEnter: () => {
        gsap.to(htmlTag, {
          x: 0, y: 0, opacity: 1, scale: 1,
          duration: 1.2 + i * 0.05,
          delay: i * 0.04,
          ease: "expo.out",
        });
      },
      once: true,
    });

    // Gentle floating parallax on scroll
    gsap.to(htmlTag, {
      y: () => (Math.random() - 0.5) * 20,
      scrollTrigger: {
        trigger: "#craft",
        start: "top bottom",
        end: "bottom top",
        scrub: 1.5,
      },
    });
  });

  // Stat counters
  ScrollTrigger.create({
    trigger: "#craft-stats",
    start: "top 85%",
    onEnter: () => {
      document.querySelectorAll(".stat__number").forEach((el) => {
        const htmlEl = el as HTMLElement;
        const target = htmlEl.dataset.count;
        const textTarget = htmlEl.dataset.countText;
        if (textTarget) {
          gsap.to({}, {
            duration: 1,
            onComplete: () => { htmlEl.textContent = textTarget; },
          });
        } else if (target) {
          const num = parseInt(target);
          const obj = { val: 0 };
          gsap.to(obj, {
            val: num,
            duration: 2,
            ease: "power2.out",
            onUpdate: () => { htmlEl.textContent = Math.round(obj.val) + "+"; },
          });
        }
      });
    },
    once: true,
  });
}

function slotMachineReveal(selector: string, gsap: any) {
  const el = document.querySelector(selector);
  if (!el) return;
  const text = el.textContent || "";
  el.innerHTML = "";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  text.split("").forEach((targetChar, i) => {
    const span = document.createElement("span");
    span.textContent = targetChar === " " ? "\u00A0" : chars[Math.floor(Math.random() * 26)];
    span.style.display = "inline-block";
    el.appendChild(span);

    if (targetChar !== " ") {
      let count = 0;
      const maxCycles = 8 + i * 2;
      const interval = setInterval(() => {
        count++;
        if (count >= maxCycles) {
          span.textContent = targetChar;
          clearInterval(interval);
        } else {
          span.textContent = chars[Math.floor(Math.random() * 26)];
        }
      }, 40);
    }
  });
}

function initPersonSection(gsap: any, ScrollTrigger: any) {
  ScrollTrigger.create({
    trigger: "#person",
    start: "top 60%",
    onEnter: () => {
      // Image reveal — simple fade + slide, no clipPath
      gsap.from("#person-image", { opacity: 0, y: 40, duration: 1.2, ease: "expo.out" });
      // Border frame SVG stroke draw
      const rect = document.querySelector("#person-frame rect");
      if (rect) gsap.to(rect, { attr: { "stroke-dashoffset": 0 }, duration: 2, delay: 0.5, ease: "power2.inOut" });
    },
    once: true,
  });

  ScrollTrigger.create({
    trigger: "#person-story",
    start: "top 75%",
    onEnter: () => {
      const el = document.getElementById("person-story");
      if (!el) return;
      const text = el.textContent || "";
      el.innerHTML = "";
      const words: HTMLSpanElement[] = [];
      text.split(" ").forEach((w) => {
        if (!w.trim()) return;
        const span = document.createElement("span");
        span.textContent = w;
        span.style.display = "inline-block";
        span.style.opacity = "0.2";
        el.appendChild(span);
        el.appendChild(document.createTextNode(" "));
        words.push(span);
      });
      gsap.to(words, {
        opacity: 1,
        stagger: 0.03,
        duration: 0.4,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 75%",
          end: "bottom 50%",
          scrub: 1,
        },
      });
    },
    once: true,
  });

  ScrollTrigger.create({
    trigger: "#person-quote",
    start: "top 85%",
    onEnter: () => {
      gsap.from("#person-quote", { x: -60, skewX: -4, opacity: 0, duration: 1.2, ease: "expo.out" });
    },
    once: true,
  });
}

function initTestimoniesSection(gsap: any, ScrollTrigger: any) {
  ScrollTrigger.create({
    trigger: "#testimonies",
    start: "top 70%",
    onEnter: () => {
      gsap.from(".testimonies__title", { y: 60, opacity: 0, duration: 1, ease: "expo.out" });
      gsap.from(".testimonies__rule", { scaleY: 0, transformOrigin: "top", duration: 1, delay: 0.3, ease: "power3.inOut" });
    },
    once: true,
  });

  ScrollTrigger.create({
    trigger: ".testimonies__grid",
    start: "top 80%",
    onEnter: () => {
      gsap.from(".testimony-card", { 
        y: 60, 
        opacity: 0, 
        stagger: 0.15, 
        duration: 1.2, 
        ease: "power2.out" 
      });
    },
    once: true,
  });
}

function initCTASection(gsap: any, ScrollTrigger: any) {
  gsap.to("#cta-glow", { scale: 1.15, duration: 4, ease: "sine.inOut", repeat: -1, yoyo: true });

  ScrollTrigger.create({
    trigger: "#cta-heading",
    start: "top 80%",
    onEnter: () => {
      gsap.from("#cta-heading h2", { y: 60, opacity: 0, stagger: 0.15, duration: 1, ease: "expo.out" });
    },
    once: true,
  });

  ScrollTrigger.create({
    trigger: ".cta-section__buttons",
    start: "top 90%",
    onEnter: () => {
      gsap.from(".cta-section__buttons a", { y: 30, opacity: 0, stagger: 0.1, duration: 0.8, ease: "power3.out" });
    },
    once: true,
  });
}

function initChapterUpdater(gsap: any, ScrollTrigger: any) {
  const chapterEl = document.getElementById("chapter-number");
  if (!chapterEl) return;
  const sections = [
    { id: "#work", label: "01 / 05" },
    { id: "#craft", label: "02 / 05" },
    { id: "#person", label: "03 / 05" },
    { id: "#testimonies", label: "04 / 05" },
    { id: "#cta", label: "05 / 05" },
  ];
  sections.forEach(({ id, label }) => {
    ScrollTrigger.create({
      trigger: id,
      start: "top 50%",
      onEnter: () => {
        gsap.to(chapterEl, { opacity: 0, duration: 0.15, onComplete: () => { chapterEl.textContent = label; gsap.to(chapterEl, { opacity: 1, duration: 0.15 }); } });
      },
      onLeaveBack: () => {
        const idx = sections.findIndex((s) => s.id === id);
        const prev = idx > 0 ? sections[idx - 1].label : "01 / 05";
        gsap.to(chapterEl, { opacity: 0, duration: 0.15, onComplete: () => { chapterEl.textContent = prev; gsap.to(chapterEl, { opacity: 1, duration: 0.15 }); } });
      },
    });
  });
}

function initBgTransitions(gsap: any, ScrollTrigger: any) {
  const transitions = [
    { trigger: "#work", bg: "#0D0D0D" },
    { trigger: "#craft", bg: "#0A0A0A" },
    { trigger: "#person", bg: "#0A0A0A" },
    { trigger: "#testimonies", bg: "#080808" },
    { trigger: "#cta", bg: "#060606" },
  ];
  transitions.forEach(({ trigger, bg }) => {
    ScrollTrigger.create({
      trigger,
      start: "top 60%",
      onEnter: () => gsap.to(document.body, { backgroundColor: bg, duration: 1 }),
      onLeaveBack: () => gsap.to(document.body, { backgroundColor: "#080808", duration: 1 }),
    });
  });
}
