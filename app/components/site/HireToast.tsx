"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PROFILE } from "@/app/lib/profile";
import s from "./site.module.css";

/** Gentle "Hiring?" card that appears once per session after some time on the site. */
export default function HireToast() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("hire-toast")) return;
    } catch {}
    const id = setTimeout(() => setShow(true), 30000);
    return () => clearTimeout(id);
  }, []);

  const close = () => {
    setShow(false);
    try {
      sessionStorage.setItem("hire-toast", "1");
    } catch {}
  };

  return (
    <div className={`${s.toast} ${show ? s.toastOn : ""}`} role="dialog" aria-label="Hiring a product designer?" aria-hidden={!show}>
      <button className={s.toastX} onClick={close} aria-label="Dismiss">
        ×
      </button>
      <p className={s.toastKicker}>
        <i /> Available now
      </p>
      <p className={s.toastTitle}>Hiring a product designer who ships code?</p>
      <div className={s.toastCtas}>
        <Link href="/book" className={s.btnLime} onClick={close}>
          Book a call
        </Link>
        <a href={PROFILE.resume} download className={s.btnLine} onClick={close}>
          Résumé ↓
        </a>
      </div>
    </div>
  );
}
