"use client";

import { contactSection } from "@/lib/data";
import { getContactPayload } from "@/lib/api-payloads";
import ApiJsonPanel from "./ApiJsonPanel";
import RevealOnScroll from "./RevealOnScroll";
import SectionHeading from "./SectionHeading";
import SocialIcons from "./SocialIcons";
import { useViewMode } from "./ViewModeProvider";

export default function Contact() {
  const { isApiView } = useViewMode();

  return (
    <section id="contact" className="scroll-mt-24 lg:scroll-mt-0">
      <RevealOnScroll>
        <SectionHeading number="05" title="Contact" />
        {isApiView ? (
          <ApiJsonPanel endpoint="/api/contact" payload={getContactPayload()} />
        ) : (
          <div className="max-w-xl">
            <p className="mb-8 text-base leading-relaxed text-muted sm:text-lg">
              {contactSection.headline}
            </p>
            <a
              href={`mailto:${contactSection.email}`}
              className="inline-flex items-center rounded-md border border-accent px-8 py-4 font-mono text-sm tracking-wide text-accent transition-all duration-200 hover:bg-accent/10 hover:shadow-[0_0_20px_rgba(94,234,212,0.15)]"
            >
              {contactSection.ctaLabel}
            </a>
            <SocialIcons className="mt-10" />
          </div>
        )}
      </RevealOnScroll>
    </section>
  );
}
