import { BookOpen, type LucideIcon } from "lucide-react";
import RevealOnScroll from "./RevealOnScroll";
import SectionHeading from "./SectionHeading";

type ResearchPaper = {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
};

const papers: ResearchPaper[] = [
  {
    title:
      "Statistical Identification of a Distance Metric that Maximizes Interrater Reliability",
    description:
      "Evaluated Euclidean, Canberra, and Manhattan distance metrics in R to measure inter-rater reliability between coders of qualitative classroom observation data at Honors Summer Math Camp at Mathworks.",
    icon: BookOpen,
    href: "/papers/distance-metrics.pdf",
  },
  {
    title: "Implementing Fairness Constraints in Spectral Clustering",
    description:
      "Incorporated a fairness/balance constraint into the spectral clustering optimization problem and evaluated it on real-world social network datasets at Honors Summer Math Camp at Mathworks.",
    icon: BookOpen,
    href: "/papers/spectral-clustering-fairness.pdf",
  },
];

function ExternalLinkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0"
      aria-hidden="true"
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

export default function Research() {
  return (
    <section id="research" className="scroll-mt-24 lg:scroll-mt-0">
      <RevealOnScroll>
        <SectionHeading number="04" title="Research" />
      </RevealOnScroll>
      <ul className="flex flex-col gap-2">
        {papers.map((paper, index) => {
          const cardContent = (
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="mb-2 flex items-start gap-2.5 text-lg font-medium text-foreground transition-colors group-hover:text-accent sm:text-xl">
                  <paper.icon
                    className="h-6 w-6 shrink-0 text-accent"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <span className="min-w-0">{paper.title}</span>
                  <span className="rounded-full border border-border bg-background/50 px-2 py-0.5 font-mono text-[10px] font-normal text-muted sm:text-xs">
                    v1 / Preliminary
                  </span>
                </h3>
                <p className="mb-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
                  {paper.description}
                </p>
                <span className="font-mono text-xs tracking-wide text-accent transition-colors group-hover:text-foreground sm:text-sm">
                  Read Paper →
                </span>
              </div>
              <div className="mt-1 w-[4.5rem] shrink-0" aria-hidden="true" />
            </div>
          );

          return (
            <li key={paper.title}>
              <RevealOnScroll delay={index * 120}>
                <article className="group relative -mx-4 rounded-lg transition-all duration-200 hover:bg-surface sm:-mx-6">
                  <a
                    href={paper.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg px-4 py-5 sm:px-6"
                    aria-label={`Read ${paper.title} (opens in new tab)`}
                  >
                    {cardContent}
                  </a>
                  <div className="pointer-events-none absolute right-4 top-5 flex items-center gap-3 opacity-0 transition-all duration-200 group-hover:opacity-100 sm:right-6">
                    <span className="text-muted" aria-hidden="true">
                      <ExternalLinkIcon />
                    </span>
                  </div>
                  <div
                    className="pointer-events-none absolute inset-0 rounded-lg border border-transparent transition-colors duration-200 group-hover:border-accent/20"
                    aria-hidden="true"
                  />
                </article>
              </RevealOnScroll>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
