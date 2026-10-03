import { z } from "zod";

/** Shared by the enquiry form (client) and /api/enquiry (server). */
export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.email("Please enter a valid email address").max(200),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+()\d\s-]*$/, "Use digits, spaces, + ( ) or - only")
    .optional()
    .or(z.literal("")),
  company: z.string().trim().min(2, "Please enter your company").max(150),
  country: z.string().trim().min(2, "Please enter your country").max(80),
  product: z.string().trim().min(1, "Please choose a product").max(80),
  quantity: z.string().trim().min(1, "Please give an approximate quantity").max(80),
  message: z.string().trim().min(10, "Please add a few details (10+ characters)").max(3000),
  /** Honeypot. Real users never see or fill this. */
  website: z.string().max(0).optional().or(z.literal("")),
});

export type Enquiry = z.infer<typeof enquirySchema>;
export type EnquiryErrors = Partial<Record<keyof Enquiry, string>>;

export function fieldErrors(error: z.ZodError): EnquiryErrors {
  const out: EnquiryErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof Enquiry;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}
