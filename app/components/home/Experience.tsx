"use client";

import {
  EDUCATION,
  EXPERIENCE,
  MORE_WORK,
  PROFILE,
  RECOGNITION,
} from "@/app/lib/profile";
import s from "./home.module.css";

/** Full experience timeline. Everything is visible, nothing hides behind a click. */
export default function Experience({
  showMore = true,
}: {
  showMore?: boolean;
}) {
  return (
    <>
      <div className={s.xp}>
        <ol className={s.xpList}>
          {EXPERIENCE.map((r) => (
            <li
              key={r.company + r.start}
              className={s.xpRow}
              data-cursor="hover"
            >
              <div className={s.xpWhen}>
                <span>{r.start}</span>
                <span>{r.end}</span>
              </div>
              <div className={s.xpDot} aria-hidden="true" />
              <div className={s.xpMain}>
                <div className={s.xpHead}>
                  <h3>{r.company}</h3>
                  <span className={s.xpSector}>{r.sector}</span>
                </div>
                <p className={s.xpRole}>
                  {r.role} · {r.place}
                </p>
                <ul className={s.xpPoints}>
                  {r.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                {r.stack && (
                  <div className={s.chipsRow}>
                    {r.stack.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>

        <aside className={s.xpSide}>
          <div className={s.resumeCard}>
            <div className={s.resumeDoc} aria-hidden="true">
              <span className={s.resumeFold} />
              <b>{PROFILE.name}</b>
              <i style={{ width: "70%" }} />
              <i style={{ width: "88%" }} />
              <i style={{ width: "60%" }} />
              <i style={{ width: "80%", marginTop: 10 }} />
              <i style={{ width: "92%" }} />
              <i style={{ width: "54%" }} />
            </div>
            <p className={s.resumeTitle}>Résumé · PDF</p>
            <p className={s.resumeSub}>
              8+ years · product design & full-stack engineering
            </p>
            <a
              href={PROFILE.resume}
              download
              className={s.btnLime}
              data-cursor="hover"
            >
              Download résumé ↓
            </a>
            <a
              href={PROFILE.resume}
              target="_blank"
              rel="noopener"
              className={s.resumeView}
              data-cursor="hover"
            >
              View in browser ↗
            </a>
          </div>

          <div className={s.xpBlock}>
            <h4>Education</h4>
            {EDUCATION.map((e) => (
              <p key={e.school}>
                <b>{e.school}</b>
                <span>
                  {e.what}
                  {e.years ? ` · ${e.years}` : ""}
                </span>
              </p>
            ))}
          </div>
          <div className={s.xpBlock}>
            <h4>Recognition</h4>
            {RECOGNITION.map((r) => (
              <p key={r}>
                <span>{r}</span>
              </p>
            ))}
          </div>
        </aside>
      </div>

      {showMore && (
        <div className={s.more}>
          <h4>More client work</h4>
          <div className={s.moreGrid}>
            {MORE_WORK.map((m) => (
              <div key={m.names} className={s.moreItem}>
                <b>{m.names}</b>
                <span>{m.what}</span>
                <em>{m.years}</em>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
