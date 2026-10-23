export type Concept = {
  id: string;
  name: string;
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
    name: "UNUM.CLINIC",
    meta: {
      title: "UNUM.CLINIC — Говорите. Карта заполнится сама. · Concept by David Adebayo",
      description:
        "An unsolicited homepage concept for UNUM.CLINIC: one dental appointment, 09:00 to 09:30, told through voice-to-chart AI, treatment plans signed with a tap and secure patient history.",
      ogImage: "/og/unum.png",
      themeColor: "#F6F8F7",
    },
  },
];

export function getConcept(id: string): Concept | undefined {
  return concepts.find((c) => c.id === id);
}
