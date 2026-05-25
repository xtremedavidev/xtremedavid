/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";

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
}

function useLagosTime() {
  const [timeParts, setTimeParts] = useState({ h: "00", m: "00", s: "00" });
  const [dateStr, setDateStr] = useState("");
  const [isAsleep, setIsAsleep] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Lagos is UTC+1 all year
      const lagosTime = new Date(now.getTime() + 3600 * 1000);
      
      const h = lagosTime.getUTCHours().toString().padStart(2, "0");
      const m = lagosTime.getUTCMinutes().toString().padStart(2, "0");
      const s = lagosTime.getUTCSeconds().toString().padStart(2, "0");
      
      setTimeParts({ h, m, s });

      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      
      const dayName = days[lagosTime.getUTCDay()];
      const monthName = months[lagosTime.getUTCMonth()];
      const dateNum = lagosTime.getUTCDate();
      const year = lagosTime.getUTCFullYear();
      
      setDateStr(`${dayName}, ${monthName} ${dateNum}, ${year}`);

      const hour = parseInt(h, 10);
      setIsAsleep(hour >= 0 && hour < 7);
    };

    updateTime();
    const int = setInterval(updateTime, 1000);
    return () => clearInterval(int);
  }, []);

  return { timeParts, dateStr, isAsleep };
}

const PROJECT_TYPES = ["Website", "Mobile App", "Design System", "Brand & Identity", "Motion / Animation", "Something Else"];

export default function ContactPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const formCardRef = useRef<HTMLDivElement>(null);
  const gsapCtxRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);

  // Time & Status
  const { timeParts, dateStr, isAsleep } = useLagosTime();
  const prevSecRef = useRef(timeParts.s);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [projectTypes, setProjectTypes] = useState<string[]>([]);
  const [budgetVal, setBudgetVal] = useState(0.5); // 0.0 to 1.0
  
  // Interaction State
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Tooltip
  const hasGreeted = useRef(false);
  const [showGreeting, setShowGreeting] = useState(false);

  // Budget slider logic
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const hasPulsed = useRef(false);

  const getBudgetLabel = (val: number) => {
    if (val < 0.2) return "< $1K";
    if (val < 0.4) return "$1K – $5K";
    if (val < 0.6) return "$5K – $15K";
    if (val < 0.8) return "$15K – $50K";
    return "$50K+";
  };

  const currentBudgetLabel = getBudgetLabel(budgetVal);

  const toggleProjectType = (t: string) => {
    setProjectTypes(prev => prev.includes(t) ? prev.filter(p => p !== t) : [...prev, t]);
  };

  // Setup GSAP and Canvas
  useEffect(() => {
    const init = async () => {
      const gsap = (window as any).gsap;
      if (!gsap || !pageRef.current) return;

      const ctx = gsap.context(() => {
        // Page Enter
        gsap.set(pageRef.current, { clearProps: "all" });
        gsap.fromTo(pageRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });

        // Left Column Elements
        gsap.from(".ct-label-main", { y: -12, opacity: 0, duration: 0.6, delay: 0.3, ease: "power2.out" });
        
        // Headings stagger
        const lines = document.querySelectorAll(".ct-head-line");
        lines.forEach((line, lineIdx) => {
          const chars = line.querySelectorAll(".ct-char");
          gsap.from(chars, {
            y: 80,
            rotationX: -70,
            opacity: 0,
            duration: 0.8,
            ease: "expo.out",
            stagger: 0.025,
            delay: 0.5 + (lineIdx * 0.2)
          });
        });

        gsap.fromTo(".ct-hr", { scaleX: 0 }, { scaleX: 1, duration: 0.8, delay: 1.2, ease: "power3.out", transformOrigin: "left" });
        gsap.from(".ct-status-wrap", { opacity: 0, y: 10, duration: 0.8, delay: 1.5, ease: "power2.out" });
        gsap.from(".ct-direct-row", { y: 16, opacity: 0, duration: 0.6, delay: 1.7, stagger: 0.15, ease: "power2.out" });

        // Form Card Enter
        if (formCardRef.current) {
          gsap.fromTo(formCardRef.current, 
            { y: 40, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 1, delay: 0.6, ease: "expo.out" }
          );
          
          gsap.from(".ct-form-group", {
            y: 24, opacity: 0, duration: 0.8, delay: 0.8, stagger: 0.12, ease: "power2.out"
          });
        }

        // Canvas fade in
        gsap.to("#contact-bg-canvas", { opacity: 1, duration: 2, ease: "power2.inOut" });

        // Canvas BG Animation
        const canvas = canvasRef.current;

        // Initialize Cursor
        initCursor(gsap);
        if (canvas) {
          const c = canvas.getContext("2d");
          if (c) {
            let time = 0;
            const render = () => {
              if (!canvas) return;
              canvas.width = window.innerWidth;
              canvas.height = window.innerHeight;
              const w = canvas.width;
              const h = canvas.height;
              
              c.clearRect(0, 0, w, h);
              c.globalCompositeOperation = "screen";

              // Orb 1: Lime
              const o1x = w * 0.2 + Math.sin(time * 0.0005) * 200;
              const o1y = h * 0.3 + Math.cos(time * 0.0003) * 150;
              const g1 = c.createRadialGradient(o1x, o1y, 0, o1x, o1y, 600);
              g1.addColorStop(0, "rgba(200,255,0,0.04)");
              g1.addColorStop(1, "rgba(200,255,0,0)");
              c.fillStyle = g1;
              c.fillRect(0, 0, w, h);

              // Orb 2: Orange
              const o2x = w * 0.8 + Math.cos(time * 0.0004 + 1) * 300;
              const o2y = h * 0.7 + Math.sin(time * 0.0006 + 2) * 200;
              const g2 = c.createRadialGradient(o2x, o2y, 0, o2x, o2y, 400);
              g2.addColorStop(0, "rgba(255,77,0,0.025)");
              g2.addColorStop(1, "rgba(255,77,0,0)");
              c.fillStyle = g2;
              c.fillRect(0, 0, w, h);

              // Orb 3: White
              const o3x = w * 0.5 + Math.sin(time * 0.0007) * 100;
              const o3y = h * 0.5 + Math.cos(time * 0.0005) * 100;
              const g3 = c.createRadialGradient(o3x, o3y, 0, o3x, o3y, 300);
              g3.addColorStop(0, "rgba(255,255,255,0.015)");
              g3.addColorStop(1, "rgba(255,255,255,0)");
              c.fillStyle = g3;
              c.fillRect(0, 0, w, h);

              time += 16;
              rafRef.current = requestAnimationFrame(render);
            };
            render();
          }
        }
      }, pageRef);

      gsapCtxRef.current = ctx;
    };

    if ((window as any).gsap) {
      setTimeout(init, 50);
    } else {
      window.addEventListener("load", init);
      return () => window.removeEventListener("load", init);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (gsapCtxRef.current) gsapCtxRef.current.revert();
    };
  }, []);

  // Time Tick Animation
  useEffect(() => {
    if (prevSecRef.current !== timeParts.s && (window as any).gsap) {
      (window as any).gsap.fromTo(".ct-time-nums", 
        { y: -4, opacity: 0.6 }, 
        { y: 0, opacity: 1, duration: 0.2 }
      );
      prevSecRef.current = timeParts.s;
    }
  }, [timeParts.s]);

  // Textarea auto-grow
  const handleTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 320)}px`;
  };

  // Slider Drag Logic
  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (!isDragging.current || !sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      let newX = e.clientX - rect.left;
      newX = Math.max(0, Math.min(newX, rect.width));
      const val = newX / rect.width;
      setBudgetVal(val);

      if (val >= 0.8 && !hasPulsed.current && (window as any).gsap) {
        hasPulsed.current = true;
        (window as any).gsap.fromTo(".ct-status-outer", { scale: 1, opacity: 0.8 }, { scale: 3, opacity: 0, duration: 1.2, ease: "power2.out" });
      } else if (val < 0.8) {
        hasPulsed.current = false;
      }
    };

    const handleUp = () => {
      isDragging.current = false;
    };

    document.addEventListener("pointermove", handleMove);
    document.addEventListener("pointerup", handleUp);
    return () => {
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerup", handleUp);
    };
  }, []);

  // Budget label scale animation
  useEffect(() => {
    if ((window as any).gsap) {
      (window as any).gsap.fromTo(".ct-budget-val", { scale: 0.95 }, { scale: 1, duration: 0.2, overwrite: true });
    }
  }, [currentBudgetLabel]);

  // Greeting Tooltip Logic
  useEffect(() => {
    if (focusedField === "projectType" && name.trim().length > 1 && !hasGreeted.current) {
      hasGreeted.current = true;
      setShowGreeting(true);
      setTimeout(() => setShowGreeting(false), 2000);
    }
  }, [focusedField, name]);

  const handleEmailBlur = () => {
    if (!email) {
      setEmailValid(null);
      return;
    }
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    setEmailValid(valid);
    if (!valid && (window as any).gsap) {
      (window as any).gsap.fromTo(".ct-email-wrap", 
        { x: -6 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" }
      );
    }
  };

  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!name || !email || !message || emailValid === false) {
      if ((window as any).gsap && formCardRef.current) {
        (window as any).gsap.fromTo(formCardRef.current, 
          { x: -8 }, { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" }
        );
      }
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      if ((window as any).gsap && formCardRef.current) {
        const tl = (window as any).gsap.timeline();
        tl.to(".ct-form-group", { opacity: 0, y: -10, stagger: -0.05, duration: 0.3, ease: "power2.in" })
          .fromTo(".ct-success-view", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.5)" });
      }
    }, 2500);
  };

  // Cursor Hover Effects (form fields)
  const bindCursor = useCallback(() => {
    return {
      onMouseEnter: () => {
        const ring = document.getElementById("cursor-ring");
        const dot = document.getElementById("cursor-dot");
        if (ring && dot) {
          ring.classList.add("cursor-form-mode");
          dot.classList.add("cursor-form-mode");
        }
      },
      onMouseLeave: () => {
        const ring = document.getElementById("cursor-ring");
        const dot = document.getElementById("cursor-dot");
        if (ring && dot) {
          ring.classList.remove("cursor-form-mode");
          dot.classList.remove("cursor-form-mode");
        }
      }
    };
  }, []);

  const bindCursorSubmit = useCallback(() => {
    return {
      onMouseEnter: () => {
        const ring = document.getElementById("cursor-ring");
        if (ring) ring.classList.add("cursor-submit-mode");
      },
      onMouseLeave: () => {
        const ring = document.getElementById("cursor-ring");
        if (ring) ring.classList.remove("cursor-submit-mode");
      }
    };
  }, []);

  // Custom SplitText Helper for heading
  const splitTitle = (text: string) => {
    return text.split("").map((c, i) => (
      <span key={i} className="ct-char" style={{ display: "inline-block", whiteSpace: "pre" }}>{c}</span>
    ));
  };

  return (
    <div data-page="contact" className="ct-page" ref={pageRef} style={{ opacity: 0 }}>
      {/* Background Canvas */}
      <canvas id="contact-bg-canvas" ref={canvasRef} style={{ opacity: 0 }}></canvas>

      <div className="ct-wrapper">
        {/* LEFT COLUMN */}
        <div className="ct-left">
          <div className="ct-left-inner">
            <div className="ct-label-main">Contact</div>
            
            <h1 className="ct-heading">
              <div className="ct-head-line" style={{ color: "var(--text)" }}>{splitTitle("Got a")}</div>
              <div className="ct-head-line ghost">{splitTitle("Vision?")}</div>
              <div className="ct-head-line" style={{ color: "var(--accent)" }}>{splitTitle("Let's Talk.")}</div>
            </h1>
            <div className="ct-hr" />

            <div className="ct-status-wrap">
              <div className="ct-status-dot-wrap">
                <div className="ct-status-inner" style={{ background: isAsleep ? "#FF9500" : "#00FF88" }}></div>
                <div className="ct-status-outer" style={{ background: isAsleep ? "#FF9500" : "#00FF88" }}></div>
              </div>
              <div className="ct-status-texts">
                <div className="ct-status-main">{isAsleep ? "Likely resting — will respond soon" : "Available for new projects"}</div>
                <div className="ct-status-sub">Response within 24 hours</div>
              </div>
            </div>

            <div className="ct-direct-lines">
              <div className="ct-direct-row">
                <span className="ct-direct-lbl">Email</span>
                <a href="mailto:davidadebayo702@email.com" className="ct-direct-val" data-cursor="hover">hello@davidadewale.com</a>
              </div>
              <div className="ct-direct-row">
                <span className="ct-direct-lbl">Behance</span>
                <a href="https://behance.net/davidadewale" target="_blank" rel="noopener noreferrer" className="ct-direct-val" data-cursor="hover">behance.net/davidadewale</a>
              </div>
            </div>

            <div className="ct-social-row">
              {["LinkedIn", "Twitter / X", "GitHub", "Behance"].map(s => (
                <a href="#" key={s} className="ct-social-link" data-cursor="hover">{s}</a>
              ))}
            </div>

            <div className="ct-ambient-time">
              <div className="ct-time-display">
                <span className="ct-time-nums">{timeParts.h}:{timeParts.m}:{timeParts.s}</span>
              </div>
              <div className="ct-time-loc">Lagos, Nigeria · WAT (UTC+1)</div>
              <div className="ct-time-date">{dateStr}</div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="ct-right">
          <div className="ct-form-card" ref={formCardRef}>
            {/* Form Fields */}
            <div className={`ct-form-content ${isSuccess ? "hidden" : ""}`}>
              
              {/* Field 01 - Name */}
              <div className="ct-form-group">
                <label className={`ct-label ${focusedField === "name" || name ? "active" : ""}`}>Who am I speaking with?</label>
                <div className="ct-input-wrap">
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Your name"
                    className="ct-input"
                    {...bindCursor()}
                  />
                  <div className={`ct-input-line ${focusedField === "name" ? "active" : ""}`}></div>
                  {name && focusedField !== "name" && <div className="ct-check">✓</div>}
                </div>
              </div>

              {/* Field 02 - Project Type */}
              <div className="ct-form-group" style={{ position: 'relative' }}>
                <label className="ct-label active">What are we building?</label>
                <div className={`ct-tooltip ${showGreeting ? "show" : ""}`}>Nice to meet you, {name.split(" ")[0]}.</div>
                <div className="ct-pills" {...bindCursor()}>
                  {PROJECT_TYPES.map(t => (
                    <button
                      key={t}
                      className={`ct-pill ${projectTypes.includes(t) ? "active" : ""}`}
                      onClick={() => toggleProjectType(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 03 - Budget */}
              <div className="ct-form-group">
                <div className="ct-budget-header">
                  <label className="ct-label active">What&apos;s the investment range?</label>
                  <span className="ct-budget-val">{currentBudgetLabel}</span>
                </div>
                <div className="ct-slider-wrap" {...bindCursor()}>
                  <div 
                    className="ct-slider-track" 
                    ref={sliderRef}
                    onPointerDown={(e) => {
                      isDragging.current = true;
                      sliderRef.current?.dispatchEvent(new PointerEvent("pointermove", { clientX: e.clientX }));
                    }}
                  >
                    <div className="ct-slider-fill" style={{ width: `${budgetVal * 100}%` }}></div>
                    <div className="ct-slider-thumb" style={{ left: `${budgetVal * 100}%` }}></div>
                  </div>
                  <div className="ct-slider-labels">
                    <span className={budgetVal < 0.2 ? "active" : ""}>&lt; $1K</span>
                    <span className={budgetVal >= 0.2 && budgetVal < 0.4 ? "active" : ""}>$1K–5K</span>
                    <span className={budgetVal >= 0.4 && budgetVal < 0.6 ? "active" : ""}>$5K–15K</span>
                    <span className={budgetVal >= 0.6 && budgetVal < 0.8 ? "active" : ""}>$15K–50K</span>
                    <span className={budgetVal >= 0.8 ? "active" : ""}>$50K+</span>
                  </div>
                </div>
              </div>

              {/* Field 04 - Message */}
              <div className="ct-form-group">
                <label className={`ct-label ${focusedField === "message" || message ? "active" : ""}`}>Tell me about it.</label>
                <div className="ct-textarea-wrap">
                  <textarea 
                    value={message}
                    onChange={handleTextarea}
                    onFocus={() => setFocusedField("message")}
                    onBlur={() => setFocusedField(null)}
                    placeholder={projectTypes.includes("Something Else") ? "Tell me everything — I'm listening." : "Describe the project, the problem, the dream..."}
                    className="ct-textarea"
                    {...bindCursor()}
                  ></textarea>
                  <div className={`ct-char-count ${message.length >= 450 ? (message.length >= 500 ? "error" : "warn") : ""}`}>
                    {message.length} / 500
                  </div>
                </div>
              </div>

              {/* Field 05 - Email */}
              <div className="ct-form-group ct-email-wrap">
                <label className={`ct-label ${focusedField === "email" || email ? "active" : ""}`}>Where do I reach you?</label>
                <div className="ct-input-wrap">
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={handleEmailBlur}
                    placeholder="Your email address"
                    className={`ct-input ${emailValid === false ? "error" : ""}`}
                    {...bindCursor()}
                  />
                  <div className={`ct-input-line ${focusedField === "email" ? "active" : ""} ${emailValid === false ? "error" : ""}`}></div>
                  {emailValid && focusedField !== "email" && <div className="ct-check">✓</div>}
                </div>
                {emailValid === false && <div className="ct-error-msg">That doesn&apos;t look right</div>}
              </div>

              {/* Submit */}
              <button 
                className={`ct-submit ${isSubmitting ? "submitting" : ""}`}
                onClick={handleSubmit}
                {...bindCursorSubmit()}
              >
                {!isSubmitting && <span className="ct-submit-txt">Send It →</span>}
                {isSubmitting && (
                  <div className="ct-loading">
                    <span>.</span><span>.</span><span>.</span>
                  </div>
                )}
              </button>
            </div>

            {/* Success State */}
            {isSuccess && (
              <div className="ct-success-view">
                <div className="ct-success-icon">✓</div>
                <h2 className="ct-success-title">Message Received.</h2>
                <p className="ct-success-desc">David will be in touch within 24 hours.</p>
                <div className="ct-success-sig">— DA</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM AMBIENT STRIP */}
      <div className="ct-bottom-strip">
        <div className="ct-marquee">
          <div className="ct-marquee-inner">
            {[1, 2, 3].map(i => (
              <span key={i}>LET&apos;S BUILD SOMETHING REAL <span className="sep">—</span> </span>
            ))}
          </div>
        </div>
        <div className="ct-copyright">© 2026 David Adewale · Built with intention.</div>
      </div>
    </div>
  );
}
