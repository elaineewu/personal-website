import { Calculator, ChartLine, Spade, TrendingUp, type LucideIcon } from "lucide-react";
import Link from "next/link";
import RevealOnScroll from "./RevealOnScroll";
import SectionHeading from "./SectionHeading";

type Project = {
  title: string;
  description: string;
  tags: string[];
  icon: LucideIcon;
  href?: string;
  github?: string;
};

const projects: Project[] = [
  {
    title: "Black-Scholes vs. Monte Carlo: Options Calculator",
    description:
      "Price European call and put options using the Black-Scholes model, and verify the result with a Monte Carlo simulation.",
    tags: ["TypeScript", "Next.js", "Quantitative Finance"],
    icon: Calculator,
    href: "/projects/options-calculator",
    github: "https://github.com/elaineewu/options-calculator",
  },
  {
    title: "Moving Average Crossover Backtester",
    description:
      "On 2021–2026 NVDA and SPY data, the moving average strategy underperformed buy-and-hold in both tests, a reminder that trend-following often lags during strong bull runs.",
    tags: ["TypeScript", "Next.js", "Trading Strategy", "Backtesting"],
    icon: TrendingUp,
    href: "/projects/ma-backtester",
    github: "https://github.com/elaineewu/ma-backtester",
  },
  {
    title: "GTO Poker Range Calculator",
    description:
      "Visualize Nash equilibrium push/fold ranges at short stack depths and explore the expected value reasoning behind each shove-or-fold decision.",
    tags: ["Game Theory", "Probability", "TypeScript", "Monte Carlo Simulation"],
    icon: Spade,
    href: "/projects/gto-poker-calculator",
    github: "https://github.com/elaineewu/gto-poker-calculator",
  },
  // TODO: add GitHub link once extracted to standalone repo
  {
    title: "Blackjack Card Counting & Kelly Sizing Simulator",
    description:
      "Simulate basic-strategy blackjack with Hi-Lo counting and true count tracking, comparing flat, spread, and Kelly bet sizing through precomputed Monte Carlo runs. Explore edge curves by true count and bankroll growth across betting strategies.",
    tags: ["TypeScript", "Next.js", "Kelly Criterion", "Risk Management"],
    icon: ChartLine,
    href: "/projects/blackjack-counter",
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

function InternalLinkIcon() {
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
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function GitHubIcon() {
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
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="scroll-mt-24 lg:scroll-mt-0">
      <RevealOnScroll>
        <SectionHeading number="03" title="Projects" />
      </RevealOnScroll>
      <ul className="flex flex-col gap-2">
        {projects.map((project, index) => {
          const isExternal = project.href?.startsWith("http") ?? false;

          const cardContent = (
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="mb-2 flex items-center gap-2.5 text-lg font-medium text-foreground transition-colors group-hover:text-accent sm:text-xl">
                  <project.icon
                    className="h-6 w-6 shrink-0 text-accent"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  {project.title}
                </h3>
                <p className="mb-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
                  {project.description}
                </p>
                <ul className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full border border-border bg-background/50 px-3 py-1 font-mono text-xs text-muted"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
              {(project.href || project.github) && (
                <div
                  className="mt-1 w-[4.5rem] shrink-0"
                  aria-hidden="true"
                />
              )}
            </div>
          );

          return (
            <li key={project.title}>
              <RevealOnScroll delay={index * 120}>
                <article className="group relative -mx-4 rounded-lg transition-all duration-200 hover:bg-surface sm:-mx-6">
                  {project.href && !isExternal ? (
                    <Link
                      href={project.href}
                      className="block rounded-lg px-4 py-5 sm:px-6"
                      aria-label={`View ${project.title}`}
                    >
                      {cardContent}
                    </Link>
                  ) : (
                    <div className="rounded-lg px-4 py-5 sm:px-6">
                      {cardContent}
                    </div>
                  )}
                  {(project.href || project.github) && (
                    <div className="pointer-events-none absolute right-4 top-5 flex items-center gap-3 opacity-0 transition-all duration-200 group-hover:opacity-100 sm:right-6">
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`View ${project.title} on GitHub (opens in new tab)`}
                          className="pointer-events-auto relative z-10 text-muted transition-colors hover:text-accent"
                        >
                          <GitHubIcon />
                        </a>
                      )}
                      {project.href &&
                        (isExternal ? (
                          <a
                            href={project.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`View ${project.title} (opens in new tab)`}
                            className="pointer-events-auto relative z-10 text-muted transition-colors hover:text-accent"
                          >
                            <ExternalLinkIcon />
                          </a>
                        ) : (
                          <span className="text-muted" aria-hidden="true">
                            <InternalLinkIcon />
                          </span>
                        ))}
                    </div>
                  )}
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
