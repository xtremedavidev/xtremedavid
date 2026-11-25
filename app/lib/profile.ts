/**
 * Single source of truth for personal info used across the site.
 * Edit here; every page (home, about, book, footer, nav) reads from it.
 */

export const PROFILE = {
  name: "David Adebayo",
  title: "Product Designer & Full-Stack Engineer",
  email: "davidadebayo702@gmail.com",
  location: "Lagos, Nigeria",
  timezone: "Africa/Lagos",
  resume: "/resume/David-Adebayo-Resume.pdf",
  /** Cal.com event link, embedded on /book. Leave empty to fall back to the built-in request picker. */
  calLink: "https://cal.com/david-adebayo-xtremedavid-z0omoq/30min",
  linkedin: "https://www.linkedin.com/in/david-adebayo/",
  behance: "https://www.behance.net/xtremedavid",
  openTo: "Open to full-time roles & projects",
};

export const STATS = [
  { n: 8, suffix: "+", l: "Years designing & shipping" },
  { n: 100, suffix: "+", l: "Brands across 5 continents" },
  { n: 5, suffix: "×", l: "Best of Behance features" },
  { n: 1, prefix: "#", l: "UI/UX designer on Behance, Nigeria" },
];

export const CLIENTS = [
  "TELUS",
  "Breathe ESG",
  "Tangible Markets",
  "SavvyLoans",
  "CareBond",
  "AZULIK",
  "The Iris",
  "APIdays",
  "Snapchef",
  "Flow Optix",
  "Realtechture",
  "Invest Africa 54",
  "Axy Digital",
  "Codarket",
  "Fayda Med Tech",
  "Hitch Guardian",
];

export type Role = {
  company: string;
  role: string;
  place: string;
  start: string;
  end: string;
  sector: string;
  points: string[];
  stack?: string[];
};

export const EXPERIENCE: Role[] = [
  {
    company: "SavvyLoans",
    role: "UI/UX Designer",
    place: "Remote",
    start: "Jun 2026",
    end: "Sep 2026",
    sector: "Fintech",
    points: ["Redesigned the lending platform end to end; user drop-offs fell 40%.", "Monthly recurring revenue grew from $1.9M to $3.6M after the redesign."],
  },
  {
    company: "CareBond",
    role: "Product Designer & Engineer",
    place: "Switzerland",
    start: "Dec 2025",
    end: "Apr 2026",
    sector: "Healthcare",
    points: [
      "Designed the institution web platform and companion mobile app end to end, about 200 screens.",
      "Delivered branding, technical documentation, PDF pipelines and frontend integration specs for a distributed team.",
      "Led the team through build; the platform is fully operational.",
    ],
    stack: ["React Native", "Expo", "Next.js", "Django"],
  },
  {
    company: "AZULIK",
    role: "Product Designer",
    place: "Tulum, Mexico",
    start: "Nov 2025",
    end: "Apr 2026",
    sector: "Hospitality",
    points: [
      "Designed the digital product and brand experience for a luxury eco-resort brand.",
      "Contributed to the digital presence of a new resort launching in 2027 with Saudi Arabia's Royal Commission for AlUla.",
    ],
  },
  {
    company: "The Iris Agency",
    role: "Designer & Full-Stack Developer",
    place: "USA",
    start: "Dec 2025",
    end: "Mar 2026",
    sector: "Agency",
    points: ["Designed and built the agency's website end to end in Next.js, from visual direction to production."],
    stack: ["Figma", "Next.js", "React"],
  },
  {
    company: "Tangible Markets",
    role: "Lead UI/UX Designer",
    place: "London, UK",
    start: "Dec 2024",
    end: "Dec 2025",
    sector: "Financial markets",
    points: [
      "Designed infrastructure and dashboards for a platform processing about $5B in transactions a year.",
      "Simplified complex workflows across enterprise clients for retail and institutional users.",
    ],
  },
  {
    company: "TELUS Communications",
    role: "UI/UX Designer",
    place: "Canada",
    start: "Jan 2023",
    end: "Dec 2024",
    sector: "Telecom",
    points: [
      "Trained AI systems and improved the digital ecosystem of one of Canada's largest telecoms (21M+ connections).",
      "Built design systems, component libraries and prototypes to enterprise accessibility standards.",
    ],
  },
  {
    company: "Breathe ESG",
    role: "Lead Product Designer",
    place: "India & Global",
    start: "Jan 2023",
    end: "Dec 2024",
    sector: "Climate SaaS",
    points: [
      "Designed end-to-end UI for a SOC 2, ISO 27001 and GDPR-compliant sustainability platform used by WeWork and Embassy Group.",
      "Built a scalable design system for Scope 1, 2 and 3 emissions reporting.",
    ],
  },
];

export const MORE_WORK: { names: string; what: string; years: string }[] = [
  { names: "Axy Digital, Codarket, Boitr", what: "Design & engineering across marketing, marketplace and SaaS", years: "2025–26" },
  { names: "Snapchef, Australia", what: "Food-tech app, research to front-end engineering", years: "2024" },
  { names: "Flow Optix, Canada", what: "IA, UX flows and hi-fi UI for an optical workflow SaaS", years: "2023–24" },
  { names: "APIdays Global", what: "UX for an API conference series in 15+ countries", years: "2023–24" },
  { names: "Invest Africa 54", what: "Three investment products for Africa-focused investors", years: "2023–24" },
  { names: "Fayda Med Tech", what: "UI/UX for a medical technology platform", years: "2023–25" },
  { names: "Realtechture", what: "Property search, listings and agent dashboards", years: "2022–23" },
  { names: "Hitch Guardian", what: "UX and identity for a safety mobile app", years: "2024" },
  { names: "WALC Africa, Oga54, Oga Ride", what: "Logistics, mobility and lifestyle platforms", years: "2025" },
  { names: "Medina Baye, Senegal", what: "Platform for a major West African cultural destination", years: "2021–22" },
  { names: "OAU Mobile", what: "Institutional app for thousands of students and staff", years: "2021–22" },
  { names: "Afritech54, Purple Ocean", what: "African tech and fintech platforms", years: "2021–25" },
];

export const EDUCATION = [
  { school: "Miva Open University", what: "B.Sc. Software Engineering · capstone in AI-driven software", years: "2024–2027 (expected)" },
  { school: "Obafemi Awolowo University", what: "Bachelor's, Food Engineering (Honors)", years: "" },
];

export const RECOGNITION = [
  "5× Adobe Behance Best of Behance (UI/UX and Illustration)",
  "#1 UI/UX designer and #2 overall designer in Nigeria on Behance",
];

export const SKILLS = {
  Design: ["Product Design", "UI/UX", "Interaction Design", "User Research", "Design Systems", "Prototyping", "Accessibility", "Brand Identity", "Illustration", "Figma"],
  Engineering: ["React", "Next.js", "React Native", "Expo", "TypeScript", "Three.js", "GSAP", "Framer Motion", "Django", "Node.js"],
  Platforms: ["Framer", "Webflow", "Shopify", "WordPress", "Sanity", "Payload CMS"],
};
