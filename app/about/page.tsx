import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About & experience · David Adebayo",
  description:
    "Product designer and full-stack engineer in Lagos. 8+ years with TELUS, Breathe ESG, Tangible Markets, SavvyLoans, CareBond and AZULIK. Download the résumé.",
};

export default function AboutPage() {
  return <AboutClient />;
}
