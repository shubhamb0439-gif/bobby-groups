export const site = {
  name: "Bobby Group",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://bobbygroup.in",
  description:
    "Bobby Group is a Bengaluru-based exporter of premium Indian whole spices and Robusta coffee beans, supplying importers, distributors and food manufacturers worldwide.",
  contact: {
    address: { locality: "Bengaluru", region: "Karnataka", postalCode: "560083", country: "IN" },
    addressLine: "Bengaluru, Karnataka - 560083",
    phone: "+91 9880355284",
    phoneHref: "tel:+919880355284",
    email: "info@bobbygroup.in",
  },
  nav: [
    { id: "about", label: "About" },
    { id: "spices", label: "Spices" },
    { id: "certifications", label: "Certifications" },
    { id: "why-us", label: "Why Us" },
    { id: "contact", label: "Contact" },
  ],
  /** Fill in real profile URLs. Empty entries render as "coming soon" placeholders. */
  social: [
    { name: "LinkedIn", href: "" },
    { name: "Instagram", href: "" },
    { name: "Facebook", href: "" },
    { name: "WhatsApp", href: "" },
  ],
} as const;

export type SectionId = (typeof site.nav)[number]["id"];
