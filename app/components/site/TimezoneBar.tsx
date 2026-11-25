"use client";

import { useEffect, useMemo, useState } from "react";
import s from "./site.module.css";

/**
 * A 24-hour strip in UTC with David's working window (09:00–19:00 Lagos)
 * plus visitor / London / New York. Hover or drag to scrub through the day.
 */
const ZONES = [
  { label: "Lagos (me)", tz: "Africa/Lagos" },
  { label: "London", tz: "Europe/London" },
  { label: "New York", tz: "America/New_York" },
];
const WORK = { start: 8, end: 18 }; // UTC hours == 09:00–19:00 WAT

function fmt(d: Date, tz: string) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(d);
}

export default function TimezoneBar() {
  const [now, setNow] = useState<Date | null>(null);
  const [scrub, setScrub] = useState<number | null>(null);
  const [youTz, setYouTz] = useState("UTC");

  useEffect(() => {
    const id0 = setTimeout(() => {
      setNow(new Date());
      setYouTz(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
    }, 0);
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => {
      clearTimeout(id0);
      clearInterval(id);
    };
  }, []);

  const nowH = now ? now.getUTCHours() + now.getUTCMinutes() / 60 : 12;
  const h = scrub ?? nowH;
  const at = useMemo(() => {
    const d = now ? new Date(now) : new Date(0);
    d.setUTCHours(Math.floor(h), Math.round((h % 1) * 60), 0, 0);
    return d;
  }, [h, now]);
  const working = h >= WORK.start && h < WORK.end;

  const onPos = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const k = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    setScrub(Math.round(k * 24 * 4) / 4);
  };

  return (
    <div className={s.tz}>
      <div className={s.tzHead}>
        <span className={s.tzStatus} data-on={working || undefined}>
          <i /> {working ? "Inside my working hours" : "Outside my working hours, I'll reply next morning"}
        </span>
        <span className={s.tzHint}>{scrub === null ? "Hover the bar to compare times" : "Scrubbing…"}</span>
      </div>
      <div className={s.tzBar} onPointerMove={onPos} onPointerDown={onPos} onPointerLeave={() => setScrub(null)} data-cursor="hover">
        <span className={s.tzWork} style={{ left: `${(WORK.start / 24) * 100}%`, width: `${((WORK.end - WORK.start) / 24) * 100}%` }}>
          <em>09:00 – 19:00 Lagos</em>
        </span>
        {[0, 6, 12, 18, 24].map((t) => (
          <span key={t} className={s.tzTick} style={{ left: `${(t / 24) * 100}%` }}>
            {String(t).padStart(2, "0")} UTC
          </span>
        ))}
        <span className={s.tzNeedle} style={{ left: `${(h / 24) * 100}%` }} />
      </div>
      <div className={s.tzZones}>
        <div className={s.tzYou}>
          <small>You · {youTz.split("/").pop()?.replace("_", " ")}</small>
          <b>{now ? fmt(at, youTz) : "--:--"}</b>
        </div>
        {ZONES.map((z) => (
          <div key={z.tz}>
            <small>{z.label}</small>
            <b>{now ? fmt(at, z.tz) : "--:--"}</b>
          </div>
        ))}
      </div>
    </div>
  );
}
