"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import s from "./micro.module.css";

/* ------------------------------------------------------------------ */
/*  Interaction Lab: live product UI. Add a demo to DEMOS to show it.  */
/* ------------------------------------------------------------------ */

type Demo = { title: string; tag: string; hint: string; C: () => React.ReactElement; wide?: boolean };

const DEMOS: Demo[] = [
  { title: "Particle type", tag: "Canvas · Physics", hint: "Type a word, then sweep the cursor through it", C: ParticleType, wide: true },
  { title: "Dynamic Island", tag: "iOS", hint: "Morphs on its own. Click to skip", C: Island },
  { title: "Holographic card", tag: "Fintech", hint: "Tilt it. Click to flip", C: HoloCard },
  { title: "Pay with Face ID", tag: "Payments", hint: "Tap pay", C: FacePay },
  { title: "Wallet stack", tag: "Fintech", hint: "Drag or tap the top card", C: Wallet },
  { title: "AI agent run", tag: "AI", hint: "Watch it work, then run it again", C: AgentRun, wide: true },
  { title: "Gooey tab bar", tag: "Navigation", hint: "Switch tabs", C: GooeyTabs },
  { title: "Slide to send", tag: "Payments", hint: "Drag all the way", C: SlideToSend, wide: true },
  { title: "Appreciate", tag: "Social", hint: "Tap the heart", C: LikeBurst },
];

export default function MicroInteractions() {
  return (
    <div className={s.grid}>
      {DEMOS.map(({ title, tag, hint, C, wide }) => (
        <div className={`${s.card} ${wide ? s.wide : ""}`} key={title}>
          <div className={s.head}>
            <span className={s.title}>{title}</span>
            <span className={s.tag}>{tag}</span>
          </div>
          <div className={s.stage}>
            <C />
          </div>
          <p className={s.hint}>{hint}</p>
        </div>
      ))}
    </div>
  );
}

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setV(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, v] as const;
}

/* ================= Particle type ================= */
function ParticleType() {
  const wrap = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const [word, setWord] = useState("HIRE ME");
  const wordRef = useRef(word);
  const setTarget = useRef<(w: string) => void>(() => {});

  useEffect(() => {
    const c = cv.current!;
    const box = wrap.current!;
    const ctx = c.getContext("2d")!;
    const dpr = Math.min(devicePixelRatio, 2);
    let W = 0;
    let H = 0;
    type P = { x: number; y: number; vx: number; vy: number; tx: number; ty: number; lime: boolean };
    let ps: P[] = [];
    const mouse = { x: -999, y: -999 };

    const sample = (w: string) => {
      const o = document.createElement("canvas");
      o.width = W;
      o.height = H;
      const g = o.getContext("2d")!;
      let fs = H * 0.62;
      g.font = `800 ${fs}px Geist, Arial, sans-serif`;
      const tw = g.measureText(w).width;
      if (tw > W * 0.9) fs *= (W * 0.9) / tw;
      g.font = `800 ${fs}px Geist, Arial, sans-serif`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillStyle = "#fff";
      g.fillText(w, W / 2, H / 2 + fs * 0.04);
      const d = g.getImageData(0, 0, W, H).data;
      const out: [number, number][] = [];
      const st = W < 500 ? 3 : 4;
      for (let y = 0; y < H; y += st) for (let x = 0; x < W; x += st) if (d[(y * W + x) * 4 + 3] > 128) out.push([x, y]);
      return out;
    };

    const retarget = (w: string) => {
      if (!W || !H) return;
      const pts = sample(w || " ");
      pts.sort(() => Math.random() - 0.5);
      while (ps.length < pts.length) ps.push({ x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, tx: 0, ty: 0, lime: Math.random() < 0.1 });
      ps.forEach((p, i) => {
        if (i < pts.length) {
          p.tx = pts[i][0];
          p.ty = pts[i][1];
        } else {
          p.tx = Math.random() < 0.5 ? -20 : W + 20;
          p.ty = Math.random() * H;
        }
      });
      ps = ps.slice(0, Math.max(pts.length, 200));
    };
    setTarget.current = retarget;

    const resize = () => {
      W = box.clientWidth;
      H = box.clientHeight;
      c.width = W * dpr;
      c.height = H * dpr;
      c.style.width = W + "px";
      c.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      retarget(wordRef.current.toUpperCase());
    };
    const ro = new ResizeObserver(resize);
    ro.observe(box);

    const onMove = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => {
      mouse.x = mouse.y = -999;
    };
    c.addEventListener("pointermove", onMove);
    c.addEventListener("pointerleave", onLeave);

    let raf = 0;
    let vis = true;
    const io = new IntersectionObserver(([e]) => (vis = e.isIntersecting));
    io.observe(c);
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!vis) return;
      ctx.clearRect(0, 0, W, H);
      for (const p of ps) {
        let ax = (p.tx - p.x) * 0.06;
        let ay = (p.ty - p.y) * 0.06;
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 3600) {
          const d = Math.sqrt(d2) + 0.01;
          const f = (1 - d / 60) * 8;
          ax += (dx / d) * f;
          ay += (dy / d) * f;
        }
        p.vx = (p.vx + ax) * 0.78;
        p.vy = (p.vy + ay) * 0.78;
        p.x += p.vx;
        p.y += p.vy;
        const sp = Math.min(1, Math.hypot(p.vx, p.vy) / 6);
        ctx.fillStyle = p.lime || sp > 0.4 ? "#c8ff00" : `rgba(240,237,230,${0.85 - sp * 0.3})`;
        ctx.fillRect(p.x, p.y, 2, 2);
      }
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      c.removeEventListener("pointermove", onMove);
      c.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  useEffect(() => {
    wordRef.current = word;
    const id = setTimeout(() => setTarget.current(word.toUpperCase()), 180);
    return () => clearTimeout(id);
  }, [word]);

  return (
    <div className={s.pt}>
      <div ref={wrap} className={s.ptCanvas}>
        <canvas ref={cv} />
      </div>
      <div className={s.ptControls}>
        <input value={word} onChange={(e) => setWord(e.target.value.slice(0, 12))} aria-label="Word to draw" spellCheck={false} />
        {["HIRE ME", "DESIGN", "SHIP IT", "LAGOS"].map((w) => (
          <button key={w} onClick={() => setWord(w)} className={word === w ? s.ptOn : ""} data-cursor="hover">
            {w}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ================= Dynamic Island ================= */
const ISLAND = ["idle", "call", "timer", "music", "faceid"] as const;
function Island() {
  const [i, setI] = useState(1);
  const [hold, setHold] = useState(false);
  const [sec, setSec] = useState(1499);
  useEffect(() => {
    if (hold) return;
    const id = setInterval(() => setI((v) => (v + 1) % ISLAND.length), 2600);
    return () => clearInterval(id);
  }, [hold]);
  useEffect(() => {
    const id = setInterval(() => setSec((v) => (v > 0 ? v - 1 : 1499)), 1000);
    return () => clearInterval(id);
  }, []);
  const st = ISLAND[i];
  return (
    <div className={s.phone} onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)}>
      <div className={s.phoneTime}>9:41</div>
      <button className={`${s.island} ${s["is_" + st]}`} onClick={() => setI((v) => (v + 1) % ISLAND.length)} aria-label="Cycle Dynamic Island" data-cursor="hover">
        <span className={s.isIdle} />
        <span className={s.isCall}>
          <i className={s.isAvatar}>TA</i>
          <span className={s.isTxt}>
            <small>Incoming call</small>
            Tolu A.
          </span>
          <i className={s.isDecline}>✕</i>
          <i className={s.isAccept}>✓</i>
        </span>
        <span className={s.isTimer}>
          <svg viewBox="0 0 24 24" width="22" height="22">
            <circle cx="12" cy="12" r="9" stroke="#333" strokeWidth="3" fill="none" />
            <circle cx="12" cy="12" r="9" stroke="#ff9f0a" strokeWidth="3" fill="none" pathLength={100} strokeDasharray={`${(sec / 1500) * 100} 100`} transform="rotate(-90 12 12)" />
          </svg>
          <b>
            {Math.floor(sec / 60)}:{String(sec % 60).padStart(2, "0")}
          </b>
        </span>
        <span className={s.isMusic}>
          <i className={s.isArt} />
          <span className={s.isTxt}>
            <small>Now playing</small>
            Lagos Nights
          </span>
          <span className={s.isWave}>
            {[0, 1, 2, 3, 4].map((k) => (
              <i key={k} style={{ animationDelay: `${k * 0.12}s` }} />
            ))}
          </span>
        </span>
        <span className={s.isFace}>
          <svg viewBox="0 0 40 40" width="34" height="34" fill="none" stroke="#c8ff00" strokeWidth="2.4" strokeLinecap="round">
            <path d="M4 12V8a4 4 0 0 1 4-4h4M28 4h4a4 4 0 0 1 4 4v4M36 28v4a4 4 0 0 1-4 4h-4M12 36H8a4 4 0 0 1-4-4v-4" />
            <path d="M14 15v3M26 15v3M20 15v8h-2M15 28c3 2.5 7 2.5 10 0" />
          </svg>
        </span>
      </button>
      <div className={s.phoneBody}>
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}

/* ================= Holo card ================= */
function HoloCard() {
  const ref = useRef<HTMLButtonElement>(null);
  const [flip, setFlip] = useState(false);
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - y) * 22}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 28}deg`);
    el.style.setProperty("--px", `${x * 100}%`);
    el.style.setProperty("--py", `${y * 100}%`);
    el.style.setProperty("--o", "1");
  };
  const onLeave = () => {
    const el = ref.current!;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--o", "0");
  };
  return (
    <div className={s.holoWrap}>
      <button ref={ref} className={`${s.holo} ${flip ? s.flipped : ""}`} onPointerMove={onMove} onPointerLeave={onLeave} onClick={() => setFlip((f) => !f)} aria-label="Flip card" data-cursor="hover">
        <span className={s.holoInner}>
          <span className={s.holoFront}>
            <span className={s.holoSheen} />
            <span className={s.holoGlare} />
            <span className={s.holoTop}>
              <b>DA</b>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M8.5 8.5a5 5 0 0 1 0 7M12 6a8.5 8.5 0 0 1 0 12M15.5 3.5a12 12 0 0 1 0 17" />
              </svg>
            </span>
            <span className={s.holoChip} />
            <span className={s.holoNum}>5412 •••• •••• 0702</span>
            <span className={s.holoBottom}>
              <span>
                <small>Card holder</small>DAVID ADEBAYO
              </span>
              <span>
                <small>Exp</small>11/29
              </span>
            </span>
          </span>
          <span className={s.holoBack}>
            <span className={s.holoStripe} />
            <span className={s.holoCvv}>
              <small>CVV</small>
              <b>•••</b>
            </span>
            <span className={s.holoNote}>Designed & built by David. Not a real card.</span>
          </span>
        </span>
      </button>
    </div>
  );
}

/* ================= Face ID pay ================= */
function FacePay() {
  const [st, setSt] = useState<"idle" | "scan" | "ok">("idle");
  const run = () => {
    if (st !== "idle") return;
    setSt("scan");
    setTimeout(() => setSt("ok"), 1700);
    setTimeout(() => setSt("idle"), 4200);
  };
  return (
    <div className={`${s.pay} ${s["pay_" + st]}`}>
      <div className={s.payRow}>
        <span className={s.payLogo}>N</span>
        <span>
          <b>Cafe Neo</b>
          <small>Victoria Island</small>
        </span>
        <strong>₦8,400</strong>
      </div>
      <div className={s.payFace} aria-hidden="true">
        <svg viewBox="0 0 60 60" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path className={s.pfCorners} d="M6 18V12a6 6 0 0 1 6-6h6M42 6h6a6 6 0 0 1 6 6v6M54 42v6a6 6 0 0 1-6 6h-6M18 54h-6a6 6 0 0 1-6-6v-6" />
          <g className={s.pfFace}>
            <path d="M22 23v4M38 23v4M30 23v12h-3M23 41c4 3.5 10 3.5 14 0" />
          </g>
          <path className={s.pfCheck} d="M18 31l8 8 16-17" pathLength={1} />
        </svg>
        <span className={s.pfScan} />
      </div>
      <button className={s.payBtn} onClick={run} data-cursor="hover">
        <span>{st === "idle" ? "Pay ₦8,400" : st === "scan" ? "Scanning…" : "Paid ✓"}</span>
      </button>
    </div>
  );
}

/* ================= AI agent run ================= */
const STEPS = [
  { t: "Reading the brief: “Onboarding for a lending app”", tool: "brief.read" },
  { t: "Pulling components from the design system", tool: "figma.library" },
  { t: "Generating 3 layout options", tool: "layout.generate" },
  { t: "Checking contrast and touch targets", tool: "a11y.audit" },
  { t: "Writing the handoff spec", tool: "spec.write" },
];
function AgentRun() {
  const [ref, inView] = useInView<HTMLDivElement>();
  const [step, setStep] = useState(-1);
  const [typed, setTyped] = useState("");
  const started = useRef(false);

  const run = useCallback(() => {
    setStep(0);
    setTyped("");
  }, []);

  useEffect(() => {
    if (inView && !started.current) {
      started.current = true;
      const id = setTimeout(run, 0);
      return () => clearTimeout(id);
    }
  }, [inView, run]);

  useEffect(() => {
    if (step < 0 || step >= STEPS.length) return;
    const full = STEPS[step].t;
    let k = 0;
    let next: ReturnType<typeof setTimeout>;
    const id = setInterval(() => {
      k++;
      setTyped(full.slice(0, k));
      if (k >= full.length) {
        clearInterval(id);
        next = setTimeout(() => {
          setStep((v) => v + 1);
          setTyped("");
        }, 520);
      }
    }, 18);
    return () => {
      clearInterval(id);
      clearTimeout(next);
    };
  }, [step]);

  const done = step >= STEPS.length;
  return (
    <div ref={ref} className={s.agent}>
      <div className={s.agentLog}>
        <div className={s.agentPrompt}>
          <span className={s.agentYou}>You</span>
          Design an onboarding flow for a lending app.
        </div>
        {STEPS.map((st, i) =>
          i <= step ? (
            <div key={st.tool} className={`${s.agentStep} ${i < step ? s.agentDone : ""}`}>
              <span className={s.agentIcon}>{i < step ? "✓" : <i className={s.spin} />}</span>
              <span className={s.agentText}>{i < step ? st.t : typed}</span>
              <code>{st.tool}</code>
            </div>
          ) : null
        )}
      </div>
      <div className={`${s.agentOut} ${done ? s.agentOutOn : ""}`}>
        <div className={s.agentScreens}>
          {[0, 1, 2].map((k) => (
            <div key={k} className={s.agentScreen} style={{ transitionDelay: `${k * 120}ms` }}>
              <i />
              <i />
              <i />
              <b />
            </div>
          ))}
        </div>
        <div className={s.agentFoot}>
          <span>{done ? "3 layouts · AA contrast · spec ready" : "Working…"}</span>
          <button onClick={run} disabled={!done} data-cursor="hover">
            Run again ↻
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= Wallet stack ================= */
const CARDS = [
  { name: "Everyday", num: "0702", bal: "₦1,248,300", bg: "linear-gradient(135deg,#c8ff00,#7dd100)", fg: "#0a0a0a" },
  { name: "Travel", num: "4418", bal: "$4,820.00", bg: "linear-gradient(135deg,#ff4d00,#ff9a3c)", fg: "#0a0a0a" },
  { name: "Savings", num: "9930", bal: "₦9,400,000", bg: "linear-gradient(135deg,#2a2a28,#55554f)", fg: "#f0ede6" },
];
function Wallet() {
  const [order, setOrder] = useState([0, 1, 2]);
  const [dy, setDy] = useState(0);
  const [active, setActive] = useState(false);
  const startY = useRef(0);
  const cycle = () => setOrder((o) => [...o.slice(1), o[0]]);
  return (
    <div className={s.wallet}>
      <div className={s.wStack}>
        {order.map((ci, pos) => {
          const c = CARDS[ci];
          const top = pos === 0;
          const y = top ? dy : 0;
          return (
            <div
              key={ci}
              className={`${s.wCard} ${top ? s.wTop : ""}`}
              style={{
                background: c.bg,
                color: c.fg,
                transform: `translateY(${pos * -16 + y}px) scale(${1 - pos * 0.06}) rotate(${top ? y * 0.05 : 0}deg)`,
                zIndex: 10 - pos,
                transition: top && active ? "none" : undefined,
              }}
              onPointerDown={
                top
                  ? (e) => {
                      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                      startY.current = e.clientY;
                      setActive(true);
                    }
                  : undefined
              }
              onPointerMove={top && active ? (e) => setDy(e.clientY - startY.current) : undefined}
              onPointerUp={
                top
                  ? () => {
                      const go = Math.abs(dy) > 50 || Math.abs(dy) < 4;
                      setActive(false);
                      setDy(0);
                      if (go) cycle();
                    }
                  : undefined
              }
              data-cursor="hover"
            >
              <span className={s.wName}>{c.name}</span>
              <span className={s.wNum}>•••• {c.num}</span>
            </div>
          );
        })}
      </div>
      <p className={s.wBal}>
        <small>Balance</small>
        <b key={order[0]}>{CARDS[order[0]].bal}</b>
      </p>
    </div>
  );
}

/* ================= Gooey tabs ================= */
const TABS = [
  { k: "Home", d: "M4 11l8-7 8 7v9h-5v-6H9v6H4z" },
  { k: "Search", d: "M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm5.5 12.5L21 21" },
  { k: "Cards", d: "M3 7h18v11H3zM3 11h18" },
  { k: "Profile", d: "M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" },
];
function GooeyTabs() {
  const [a, setA] = useState(0);
  return (
    <div className={s.goo}>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <filter id="da-goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b" />
          <feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" />
        </filter>
      </svg>
      <div className={s.gooBar}>
        <div className={s.gooLayer} aria-hidden="true">
          <span className={s.gooBlob} style={{ transform: `translateX(${a * 100}%)` }} />
          <span className={s.gooDrop} style={{ transform: `translateX(${a * 100}%)` }} />
        </div>
        {TABS.map((t, i) => (
          <button key={t.k} className={`${s.gooTab} ${a === i ? s.gooOn : ""}`} onClick={() => setA(i)} aria-label={t.k} data-cursor="hover">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" strokeLinecap="round">
              <path d={t.d} />
            </svg>
          </button>
        ))}
      </div>
      <p className={s.gooLabel} key={a}>
        {TABS[a].k}
      </p>
    </div>
  );
}

/* ================= Slide to send ================= */
function SlideToSend() {
  const track = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);
  const [drag, setDrag] = useState(false);
  const [sent, setSent] = useState(false);
  const [maxW, setMaxW] = useState(200);
  const start = useRef(0);
  const KNOB = 52;
  const max = () => (track.current ? track.current.clientWidth - KNOB - 8 : 200);
  const up = () => {
    if (!drag) return;
    setDrag(false);
    if (x > maxW * 0.86) {
      setX(maxW);
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setX(0);
      }, 2200);
    } else setX(0);
  };
  const p = x / (maxW || 1);
  return (
    <div className={s.send}>
      <div className={s.sendTo}>
        <i>TA</i>
        <span>
          <small>Send to</small>Tolu A.
        </span>
      </div>
      <strong className={s.sendAmt}>₦250,000</strong>
      <div ref={track} className={`${s.slide} ${sent ? s.slideSent : ""}`} style={{ ["--p" as string]: p }}>
        <div className={s.slideFill} style={{ width: x + KNOB + 4 }} />
        <span className={s.slideLabel}>{sent ? "Sent" : "Slide to send"}</span>
        <button
          className={s.knob}
          style={{ transform: `translateX(${x}px)`, transition: drag ? "none" : undefined }}
          onPointerDown={(e) => {
            if (sent) return;
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            start.current = e.clientX - x;
            setMaxW(max());
            setDrag(true);
          }}
          onPointerMove={(e) => drag && setX(Math.max(0, Math.min(maxW, e.clientX - start.current)))}
          onPointerUp={up}
          onPointerCancel={up}
          aria-label="Slide to send"
          data-cursor="hover"
        >
          {sent ? "✓" : "→"}
        </button>
        {sent && (
          <span className={s.confetti} aria-hidden="true">
            {Array.from({ length: 16 }).map((_, i) => (
              <i key={i} style={{ ["--a" as string]: `${i * 22.5}deg`, ["--d" as string]: `${40 + (i % 3) * 18}px` }} />
            ))}
          </span>
        )}
      </div>
    </div>
  );
}

/* ================= Like burst ================= */
function LikeBurst() {
  const [liked, setLiked] = useState(false);
  const [burst, setBurst] = useState(0);
  const count = 8386 + (liked ? 1 : 0);
  return (
    <div className={s.likeWrap}>
      <button
        className={`${s.like} ${liked ? s.liked : ""}`}
        onClick={() => {
          setLiked((l) => !l);
          if (!liked) setBurst((b) => b + 1);
        }}
        aria-pressed={liked}
        aria-label="Appreciate"
        data-cursor="hover"
      >
        <svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true">
          <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.1 0 3.6 1.2 5.2 3 1.6-1.8 3.1-3 5.2-3 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z" />
        </svg>
        {burst > 0 && (
          <span key={burst} className={s.lBurst} aria-hidden="true">
            {Array.from({ length: 12 }).map((_, i) => (
              <i key={i} style={{ ["--a" as string]: `${i * 30}deg` }} />
            ))}
          </span>
        )}
      </button>
      <span className={s.likeCount}>
        <b key={count}>{count.toLocaleString()}</b> appreciations on Behance
      </span>
    </div>
  );
}
