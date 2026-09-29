import {
  aboutSection,
  apiEndpointCatalog,
  contactSection,
  experienceEntries,
  projectEntries,
  researchEntries,
  siteHero,
} from "./data";
import {
  resumeEducation,
  resumeExperience,
  resumePdfUrl,
  resumeProjects,
  resumeSkills,
} from "./resume";

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

function toCamelCase(label: string) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+(\w)/g, (_, c: string) => c.toUpperCase());
}

export function getResumePayload() {
  return {
    section: "Resume",
    name: siteHero.name,
    pdfUrl: resumePdfUrl,
    education: resumeEducation.map((entry) => ({
      school: entry.school,
      degree: entry.degree,
      dates: entry.dates,
      ...Object.fromEntries(
        entry.details.map(({ label, value }) => [
          toCamelCase(label),
          value,
        ]),
      ),
    })),
    experience: resumeExperience.map((entry) => ({
      organization: entry.organization,
      role: entry.role,
      dates: entry.dates,
      highlights: entry.bullets,
    })),
    projects: resumeProjects.map((project) => ({
      name: project.name,
      focus: project.focus,
      highlights: project.bullets,
      ...(project.projectPageUrl
        ? { projectPageUrl: project.projectPageUrl }
        : {}),
    })),
    skills: Object.fromEntries(
      resumeSkills.map(({ label, items }) => [
        toCamelCase(label),
        items,
      ]),
    ),
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
