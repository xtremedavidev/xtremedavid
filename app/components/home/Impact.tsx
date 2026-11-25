"use client";

import { useEffect, useRef, useState } from "react";
import s from "./home.module.css";

/** Runs once when the element first scrolls into view. */
function useInView<T extends HTMLElement>(threshold = 0.35) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

/** Counts up from `from` to `to` when `run` turns true. Numbers are always visible. */
function Count({ from = 0, to, run, decimals = 0, ms = 1600 }: { from?: number; to: number; run: boolean; decimals?: number; ms?: number }) {
  const [v, setV] = useState(from);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      const e = 1 - Math.pow(1 - k, 4);
      setV(from + (to - from) * e);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, from, to, ms]);
  return <>{v.toFixed(decimals)}</>;
}

/* MRR line: 1.9M -> 3.6M */
function MrrCard() {
  const [ref, on] = useInView<HTMLDivElement>();
  const pts = [1.9, 1.95, 2.1, 2.05, 2.4, 2.6, 2.55, 2.9, 3.1, 3.3, 3.25, 3.6];
  const w = 400;
  const h = 150;
  const path = pts.map((v, i) => `${i === 0 ? "M" : "L"}${(i / (pts.length - 1)) * w},${h - ((v - 1.6) / 2.2) * h}`).join(" ");
  return (
    <div ref={ref} className={`${s.bento} ${s.bentoWide}`} data-on={on || undefined}>
      <div className={s.bentoHead}>
        <span>SavvyLoans · after the redesign</span>
        <span className={s.bentoPill}>Fintech</span>
      </div>
      <p className={s.bentoBig}>
        $<Count from={1.9} to={3.6} run={on} decimals={1} />M <small>MRR</small>
      </p>
      <p className={s.bentoSub}>Monthly recurring revenue grew from $1.9M to $3.6M. Curve is illustrative.</p>
      <svg viewBox={`0 0 ${w} ${h}`} className={s.mrr} preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="mrrfill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#c8ff00" stopOpacity="0.35" />
            <stop offset="1" stopColor="#c8ff00" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path} L${w},${h} L0,${h} Z`} fill="url(#mrrfill)" className={s.mrrFill} />
        <path d={path} fill="none" stroke="#c8ff00" strokeWidth="2.5" className={s.mrrLine} pathLength={1} />
      </svg>
    </div>
  );
}

/* Funnel: drop-offs -40% */
function FunnelCard() {
  const [ref, on] = useInView<HTMLDivElement>();
  const before = [100, 62, 38, 21];
  const after = [100, 81, 66, 52];
  return (
    <div ref={ref} className={s.bento} data-on={on || undefined}>
      <div className={s.bentoHead}>
        <span>Onboarding funnel</span>
        <span className={s.bentoPill}>UX</span>
      </div>
      <p className={s.bentoBig}>
        −<Count to={40} run={on} />% <small>drop-offs</small>
      </p>
      <div className={s.funnel} aria-hidden="true">
        {before.map((b, i) => (
          <div key={i} className={s.funnelRow}>
            <span className={s.funnelBefore} style={{ width: `${b}%` }} />
            <span className={s.funnelAfter} style={{ width: on ? `${after[i]}%` : `${b}%`, transitionDelay: `${i * 120}ms` }} />
          </div>
        ))}
      </div>
      <p className={s.bentoLegend}>
        <i /> after · <i className={s.legendDim} /> before · <em>illustrative</em>
      </p>
    </div>
  );
}

/* Volume ticker */
function VolumeCard() {
  const [ref, on] = useInView<HTMLDivElement>();
  const [tx, setTx] = useState<number[]>([]);
  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => {
      setTx((t) => [Math.round(400 + Math.random() * 9600), ...t].slice(0, 4));
    }, 900);
    return () => clearInterval(id);
  }, [on]);
  return (
    <div ref={ref} className={s.bento}>
      <div className={s.bentoHead}>
        <span>Tangible Markets · London</span>
        <span className={s.bentoPill}>Dashboards</span>
      </div>
      <p className={s.bentoBig}>
        $<Count to={5} run={on} />B <small>/ year</small>
      </p>
      <p className={s.bentoSub}>Transactions through the platform I designed.</p>
      <ul className={s.ticker} aria-hidden="true">
        {tx.map((v, i) => (
          <li key={`${v}-${i}`} className={i === 0 ? s.tickNew : ""}>
            <span>TX-{(v * 7) % 9000 + 1000}</span>
            <span>+${v.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* Dotted globe: 100+ brands on 5 continents */
function GlobeCard() {
  const cv = useRef<HTMLCanvasElement>(null);
  const [ref, on] = useInView<HTMLDivElement>(0.2);
  useEffect(() => {
    const c = cv.current;
    if (!c || !on) return;
    const ctx = c.getContext("2d")!;
    const dpr = Math.min(devicePixelRatio, 2);
    const size = c.clientWidth;
    c.width = c.height = size * dpr;
    ctx.scale(dpr, dpr);
    const pts: [number, number, number, boolean][] = [];
    const N = 900;
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = i * 2.39996;
      pts.push([Math.cos(th) * r, y, Math.sin(th) * r, Math.random() < 0.06]);
    }
    let a = 0;
    let raf = 0;
    const R = size * 0.42;
    const draw = () => {
      a += 0.004;
      ctx.clearRect(0, 0, size, size);
      for (const [x, y, z, hot] of pts) {
        const X = x * Math.cos(a) - z * Math.sin(a);
        const Z = x * Math.sin(a) + z * Math.cos(a);
        if (Z < -0.2) continue;
        const k = (Z + 1) / 2;
        ctx.fillStyle = hot ? `rgba(200,255,0,${0.4 + k * 0.6})` : `rgba(240,237,230,${0.08 + k * 0.4})`;
        ctx.beginPath();
        ctx.arc(size / 2 + X * R, size / 2 - y * R, hot ? 2.2 : 1.1 + k * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [on]);
  return (
    <div ref={ref} className={`${s.bento} ${s.bentoTall}`}>
      <div className={s.bentoHead}>
        <span>Clients worldwide</span>
        <span className={s.bentoPill}>Global</span>
      </div>
      <p className={s.bentoBig}>
        <Count to={100} run={on} />+ <small>brands</small>
      </p>
      <p className={s.bentoSub}>Africa, Europe, North America, Asia and Latin America.</p>
      <canvas ref={cv} className={s.globe} aria-hidden="true" />
    </div>
  );
}

/* Screens counter: CareBond ~200 screens */
function ScreensCard() {
  const [ref, on] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={s.bento} data-on={on || undefined}>
      <div className={s.bentoHead}>
        <span>CareBond · Switzerland</span>
        <span className={s.bentoPill}>Design + build</span>
      </div>
      <p className={s.bentoBig}>
        ~<Count to={200} run={on} /> <small>screens</small>
      </p>
      <div className={s.screens} aria-hidden="true">
        {Array.from({ length: 40 }).map((_, i) => (
          <i key={i} style={{ transitionDelay: `${i * 22}ms` }} />
        ))}
      </div>
      <p className={s.bentoSub}>Web platform + mobile app, then led the build: React Native, Next.js, Django.</p>
    </div>
  );
}

/* Telecom scale */
function TelusCard() {
  const [ref, on] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={s.bento} data-on={on || undefined}>
      <div className={s.bentoHead}>
        <span>TELUS · Canada</span>
        <span className={s.bentoPill}>Design systems</span>
      </div>
      <p className={s.bentoBig}>
        <Count to={21} run={on} />M+ <small>connections</small>
      </p>
      <div className={s.pulseGrid} aria-hidden="true">
        {Array.from({ length: 60 }).map((_, i) => (
          <i key={i} style={{ animationDelay: `${(i * 137) % 2400}ms` }} />
        ))}
      </div>
      <p className={s.bentoSub}>Design systems and AI training for one of Canada&apos;s largest telecoms.</p>
    </div>
  );
}

export default function Impact() {
  return (
    <div className={s.bentoGrid}>
      <MrrCard />
      <GlobeCard />
      <FunnelCard />
      <VolumeCard />
      <ScreensCard />
      <TelusCard />
    </div>
  );
}
