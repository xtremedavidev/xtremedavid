"use client";

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
import { useRouter } from "next/navigation";

/* ═══════════ Cursor ═══════════ */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function initCursor(gsap: any) {
  const dot = document.getElementById("cursor-dot");
  const ring = document.getElementById("cursor-ring");
  if (!dot || !ring) return;
  document.addEventListener("mousemove", (e) => {
    gsap.set(dot, { x: e.clientX, y: e.clientY });
    gsap.to(ring, { x: e.clientX, y: e.clientY, duration: 0.35, ease: "power2.out" });
  });
  document.querySelectorAll('a, button, [data-cursor="hover"]').forEach((el) => {
    el.addEventListener("mouseenter", () => {
      gsap.to(ring, { scale: 2.5, opacity: 0.3, duration: 0.3 });
      gsap.to(dot, { scale: 1.5, duration: 0.3 });
    });
    el.addEventListener("mouseleave", () => {
      gsap.to(ring, { scale: 1, opacity: 0.6, duration: 0.3, background: "transparent", borderColor: "#C8FF00" });
      gsap.to(dot, { scale: 1, duration: 0.3 });
    });
  });
  document.addEventListener("mousedown", () => gsap.to([dot, ring], { scale: 0.8, duration: 0.1 }));
  document.addEventListener("mouseup", () => {
    gsap.to(dot, { scale: 1, duration: 0.3, ease: "elastic.out(1,0.3)" });
    gsap.to(ring, { scale: 1, duration: 0.3, ease: "elastic.out(1,0.3)" });
  });
}

/* ═══════════ Custom SplitText Helpers ═══════════ */
function splitToChars(selector: string | Element) {
  const elements = typeof selector === "string" ? document.querySelectorAll(selector) : [selector];
  const allChars: Element[] = [];
  elements.forEach((el) => {
    const text = el.textContent || "";
    el.innerHTML = "";
    text.split("").forEach((char) => {
      const span = document.createElement("span");
      span.style.display = "inline-block";
      if (char === " ") {
        span.innerHTML = "&nbsp;";
      } else {
        span.textContent = char;
      }
      el.appendChild(span);
      allChars.push(span);
    });
  });
  return allChars;
}

function splitToWords(selector: string | Element) {
  const elements = typeof selector === "string" ? document.querySelectorAll(selector) : [selector];
  const allWords: Element[] = [];
  elements.forEach((el) => {
    const text = el.textContent || "";
    el.innerHTML = "";
    text.split(" ").forEach((word, i, arr) => {
      const span = document.createElement("span");
      span.style.display = "inline-block";
      span.textContent = word;
      el.appendChild(span);
      allWords.push(span);
      
      // Add a space after word except for the last one
      if (i < arr.length - 1) {
        el.appendChild(document.createTextNode(" "));
      }
    });
  });
  return allWords;
}

export default function AboutPage() {
  const router = useRouter();
  const pageRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gsapCtxRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lenisRef = useRef<any>(null);

  const [activeChapter, setActiveChapter] = useState(0);
  
  // Navigate with transition
  const navigateTo = useCallback((href: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gsap = (window as any).gsap;
    if (gsap && pageRef.current) {
      gsap.to(pageRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => router.push(href),
      });
    } else {
      router.push(href);
    }
  }, [router]);

  useIsomorphicLayoutEffect(() => {
    let chapterObserver: IntersectionObserver | null = null;
    const init = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const gsap = (window as any).gsap;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ScrollTrigger = (window as any).ScrollTrigger;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Lenis = (window as any).Lenis;
      if (!gsap || !ScrollTrigger) return;

      gsap.registerPlugin(ScrollTrigger);
      // Kill stale animations from previous mount (no revert — it crashes React)
      const ScrollTriggerRef = (window as any).ScrollTrigger;
      if (ScrollTriggerRef) {
        ScrollTriggerRef.getAll().forEach((st: any) => st.kill());
      }
      gsap.killTweensOf("*");

      gsap.context(() => {
        // Reset stale styles
        if (pageRef.current) {
          gsap.set(pageRef.current, { clearProps: "opacity,y,transform" });
        }

        // Lenis
        if (Lenis) {
          const lenis = new Lenis({
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
          lenisRef.current = lenis;
          lenis.on("scroll", ScrollTrigger.update);
          gsap.ticker.add((time: number) => lenis.raf(time * 1000));
          gsap.ticker.lagSmoothing(0);
        }

        initCursor(gsap);

        // Loader exit → DA flash → content reveal
        const pageContent = document.querySelector(".ab-page-content");
        
        const tlEnter = gsap.timeline();
        // Loader bar fills then slides up
        tlEnter.to("#loader-progress", { width: "100%", duration: 0.6, ease: "power2.inOut" }, 0);
        tlEnter.to("#page-loader", { yPercent: -100, duration: 0.8, ease: "expo.inOut" }, 0.6);
        // Content fades in after loader clears
        tlEnter.fromTo(pageContent, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 1.2);

        // Background color shifts per section
        const bgColors = ["#080808", "#090B0A", "#080A0D", "#0A0808", "#060606", "#080808"];
        const sections = document.querySelectorAll(".ab-section");
        sections.forEach((sec, i) => {
          ScrollTrigger.create({
            trigger: sec,
            start: "top 50%",
            end: "bottom 50%",
            onEnter: () => gsap.to(pageRef.current, { backgroundColor: bgColors[i], duration: 1.2, ease: "power2.inOut" }),
            onEnterBack: () => gsap.to(pageRef.current, { backgroundColor: bgColors[i], duration: 1.2, ease: "power2.inOut" }),
          });
        });

        // Intersection observer for chapter dots
        chapterObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const idx = parseInt((entry.target as HTMLElement).dataset.chapterIdx || "0", 10);
              setActiveChapter(idx);
            }
          });
        }, { threshold: 0.3 });
        
        document.querySelectorAll("[data-chapter-idx]").forEach(el => chapterObserver!.observe(el));

        // Section 1: Arrival
        // Blob breathing
        gsap.to(".ab-hero-blob", {
          scale: 1.15,
          duration: 8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true
        });

        // Eyebrow
        tlEnter.from(".ab-hero-eyebrow", { y: -12, opacity: 0, duration: 0.5, ease: "power2.out" }, 0.3);

        // SplitText Headings
        const lines = document.querySelectorAll(".ab-hero-line");
        const line1Chars = lines[0] ? splitToChars(lines[0]) : [];
        const line2Chars = lines[1] ? splitToChars(lines[1]) : [];
        const line3Chars = lines[2] ? splitToChars(lines[2]) : [];
        
        tlEnter.from(line1Chars, { y: 100, rotationX: -80, opacity: 0, stagger: 0.03, duration: 1, ease: "expo.out" }, 0.5);
        tlEnter.from(line2Chars, { y: 100, rotationX: -80, opacity: 0, stagger: 0.03, duration: 1, ease: "expo.out" }, 0.75);
        tlEnter.from(line3Chars, { y: 100, rotationX: -80, opacity: 0, stagger: 0.03, duration: 1, ease: "expo.out" }, 1.0);

        // Sub-copy
        const subWords = splitToWords(".ab-hero-sub");
        tlEnter.from(subWords, { opacity: 0, y: 10, stagger: 0.03, duration: 0.6, ease: "power2.out" }, 1.4);

        // Section 1 scroll-out: fade and drift as it leaves viewport
        gsap.to(".ab-hero-content", {
          opacity: 0,
          y: -60,
          ease: "none",
          scrollTrigger: {
            trigger: ".ab-sec-1",
            start: "60% top",
            end: "bottom top",
            scrub: true
          }
        });

        gsap.to(".ab-scroll-ind", {
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: ".ab-sec-1",
            start: "20% top",
            end: "40% top",
            scrub: true
          }
        });

        // Section 2: Origin
        ScrollTrigger.create({
          trigger: ".ab-sec-2",
          start: "top 75%",
          onEnter: () => {
            gsap.fromTo(".ab-ch-label-1", { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: "power2.out" });
            gsap.fromTo(".ab-s2-img", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 1.4, ease: "expo.inOut" });
            gsap.fromTo(".ab-s2-bracket", { strokeDashoffset: 80 }, { strokeDashoffset: 0, stagger: 0.1, duration: 0.8, ease: "power2.out", delay: 1.4 });
            gsap.fromTo(".ab-s2-stat", { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)", delay: 2.2 });
            gsap.fromTo(".ab-s2-open", { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: "expo.out" });
          }
        });

        gsap.to(".ab-s2-stat", { y: -8, duration: 3, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 2.8 });

        const s2Paras = document.querySelectorAll(".ab-s2-p");
        s2Paras.forEach((p) => {
          const pWords = splitToWords(p);
          gsap.fromTo(pWords, { opacity: 0.15 }, {
            opacity: 1,
            stagger: 0.05,
            scrollTrigger: {
              trigger: p,
              start: "top 75%",
              end: "bottom 60%",
              scrub: 1,
              invalidateOnRefresh: true
            }
          });
        });

        gsap.fromTo(".ab-s2-hr", { scaleX: 0 }, {
          scaleX: 1,
          duration: 1,
          transformOrigin: "left",
          scrollTrigger: { trigger: ".ab-s2-hr", start: "top 85%" }
        });

        // Section 3: Craft
        ScrollTrigger.create({
          trigger: ".ab-sec-3",
          start: "top 80%",
          onEnter: () => {
            gsap.to(".ab-s3-bg", { opacity: 1, duration: 1 });
            
            // Slot machine
            const headChars = document.querySelectorAll(".ab-s3-head-char");
            headChars.forEach((el, idx) => {
              const htmlEl = el as HTMLElement;
              const original = htmlEl.dataset.char || "";
              if (original === " ") return;
              
              let frame = 0;
              const maxFrames = 12 + idx * 2;
              const tickerFn = () => {
                if (frame < maxFrames) {
                  htmlEl.innerText = String.fromCharCode(65 + Math.floor(Math.random() * 26));
                  frame++;
                } else {
                  htmlEl.innerText = original;
                  gsap.ticker.remove(tickerFn);
                }
              };
              gsap.ticker.add(tickerFn);
            });
          },
          onLeave: () => gsap.to(".ab-s3-bg", { opacity: 0, duration: 1 }),
          onEnterBack: () => gsap.to(".ab-s3-bg", { opacity: 1, duration: 1 }),
          onLeaveBack: () => gsap.to(".ab-s3-bg", { opacity: 0, duration: 1 }),
        });

        const s3Cols = document.querySelectorAll(".ab-s3-col");
        s3Cols.forEach((col, i) => {
          gsap.fromTo(col.querySelectorAll(".ab-s3-item"), { x: -20, opacity: 0 }, {
            x: 0,
            opacity: 1,
            stagger: 0.04,
            duration: 0.6,
            ease: "power2.out",
            delay: i * 0.15,
            scrollTrigger: { trigger: col, start: "top 80%" }
          });
        });

        gsap.to(".ab-figma-rect", {
          opacity: 0.3,
          duration: 1.5,
          stagger: { each: 0.3, yoyo: true, repeat: -1 },
          ease: "sine.inOut"
        });

        // Section 4: Faith & Person
        ScrollTrigger.create({
          trigger: ".ab-sec-4",
          start: "top 75%",
          onEnter: () => {
            gsap.fromTo(".ab-s4-quote", { scale: 0.96, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, ease: "expo.out" });
            gsap.fromTo(".ab-s4-hr", { scaleX: 0 }, { scaleX: 1, duration: 1, ease: "power2.out", delay: 0.4 });
          }
        });

        const s4Paras = document.querySelectorAll(".ab-s4-p");
        s4Paras.forEach((p) => {
          const pWords = splitToWords(p);
          gsap.fromTo(pWords, { opacity: 0.15 }, {
            opacity: 1,
            stagger: 0.05,
            scrollTrigger: { trigger: p, start: "top 75%", end: "bottom 60%", scrub: 1, invalidateOnRefresh: true }
          });
        });

        ScrollTrigger.create({
          trigger: ".ab-s4-icons",
          start: "top 80%",
          onEnter: () => {
            gsap.fromTo(".ab-s4-icon path, .ab-s4-icon circle", { strokeDashoffset: 100 }, { strokeDashoffset: 0, stagger: 0.3, duration: 1, ease: "power2.out" });
          }
        });

        // Section 5: Philosophy
        ScrollTrigger.create({
          trigger: ".ab-sec-5",
          start: "top 75%",
          onEnter: () => {
            const s5Chars = splitToChars(".ab-s5-head-line");
            gsap.fromTo(s5Chars, { y: 100, rotationX: -80, opacity: 0 }, { y: 0, rotationX: 0, opacity: 1, stagger: 0.03, duration: 1, ease: "expo.out" });
          }
        });

        const s5Rows = document.querySelectorAll(".ab-s5-row");
        s5Rows.forEach((row) => {
          ScrollTrigger.create({
            trigger: row,
            start: "top 80%",
            onEnter: () => {
              gsap.fromTo(row.querySelector(".ab-s5-num"), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" });
              gsap.fromTo(row.querySelector(".ab-s5-text"), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.15 });
              gsap.fromTo(row.querySelector(".ab-s5-hr"), { scaleX: 0 }, { scaleX: 1, duration: 1, transformOrigin: "left", delay: 0.3 });
            }
          });
        });

        // Section 6: CTA
        ScrollTrigger.create({
          trigger: ".ab-sec-6",
          start: "top 75%",
          onEnter: () => {
            gsap.fromTo(".ab-s6-close", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1, ease: "power2.out" });
            const s6Chars = splitToChars(".ab-s6-head-line");
            gsap.fromTo(s6Chars, { y: 50, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.02, duration: 0.8, ease: "expo.out", delay: 0.2 });
            gsap.fromTo(".ab-s6-btns, .ab-s6-social, .ab-s6-foot", { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.15, duration: 0.8, ease: "power2.out", delay: 0.6 });
          }
        });

        gsap.to(".ab-s6-blob", { scale: 1.15, duration: 8, ease: "sine.inOut", repeat: -1, yoyo: true });

        // Hover for Craft skills
        document.querySelectorAll(".ab-s3-item").forEach(item => {
          item.addEventListener("mouseenter", () => {
            gsap.to(item, { backgroundColor: "rgba(200,255,0,0.04)", duration: 0.2 });
            gsap.to(item.querySelector("span"), { color: "var(--text)", duration: 0.2 });
            gsap.to(item.querySelector(".ab-s3-dot"), { x: 0, opacity: 1, duration: 0.2 });
          });
          item.addEventListener("mouseleave", () => {
            gsap.to(item, { backgroundColor: "transparent", duration: 0.2 });
            gsap.to(item.querySelector("span"), { color: "var(--muted)", duration: 0.2 });
            gsap.to(item.querySelector(".ab-s3-dot"), { x: -10, opacity: 0, duration: 0.2 });
          });
        });

      }, pageRef);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).gsap && (window as any).ScrollTrigger) {
      init();
    } else {
      window.addEventListener("load", init);
    }

    return () => {
      chapterObserver?.disconnect();
      window.removeEventListener("load", init);
      if (gsapCtxRef.current) {
        gsapCtxRef.current.revert();
      }
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
    };
  }, []);

  const scrollToChapter = (idx: number) => {
    const section = document.querySelector(`.ab-sec-${idx + 2}`);
    if (section && lenisRef.current) {
      lenisRef.current.scrollTo(section, { offset: 0, duration: 1.2 });
    }
  };

  const chapters = ["Origin", "Craft", "Person", "Philosophy"];

  return (
    <div data-page="about" className="ab-page" ref={pageRef} style={{ backgroundColor: "#080808" }}>
      {/* Page Loader */}
      <div id="page-loader">
        <div className="loader-text">David<span>.</span></div>
        <div className="loader-bar-container">
          <div id="loader-progress"></div>
        </div>
      </div>

      {/* Noise Overlay */}
      <div className="ab-noise">
        <svg xmlns="http://www.w3.org/2000/svg">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch"/>
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)"/>
        </svg>
      </div>

      <div className="ab-page-content" style={{ opacity: 1 }}>

        {/* Progress Dots */}
        <div className="ab-prog-tracker">
          {chapters.map((ch, i) => (
            <div key={i} className="ab-prog-dot-wrap" onClick={() => scrollToChapter(i)} data-cursor="hover">
              <div className={`ab-prog-dot ${activeChapter === i ? "active" : ""}`} />
              <div className="ab-prog-tooltip">{ch}</div>
            </div>
          ))}
        </div>

        {/* Section 1: Arrival */}
        <section className="ab-section ab-sec-1">
          <div className="ab-hero-blob" />
          <div className="ab-hero-content">
            <div className="ab-hero-eyebrow">About</div>
            <h1 className="ab-hero-title">
              <div className="ab-hero-line" style={{ color: "var(--text)" }}>I Build</div>
              <div className="ab-hero-line ghost">Worlds</div>
              <div className="ab-hero-line" style={{ color: "var(--accent)" }}>From Code.</div>
            </h1>
            <div className="ab-hero-sub">Designer. Engineer. Storyteller. Based in Lagos, building for the world.</div>
          </div>
          <div className="ab-scroll-ind">
            <span>SCROLL</span>
            <div className="ab-scroll-line" />
          </div>
        </section>

        {/* Section 2: Origin */}
        <section className="ab-section ab-sec-2" data-chapter-idx="0">
          <div className="ab-ch-label ab-ch-label-1">Chapter 01 — Origin</div>
          <div className="ab-s2-layout">
            <div className="ab-s2-left">
              <div className="ab-s2-img-wrap">
                <div className="ab-s2-img">
                  <Image
                    src="/images/image.jpeg"
                    alt="David Adebayo"
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    priority
                    className="ab-s2-photo"
                  />
                  <div className="ab-s2-photo-gradient" />
                </div>
                <svg className="ab-s2-brackets" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Top Left */}
                  <path className="ab-s2-bracket" d="M 0 40 L 0 0 L 40 0" />
                  {/* Top Right */}
                  <path className="ab-s2-bracket" d="M 60 0 L 100 0 L 100 40" />
                  {/* Bottom Right */}
                  <path className="ab-s2-bracket" d="M 100 60 L 100 100 L 60 100" />
                  {/* Bottom Left */}
                  <path className="ab-s2-bracket" d="M 40 100 L 0 100 L 0 60" />
                </svg>
              </div>
              <div className="ab-s2-stat">
                <div className="ab-s2-stat-num">#1</div>
                <div className="ab-s2-stat-sub">Nigeria · Behance</div>
              </div>
            </div>
            <div className="ab-s2-right">
              <div className="ab-s2-open">Lagos gave me hunger.</div>
              <div className="ab-s2-p">David Adebayo is a UI/UX designer and software engineer who has worked with hundreds of brands and companies across the world — building digital products that are precise, alive, and impossible to ignore. He holds the #1 spot in the UI/UX category in Nigeria on Behance, and #2 across all fields — without posting a single project in 2025 or 2026.</div>
              <div className="ab-s2-p">His work sits at the intersection of design systems and engineering reality. He doesn&apos;t just design screens — he builds the code behind them. From React Native mobile apps to Next.js web platforms to WordPress ecosystems, David moves between disciplines the way a musician moves between instruments: fluently, without apology.</div>
              <div className="ab-s2-p">He is based in Lagos. He works for the world.</div>
              <div className="ab-s2-hr" />
            </div>
          </div>
        </section>

        {/* Section 3: Craft */}
        <section className="ab-section ab-sec-3" data-chapter-idx="1">
          <div className="ab-s3-bg" />
          <div className="ab-ch-label ab-ch-label-2">Chapter 02 — The Craft</div>
          <h2 className="ab-s3-head">
            {"Built Different.".split("").map((c, i) => (
              <span key={i} className="ab-s3-head-char" data-char={c}>{c}</span>
            ))}
          </h2>
          <div className="ab-s3-cols">
            <div className="ab-s3-col">
              <div className="ab-s3-col-head">Design & Creative</div>
              {["UI/UX Design", "Design Systems", "Mobile-first Design", "Prototyping", "Motion Design", "Motion Graphics", "Video Editing", "Brand Identity", "Figma", "Webflow"].map(s => (
                <div key={s} className="ab-s3-item">
                  <div className="ab-s3-dot" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
            <div className="ab-s3-col">
              <div className="ab-s3-col-head">Engineering</div>
              {["React Native / Expo", "Next.js", "Django / Python", "Node.js", "TypeScript", "Java", "Kotlin", "Flutter", "WordPress / Elementor", "REST APIs"].map(s => (
                <div key={s} className="ab-s3-item">
                  <div className="ab-s3-dot" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
            <div className="ab-s3-col">
              <div className="ab-s3-col-head">Tools & Platforms</div>
              {["Three.js", "GSAP", "Framer Motion", "Blender", "Cloudinary", "Vercel", "Git", "Figma → Code"].map(s => (
                <div key={s} className="ab-s3-item">
                  <div className="ab-s3-dot" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="ab-s3-figma">
            <div className="ab-s3-figma-text">
              <div className="ab-s3-figma-lbl">Primary Weapon</div>
              <div className="ab-s3-figma-title">Figma</div>
              <div className="ab-s3-figma-sub">Every pixel starts here.</div>
            </div>
            <div className="ab-s3-figma-visual">
              <svg viewBox="0 0 100 100" className="ab-figma-svg">
                <rect className="ab-figma-rect" x="10" y="20" width="40" height="60" rx="4" />
                <rect className="ab-figma-rect" x="30" y="10" width="40" height="60" rx="4" />
                <rect className="ab-figma-rect" x="50" y="30" width="40" height="60" rx="4" />
              </svg>
            </div>
          </div>
        </section>

        {/* Section 4: Faith & Person */}
        <section className="ab-section ab-sec-4" data-chapter-idx="2">
          <div className="ab-ch-label ab-ch-label-3">Chapter 03 — The Person</div>
          <div className="ab-s4-content">
            <div className="ab-s4-quote">&quot;I build with my hands. I live by my faith.&quot;</div>
            <div className="ab-s4-hr" />
            <div className="ab-s4-p">David&apos;s faith is not a footnote. It is the foundation. Every project he takes on, every decision he makes — it runs through a filter of purpose. He doesn&apos;t build for applause. He builds because it means something.</div>
            <div className="ab-s4-p">He and Ife share a relationship defined by depth, not performance. The kind that holds steady when the work is hard and the nights are long. That groundedness shows up in his work — in the care, the patience, the refusal to ship something that isn&apos;t right.</div>
            
            <div className="ab-s4-icons">
              <svg className="ab-s4-icon" viewBox="0 0 24 24"><path d="M12 2v20M7 7h10" strokeDasharray="100" strokeDashoffset="100"/></svg>
              <svg className="ab-s4-icon" viewBox="0 0 40 24"><circle cx="14" cy="12" r="8" strokeDasharray="100" strokeDashoffset="100"/><circle cx="26" cy="12" r="8" strokeDasharray="100" strokeDashoffset="100"/></svg>
              <svg className="ab-s4-icon" viewBox="0 0 24 24"><path d="M8 6l-6 6 6 6M16 6l6 6-6 6M14 4l-4 16" strokeDasharray="100" strokeDashoffset="100"/></svg>
            </div>

            <div className="ab-s4-p">Outside the screen, he thinks in systems. He sees design in everything — in theology, in conversation, in the way a good meal is plated. He is a builder who never fully clocks out.</div>
          </div>
        </section>

        {/* Section 5: Philosophy */}
        <section className="ab-section ab-sec-5" data-chapter-idx="3">
          <div className="ab-ch-label ab-ch-label-4">Chapter 04 — Philosophy</div>
          <h2 className="ab-s5-head">
            <div className="ab-s5-head-line" style={{ color: "var(--text)" }}>How I</div>
            <div className="ab-s5-head-line ghost">Think.</div>
          </h2>
          <div className="ab-s5-statements">
            {[
              { num: "01", title: "Design Is a Conversation", sub: "Every interface is a dialogue between a person and a possibility. If the design talks down to the user, I've failed. If it disappears — if it just works — I've done my job." },
              { num: "02", title: "Code Is Not Separate From Design", sub: "The divide between designer and developer is a lie sold by people who are afraid to learn both. I live in both. The best work lives there too." },
              { num: "03", title: "Craft Over Speed", sub: "I would rather ship one thing that is undeniably right than ten things that are merely acceptable. Quality is not a feature. It is the only metric that matters." },
              { num: "04", title: "Purpose Over Applause", sub: "I don't build for likes or rankings — though they come. I build because I believe digital products can genuinely change lives. That belief shows up in every decision." }
            ].map((st, i) => (
              <div className="ab-s5-row" key={st.num}>
                <div className="ab-s5-num">{st.num}</div>
                <div className="ab-s5-text">
                  <div className="ab-s5-title">{st.title}</div>
                  <div className="ab-s5-sub">{st.sub}</div>
                </div>
                {i < 3 && <div className="ab-s5-hr" />}
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: CTA */}
        <section className="ab-section ab-sec-6">
          <div className="ab-s6-blob" />
          <div className="ab-s6-content">
            <div className="ab-s6-close">If you&apos;ve read this far, we should probably talk.</div>
            <h2 className="ab-s6-head">
              <div className="ab-s6-head-line" style={{ color: "var(--text)" }}>Let&apos;s Build</div>
              <div className="ab-s6-head-line ghost">Something Real.</div>
            </h2>
            <div className="ab-s6-btns">
              <button className="ab-btn-primary" onClick={() => navigateTo("/contact")} data-cursor="hover">Start a Conversation</button>
              <button className="ab-btn-secondary" onClick={() => navigateTo("/projects")} data-cursor="hover">See the Work →</button>
            </div>
            <div className="ab-s6-social">
              <a href="https://www.linkedin.com/in/david-adebayo/" target="_blank" rel="noopener noreferrer" data-cursor="hover">LINKEDIN</a>
              <a href="https://www.behance.net/xtremedavid" target="_blank" rel="noopener noreferrer" data-cursor="hover">BEHANCE</a>
              <a href="mailto:davidadebayo702@gmail.com" data-cursor="hover">EMAIL</a>
            </div>
          </div>
          <div className="ab-s6-foot">Lagos · Nigeria · The World</div>
        </section>

      </div>
    </div>
  );
}
