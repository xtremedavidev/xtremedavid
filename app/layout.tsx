import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import PortfolioShell from "./components/PortfolioShell";

export const metadata: Metadata = {
  metadataBase: new URL("https://xtreme-david.com"),
  title: "David Adebayo — Product Designer & Full-Stack Engineer",
  description:
    "David Adebayo: product designer and full-stack engineer. 8+ years, 100+ brands including TELUS, Tangible Markets and CareBond. #1 UI/UX designer on Behance in Nigeria.",
  icons: {
    icon: [
      { url: "/images/fav.jpeg", type: "image/jpeg" },
      { url: "/fav.jpeg", type: "image/jpeg" },
    ],
    shortcut: "/images/fav.jpeg",
    apple: "/images/fav.jpeg",
  },
  openGraph: {
    title: "David Adebayo — Product Designer & Full-Stack Engineer",
    description:
      "David Adebayo: product designer and full-stack engineer. 8+ years, 100+ brands including TELUS, Tangible Markets and CareBond. #1 UI/UX designer on Behance in Nigeria.",
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
    title: "David Adebayo — Product Designer & Full-Stack Engineer",
    description:
      "David Adebayo: product designer and full-stack engineer. 8+ years, 100+ brands including TELUS, Tangible Markets and CareBond. #1 UI/UX designer on Behance in Nigeria.",
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
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&display=swap"
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

        {/* Google tag (gtag.js) */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
                `,
              }}
            />
          </>
        )}
      </head>
      <PortfolioShell>
        {children}
      </PortfolioShell>
    </html>
  );
}
