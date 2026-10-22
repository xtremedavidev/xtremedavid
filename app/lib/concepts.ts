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
];

export function getConcept(id: string): Concept | undefined {
  return concepts.find((c) => c.id === id);
}
