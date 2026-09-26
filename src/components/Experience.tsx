"use client";

import { FileText } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { experienceEntries, type ExperienceLink } from "@/lib/data";
import { getExperiencePayload } from "@/lib/api-payloads";
import ApiJsonPanel from "./ApiJsonPanel";
import RevealOnScroll from "./RevealOnScroll";
import SectionHeading from "./SectionHeading";
import { useViewMode } from "./ViewModeProvider";

function ExperiencePaperMenu({ papers }: { papers: ExperienceLink[] }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative sm:ml-auto">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="View papers"
        className="inline-flex items-center gap-1 text-muted transition-colors hover:text-accent"
      >
        <FileText
          className="h-3.5 w-3.5"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <span className="font-mono text-xs">View Papers</span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-2 w-max max-w-[calc(100vw-3rem)] rounded-lg border border-border bg-surface py-1 shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
        >
          {papers.map((paper) => (
            <a
              key={paper.href}
              role="menuitem"
              href={paper.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="block whitespace-nowrap px-3 py-2.5 text-left text-xs leading-snug text-muted transition-colors hover:bg-accent/10 hover:text-accent sm:text-sm"
            >
              {paper.title}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Experience() {
  const { isApiView } = useViewMode();
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [fillHeight, setFillHeight] = useState(0);
  const [lineTop, setLineTop] = useState(0);
  const [lineHeight, setLineHeight] = useState(0);
  const [activeDots, setActiveDots] = useState<boolean[]>(
    () => experienceEntries.map(() => false),
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
    let resizeObserver: ResizeObserver | null = null;

    if (timeline && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(updateTimeline);
      resizeObserver.observe(timeline);
    }

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

      {isApiView ? (
        <ApiJsonPanel
          endpoint="/api/experience"
          payload={getExperiencePayload()}
        />
      ) : (
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
          {experienceEntries.map((entry, index) => (
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
                    {entry.links && (
                      <ExperiencePaperMenu papers={entry.links} />
                    )}
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
      )}
    </section>
  );
}
