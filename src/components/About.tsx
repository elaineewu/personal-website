"use client";

import { aboutSection } from "@/lib/data";
import { getAboutPayload } from "@/lib/api-payloads";
import ApiJsonPanel from "./ApiJsonPanel";
import RevealOnScroll from "./RevealOnScroll";
import SectionHeading from "./SectionHeading";
import { useViewMode } from "./ViewModeProvider";

export default function About() {
  const { isApiView } = useViewMode();

  return (
    <section id="about" className="scroll-mt-24 lg:scroll-mt-0">
      <RevealOnScroll>
        <SectionHeading number="01" title="About" />
        {isApiView ? (
          <ApiJsonPanel endpoint="/api/about" payload={getAboutPayload()} />
        ) : (
          <div className="max-w-2xl text-base leading-relaxed text-muted sm:text-lg sm:leading-8">
            <p>{aboutSection.body}</p>
          </div>
        )}
      </RevealOnScroll>
    </section>
  );
}
