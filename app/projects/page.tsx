/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import projectsData from "@/app/data/projects.cdn.json";

/* ───────── Types ───────── */
interface MediaItem {
  index: number;
  type: string;
  src: string | null;
  embedUrl?: string;
  alt?: string;
  vimeoId?: string | null;
  youtubeId?: string | null;
  downloaded?: boolean;
}

interface Project {
  id: string;
  title: string;
  url: string;
  slug: string;
  description: string;
  tags: string[];
  tools: string[];
  published: string;
  appreciations: string;
  views: string;
  cover: string;
  media: MediaItem[];
  mediaCount: number;
}

/* ───────── Helpers ───────── */
const parseNumber = (s: string): number =>
  parseInt(s.replace(/,/g, ""), 10) || 0;

const FILTER_TAGS = [
  "All",
  "Web Design",
  "UI/UX",
  "Mobile App",
  "Branding",
  "3D",
  "Motion",
  "Figma",
];

function getMediaTypeBadge(media: MediaItem[]): { icon: string; label: string } {
  const types = new Set(media.map((m) => m.type));
  if (media.some((m) => m.embedUrl?.includes("figma")))
    return { icon: "◈", label: "Interactive" };
  if (types.has("vimeo") || types.has("youtube") || types.has("embed"))
    return { icon: "▶", label: "Video" };
  if (types.has("gif")) return { icon: "⟳", label: "GIF" };
  return { icon: "◻", label: "Images" };
}

function getCardLayout(index: number): "featured" | "tall" | "normal" {
  const pos = index % 6;
  if (pos === 0 || pos === 5) return "featured";
  if (pos === 1) return "tall";
  return "normal";
}

function extractYear(published: string): string {
  const match = published.match(/\d{4}/);
  return match ? match[0] : "";
}

/* ───────── Cursor Init ───────── */
function initCursor(gsap: any) {
  const dot = document.getElementById("cursor-dot");
  const ring = document.getElementById("cursor-ring");
  if (!dot || !ring) return;

  document.addEventListener("mousemove", (e) => {
    gsap.set(dot, { x: e.clientX, y: e.clientY });
    gsap.to(ring, { x: e.clientX, y: e.clientY, duration: 0.35, ease: "power2.out" });
  });

  const bindHoverTargets = () => {
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
  };

  bindHoverTargets();

  document.addEventListener("mousedown", () => {
    gsap.to([dot, ring], { scale: 0.8, duration: 0.1 });
  });
  document.addEventListener("mouseup", () => {
    gsap.to(dot, { scale: 1, duration: 0.3, ease: "elastic.out(1,0.3)" });
    gsap.to(ring, { scale: 1, duration: 0.3, ease: "elastic.out(1,0.3)" });
  });
}

/* ───────── Component ───────── */
export default function ProjectsPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("All");
  const pageRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const toolsMarqueeRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const statsRef = useRef<HTMLDivElement>(null);
  const gsapCtxRef = useRef<any>(null);

  const projects = useMemo(() => projectsData as Project[], []);

  const totalProjects = projects.length;
  const totalAppreciations = useMemo(
    () => projects.reduce((sum, p) => sum + parseNumber(p.appreciations), 0),
    [projects]
  );
  const totalViews = useMemo(
    () => projects.reduce((sum, p) => sum + parseNumber(p.views), 0),
    [projects]
  );

  const allTools = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.tools.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (activeFilter === "All") return projects;
    return projects.filter((p) =>
      p.tags.some((t) => t.toLowerCase().includes(activeFilter.toLowerCase()))
    );
  }, [activeFilter, projects]);

  /* ───── Card click exit animation ───── */
  const handleCardClick = useCallback(
    (slug: string, cardEl: HTMLDivElement | null) => {
      const gsap = (window as any).gsap;
      if (!gsap || !cardEl) {
        router.push(`/work/${slug}`);
        return;
      }
      const allCards = gridRef.current?.querySelectorAll(".wk-card");
      const tl = gsap.timeline({
        onComplete: () => router.push(`/work/${slug}`),
      });
      if (allCards) {
        allCards.forEach((c: Element) => {
          if (c !== cardEl) {
            tl.to(c, { opacity: 0, duration: 0.35, ease: "power2.in" }, 0);
          }
        });
      }
      tl.to(
        cardEl,
        {
          scale: 1.05,
          opacity: 0,
          duration: 0.5,
          ease: "expo.inOut",
        },
        0
      );
    },
    [router]
  );

  /* ───── Filter transition ───── */
  const handleFilter = useCallback(
    (tag: string) => {
      if (tag === activeFilter) return;
      const gsap = (window as any).gsap;
      if (gsap && gridRef.current) {
        const cards = gridRef.current.querySelectorAll(".wk-card");
        gsap.to(cards, {
          opacity: 0,
          y: 30,
          duration: 0.25,
          stagger: 0.03,
          ease: "power2.in",
          onComplete: () => {
            setActiveFilter(tag);
          },
        });
      } else {
        setActiveFilter(tag);
      }
    },
    [activeFilter]
  );

  /* ───── GSAP Init: Lenis, Cursor, Hero Animations ───── */
  useEffect(() => {
    const init = () => {
      const gsap = (window as any).gsap;
      const ScrollTrigger = (window as any).ScrollTrigger;
      const Lenis = (window as any).Lenis;
      if (!gsap || !ScrollTrigger) return;
      gsap.registerPlugin(ScrollTrigger);

      /* Kill stale GSAP context from previous mount */
      gsapCtxRef.current?.revert();

      const ctx = gsap.context(() => {
        /* Reset page visibility (exit animations leave opacity:0) */
        if (pageRef.current) {
          gsap.set(pageRef.current, { clearProps: "opacity,y,transform" });
        }

        /* Lenis smooth scroll */
        if (Lenis) {
          const lenis = new Lenis({
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
          lenis.on("scroll", ScrollTrigger.update);
          gsap.ticker.add((time: number) => lenis.raf(time * 1000));
          gsap.ticker.lagSmoothing(0);
        }

        /* Custom cursor */
        initCursor(gsap);

        /* Progress bar */
        const progressBar = document.getElementById("progress-bar");
        if (progressBar) {
          gsap.to(progressBar, {
            width: "100%",
            ease: "none",
            scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.3 },
          });
        }

        /* Loader exit */
        const loaderTl = gsap.timeline();
        loaderTl.to("#loader-progress", { width: "100%", duration: 0.6, ease: "power2.inOut" }, 0);
        loaderTl.to("#page-loader", { yPercent: -100, duration: 0.8, ease: "expo.inOut" }, 0.6);

        /* Logo hover */
        const logo = document.querySelector(".navbar__logo");
        if (logo) {
          logo.addEventListener("mouseenter", () => gsap.to(logo, { skewX: -6, duration: 0.3, ease: "power2.out" }));
          logo.addEventListener("mouseleave", () => gsap.to(logo, { skewX: 0, duration: 0.3, ease: "power2.out" }));
        }

        /* Hero Marquee */
        if (marqueeRef.current) {
          gsap.to(marqueeRef.current.querySelectorAll(".wk-marquee-span"), {
            x: "-50%",
            duration: 30,
            ease: "none",
            repeat: -1,
          });
        }

        /* Eyebrow */
        gsap.from(".wk-hero-eyebrow", {
          y: -10,
          opacity: 0,
          duration: 0.8,
          ease: "expo.out",
          delay: 0.2,
        });

        /* Heading chars */
        const headingChars = document.querySelectorAll(".wk-heading-char");
        gsap.from(headingChars, {
          y: 80,
          opacity: 0,
          rotationX: -70,
          stagger: 0.04,
          duration: 1,
          ease: "expo.out",
          delay: 0.3,
        });

        /* Stats count-up */
        if (statsRef.current) {
          const statEls = statsRef.current.querySelectorAll("[data-wk-count]");
          statEls.forEach((el: Element) => {
            const target = parseInt(
              (el as HTMLElement).dataset.wkCount || "0",
              10
            );
            const obj = { val: 0 };
            gsap.to(obj, {
              val: target,
              duration: 2,
              ease: "power2.out",
              delay: 0.6,
              onUpdate: () => {
                (el as HTMLElement).textContent = Math.round(
                  obj.val
                ).toLocaleString();
              },
            });
          });
        }

        /* Filter tabs */
        gsap.from(".wk-filter-pill", {
          y: 20,
          opacity: 0,
          stagger: 0.05,
          duration: 0.6,
          ease: "expo.out",
          delay: 1.0,
        });

        /* Tools marquee */
        if (toolsMarqueeRef.current) {
          gsap.to(
            toolsMarqueeRef.current.querySelectorAll(".wk-tools-marquee-span"),
            {
              x: "-50%",
              duration: 20,
              ease: "none",
              repeat: -1,
            }
          );
        }
      }, pageRef);

      gsapCtxRef.current = ctx;
    };

    if ((window as any).gsap && (window as any).ScrollTrigger) {
      init();
    } else {
      window.addEventListener("load", init);
      return () => window.removeEventListener("load", init);
    }
  }, []);

  /* ───── Cleanup GSAP context on unmount ───── */
  useEffect(() => {
    return () => {
      gsapCtxRef.current?.revert();
    };
  }, []);

  /* ───── Card scroll entrance ───── */
  useEffect(() => {
    const gsap = (window as any).gsap;
    const ScrollTrigger = (window as any).ScrollTrigger;
    if (!gsap || !ScrollTrigger) return;

    const raf = requestAnimationFrame(() => {
      const cards = gridRef.current?.querySelectorAll(".wk-card");
      if (!cards) return;

      // Reset cards
      gsap.set(cards, { opacity: 0, y: 60, rotateX: 8 });

      cards.forEach((card, j) => {
        ScrollTrigger.create({
          trigger: card,
          start: "top 88%",
          once: true,
          onEnter: () => {
            gsap.to(card, {
              opacity: 1,
              y: 0,
              rotateX: 0,
              duration: 0.9,
              delay: (j % 3) * 0.1,
              ease: "expo.out",
            });
          },
        });
      });
    });

    return () => cancelAnimationFrame(raf);
  }, [filteredProjects]);

  /* ───── Card hover GSAP ───── */
  const handleMouseEnter = useCallback((el: HTMLDivElement | null) => {
    const gsap = (window as any).gsap;
    if (!gsap || !el) return;
    gsap.to(el, {
      y: -8,
      borderColor: "rgba(200,255,0,0.25)",
      boxShadow:
        "0 32px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(200,255,0,0.1)",
      duration: 0.4,
      ease: "expo.out",
    });
    const img = el.querySelector(".wk-card-img");
    if (img)
      gsap.to(img, { scale: 1.06, duration: 0.7, ease: "expo.out" });
    const overlay = el.querySelector(".wk-card-overlay");
    if (overlay) gsap.to(overlay, { opacity: 1, duration: 0.35 });
    const arrow = el.querySelector(".wk-card-arrow");
    if (arrow)
      gsap.to(arrow, { scale: 1, opacity: 1, duration: 0.4, ease: "expo.out" });
  }, []);

  const handleMouseLeave = useCallback((el: HTMLDivElement | null) => {
    const gsap = (window as any).gsap;
    if (!gsap || !el) return;
    gsap.to(el, {
      y: 0,
      borderColor: "rgba(255,255,255,0.08)",
      boxShadow: "none",
      duration: 0.4,
      ease: "expo.out",
    });
    const img = el.querySelector(".wk-card-img");
    if (img) gsap.to(img, { scale: 1, duration: 0.7, ease: "expo.out" });
    const overlay = el.querySelector(".wk-card-overlay");
    if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.35 });
    const arrow = el.querySelector(".wk-card-arrow");
    if (arrow)
      gsap.to(arrow, { scale: 0.6, opacity: 0, duration: 0.3 });
  }, []);

  /* ───── Build titles string for marquee ───── */
  const marqueeText = useMemo(
    () => projects.map((p) => p.title).join("  ·  ") + "  ·  ",
    [projects]
  );

  /* ───── Build tools string for bottom marquee ───── */
  const toolsText = useMemo(
    () => allTools.join("  ·  ") + "  ·  ",
    [allTools]
  );

  return (
    <div data-page="work" className="wk-page" ref={pageRef}>
      {/* ──────── PAGE LOADER ──────── */}
      <div id="page-loader">
        <div className="loader-text">David<span>.</span></div>
        <div className="loader-bar-container">
          <div id="loader-progress"></div>
        </div>
      </div>

      {/* ──────── SECTION 1 — HERO ──────── */}
      <section className="wk-hero" ref={heroRef}>
        {/* Marquee background */}
        <div className="wk-hero-marquee" ref={marqueeRef} aria-hidden="true">
          <span className="wk-marquee-span">{marqueeText}</span>
          <span className="wk-marquee-span">{marqueeText}</span>
        </div>

        {/* Foreground */}
        <div className="wk-hero-content">
          <span className="wk-hero-eyebrow">Selected Work</span>

          <h1 className="wk-hero-heading">
            <span className="wk-heading-line1">
              {"The Work".split("").map((ch, i) => (
                <span className="wk-heading-char" key={`l1-${i}`}>
                  {ch === " " ? "\u00A0" : ch}
                </span>
              ))}
            </span>
            <br />
            <span className="wk-heading-line2">
              {"Speaks.".split("").map((ch, i) => (
                <span className="wk-heading-char wk-heading-char--outline" key={`l2-${i}`}>
                  {ch === " " ? "\u00A0" : ch}
                </span>
              ))}
            </span>
          </h1>

          {/* Stats */}
          <div className="wk-hero-stats" ref={statsRef}>
            <div className="wk-stat">
              <span className="wk-stat-number" data-wk-count={totalProjects}>
                0
              </span>
              <span className="wk-stat-label">Projects</span>
            </div>
            <div className="wk-stat">
              <span
                className="wk-stat-number"
                data-wk-count={totalAppreciations}
              >
                0
              </span>
              <span className="wk-stat-label">Appreciations</span>
            </div>
            <div className="wk-stat">
              <span className="wk-stat-number" data-wk-count={totalViews}>
                0
              </span>
              <span className="wk-stat-label">Total Views</span>
            </div>
          </div>

          {/* Filters */}
          <div className="wk-filters">
            {FILTER_TAGS.map((tag) => (
              <button
                key={tag}
                className={`wk-filter-pill ${
                  activeFilter === tag ? "wk-filter-pill--active" : ""
                }`}
                onClick={() => handleFilter(tag)}
                data-cursor="hover"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── SECTION 2 — PROJECTS GRID ──────── */}
      <section className="wk-grid-section">
        <div className="wk-grid" ref={gridRef}>
          {filteredProjects.map((project, index) => {
            const layout = getCardLayout(index);
            const badge = getMediaTypeBadge(project.media);
            const tags = project.tags.slice(0, 2);
            const year = extractYear(project.published);

            return (
              <div
                key={project.id}
                className={`wk-card wk-card--${layout}`}
                data-cursor="hover"
                ref={(el) => {
                  cardsRef.current[index] = el;
                }}
                onMouseEnter={() => handleMouseEnter(cardsRef.current[index])}
                onMouseLeave={() => handleMouseLeave(cardsRef.current[index])}
                onClick={() =>
                  handleCardClick(project.slug, cardsRef.current[index])
                }
              >
                {/* Image block */}
                <div className="wk-card-image-wrap">
                  <img
                    className="wk-card-img"
                    src={project.cover}
                    alt={project.title}
                    loading="lazy"
                  />

                  {/* Hover overlay */}
                  <div className="wk-card-overlay">
                    <span className="wk-card-arrow">→</span>
                  </div>

                  {/* Media type badge */}
                  <div className="wk-card-media-badge">
                    <span className="wk-card-media-icon">{badge.icon}</span>
                    <span>{badge.label}</span>
                  </div>

                  {/* Media count */}
                  <div className="wk-card-media-count">
                    {project.mediaCount}
                  </div>
                </div>

                {/* Card body */}
                <div className="wk-card-body">
                  <div className="wk-card-tags">
                    {tags.map((t, i) => (
                      <span key={i}>
                        <span className="wk-card-tag">{t}</span>
                        {i < tags.length - 1 && (
                          <span className="wk-card-tag-sep"> · </span>
                        )}
                      </span>
                    ))}
                  </div>
                  <h3 className="wk-card-title">{project.title}</h3>
                  {project.description && (
                    <p className="wk-card-desc">{project.description}</p>
                  )}
                  <div className="wk-card-bottom">
                    <div className="wk-card-meta">
                      <span>♥ {project.appreciations}</span>
                      <span>👁 {project.views}</span>
                    </div>
                    <span className="wk-card-year">{year}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ──────── SECTION 3 — BOTTOM STRIP ──────── */}
      <section className="wk-bottom-strip">
        <span className="wk-bottom-left">
          Showing {filteredProjects.length} of {totalProjects} Projects
        </span>
        <div className="wk-bottom-ticker" ref={toolsMarqueeRef}>
          <span className="wk-tools-marquee-span">{toolsText}</span>
          <span className="wk-tools-marquee-span">{toolsText}</span>
        </div>
        <a
          href="https://www.behance.net/xtremedavid"
          target="_blank"
          rel="noopener noreferrer"
          className="wk-bottom-right"
          data-cursor="hover"
        >
          View on Behance →
        </a>
      </section>
    </div>
  );
}
