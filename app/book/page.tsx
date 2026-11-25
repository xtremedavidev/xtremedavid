import type { Metadata } from "next";
import BookClient from "./BookClient";

export const metadata: Metadata = {
  title: "Book a call · David Adebayo",
  description: "Book a 30-minute intro call with David Adebayo, product designer and full-stack engineer, about a role or a project.",
};

export default function BookPage() {
  return <BookClient />;
}
