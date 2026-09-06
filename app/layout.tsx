/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "David Adebayo — UI/UX Designer & Software Engineer",
  description:
    "Portfolio of David Adebayo — #1 on Behance Nigeria (UI/UX). Globally recognized designer & engineer building digital worlds.",
  icons: {
    icon: [
      { url: "/images/fav.jpeg", type: "image/jpeg" },
      { url: "/fav.jpeg", type: "image/jpeg" },
    ],
    shortcut: "/images/fav.jpeg",
    apple: "/images/fav.jpeg",
  },
  openGraph: {
    title: "David Adebayo — UI/UX Designer & Software Engineer",
    description:
      "Portfolio of David Adebayo — #1 on Behance Nigeria (UI/UX). Globally recognized designer & engineer building digital worlds.",
    images: [
      {
        url: "/images/image.jpeg",
        width: 1200,
        height: 1500,
        alt: "David Adebayo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "David Adebayo — UI/UX Designer & Software Engineer",
    description:
      "Portfolio of David Adebayo — #1 on Behance Nigeria (UI/UX). Globally recognized designer & engineer building digital worlds.",
    images: ["/images/image.jpeg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/images/fav.jpeg" type="image/jpeg" />
        <link rel="shortcut icon" href="/images/fav.jpeg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/images/fav.jpeg" />

        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Playfair+Display:ital@1&display=swap"
          rel="stylesheet"
        />

        {/* Three.js */}
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
          defer
        ></script>

        {/* GSAP + Plugins */}
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"
          defer
        ></script>
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"
          defer
        ></script>
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/CustomEase.min.js"
          defer
        ></script>

        {/* Lenis */}
        <script
          src="https://unpkg.com/lenis@1.1.18/dist/lenis.min.js"
          defer
        ></script>
      </head>
      <body>
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
        <div id="chapter-number" dangerouslySetInnerHTML={{ __html: "01 / 04" }} />

        <Navbar />
        {children}
      </body>
    </html>
  );
}
