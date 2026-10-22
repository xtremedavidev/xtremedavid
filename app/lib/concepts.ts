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
];

export function getConcept(id: string): Concept | undefined {
  return concepts.find((c) => c.id === id);
}
