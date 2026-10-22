import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { concepts, getConcept } from "@/app/lib/concepts";
import { registry } from "@/app/components/concepts/registry";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return concepts.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = getConcept((await params).id);
  if (!c) return {};
  return {
    title: c.meta.title,
    description: c.meta.description,
    robots: { index: false, follow: false },
    openGraph: { title: c.meta.title, description: c.meta.description, images: [c.meta.ogImage] },
    twitter: { card: "summary_large_image", title: c.meta.title, description: c.meta.description, images: [c.meta.ogImage] },
  };
}

export async function generateViewport({ params }: Props): Promise<Viewport> {
  const c = getConcept((await params).id);
  return { themeColor: c?.meta.themeColor };
}

export default async function ConceptPage({ params }: Props) {
  const { id } = await params;
  const Concept = registry[id];
  if (!getConcept(id) || !Concept) notFound();
  return <Concept />;
}
