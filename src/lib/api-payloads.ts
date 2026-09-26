import {
  aboutSection,
  apiEndpointCatalog,
  contactSection,
  experienceEntries,
  projectEntries,
  researchEntries,
  siteHero,
} from "./data";

export function getApiIndexPayload() {
  return {
    name: siteHero.name,
    tagline: siteHero.tagline,
    endpoints: apiEndpointCatalog.map(({ path, description }) => ({
      path,
      description,
    })),
  };
}

export function getAboutPayload() {
  return {
    section: "About",
    body: aboutSection.body,
  };
}

export function getExperiencePayload() {
  return {
    section: "Experience",
    roles: experienceEntries.map((entry) => ({
      title: entry.title,
      organization: entry.organization,
      dates: entry.dates,
      description: entry.description,
      ...(entry.links?.length ? { links: entry.links } : {}),
    })),
  };
}

export function getProjectsPayload() {
  return {
    section: "Projects",
    projects: projectEntries.map((project) => ({
      name: project.title,
      description: project.description,
      tags: project.tags,
      ...(project.projectPageUrl
        ? { projectPageUrl: project.projectPageUrl }
        : {}),
      ...(project.githubUrl ? { githubUrl: project.githubUrl } : {}),
      ...(project.extraLinks?.length
        ? { extraLinks: project.extraLinks }
        : {}),
    })),
  };
}

export function getResearchPayload() {
  return {
    section: "Research",
    papers: researchEntries.map((paper) => ({
      title: paper.title,
      status: paper.status,
      description: paper.description,
      pdfUrl: paper.pdfUrl,
    })),
  };
}

export function getContactPayload() {
  return {
    section: "Contact",
    email: contactSection.email,
    github: contactSection.github,
    linkedIn: contactSection.linkedIn,
  };
}

export function getApiNotFoundPayload(path: string) {
  return {
    error: "Not found",
    message: `No endpoint at ${path}. See GET /api for available routes.`,
    documentation: "/api",
  };
}

export function stringifyApiPayload(payload: unknown): string {
  return JSON.stringify(payload, null, 2);
}
