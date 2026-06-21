"use client";

import { useLayoutEffect, useRef, useState } from "react";
import RevealOnScroll from "./RevealOnScroll";
import SectionHeading from "./SectionHeading";

type ExperienceEntry = {
  id: string;
  title: string;
  organization: string;
  dates: string;
  description: string;
  swapHierarchy?: boolean;
};

const experiences: ExperienceEntry[] = [
  {
    id: "varsity",
    title: "Software Engineering Intern",
    organization: "Varsity Software",
    dates: "Jan 2026 – Present",
    description:
      "Own end-to-end product development for client web apps, from discovery and UX design through deployment. Building an AI-powered business assessment tool and migrating the Princeton University store marketplace, using generative AI to accelerate prototyping cycles.",
  },
  {
    id: "smile-train",
    title: "Data Analyst Intern",
    organization: "Smile Train",
    dates: "Jun – Aug 2025",
    description:
      "Partnered with fundraising and program teams to turn donation data into actionable insights, building Qlik Sense dashboards and querying SQL datasets to speed up regional funding decisions and address donor drop-off patterns.",
  },
  {
    id: "princeton",
    title: "Operations Research & Financial Engineering",
    organization: "Princeton University",
    dates: "Sep 2024 – Present",
    description:
      "Pursuing a B.S.E. in Operations Research and Financial Engineering with minors in Statistics & Machine Learning and Finance, building a foundation in probability, optimization, and financial mathematics.",
    swapHierarchy: true,
  },
  {
    id: "math-camp",
    title: "Researcher",
    organization: "Honors Summer Math Camp at Mathworks",
    dates: "Summers 2021–2024",
    description:
      "Researched statistical distance metrics and constrained spectral clustering in R, Python, and MATLAB, improving predictive accuracy to 89% and cutting algorithm runtime by 22%. Presented technical findings to non-technical audiences at annual symposiums.",
  },
];

export default function Experience() {
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [fillHeight, setFillHeight] = useState(0);
  const [lineTop, setLineTop] = useState(0);
  const [lineHeight, setLineHeight] = useState(0);
  const [activeDots, setActiveDots] = useState<boolean[]>(
    () => experiences.map(() => false),
  );

  useLayoutEffect(() => {
    const updateTimeline = () => {
      const section = sectionRef.current;
      const dots = dotRefs.current.filter(Boolean) as HTMLDivElement[];
      if (!section || dots.length === 0) return;

      const firstDot = dots[0];
      const lastDot = dots[dots.length - 1];
      const timeline = timelineRef.current;
      if (!timeline) return;

      const timelineTop = timeline.offsetTop;
      const firstCenter =
        firstDot.offsetTop + firstDot.offsetHeight / 2 - timelineTop;
      const lastCenter =
        lastDot.offsetTop + lastDot.offsetHeight / 2 - timelineTop;
      const span = lastCenter - firstCenter;

      setLineTop(firstCenter);
      setLineHeight(span);

      const viewportHeight = window.innerHeight;
      const scrollStart = section.offsetTop - viewportHeight * 0.75;
      const scrollEnd =
        section.offsetTop + section.offsetHeight - viewportHeight * 0.25;
      const scrollRange = Math.max(scrollEnd - scrollStart, 1);
      const progress = Math.min(
        1,
        Math.max(0, (window.scrollY - scrollStart) / scrollRange),
      );

      const fillEnd = firstCenter + span * progress;
      setFillHeight(Math.max(0, fillEnd - firstCenter));

      setActiveDots(
        dots.map((dot) => {
          const dotCenter = dot.offsetTop + dot.offsetHeight / 2 - timelineTop;
          return dotCenter <= fillEnd + 1;
        }),
      );
    };

    updateTimeline();
    window.addEventListener("scroll", updateTimeline, { passive: true });
    window.addEventListener("resize", updateTimeline);

    const timeline = timelineRef.current;
    const resizeObserver =
      timeline && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateTimeline)
        : null;
    resizeObserver?.observe(timeline);

    return () => {
      window.removeEventListener("scroll", updateTimeline);
      window.removeEventListener("resize", updateTimeline);
      resizeObserver?.disconnect();
    };
  }, []);

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="scroll-mt-24 lg:scroll-mt-0"
    >
      <RevealOnScroll>
        <SectionHeading number="02" title="Experience" />
      </RevealOnScroll>

      <div ref={timelineRef} className="relative pl-8">
        <div
          className="absolute left-[7px] w-px bg-border/80"
          style={{ top: lineTop, height: lineHeight }}
          aria-hidden="true"
        />
        <div
          className="absolute left-[7px] w-px bg-accent"
          style={{ top: lineTop, height: fillHeight }}
          aria-hidden="true"
        />

        <ul className="flex flex-col">
          {experiences.map((entry, index) => (
            <li
              key={entry.id}
              className="relative pb-12 last:pb-0"
            >
              <div
                ref={(el) => {
                  dotRefs.current[index] = el;
                }}
                className={`absolute left-0 top-2 z-10 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 transition-colors duration-300 ${
                  activeDots[index]
                    ? "border-accent bg-accent shadow-[0_0_8px_rgba(94,234,212,0.35)]"
                    : "border-border bg-background"
                }`}
                aria-hidden="true"
              />

              <RevealOnScroll delay={index * 100}>
                <div className="pl-6">
                  <div className="mb-1 flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
                    <h3 className="text-lg font-medium text-foreground sm:text-xl">
                      {entry.swapHierarchy ? entry.organization : entry.title}
                    </h3>
                    <span className="font-mono text-xs tracking-wide text-accent sm:text-sm">
                      {entry.dates}
                    </span>
                  </div>
                  <p className="mb-2 font-mono text-sm text-muted">
                    {entry.swapHierarchy ? entry.title : entry.organization}
                  </p>
                  <p className="max-w-2xl text-sm leading-relaxed text-muted sm:text-base sm:leading-7">
                    {entry.description}
                  </p>
                </div>
              </RevealOnScroll>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
