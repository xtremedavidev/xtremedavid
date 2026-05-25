/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import projectsData from "@/app/data/projects.cdn.json";

/* ═══════════ Types ═══════════ */
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

const projects = projectsData as Project[];

/* ═══════════ Helpers ═══════════ */
function dedupeTools(tools: string[]): string[] {
  return [
    ...new Set(
      tools.flatMap((t) => t.split(",").map((s) => s.trim())).filter(Boolean)
    ),
  ];
}

function getRelatedProjects(current: Project, count = 3): Project[] {
  const currentTags = new Set(current.tags.map((t) => t.toLowerCase()));
  return projects
    .filter((p) => p.id !== current.id)
    .map((p) => ({
      project: p,
      score: p.tags.filter((t) => currentTags.has(t.toLowerCase())).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((x) => x.project);
}

function extractYear(published: string): string {
  const m = published.match(/\d{4}/);
  return m ? m[0] : "";
}

/* ═══════════ Cursor ═══════════ */
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

/* ═══════════ Sidebar Content (reusable) ═══════════ */
function SidebarContent({
  project,
  tools,
  onBack,
}: {
  project: Project;
  tools: string[];
  onBack: () => void;
}) {
  return (
    <>
      {/* Back */}
      <button className="pd-back" onClick={onBack} data-cursor="hover">
        ← All Work
      </button>

      {/* Title */}
      <h2 className="pd-sidebar-title">{project.title}</h2>
      <div className="pd-sidebar-line" />

      {/* Description */}
      {project.description && (
        <p className="pd-sidebar-desc">{project.description}</p>
      )}

      {/* Meta */}
      <div className="pd-meta-grid">
        <div className="pd-meta-item">
          <span className="pd-meta-label">Published</span>
          <span className="pd-meta-value">{project.published}</span>
        </div>
        <div className="pd-meta-item">
          <span className="pd-meta-label">Appreciations</span>
          <span className="pd-meta-value">♥ {project.appreciations}</span>
        </div>
        <div className="pd-meta-item">
          <span className="pd-meta-label">Views</span>
          <span className="pd-meta-value">👁 {project.views}</span>
        </div>
        <div className="pd-meta-item">
          <span className="pd-meta-label">Media</span>
          <span className="pd-meta-value">{project.mediaCount} assets</span>
        </div>
      </div>

      {/* Tags */}
      {project.tags.length > 0 && (
        <div className="pd-sidebar-section">
          <span className="pd-section-label">Tags</span>
          <div className="pd-pill-wrap">
            {project.tags.map((t, i) => (
              <span className="pd-pill" key={i}>{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* Tools */}
      {tools.length > 0 && (
        <div className="pd-sidebar-section">
          <span className="pd-section-label">Tools</span>
          <div className="pd-pill-wrap">
            {tools.map((t, i) => (
              <span className="pd-pill" key={i}>{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="pd-behance-cta"
        data-cursor="hover"
      >
        View on Behance ↗
      </a>
    </>
  );
}

/* ═══════════ Main Component ═══════════ */
export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const project = useMemo(() => projects.find((p) => p.slug === slug) || null, [slug]);

  /* State */
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [activeDot, setActiveDot] = useState(0);
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);

  /* Refs */
  const pageRef = useRef<HTMLDivElement>(null);
  const mediaColRef = useRef<HTMLDivElement>(null);
  const mediaItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const mobileInfoRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<any>(null);
  const gsapCtxRef = useRef<any>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  /* Derived */
  const tools = useMemo(() => (project ? dedupeTools(project.tools) : []), [project]);
  const renderableMedia = useMemo(
    () =>
      project
        ? project.media.filter(
            (m) => m.src || m.embedUrl
          )
        : [],
    [project]
  );
  const lightboxMedia = useMemo(
    () => renderableMedia.filter((m) => (m.type === "image" || m.type === "gif") && m.src),
    [renderableMedia]
  );
  const relatedProjects = useMemo(
    () => (project ? getRelatedProjects(project) : []),
    [project]
  );

  /* ═══ Navigate with exit transition ═══ */
  const navigateTo = useCallback(
    (href: string) => {
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
    },
    [router]
  );

  /* ═══ GSAP Init ═══ */
  useEffect(() => {
    if (!project) return;

    const init = () => {
      const gsap = (window as any).gsap;
      const ScrollTrigger = (window as any).ScrollTrigger;
      const Lenis = (window as any).Lenis;
      if (!gsap || !ScrollTrigger) return;
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        /* Lenis */
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

        /* Cursor */
        initCursor(gsap);

        /* Reset stale exit-animation styles, then page enter */
        if (pageRef.current) {
          gsap.set(pageRef.current, { clearProps: "all" });
          gsap.fromTo(pageRef.current, 
            { opacity: 0, y: 30 }, 
            { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
          );
        }

        /* Progress bar */
        const progressBar = document.getElementById("progress-bar");
        if (progressBar) {
          gsap.to(progressBar, {
            width: "100%",
            ease: "none",
            scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.3 },
          });
        }

        /* Hero parallax */
        const heroCover = document.querySelector(".pd-hero-cover");
        const heroContent = document.querySelector(".pd-hero-content");
        if (heroCover) {
          gsap.to(heroCover, {
            yPercent: 20,
            ease: "none",
            scrollTrigger: { trigger: ".pd-hero", start: "top top", end: "bottom top", scrub: true },
          });
        }
        if (heroContent) {
          gsap.to(heroContent, {
            yPercent: 30,
            ease: "none",
            scrollTrigger: { trigger: ".pd-hero", start: "top top", end: "bottom top", scrub: true },
          });
        }

        /* Hero entrance */
        gsap.fromTo(".pd-hero-cover", 
          { opacity: 0, scale: 1.08 }, 
          { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" }
        );
        const titleChars = document.querySelectorAll(".pd-hero-char");
        if (titleChars.length) {
          gsap.fromTo(titleChars, 
            { y: 60, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.03, duration: 0.9, delay: 0.4, ease: "expo.out" }
          );
        }
        gsap.fromTo(".pd-hero-tags", 
          { y: 20, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.6, delay: 0.8, ease: "expo.out" }
        );

        /* Sidebar line draw */
        gsap.from(".pd-sidebar-line", {
          scaleX: 0, duration: 0.8, delay: 0.5, ease: "expo.out", transformOrigin: "left",
        });

      }, pageRef);

      gsapCtxRef.current = ctx;
    };

    if ((window as any).gsap && (window as any).ScrollTrigger) {
      setTimeout(init, 50);
    } else {
      window.addEventListener("load", init);
      return () => window.removeEventListener("load", init);
    }
  }, [project]);

  /* ═══ Media fade observer ═══ */
  useEffect(() => {
    if (!project || !mediaColRef.current) return;
    const gsap = (window as any).gsap;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            if (gsap) {
              gsap.to(el, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" });
            } else {
              el.style.opacity = "1";
              el.style.transform = "translateY(0)";
            }
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1 }
    );

    const items = mediaColRef.current.querySelectorAll(".pd-media-item");
    items.forEach((item, i) => {
      const el = item as HTMLElement;
      // First 3 items don't need fade (they're near hero)
      if (i < 3) {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      } else {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
        el.style.transition = "none";
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [project, renderableMedia]);

  /* ═══ Dot tracking observer ═══ */
  useEffect(() => {
    if (!project || !mediaColRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt((entry.target as HTMLElement).dataset.mediaIdx || "0", 10);
            setActiveDot(idx);
          }
        });
      },
      { rootMargin: "0px 0px -60% 0px", threshold: 0 }
    );

    const items = mediaColRef.current.querySelectorAll(".pd-media-item");
    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [project, renderableMedia]);

  /* ═══ Cleanup ═══ */
  useEffect(() => {
    return () => {
      gsapCtxRef.current?.revert();
    };
  }, []);

  /* ═══ Lightbox keyboard + touch ═══ */
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") setLightboxIdx((i) => Math.min(i + 1, lightboxMedia.length - 1));
      if (e.key === "ArrowLeft") setLightboxIdx((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxOpen, lightboxMedia.length]);

  /* ═══ Touch swipe for lightbox ═══ */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
      if (Math.abs(dx) > 50) {
        if (dx < 0) setLightboxIdx((i) => Math.min(i + 1, lightboxMedia.length - 1));
        else setLightboxIdx((i) => Math.max(i - 1, 0));
      }
      touchStartRef.current = null;
    },
    [lightboxMedia.length]
  );

  /* ═══ Open lightbox for a media item ═══ */
  const openLightbox = useCallback(
    (mediaItem: MediaItem) => {
      const idx = lightboxMedia.findIndex((m) => m.index === mediaItem.index);
      if (idx >= 0) {
        setLightboxIdx(idx);
        setLightboxOpen(true);
      }
    },
    [lightboxMedia]
  );

  /* ═══ Scroll to media dot ═══ */
  const scrollToDot = useCallback((idx: number) => {
    const el = mediaItemsRef.current[idx];
    if (!el) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset: -80, duration: 1.2 });
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  /* ═══ Mobile info toggle ═══ */
  const toggleMobileInfo = useCallback(() => {
    const gsap = (window as any).gsap;
    if (!mobileInfoRef.current) return;
    if (mobileInfoOpen) {
      gsap?.to(mobileInfoRef.current, {
        height: 0, duration: 0.4, ease: "power3.inOut", overflow: "hidden",
        onComplete: () => setMobileInfoOpen(false),
      });
    } else {
      setMobileInfoOpen(true);
      requestAnimationFrame(() => {
        if (mobileInfoRef.current) {
          gsap?.from(mobileInfoRef.current, {
            height: 0, duration: 0.5, ease: "power3.out", overflow: "hidden",
          });
        }
      });
    }
  }, [mobileInfoOpen]);

  /* ═══════════ 404 ═══════════ */
  if (!project) {
    return (
      <div className="pd-page pd-not-found" ref={pageRef} data-page="work-detail">
        <div className="pd-not-found-inner">
          <h1>Project not found</h1>
          <a href="/projects" className="pd-back" data-cursor="hover">← Back to Work</a>
        </div>
      </div>
    );
  }

  /* ═══════════ Render ═══════════ */
  return (
    <div className="pd-page" ref={pageRef} data-page="work-detail">

      {/* ══════ HERO ══════ */}
      <section className="pd-hero">
        <img className="pd-hero-cover" src={project.cover} alt={project.title} />
        <div className="pd-hero-overlay" />
        <div className="pd-hero-content">
          <span className="pd-hero-label">Project</span>
          <h1 className="pd-hero-title">
            {project.title.split("").map((ch, i) => (
              <span className="pd-hero-char" key={i}>
                {ch === " " ? "\u00A0" : ch}
              </span>
            ))}
          </h1>
          <div className="pd-hero-tags">
            {project.tags.slice(0, 5).map((t, i) => (
              <span className="pd-hero-tag" key={i}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ MOBILE STICKY STRIP ══════ */}
      <div className="pd-mobile-strip">
        <button className="pd-mobile-strip-back" onClick={() => navigateTo("/projects")} data-cursor="hover">
          ← Work
        </button>
        <span className="pd-mobile-strip-title">{project.title}</span>
      </div>
      <button className="pd-mobile-toggle" onClick={toggleMobileInfo} data-cursor="hover">
        {mobileInfoOpen ? "Close Info ✕" : "Project Info ▾"}
      </button>
      {mobileInfoOpen && (
        <div className="pd-mobile-info" ref={mobileInfoRef}>
          <SidebarContent project={project} tools={tools} onBack={() => navigateTo("/projects")} />
        </div>
      )}

      {/* ══════ LAYOUT: SIDEBAR + MEDIA ══════ */}
      <div className="pd-layout">
        {/* SIDEBAR */}
        <aside className="pd-sidebar">
          <SidebarContent project={project} tools={tools} onBack={() => navigateTo("/projects")} />

          {/* Media nav dots */}
          <div className="pd-dots">
            {renderableMedia.map((_, i) => (
              <button
                key={i}
                className={`pd-dot ${activeDot === i ? "pd-dot--active" : ""}`}
                onClick={() => scrollToDot(i)}
                aria-label={`Go to media ${i + 1}`}
              />
            ))}
          </div>
        </aside>

        {/* MEDIA COLUMN */}
        <main className="pd-media-col" ref={mediaColRef}>
          {renderableMedia.map((item, i) => {
            const isImageOrGif = (item.type === "image" || item.type === "gif") && item.src;
            const isVimeo = item.type === "vimeo" && item.embedUrl;
            const isFigma = item.embedUrl?.includes("figma");
            const isEmbed = item.type === "embed" && item.embedUrl && !isFigma;

            return (
              <div
                key={item.index}
                className="pd-media-item"
                data-media-idx={i}
                ref={(el) => { mediaItemsRef.current[i] = el; }}
                onClick={isImageOrGif ? () => openLightbox(item) : undefined}
                data-cursor={isImageOrGif ? "hover" : undefined}
              >
                {/* IMAGE / GIF */}
                {isImageOrGif && (
                  <img
                    className="pd-media-img"
                    src={item.src!}
                    alt={item.alt || project.title}
                    loading={i < 3 ? "eager" : "lazy"}
                  />
                )}

                {/* VIMEO */}
                {isVimeo && !isFigma && (
                  <div className="pd-video-block">
                    <iframe
                      src={`${item.embedUrl}?autoplay=1&loop=1&muted=1&controls=0&byline=0&portrait=0&title=0`}
                      allow="autoplay; fullscreen"
                      frameBorder="0"
                      title={`Video ${item.index}`}
                    />
                  </div>
                )}

                {/* EMBED (non-Figma) */}
                {isEmbed && (
                  <div className="pd-video-block">
                    <iframe
                      src={item.embedUrl}
                      allow="autoplay; fullscreen"
                      frameBorder="0"
                      title={`Embed ${item.index}`}
                    />
                  </div>
                )}

                {/* FIGMA */}
                {isFigma && (
                  <div className="pd-figma-block">
                    <div className="pd-figma-bar">
                      <span className="pd-figma-label">◈ Interactive Prototype</span>
                      <a
                        href={item.embedUrl!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pd-figma-link"
                        data-cursor="hover"
                      >
                        Open in Figma ↗
                      </a>
                    </div>
                    <div className="pd-figma-iframe-wrap">
                      <iframe
                        src={item.embedUrl}
                        allow="autoplay; fullscreen"
                        frameBorder="0"
                        title={`Figma ${item.index}`}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </main>
      </div>

      {/* ══════ RELATED PROJECTS ══════ */}
      <section className="pd-related">
        <h2 className="pd-related-heading">More Work</h2>
        <div className="pd-related-row">
          {relatedProjects.map((rp) => (
            <div
              key={rp.id}
              className="pd-related-card"
              data-cursor="hover"
              onClick={() => navigateTo(`/work/${rp.slug}`)}
            >
              <div className="pd-related-card-img-wrap">
                <img className="pd-related-card-img" src={rp.cover} alt={rp.title} loading="lazy" />
                <div className="pd-related-card-overlay">
                  <span className="pd-related-card-arrow">→</span>
                </div>
              </div>
              <div className="pd-related-card-body">
                <span className="pd-related-card-tag">{rp.tags.slice(0, 2).join(" · ")}</span>
                <h3 className="pd-related-card-title">{rp.title}</h3>
                <div className="pd-related-card-meta">
                  <span>♥ {rp.appreciations}</span>
                  <span>{extractYear(rp.published)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ LIGHTBOX ══════ */}
      {lightboxOpen && lightboxMedia[lightboxIdx] && (
        <div
          className="pd-lightbox"
          onClick={(e) => { if (e.target === e.currentTarget) setLightboxOpen(false); }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <img
            className="pd-lightbox-img"
            src={lightboxMedia[lightboxIdx].src!}
            alt={lightboxMedia[lightboxIdx].alt || ""}
          />

          {/* Close */}
          <button className="pd-lightbox-close" onClick={() => setLightboxOpen(false)} data-cursor="hover">
            ✕
          </button>

          {/* Arrows */}
          {lightboxIdx > 0 && (
            <button className="pd-lightbox-arrow pd-lightbox-arrow--left" onClick={() => setLightboxIdx((i) => i - 1)} data-cursor="hover">
              ←
            </button>
          )}
          {lightboxIdx < lightboxMedia.length - 1 && (
            <button className="pd-lightbox-arrow pd-lightbox-arrow--right" onClick={() => setLightboxIdx((i) => i + 1)} data-cursor="hover">
              →
            </button>
          )}

          {/* Counter */}
          <span className="pd-lightbox-counter">
            {lightboxIdx + 1} / {lightboxMedia.length}
          </span>
        </div>
      )}
    </div>
  );
}
