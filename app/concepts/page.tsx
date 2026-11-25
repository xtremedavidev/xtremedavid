import type { Metadata } from "next";
import ConceptsPageClient from "./ConceptsPageClient";

export const metadata: Metadata = {
  title: "Concepts Lab · David Adebayo",
  description:
    "Unsolicited homepage concepts designed and built end to end by David Adebayo: 3D, motion and real code for brands like REPS, TrueRights, Arbe and more.",
  openGraph: {
    title: "Concepts Lab · David Adebayo",
    description: "Unsolicited homepages, designed and built end to end. Open them, they're real sites.",
    images: ["/og/reps.png"],
  },
};

export default function ConceptsPage() {
  return <ConceptsPageClient />;
}
