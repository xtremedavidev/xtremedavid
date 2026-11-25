"use client";

import { useEffect, useRef } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Official Cal.com inline embed (embed.js), themed to the site:
 * dark UI, lime brand colour, month view.
 */
export default function CalInline({ link, onBooked }: { link: string; onBooked?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const calLink = link.replace(/^https?:\/\/(app\.)?cal\.com\//, "").replace(/\?.*$/, "");

  useEffect(() => {
    const w = window as any;
    // Standard Cal.com loader snippet
    (function (C: any, A: string, L: string) {
      const p = function (a: any, ar: any) {
        a.q.push(ar);
      };
      const d = C.document;
      C.Cal =
        C.Cal ||
        function (...args: any[]) {
          const cal = C.Cal;
          const ar = args;
          if (!cal.loaded) {
            cal.ns = {};
            cal.q = cal.q || [];
            d.head.appendChild(d.createElement("script")).src = A;
            cal.loaded = true;
          }
          if (ar[0] === L) {
            const api: any = function (...a: any[]) {
              p(api, a);
            };
            const namespace = ar[1];
            api.q = api.q || [];
            if (typeof namespace === "string") {
              cal.ns[namespace] = cal.ns[namespace] || api;
              p(cal.ns[namespace], ar);
              p(cal, ["initNamespace", namespace]);
            } else p(cal, ar);
            return;
          }
          p(cal, ar);
        };
    })(w, "https://app.cal.com/embed/embed.js", "init");

    const ns = "intro";
    w.Cal("init", ns, { origin: "https://cal.com" });
    w.Cal.ns[ns]("inline", {
      elementOrSelector: "#cal-inline",
      calLink,
      config: { layout: "month_view", theme: "dark" },
    });
    w.Cal.ns[ns]("ui", {
      theme: "dark",
      hideEventTypeDetails: false,
      layout: "month_view",
      cssVarsPerTheme: { dark: { "cal-brand": "#c8ff00", "cal-brand-emphasis": "#d9ff4d", "cal-brand-text": "#0a0a0a" } },
    });
    if (onBooked) w.Cal.ns[ns]("on", { action: "bookingSuccessful", callback: onBooked });
  }, [calLink, onBooked]);

  return <div id="cal-inline" ref={ref} style={{ width: "100%", minHeight: 640, overflow: "auto" }} />;
}
