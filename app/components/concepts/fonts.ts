/**
 * Self-hosted fonts for the concept sites.
 *
 * These used to come from next/font/google, which downloads from Google at
 * build time. When that download fails (it does, intermittently, on Vercel),
 * the whole build fails. Shipping the files with the repo makes builds
 * deterministic. All fonts are OFL-1.1 (files from Fontsource).
 */
import localFont from "next/font/local";

export const geist = localFont({
  src: "./_fonts/geist-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-geist",
  display: "swap",
});

export const geistMono = localFont({
  src: "./_fonts/geist-mono-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-gmono",
  display: "swap",
});

export const michroma = localFont({
  src: "./_fonts/michroma-latin-400-normal.woff2",
  weight: "400",
  variable: "--font-michroma",
  display: "swap",
});

export const montserrat = localFont({
  src: "./_fonts/montserrat-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-montserrat",
  display: "swap",
});

export const outfit = localFont({
  src: "./_fonts/outfit-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-outfit",
  display: "swap",
});

export const plexMono = localFont({
  src: "./_fonts/ibm-plex-mono-latin-500-normal.woff2",
  weight: "500",
  variable: "--font-plex",
  display: "swap",
});

export const hostGrotesk = localFont({
  src: "./_fonts/host-grotesk-latin-wght-normal.woff2",
  weight: "300 800",
  variable: "--font-host",
  display: "swap",
});

export const jetbrainsMono = localFont({
  src: "./_fonts/jetbrains-mono-latin-wght-normal.woff2",
  weight: "100 800",
  variable: "--font-jbm",
  display: "swap",
});

/* UNUM.CLINIC needs Cyrillic. Latin and Cyrillic are separate files, so they are
   loaded as two families and stacked in one CSS variable (see unumFontVars). */
const onestLatin = localFont({ src: "./_fonts/onest-latin-wght-normal.woff2", weight: "100 900", display: "swap", adjustFontFallback: false });
const onestCyr = localFont({ src: "./_fonts/onest-cyrillic-wght-normal.woff2", weight: "100 900", display: "swap", adjustFontFallback: false });
const jbLatin = localFont({ src: "./_fonts/jetbrains-mono-latin-wght-normal.woff2", weight: "100 800", display: "swap", adjustFontFallback: false });
const jbCyr = localFont({ src: "./_fonts/jetbrains-mono-cyrillic-wght-normal.woff2", weight: "100 800", display: "swap", adjustFontFallback: false });

const first = (f: { style: { fontFamily: string } }) => f.style.fontFamily.split(",")[0].trim();

/** Inline style that defines --font-onest and --font-jb with Latin + Cyrillic coverage. */
export const unumFontVars = {
  "--font-onest": `${first(onestLatin)}, ${first(onestCyr)}, system-ui, sans-serif`,
  "--font-jb": `${first(jbLatin)}, ${first(jbCyr)}, ui-monospace, monospace`,
} as React.CSSProperties;
