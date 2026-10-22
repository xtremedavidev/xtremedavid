"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function PortfolioShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    // Render a clean body with no portfolio overlays for Payload admin
    return <body>{children}</body>;
  }

  // Concept pages (/concept/*) are standalone sites: no cursor, noise, navbar or chapter UI.
  // Their styles live in their own CSS Module; globals.css is not modified for them.
  if (pathname?.startsWith("/concept")) {
    return <body data-concept="">{children}</body>;
  }

  return (
    <body data-portfolio="">
      {/* Custom Cursor */}
      <div id="cursor-dot"></div>
      <div id="cursor-ring"></div>

      {/* Progress Bar */}
      <div id="progress-bar"></div>

      {/* Noise Overlay */}
      <div id="noise-overlay">
        <svg width="100%" height="100%">
          <filter id="noise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      {/* Chapter Number */}
      <div
        id="chapter-number"
        dangerouslySetInnerHTML={{ __html: "01 / 04" }}
      />

      <Navbar />
      {children}
    </body>
  );
}
