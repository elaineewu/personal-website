"use client";

import {
  Calculator,
  ChartLine,
  FileText,
  FlaskConical,
  Spade,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import {
  projectEntries,
  type ProjectEntry,
  type ProjectIconKey,
} from "@/lib/data";
import { getProjectsPayload } from "@/lib/api-payloads";
import ApiJsonPanel from "./ApiJsonPanel";
import RevealOnScroll from "./RevealOnScroll";
import SectionHeading from "./SectionHeading";
import { useViewMode } from "./ViewModeProvider";

const projectIcons: Record<ProjectIconKey, LucideIcon> = {
  calculator: Calculator,
  trendingUp: TrendingUp,
  spade: Spade,
  chartLine: ChartLine,
  flask: FlaskConical,
};

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

function ProjectNotesLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Read ${label.toLowerCase()} (opens in new tab)`}
      className="relative z-10 inline-flex shrink-0 items-center gap-1 text-muted transition-colors hover:text-accent"
    >
      <FileText
        className="h-3.5 w-3.5"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <span className="font-mono text-xs">{label}</span>
    </a>
  );
}

function projectNotesHref(project: ProjectEntry) {
  return project.extraLinks?.find((link) => link.label === "Engineering Notes")
    ?.href;
}

export default function Projects() {
  const { isApiView } = useViewMode();

  return (
    <section id="projects" className="scroll-mt-24 lg:scroll-mt-0">
      <RevealOnScroll>
        <SectionHeading number="03" title="Projects" />
      </RevealOnScroll>
      {isApiView ? (
        <ApiJsonPanel endpoint="/api/projects" payload={getProjectsPayload()} />
      ) : (
      <ul className="flex flex-col gap-2">
        {projectEntries.map((project, index) => {
          const ProjectIcon = projectIcons[project.icon];
          const isExternal = project.projectPageUrl?.startsWith("http") ?? false;
          const hasInternalLink = Boolean(
            project.projectPageUrl && !isExternal,
          );
          const notesHref = projectNotesHref(project);
          const splitNotesLink = Boolean(notesHref && hasInternalLink);

          const titleLinkClassName =
            "inline-flex min-w-0 max-w-full items-center gap-2.5 text-lg font-medium text-foreground transition-colors group-hover:text-accent sm:text-xl";

          const projectIcon = (
            <ProjectIcon
              className="h-6 w-6 shrink-0 text-accent"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          );

          const descriptionAndTags = (
            <>
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
            </>
          );

          const cardContent = (
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {splitNotesLink ? (
                  <>
                    <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <Link
                        href={project.projectPageUrl!}
                        className={titleLinkClassName}
                      >
                        {projectIcon}
                        <span className="min-w-0">{project.title}</span>
                      </Link>
                      <ProjectNotesLink href={notesHref!} label="Engineering Notes" />
                    </div>
                    <Link
                      href={project.projectPageUrl!}
                      className="block"
                      aria-label={`View ${project.title}`}
                    >
                      {descriptionAndTags}
                    </Link>
                  </>
                ) : (
                  <>
                    <h3 className="mb-2 flex items-center gap-2.5 text-lg font-medium text-foreground transition-colors group-hover:text-accent sm:text-xl">
                      {projectIcon}
                      {project.title}
                    </h3>
                    {descriptionAndTags}
                  </>
                )}
              </div>
              {(project.projectPageUrl || project.githubUrl) && (
                <div className="mt-1 w-[4.5rem] shrink-0" aria-hidden="true" />
              )}
            </div>
          );

          return (
            <li key={project.title}>
              <RevealOnScroll delay={index * 120}>
                <article className="group relative -mx-4 rounded-lg transition-all duration-200 hover:bg-surface sm:-mx-6">
                  {hasInternalLink && !splitNotesLink ? (
                    <Link
                      href={project.projectPageUrl!}
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
                  {(project.projectPageUrl || project.githubUrl) && (
                    <div className="pointer-events-none absolute right-4 top-5 flex items-center gap-3 opacity-0 transition-all duration-200 group-hover:opacity-100 sm:right-6">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`View ${project.title} on GitHub (opens in new tab)`}
                          className="pointer-events-auto relative z-10 text-muted transition-colors hover:text-accent"
                        >
                          <GitHubIcon />
                        </a>
                      )}
                      {project.projectPageUrl &&
                        (isExternal ? (
                          <a
                            href={project.projectPageUrl}
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
      )}
    </section>
  );
}
