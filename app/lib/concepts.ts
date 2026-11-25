export type Concept = {
  id: string;
  name: string;
  /** Concepts sharing a family are shown as one card with a version switch (e.g. dark / light). */
  family?: string;
  /** Label for this version inside its family, e.g. "Dark" or "Light". */
  variant?: string;
  /** Showcase fields: these drive the home page Concepts Lab and /concepts. */
  showcase: {
    brand: string;
    pitch: string;
    industry: string;
    techniques: string[];
    year: string;
    /** Poster image, 1440×900 screenshot of the hero. Defaults to meta.ogImage. */
    poster?: string;
    /** Short muted scroll-through clip (960×600 mp4) that plays on hover / when in front of the ring. */
    video?: string;
    /** Higher = shown first. */
    order: number;
  };
  meta: {
    title: string;
    description: string;
    ogImage: string;
    themeColor: string;
  };
};

export const concepts: Concept[] = [
  {
    id: "galcon",
    showcase: {
      brand: "Galcon",
      pitch: "Every drop, precisely controlled. A calm, image-led story of irrigation control for gardens, parks and farms.",
      industry: "AgriTech",
      techniques: ["Scroll story","Draggable UI","GSAP"],
      year: "2026",
      poster: "/concepts/galcon/thumb.jpg",
      video: "/concepts/galcon/preview.mp4",
      order: 1,
    },
    name: "Galcon",
    meta: {
      title: "Galcon — Every drop, precisely controlled. · Concept by David Adebayo",
      description:
        "An unsolicited homepage concept for Galcon: calm, image-led irrigation and fertigation control for gardens, parks and farms.",
      ogImage: "/og/galcon.png",
      themeColor: "#F2F2EF",
    },
  },
  {
    id: "ecolit",
    showcase: {
      brand: "ECOLIT",
      pitch: "Homes from light steel, anywhere: a partner-network site that sells both a home and a business.",
      industry: "Construction",
      techniques: ["Canvas","Editorial layout","GSAP"],
      year: "2026",
      poster: "/concepts/ecolit/thumb.jpg",
      video: "/concepts/ecolit/preview.mp4",
      order: 2,
    },
    name: "ECOLIT",
    meta: {
      title: "ECOLIT — Homes from light steel, anywhere. · Concept by David Adebayo",
      description:
        "An unsolicited homepage concept for ECOLIT: cold-formed steel homes, a global partner network, and a business you can open in your city.",
      ogImage: "/og/ecolit.png",
      themeColor: "#ECEDEA",
    },
  },
  {
    id: "arbe",
    showcase: {
      brand: "Arbe",
      pitch: "Ride along with 4D imaging radar and see what 2,304 channels see, rendered as a live point cloud.",
      industry: "Automotive",
      techniques: ["Point cloud","Video","Scroll story"],
      year: "2026",
      poster: "/concepts/arbe/thumb.jpg",
      video: "/concepts/arbe/preview.mp4",
      order: 3,
    },
    name: "Arbe",
    meta: {
      title: "Arbe — Radar Revolution. Delivered. · Concept by David Adebayo",
      description:
        "An unsolicited homepage concept for Arbe: ride along with 4D imaging radar, look inside Phoenix, and see what 2,304 channels see.",
      ogImage: "/og/arbe.png",
      themeColor: "#F3F5F9",
    },
  },
  {
    id: "unum",
    showcase: {
      brand: "UNUM.CLINIC",
      pitch: "One dental appointment, 09:00 to 09:30, told through voice-to-chart AI.",
      industry: "HealthTech",
      techniques: ["Narrative UI","Product storytelling","GSAP"],
      year: "2026",
      poster: "/concepts/unum/thumb.jpg",
      video: "/concepts/unum/preview.mp4",
      order: 4,
    },
    name: "UNUM.CLINIC",
    meta: {
      title: "UNUM.CLINIC — Говорите. Карта заполнится сама. · Concept by David Adebayo",
      description:
        "An unsolicited homepage concept for UNUM.CLINIC: one dental appointment, 09:00 to 09:30, told through voice-to-chart AI, treatment plans signed with a tap and secure patient history.",
      ogImage: "/og/unum.png",
      themeColor: "#F6F8F7",
    },
  },
  {
    id: "truerights",
    family: "truerights",
    variant: "Dark",
    showcase: {
      brand: "TrueRights",
      pitch: "Own your likeness: a cinematic glass-and-particle story about licensing your face and voice to AI.",
      industry: "AI · Rights",
      techniques: ["Canvas particles","Glass UI","Cinematic scroll"],
      year: "2026",
      poster: "/concepts/truerights/thumb.jpg",
      video: "/concepts/truerights/preview.mp4",
      order: 5,
    },
    name: "TrueRights",
    meta: {
      title: "TrueRights — Own your likeness. · Concept by David Adebayo",
      description:
        "An unsolicited homepage concept for TrueRights: a cinematic, glass-and-particle story of registering your face, voice and style, licensing them on your terms and getting paid every time AI uses you.",
      ogImage: "/og/truerights.png",
      themeColor: "#020B06",
    },
  },
  {
    id: "truerights-light",
    family: "truerights",
    variant: "Light",
    showcase: {
      brand: "TrueRights",
      pitch: "A verified rights record, live consent controls and deepfake detection, in a clean product voice.",
      industry: "AI · Rights",
      techniques: ["Product UI","Clean system","GSAP"],
      year: "2026",
      poster: "/concepts/truerights-light/thumb.jpg",
      video: "/concepts/truerights-light/preview.mp4",
      order: 5,
    },
    name: "TrueRights (light)",
    meta: {
      title: "TrueRights — Own the rights to you. · Concept by David Adebayo",
      description:
        "A clean, light homepage concept for TrueRights: one verified rights record, live consent controls, deepfake detection and a consent API for AI platforms.",
      ogImage: "/og/truerights-light.png",
      themeColor: "#F3F5EF",
    },
  },
  {
    id: "reps",
    family: "reps",
    variant: "Dark",
    showcase: {
      brand: "REPS",
      pitch: "The road is the power plant. Follow one braking truck through a live 3D road power plant.",
      industry: "Energy",
      techniques: ["Three.js","Bloom post-processing","3D scroll story"],
      year: "2026",
      poster: "/concepts/reps/thumb.jpg",
      video: "/concepts/reps/preview.mp4",
      order: 6,
    },
    name: "REPS",
    meta: {
      title: "REPS — The road is the power plant. · Concept by David Adebayo",
      description:
        "A cinematic homepage concept for REPS: follow one braking truck through a live 3D road power plant — trigger plates, hydraulics, a maglev converter and storage — out to a city lit by its roads.",
      ogImage: "/og/reps.png",
      themeColor: "#070807",
    },
  },
  {
    id: "reps-light",
    family: "reps",
    variant: "Light",
    showcase: {
      brand: "REPS",
      pitch: "Turning roads into power plants: a live 3D city map, the plate in detail and the Port of Hamburg.",
      industry: "Energy",
      techniques: ["Three.js","3D map","Scroll system"],
      year: "2026",
      poster: "/concepts/reps-light/thumb.jpg",
      video: "/concepts/reps-light/preview.mp4",
      order: 6,
    },
    name: "REPS (light)",
    meta: {
      title: "REPS — Turning roads into power plants. · Concept by David Adebayo",
      description:
        "A light, official homepage concept for REPS: a live 3D city map, the REPS plate in detail, a scroll-driven five-step system view and the Port of Hamburg in operation.",
      ogImage: "/og/reps-light.png",
      themeColor: "#F2F3F0",
    },
  },
];

export function getConcept(id: string): Concept | undefined {
  return concepts.find((c) => c.id === id);
}

export type ConceptGroup = {
  key: string;
  brand: string;
  versions: Concept[];
  order: number;
};

/** Concepts grouped into families, newest (highest order) first. */
export function conceptGroups(): ConceptGroup[] {
  const map = new Map<string, ConceptGroup>();
  for (const c of concepts) {
    const key = c.family ?? c.id;
    const g = map.get(key) ?? { key, brand: c.showcase.brand, versions: [], order: c.showcase.order };
    g.versions.push(c);
    g.order = Math.max(g.order, c.showcase.order);
    map.set(key, g);
  }
  return [...map.values()].sort((a, b) => b.order - a.order);
}

export function posterOf(c: Concept): string {
  return c.showcase.poster ?? c.meta.ogImage;
}
