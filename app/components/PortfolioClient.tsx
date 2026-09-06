"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import Image from "next/image";
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function PortfolioClient() {
  const cleanupRef = useRef<(() => void) | null>(null);

  useIsomorphicLayoutEffect(() => {
    let isMounted = true;
    const init = () => {
       
      if (
        typeof window === "undefined" ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        !(window as any).gsap ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        !(window as any).THREE ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        !(window as any).Lenis
      )
        return;
      import("../lib/animations").then((mod) => {
        if (!isMounted) return; // Prevent running if unmounted during import
        const cleanup = mod.initAnimations();
        if (cleanup) cleanupRef.current = cleanup;
      });
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).gsap && (window as any).THREE && (window as any).Lenis) {
      init();
    } else {
      window.addEventListener("load", init);
    }

    return () => {
      isMounted = false;
      window.removeEventListener("load", init);
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, []);

  return (
    <main className="portfolio-page">
      {/* LOADER */}
      <div id="page-loader">
        <div className="loader-text">ADEBAYO<span>.</span></div>
        <div className="loader-bar-container">
          <div id="loader-progress"></div>
        </div>
      </div>

      {/* LIQUID RIPPLE OVERLAY */}
      <canvas id="liquid-canvas" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9998 }}></canvas>

      {/* HERO */}
      <section className="hero" id="hero">
        <canvas id="hero-canvas"></canvas>
        <div className="hero__vignette"></div>
        <div className="hero__content" id="hero-content">
          <h1 className="hero__name" id="hero-name-david">DAVID</h1>
          <h1 className="hero__name hero__name--outline" id="hero-name-adebayo">ADEBAYO</h1>
          <p className="hero__tagline" id="hero-tagline">UI/UX Designer &amp; Software Engineer</p>
          <p className="hero__subtagline" id="hero-subtagline">#1 in Nigeria on Behance · Building Digital Worlds</p>
          <div className="hero__line" id="hero-line"></div>
        </div>
        <div className="hero__scroll" id="hero-scroll">
          <span className="hero__scroll-text">SCROLL</span>
          <div className="hero__scroll-line" id="scroll-line-anim"></div>
        </div>
      </section>

      {/* THE WORK */}
      <section className="work-section" id="work">
        <p className="chapter-label chapter-label--left">Chapter 01 — The Work</p>
        <div className="work-section__heading">
          <h2><span id="work-word-1">Selected</span>{" "}<span id="work-word-2">Work</span></h2>
        </div>
        <div className="work-section__track" id="work-track">
          <Card image="/images/Carebond.png" tag="UI/UX · Web" title="Carebond" desc="Healthcare platform — design & development" href="https://www.carebond.ch/en" />
          <Card image="/images/Iris.png" tag="Web · Agency" title="The Iris" desc="Creative agency — branding & web" href="https://theiris.io" />
          <Card image="/images/behance.png" tag="UI/UX · Portfolio" title="Behance Portfolio" desc="#1 in Nigeria — UI/UX category showcase" href="https://behance.net/xtremedavid" />
          <Card image="/images/wonderphone.png" tag="Web · Product" title="Wonderphone" desc="Consumer tech — product site" href="https://www.wondersimple.com/" />
          <Card image="/images/kevda.png" tag="Web · Biotech" title="Kevda" desc="Bioworks — science meets design" href="https://kevdabioworks.com" />
          <Card image="/images/codarket.png" tag="Web · Agency" title="Codarket" desc="Digital agency — timeless experiences" href="https://www.codarket.com/" />
          <Card tag="Web · SaaS" title="HitchGuardian" desc="Safety & security platform" href="https://www.hitchguardian.me/" />
          <Card image="/images/axy.png" tag="Web · Digital" title="AXY Digital" desc="Digital solutions — strategy & build" href="https://www.axy.digital/" />
        </div>
      </section>

      {/* THE CRAFT */}
      <section className="craft-section" id="craft">
        <div className="craft-section__bg" id="craft-bg"></div>
        <p className="chapter-label chapter-label--right">Chapter 02 — The Craft</p>
        <div className="craft-section__heading">
          <h2 id="craft-heading" dangerouslySetInnerHTML={{ __html: "Built Different" }} />
        </div>
        <div className="craft-section__grid">
          <div className="craft-section__copy">
            <p id="craft-copy" dangerouslySetInnerHTML={{ __html: "I don't just design screens — I architect experiences. Every pixel is a decision. Every interaction, a conversation." }} />
          </div>
          <div className="craft-section__tags" id="craft-tags">
            {["React Native","Next.js","Django","WordPress","Elementor","Three.js","GSAP","Figma","Framer","UI/UX","Design Systems","Python","Expo","TypeScript","Node.js","Healthcare Tech"].map((s) => (
              <span className="skill-tag" key={s} data-cursor="hover">{s}</span>
            ))}
          </div>
        </div>
        <div className="craft-section__stats" id="craft-stats">
          <div className="stat">
            <div className="stat__number" data-count="100" dangerouslySetInnerHTML={{ __html: "0" }} />
            <div className="stat__label">Brands Worked With</div>
          </div>
          <div className="stat">
            <div className="stat__number" data-count-text="#1" dangerouslySetInnerHTML={{ __html: "#0" }} />
            <div className="stat__label">Nigeria Behance UI/UX</div>
          </div>
          <div className="stat">
            <div className="stat__number" data-count="5" dangerouslySetInnerHTML={{ __html: "0" }} />
            <div className="stat__label">Years Building</div>
          </div>
        </div>
      </section>

      {/* THE PERSON */}
      <section className="person-section" id="person">
        <div className="person-section__ambient">ADEBAYO</div>
        <p className="chapter-label chapter-label--left">Chapter 03 — The Person</p>
        <div className="person-section__grid">
          <div className="person-section__image" id="person-image">
            <div className="person-section__image-inner">
              <Image
                src="/images/image.jpeg"
                alt="David Adebayo"
                fill
                sizes="(max-width: 768px) 320px, 380px"
                priority
                className="person-section__img"
              />
              <div className="person-section__overlay" />
            </div>
            <svg className="person-section__border-frame" id="person-frame" viewBox="0 0 400 534" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="398" height="532" rx="13" stroke="#C8FF00" strokeWidth="1.5" strokeDasharray="1868" strokeDashoffset="1868"/>
            </svg>
          </div>
          <div className="person-section__text">
            <p className="person-section__story" id="person-story" dangerouslySetInnerHTML={{ __html: "David Adebayo is a globally recognized UI/UX designer and software engineer. From Lagos to the world — his work sits at the intersection of craft, code, and storytelling. When he's not building products, he's in communion with his faith and his person, Ife." }} />
            <p className="person-section__quote" id="person-quote">Faith. Code. Purpose.</p>
          </div>
        </div>
      </section>

      {/* TESTIMONIES */}
      <section className="testimonies-section" id="testimonies">
        <p className="chapter-label chapter-label--right">Chapter 04 — Testimonies</p>
        <div className="testimonies__header">
          <h2 className="testimonies__title">What They Say</h2>
          <div className="testimonies__rule" />
        </div>
        
        <div className="testimonies__grid">
          {[
            {
              quote: "David doesn't just design; he architects experiences. The level of polish and technical foresight he brings is unmatched.",
              author: "Sarah Jenkins",
              role: "Product Director, TechNova"
            },
            {
              quote: "A rare breed of designer who actually understands code. He built our entire design system and it scales beautifully.",
              author: "Michael Okonkwo",
              role: "CTO, FinFlow"
            },
            {
              quote: "The best UI/UX talent I've worked with in years. David's attention to detail turned our MVP into a world-class product.",
              author: "Elena Rodriguez",
              role: "Founder, Studio X"
            }
          ].map((t, i) => (
            <div className="testimony-card" key={i} data-cursor="hover">
              <div className="testimony-card__quote-mark">&quot;</div>
              <p className="testimony-card__text">{t.quote}</p>
              <div className="testimony-card__author">
                <span className="testimony-card__name">{t.author}</span>
                <span className="testimony-card__role">{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* THE CALL */}
      <section className="cta-section" id="cta">
        <div className="cta-section__glow" id="cta-glow"></div>
        <div className="cta-section__content">
          <p className="chapter-label chapter-label--center">Chapter 05 — The Call</p>
          <div className="cta-section__heading" id="cta-heading">
            <h2>Let&apos;s Build Something</h2>
            <h2><span className="outline-text">The World Remembers.</span></h2>
          </div>
          <div className="cta-section__buttons">
            <a href="mailto:davidadebayo702@gmail.com" className="cta-section__btn-primary" data-cursor="hover">Start a Project</a>
            <a href="https://www.behance.net/xtremedavid" target="_blank" rel="noopener noreferrer" className="cta-section__btn-secondary" data-cursor="hover">View Full Behance</a>
          </div>
          <a href="mailto:davidadebayo702@gmail.com" className="cta-section__email" data-cursor="hover">davidadebayo702@gmail.com</a>
        </div>
        <footer className="footer">
          <div className="footer__rule"></div>
          <div className="footer__row">
            <span>© 2026 David Adebayo</span>
            <span>Designed &amp; Built by David</span>
          </div>
        </footer>
      </section>
    </main>
  );
}

function Card({ image, tag, title, desc, href }: { image?: string; tag: string; title: string; desc: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="project-card"
      data-cursor="hover"
    >
      <div className="project-card__image">
        {image ? (
          <div className="project-card__image-inner">
            <Image
              src={image}
              alt={title}
              fill
              sizes="480px"
              className="project-card__img"
            />
          </div>
        ) : (
          <div className="project-card__image-inner project-card__gradient-fallback">
            <span className="project-card__image-initials">{title.split(" ").map(w => w[0]).join("")}</span>
          </div>
        )}
      </div>
      <div className="project-card__body">
        <span className="project-card__tag">{tag}</span>
        <h3 className="project-card__title">{title}</h3>
        <p className="project-card__desc">{desc}</p>
        <span className="project-card__link">Visit Site →</span>
      </div>
    </a>
  );
}
