"use client";

import Link from "next/link";
import { Suspense } from "react";
import { Download } from "lucide-react";
import { siteHero, contactSection } from "@/lib/data";
import {
  resumeEducation,
  resumeExperience,
  resumePdfUrl,
  resumeProjects,
  resumeSkills,
} from "@/lib/resume";
import { getResumePayload } from "@/lib/api-payloads";
import ApiJsonPanel from "./ApiJsonPanel";
import RevealOnScroll from "./RevealOnScroll";
import SectionHeading from "./SectionHeading";
import ViewToggle from "./ViewToggle";
import { ViewModeProvider, useViewMode } from "./ViewModeProvider";

function EntryHeader({
  primary,
  secondary,
  dates,
  href,
}: {
  primary: string;
  secondary: string;
  dates: string;
  href?: string;
}) {
  return (
    <>
      <div className="mb-1 flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
        <h3 className="text-lg font-medium text-foreground">
          {href ? (
            <Link
              href={href}
              className="transition-colors hover:text-accent"
            >
              {primary}
              <span className="ml-1.5 text-sm text-accent" aria-hidden="true">
                ↗
              </span>
            </Link>
          ) : (
            primary
          )}
        </h3>
        {dates && (
          <span className="shrink-0 font-mono text-xs tracking-wide text-accent sm:text-sm">
            {dates}
          </span>
        )}
      </div>
      <p className="mb-3 font-mono text-sm text-muted">{secondary}</p>
    </>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-3 text-sm leading-relaxed text-muted sm:text-base sm:leading-7"
        >
          <span className="mt-[0.7em] h-1 w-1 shrink-0 rounded-full bg-accent/70 sm:mt-[0.8em]" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ResumeContent() {
  const { isApiView } = useViewMode();

  return (
    <div className="min-h-screen px-6 pb-24 pt-12 lg:px-12 lg:py-16 xl:px-24">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-sm text-muted transition-colors hover:text-accent"
          >
            <span aria-hidden="true">←</span>
            Back to home
          </Link>
          <ViewToggle />
        </div>

        <header className="mb-16 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 font-mono text-sm text-accent">Resume</p>
            <h1 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
              {siteHero.name}
            </h1>
            <p className="mt-3 text-base text-muted">
              Princeton University · Operations Research and Financial
              Engineering
            </p>
            <p className="mt-1 font-mono text-sm text-muted">
              <a
                href={`mailto:${contactSection.email}`}
                className="transition-colors hover:text-accent"
              >
                {contactSection.email}
              </a>
            </p>
          </div>
          <a
            href={resumePdfUrl}
            download
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-md border border-accent/60 px-4 py-2 font-mono text-sm text-accent transition-colors hover:bg-accent/10 sm:self-auto"
          >
            <Download className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            Download PDF
          </a>
        </header>

        {isApiView ? (
          <ApiJsonPanel endpoint="/api/resume" payload={getResumePayload()} />
        ) : (
          <div className="flex flex-col gap-20">
            <section aria-label="education">
              <RevealOnScroll>
                <SectionHeading number="01" title="Education" />
              </RevealOnScroll>
              <div className="flex flex-col gap-10">
                {resumeEducation.map((entry, index) => (
                  <RevealOnScroll key={entry.id} delay={index * 100}>
                    <EntryHeader
                      primary={entry.school}
                      secondary={entry.degree}
                      dates={entry.dates}
                    />
                    <dl className="flex flex-col gap-2">
                      {entry.details.map(({ label, value }) => (
                        <div
                          key={label}
                          className="text-sm leading-relaxed sm:text-base sm:leading-7"
                        >
                          <dt className="inline font-medium text-foreground">
                            {label}:{" "}
                          </dt>
                          <dd className="inline text-muted">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </RevealOnScroll>
                ))}
              </div>
            </section>

            <section aria-label="experience">
              <RevealOnScroll>
                <SectionHeading number="02" title="Experience" />
              </RevealOnScroll>
              <div className="flex flex-col gap-10">
                {resumeExperience.map((entry, index) => (
                  <RevealOnScroll key={entry.id} delay={index * 60}>
                    <EntryHeader
                      primary={entry.organization}
                      secondary={entry.role}
                      dates={entry.dates}
                    />
                    <BulletList items={entry.bullets} />
                  </RevealOnScroll>
                ))}
              </div>
            </section>

            <section aria-label="projects">
              <RevealOnScroll>
                <SectionHeading number="03" title="Projects" />
              </RevealOnScroll>
              <div className="flex flex-col gap-10">
                {resumeProjects.map((project, index) => (
                  <RevealOnScroll key={project.id} delay={index * 60}>
                    <EntryHeader
                      primary={project.name}
                      secondary={project.focus}
                      dates=""
                      href={project.projectPageUrl}
                    />
                    <BulletList items={project.bullets} />
                  </RevealOnScroll>
                ))}
              </div>
            </section>

            <section aria-label="skills">
              <RevealOnScroll>
                <SectionHeading number="04" title="Skills & Interests" />
              </RevealOnScroll>
              <dl className="flex flex-col gap-5">
                {resumeSkills.map(({ label, items }) => (
                  <div key={label}>
                    <dt className="mb-2 font-mono text-sm text-foreground">
                      {label}
                    </dt>
                    <dd className="flex flex-wrap gap-2">
                      {items.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-border bg-surface/60 px-3 py-1 font-mono text-xs text-muted"
                        >
                          {item}
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResumePage() {
  return (
    <Suspense fallback={null}>
      <ViewModeProvider>
        <ResumeContent />
      </ViewModeProvider>
    </Suspense>
  );
}
