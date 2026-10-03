/**
 * All site copy in one place. Wording comes from the current bobbygroup.in,
 * lightly tightened. Do not add facts that are not true for the business.
 */
import type { SceneKey } from "@/lib/sequence";

export type StoryPanel = {
  id: string;
  /** Scene the panel belongs to; it fades in/out inside `range` (fractions of that scene). */
  scenes: SceneKey[];
  /** Portion of the combined scene span where the panel is fully visible, 0..1. */
  hold?: [number, number];
  eyebrow?: string;
  title: string;
  body?: string;
  /** "dark" text for white frames, "light" text for ocean frames. */
  tone: "dark" | "light";
  align: "left" | "right" | "center";
  cta?: { label: string; target: string };
};

export const hero = {
  title: "Premium Indian Spices, Exported Worldwide",
  subline: "Whole spices and coffee, sourced directly from trusted growers across India.",
  scrollCue: "Scroll to explore",
  facts: [
    { value: "9", label: "Products" },
    { value: "7", label: "Registrations & certifications" },
  ],
};

export const storyPanels: StoryPanel[] = [
  {
    id: "sourcing",
    scenes: ["fill"],
    hold: [0.35, 0.85],
    eyebrow: "Direct sourcing",
    title: "Sourced directly from trusted growers",
    body: "Green Cardamom, Black Pepper, Turmeric, Cinnamon, Teja S17 Red Chilli, Clove and Robusta Coffee Beans.",
    tone: "dark",
    align: "left",
  },
  {
    id: "quality",
    scenes: ["zoomOutTruck", "crane"],
    hold: [0.2, 0.8],
    eyebrow: "Our process",
    title: "Quality inspection. Custom packaging. Bulk quantities.",
    tone: "dark",
    align: "right",
  },
  {
    id: "shipping",
    scenes: ["shipLoad", "shipDepart"],
    hold: [0.2, 0.8],
    eyebrow: "Timely delivery",
    title: "Global shipping, delivered on time",
    tone: "dark",
    align: "left",
  },
  {
    id: "closing",
    scenes: ["drone"],
    hold: [0.3, 1],
    eyebrow: "Bulk orders & customisation",
    title: "From India's growers to your market.",
    body: "Tell us what you need, and we'll take it from there.",
    tone: "light",
    align: "center",
    cta: { label: "Get a Quote", target: "contact" },
  },
];

export const about = {
  eyebrow: "About Us",
  title: "An Indian exporter of premium spices",
  lead:
    "Bobby Group is an Indian exporter company specializing in premium spices including Green Cardamom, Black Pepper, Turmeric, Cinnamon, Teja S17 Red Chilli, Clove and Robusta Coffee Beans. We supply importers, distributors and food manufacturers with consistent quality products sourced directly from trusted growers across India.",
  pillars: [
    {
      title: "Commitment to quality",
      body: "With a focus on quality and professionalism, we work continuously to create the best experience for every customer, serving you with commitment and care.",
    },
    {
      title: "Long-term relationships",
      body: "We believe in building long-term relationships through honesty, consistency and outstanding service. Your satisfaction is our priority, and we strive every day to exceed expectations.",
    },
  ],
};

export const spices = {
  eyebrow: "Our Spices",
  title: "Experience the magic of spices",
  intro: "Discover a rich collection of handpicked spices sourced for freshness, aroma, and authentic flavor.",
  /** `slug` maps to /public/spices/<slug>.jpg. `tint` colors the placeholder when no photo exists. */
  items: [
    { slug: "turmeric", name: "Turmeric", tint: ["#E8A317", "#9C5B05"] },
    { slug: "cardamom", name: "Cardamoms", tint: ["#9DB36A", "#4F6B2C"] },
    { slug: "teja-s17-red-chilli", name: "Teja S17 Red Chilli", tint: ["#D63A22", "#7A160C"] },
    { slug: "cinnamon", name: "Cinnamon", tint: ["#C1834B", "#6E3F1C"] },
    { slug: "cloves", name: "Cloves", tint: ["#8A4B2F", "#3D1E12"] },
    { slug: "black-pepper", name: "Black Pepper", tint: ["#5B5148", "#1E1A17"] },
    { slug: "star-anise", name: "Star Anise", tint: ["#A0522D", "#4A2412"] },
    { slug: "cumin-seeds", name: "Cumin Seeds", tint: ["#B89A63", "#6A532B"] },
    { slug: "robusta-coffee", name: "Robusta Coffee Beans", tint: ["#7B4A2E", "#2B1A10"] },
  ],
} as const;

export const certifications = {
  eyebrow: "Licenses & Certifications",
  title: "Quality and compliance at our foundation",
  intro:
    "At Bobby Group, quality and compliance form the foundation of our operations. Our certifications and registrations demonstrate our commitment to food safety, export excellence, and delivering premium Indian spices that meet international market requirements.",
  /** `slug` maps to /public/certifications/<slug>.(svg|png|webp|jpg). */
  items: [
    { slug: "dgft", short: "DGFT", name: "Importer-Exporter Code", org: "Directorate General of Foreign Trade" },
    { slug: "fssai", short: "FSSAI", name: "Food Safety and Standards Authority of India", org: "FSSAI" },
    { slug: "spices-board", short: "Spices Board", name: "Exporter Certification", org: "Spices Board India" },
    { slug: "apeda", short: "APEDA", name: "Membership Certificate", org: "APEDA" },
    { slug: "mca", short: "MCA", name: "Register of Companies", org: "Ministry of Corporate Affairs" },
    { slug: "gst", short: "GST", name: "Goods & Services Tax", org: "GST Registration" },
    { slug: "coffee-board", short: "Coffee Board", name: "Coffee Board of India", org: "Coffee Board" },
  ],
} as const;

export const whyUs = {
  eyebrow: "Why Choose Bobby Group?",
  title: "Built for importers who need consistency",
  items: [
    { icon: "sourcing", title: "Direct sourcing", body: "Products sourced directly from trusted growers across India." },
    { icon: "pricing", title: "Competitive pricing", body: "Competitive pricing for importers and distributors." },
    { icon: "packaging", title: "Custom packaging", body: "Packaging tailored to your market and requirements." },
    { icon: "bulk", title: "Bulk quantities", body: "Supply at the volumes food manufacturers need." },
    { icon: "shipping", title: "Global shipping", body: "Export shipments to international markets." },
    { icon: "inspection", title: "Quality inspection", body: "Quality inspected for consistent standards." },
    { icon: "delivery", title: "Timely delivery", body: "Reliable, on-time delivery." },
  ],
} as const;

export const contact = {
  eyebrow: "Contact Us",
  title: "For any bulk order / customization, get in touch",
  intro: "Reach out through the form and we will get back to you shortly.",
  success: "Thank you. Your enquiry has been sent, and we'll get back to you shortly.",
};

export const productOptions = [...spices.items.map((s) => s.name), "Multiple products / other"];
