"use client";

import { useEffect, useMemo, useState } from "react";
import { submitContactForm } from "@/app/contact/actions";
import { PROFILE } from "@/app/lib/profile";
import CalInline from "./CalInline";
import { initSiteMotion } from "@/app/lib/siteMotion";
import s from "./book.module.css";

/* Bookable any day, any hour: slots are generated in the visitor's own local time. */
function nextDays(n: number) {
  const out: Date[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  for (let i = 0; i < n; i++) {
    out.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

const PARTS = [
  { label: "Morning", from: 6, to: 12 },
  { label: "Afternoon", from: 12, to: 17 },
  { label: "Evening", from: 17, to: 22 },
  { label: "Night", from: 22, to: 30 },
];

function slotsFor(day: Date) {
  const now = Date.now() + 60 * 60 * 1000; // at least an hour from now
  return PARTS.map((p) => {
    const list: Date[] = [];
    for (let h = p.from; h < p.to; h += 0.5) {
      const t = new Date(day);
      t.setHours(Math.floor(h), (h % 1) * 60, 0, 0); // hours >= 24 roll into the next morning
      if (t.getTime() > now) list.push(t);
    }
    return { label: p.label, list };
  }).filter((g) => g.list.length);
}

type Kind = "Full-time role" | "Contract / freelance" | "Project" | "Just saying hi";

export default function BookClient() {
  const [tz, setTz] = useState("UTC");
  const [days, setDays] = useState<Date[]>([]);
  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState<Date | null>(null);
  const [kind, setKind] = useState<Kind>("Full-time role");
  const [form, setForm] = useState({ name: "", email: "", company: "", note: "" });
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [err, setErr] = useState("");
  const [useForm, setUseForm] = useState(!PROFILE.calLink);

  useEffect(() => {
    const id = setTimeout(() => {
      setTz(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
      setDays(nextDays(14));
    }, 0);
    let cleanup: (() => void) | undefined;
    const w = window as unknown as Record<string, unknown>;
    const start = () => {
      if (!cleanup) cleanup = initSiteMotion();
    };
    if (w.gsap) start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      clearTimeout(id);
      window.removeEventListener("load", start);
      cleanup?.();
    };
  }, []);

  const fmtDay = useMemo(() => new Intl.DateTimeFormat("en-GB", { weekday: "short" }), []);
  const fmtDate = useMemo(() => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }), []);
  const fmtTime = useMemo(() => new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }), []);
  const fmtLong = useMemo(() => new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZoneName: "short" }), []);
  const fmtLagos = useMemo(() => new Intl.DateTimeFormat("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" }), []);

  const groups = days[day] ? slotsFor(days[day]) : [];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slot) return;
    setState("sending");
    setErr("");
    const message = [
      `Intro call request (${kind})`,
      `Time: ${fmtLong.format(slot)}  ·  Lagos: ${fmtLagos.format(slot)}`,
      form.company ? `Company / role: ${form.company}` : "",
      form.note ? `\nNotes:\n${form.note}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    const res = await submitContactForm({ name: form.name, email: form.email, projectTypes: ["Intro call", kind], budget: "Intro call · 30 min", message });
    if (res.success) setState("done");
    else {
      setState("error");
      setErr(res.error || "Something went wrong.");
    }
  };

  return (
    <main className={s.page}>
      <div className={s.wrap}>
        <header className={s.head}>
          <p className={s.kicker}>
            <i /> {PROFILE.openTo}
          </p>
          <h1>
            Pick a time. <span>Let&apos;s talk.</span>
          </h1>
          <p className={s.sub}>30 minutes about a role or a project. Any day, any hour, shown in your own time zone. I&apos;ll confirm with a video link by email.</p>
        </header>

        <div className={s.grid}>
          <section className={s.panel}>
            {!useForm ? (
              <>
                <CalInline link={PROFILE.calLink} />
                <p className={s.alt}>
                  Calendar not loading, or want to suggest something else?{" "}
                  <button type="button" onClick={() => setUseForm(true)} data-cursor="hover">
                    Send a time request instead
                  </button>
                  {" · "}
                  <a href={PROFILE.calLink} target="_blank" rel="noopener noreferrer">
                    Open on Cal.com ↗
                  </a>
                </p>
              </>
            ) : state === "done" ? (
              <div className={s.done}>
                <span className={s.doneIcon}>✓</span>
                <h2>Request sent.</h2>
                <p>
                  {slot && fmtLong.format(slot)}. I&apos;ll confirm by email at <b>{form.email}</b> with a video link. A copy of your request is on its way to you too.
                </p>
                <a href={PROFILE.resume} download className={s.btnLime}>
                  Download my résumé while you wait ↓
                </a>
              </div>
            ) : (
              <form onSubmit={submit}>
                <div className={s.step}>
                  <span>1</span> Pick a day
                </div>
                <div className={s.days}>
                  {days.map((d, i) => (
                    <button
                      type="button"
                      key={d.toISOString()}
                      className={i === day ? s.dayOn : ""}
                      onClick={() => {
                        setDay(i);
                        setSlot(null);
                      }}
                      data-cursor="hover"
                    >
                      <small>{fmtDay.format(d)}</small>
                      <b>{fmtDate.format(d)}</b>
                    </button>
                  ))}
                </div>

                <div className={s.step}>
                  <span>2</span> Pick a time <em>your local time · {tz.replace("_", " ")}</em>
                </div>
                {groups.map((g) => (
                  <div key={g.label} className={s.slotGroup}>
                    <p className={s.slotLabel}>{g.label}</p>
                    <div className={s.slots}>
                      {g.list.map((t) => (
                        <button
                          type="button"
                          key={t.toISOString()}
                          className={slot?.getTime() === t.getTime() ? s.slotOn : ""}
                          onClick={() => setSlot(t)}
                          data-cursor="hover"
                        >
                          {fmtTime.format(t)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div className={`${s.details} ${slot ? s.detailsOn : ""}`}>
                  <div>
                    <div className={s.step}>
                      <span>3</span> Your details
                    </div>
                    <div className={s.kinds}>
                      {(["Full-time role", "Contract / freelance", "Project", "Just saying hi"] as Kind[]).map((k) => (
                        <button type="button" key={k} className={kind === k ? s.kindOn : ""} onClick={() => setKind(k)} data-cursor="hover">
                          {k}
                        </button>
                      ))}
                    </div>
                    <div className={s.fields}>
                      <label>
                        <span>Name</span>
                        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ada Lovelace" />
                      </label>
                      <label>
                        <span>Work email</span>
                        <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ada@company.com" />
                      </label>
                      <label className={s.full}>
                        <span>Company / role link (optional)</span>
                        <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Acme · Senior Product Designer" />
                      </label>
                      <label className={s.full}>
                        <span>Anything I should know? (optional)</span>
                        <textarea rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Team, timeline, what you're building…" />
                      </label>
                    </div>
                    <div className={s.submitRow}>
                      <p>{slot ? <>Requesting <b>{fmtLong.format(slot)}</b></> : "Pick a time first"}</p>
                      <button type="submit" className={s.btnLime} disabled={!slot || state === "sending"} data-cursor="hover">
                        {state === "sending" ? "Sending…" : "Request this time →"}
                      </button>
                    </div>
                    {state === "error" && <p className={s.error}>Couldn&apos;t send: {err}. You can email me directly at {PROFILE.email}.</p>}
                  </div>
                </div>
              </form>
            )}
          </section>

          <aside className={s.side}>
            <div className={s.card}>
              <h3>Intro call · 30 min</h3>
              <ul>
                <li>Free · video link by email</li>
                <li>Any day, any hour, any time zone</li>
                <li>Your role, product or idea; my honest take</li>
                <li>Walkthrough of relevant work if useful</li>
              </ul>
            </div>
            <div className={s.card}>
              <h3>Prefer not to book?</h3>
              <a href={`mailto:${PROFILE.email}`} className={s.link}>
                {PROFILE.email}
              </a>
              <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer" className={s.link}>
                LinkedIn ↗
              </a>
              <a href={PROFILE.resume} download className={s.btnLine}>
                Download résumé ↓
              </a>
            </div>
          </aside>
        </div>

      </div>
    </main>
  );
}
