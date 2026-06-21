import Link from "next/link";
import RevealOnScroll from "./RevealOnScroll";
import SectionHeading from "./SectionHeading";

type Project = {
  title: string;
  description: string;
  tags: string[];
  href?: string;
  github?: string;
};

const projects: Project[] = [
  {
    title: "Black-Scholes Options Calculator",
    description:
      "Interactive calculator that prices European call and put options using the Black-Scholes model, with live updates for delta, gamma, theta, and vega as inputs change.",
    tags: ["TypeScript", "Next.js", "Quantitative Finance"],
    href: "/projects/options-calculator",
    github: "https://github.com/elaineewu/options-calculator",
  },
  {
    title: "Moving Average Crossover Backtester",
    description:
      "Backtest a moving average crossover strategy on NVIDIA and SPY historical data, comparing strategy returns against buy-and-hold and visualizing portfolio growth over time.",
    tags: ["TypeScript", "Next.js", "Trading Strategy", "Backtesting"],
    href: "/projects/ma-backtester",
    github: "https://github.com/elaineewu/ma-backtester",
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
        <SectionHeading number="02" title="Projects" />
      </RevealOnScroll>
      <ul className="flex flex-col gap-2">
        {projects.map((project, index) => {
          const isExternal = project.href?.startsWith("http") ?? false;

          return (
            <li key={project.title}>
              <RevealOnScroll delay={index * 120}>
                <article className="group relative -mx-4 rounded-lg px-4 py-5 transition-all duration-200 hover:bg-surface sm:-mx-6 sm:px-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-2 text-lg font-medium text-foreground transition-colors group-hover:text-accent sm:text-xl">
                        {project.href && !isExternal ? (
                          <Link href={project.href}>{project.title}</Link>
                        ) : (
                          project.title
                        )}
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
                      <div className="mt-1 flex shrink-0 items-center gap-3 opacity-0 transition-all duration-200 group-hover:opacity-100">
                        {project.github && (
                          <a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`View ${project.title} on GitHub (opens in new tab)`}
                            className="text-muted transition-colors hover:text-accent"
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
                              className="text-muted transition-colors hover:text-accent"
                            >
                              <ExternalLinkIcon />
                            </a>
                          ) : (
                            <Link
                              href={project.href}
                              aria-label={`View ${project.title}`}
                              className="text-muted transition-colors hover:text-accent"
                            >
                              <InternalLinkIcon />
                            </Link>
                          ))}
                      </div>
                    )}
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
