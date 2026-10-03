"use client";

import { useId, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { enquirySchema, fieldErrors, type Enquiry, type EnquiryErrors } from "@/lib/validation";
import { contact, productOptions } from "@/config/content";
import { site } from "@/config/site";
import { MagneticButton } from "@/components/MagneticButton";

type Status = "idle" | "sending" | "success" | "error";

const empty: Enquiry = { name: "", email: "", phone: "", company: "", country: "", product: "", quantity: "", message: "", website: "" };

export function EnquiryForm() {
  const [values, setValues] = useState<Enquiry>(empty);
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const uid = useId();

  const update = (key: keyof Enquiry) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const validateField = (key: keyof Enquiry) => {
    const result = enquirySchema.safeParse(values);
    const msg = result.success ? undefined : fieldErrors(result.error)[key];
    setErrors((er) => ({ ...er, [key]: msg }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = enquirySchema.safeParse(values);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      const first = Object.keys(errs)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setStatus("sending");
    setServerMessage("");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; errors?: EnquiryErrors };
      if (!res.ok || !data.ok) {
        if (data.errors) setErrors(data.errors);
        setServerMessage(data.message ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
      setValues(empty);
      requestAnimationFrame(playSuccess);
    } catch {
      setServerMessage("We couldn't reach the server. Please check your connection and try again.");
      setStatus("error");
    }
  }

  function playSuccess() {
    const el = successRef.current;
    if (!el) return;
    el.focus();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap
      .timeline()
      .from(el, { autoAlpha: 0, y: 20, duration: 0.5, ease: "power2.out" })
      .from(el.querySelector("[data-ring]"), { scale: 0.4, autoAlpha: 0, duration: 0.6, ease: "back.out(2)" }, "-=0.2")
      .fromTo(el.querySelector("[data-check]"), { strokeDashoffset: 30 }, { strokeDashoffset: 0, duration: 0.5, ease: "power2.out" }, "-=0.25")
      .from(el.querySelectorAll("[data-success-text]"), { autoAlpha: 0, y: 10, stagger: 0.08, duration: 0.4 }, "-=0.2");
  }

  if (status === "success") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="flex min-h-[520px] flex-col items-center justify-center rounded-3xl bg-white p-10 text-center shadow-[0_40px_80px_-50px_rgba(0,0,0,0.4)] outline-none"
      >
        <span data-ring className="flex h-20 w-20 items-center justify-center rounded-full bg-gold/12 ring-1 ring-gold/40">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="var(--color-gold)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path data-check d="m5 12.5 4.5 4.5L19 7.5" strokeDasharray="30" />
          </svg>
        </span>
        <h3 data-success-text className="mt-8 font-heading text-3xl font-bold text-ink">
          Enquiry received
        </h3>
        <p data-success-text className="mt-3 max-w-sm text-ink/65">
          {contact.success}
        </p>
        <button data-success-text type="button" onClick={() => setStatus("idle")} className="mt-8 text-sm font-semibold text-gold underline-offset-4 hover:underline">
          Send another enquiry
        </button>
      </div>
    );
  }

  const field = (key: keyof Enquiry) => ({
    id: `${uid}-${key}`,
    name: key,
    value: values[key] ?? "",
    onChange: update(key),
    onBlur: () => values[key] && validateField(key),
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `${uid}-${key}-error` : undefined,
    className: `peer w-full rounded-xl border bg-white px-4 py-3.5 text-ink placeholder:text-ink/60 transition-colors outline-none focus:border-gold focus:ring-2 focus:ring-gold/25 ${
      errors[key] ? "border-chili" : "border-ink/12"
    }`,
  });

  const label = (key: keyof Enquiry, text: string, required = true) => (
    <label htmlFor={`${uid}-${key}`} className="mb-2 block text-sm font-medium text-ink/80">
      {text}
      {required ? <span className="text-chili" aria-hidden="true"> *</span> : <span className="text-ink/60"> (optional)</span>}
    </label>
  );

  const error = (key: keyof Enquiry) =>
    errors[key] ? (
      <p id={`${uid}-${key}-error`} className="mt-1.5 text-sm text-chili">
        {errors[key]}
      </p>
    ) : null;

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      aria-labelledby={`${uid}-title`}
      className="relative rounded-3xl bg-white p-6 shadow-[0_40px_80px_-50px_rgba(0,0,0,0.4)] sm:p-10"
    >
      <h3 id={`${uid}-title`} className="font-heading text-2xl font-bold text-ink">
        Send an enquiry
      </h3>
      <p className="mt-1 text-sm text-ink/60">
        Fields marked <span className="text-chili">*</span> are required.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          {label("name", "Name")}
          <input type="text" autoComplete="name" required {...field("name")} />
          {error("name")}
        </div>
        <div>
          {label("company", "Company")}
          <input type="text" autoComplete="organization" required {...field("company")} />
          {error("company")}
        </div>
        <div>
          {label("email", "Email")}
          <input type="email" autoComplete="email" inputMode="email" required {...field("email")} />
          {error("email")}
        </div>
        <div>
          {label("phone", "Phone / WhatsApp", false)}
          <input type="tel" autoComplete="tel" inputMode="tel" {...field("phone")} />
          {error("phone")}
        </div>
        <div>
          {label("country", "Country")}
          <input type="text" autoComplete="country-name" required {...field("country")} />
          {error("country")}
        </div>
        <div>
          {label("product", "Product of interest")}
          <select required {...field("product")}>
            <option value="" disabled>
              Choose a product
            </option>
            {productOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          {error("product")}
        </div>
        <div className="sm:col-span-2">
          {label("quantity", "Quantity")}
          <input type="text" placeholder="e.g. 1 x 20ft container, 5 MT per month" required {...field("quantity")} />
          {error("quantity")}
        </div>
        <div className="sm:col-span-2">
          {label("message", "Message")}
          <textarea rows={5} placeholder="Grade, packaging, destination port, timeline…" required {...field("message")} />
          {error("message")}
        </div>
        {/* Honeypot: hidden from people and assistive tech, bots tend to fill it. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label htmlFor={`${uid}-website`}>Website</label>
          <input id={`${uid}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={update("website")} />
        </div>
      </div>

      <div className="mt-8 flex flex-col-reverse items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-ink/60">
          Prefer email? Write to{" "}
          <a href={`mailto:${site.contact.email}`} className="font-medium text-gold hover:underline">
            {site.contact.email}
          </a>
        </p>
        <MagneticButton type="submit" variant="gold" disabled={status === "sending"} className="px-8 py-4">
          {status === "sending" ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
              Sending…
            </>
          ) : (
            "Send enquiry"
          )}
        </MagneticButton>
      </div>
      <div aria-live="assertive" className="mt-4 min-h-6">
        {status === "error" && serverMessage && (
          <p className="rounded-lg bg-chili/8 px-4 py-3 text-sm text-chili" role="alert">
            {serverMessage}
          </p>
        )}
      </div>
    </form>
  );
}
