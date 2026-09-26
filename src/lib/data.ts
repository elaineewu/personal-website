export const siteHero = {
  name: "Elaine Wu",
  tagline: "Quant finance, data analysis, and the code behind both.",
} as const;

export const aboutSection = {
  body: `Hi! I'm Elaine, an Operations Research and Financial Engineering student at Princeton with a focus on quantitative finance and data analysis. I'm drawn to problems where models and market data tell a clear story, and I bring that story to life through software engineering. Right now I'm a Software Engineering Intern at Varsity Software, where I work on end-to-end product development for client web apps. I'm interested in work at the intersection of markets and analytics: turning messy datasets into clear decisions, and using AI to move faster without sacrificing craft.`,
} as const;

export type ExperienceLink = {
  title: string;
  href: string;
};

export type ExperienceEntry = {
  id: string;
  title: string;
  organization: string;
  dates: string;
  description: string;
  swapHierarchy?: boolean;
  links?: ExperienceLink[];
};

export const experienceEntries: ExperienceEntry[] = [
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
    links: [
      {
        title: "Statistical Distance Metrics for Interrater Reliability",
        href: "/papers/distance-metrics.pdf",
      },
      {
        title: "Implementing Fairness Constraints in Spectral Clustering",
        href: "/papers/spectral-clustering-fairness.pdf",
      },
    ],
  },
];

export type ProjectIconKey =
  | "calculator"
  | "trendingUp"
  | "spade"
  | "chartLine"
  | "flask";

export type ProjectExtraLink = {
  label: string;
  href: string;
};

export type ProjectEntry = {
  title: string;
  description: string;
  tags: string[];
  icon: ProjectIconKey;
  projectPageUrl?: string;
  githubUrl?: string;
  extraLinks?: ProjectExtraLink[];
};

export const projectEntries: ProjectEntry[] = [
  {
    title: "Stress-Testing the Constants in 101 Formulaic Alphas",
    description:
      "The six-digit constants in 13 of WorldQuant's published alphas ranked no better than their integer neighbors (49th percentile) and beat random constants only at chance on S&P 500 data, and choosing windows by in-sample IC hurt out-of-sample IC. Only Alpha #75 held up.",
    tags: ["Python", "pandas", "Alpha Research", "Overfitting"],
    icon: "flask",
    projectPageUrl: "/projects/alpha101-constants",
    githubUrl: "https://github.com/elaineewu/personal-website/tree/main/research/alpha101",
  },
  {
    title: "Black-Scholes vs. Monte Carlo: Options Calculator",
    description:
      "Price European call and put options using the Black-Scholes model, and verify the result with a Monte Carlo simulation.",
    tags: ["TypeScript", "Next.js", "Quantitative Finance"],
    icon: "calculator",
    projectPageUrl: "/projects/options-calculator",
    githubUrl: "https://github.com/elaineewu/options-calculator",
  },
  {
    title: "Moving Average Crossover Backtester",
    description:
      "Buy-and-hold beat the 50/200-day MA crossover on both NVDA (+1,043% vs. +722%) and SPY (+77% vs. +56%) from 2021 to 2026, consistent with trend-following lagging strong bull runs.",
    tags: ["TypeScript", "Next.js", "Trading Strategy", "Backtesting"],
    icon: "trendingUp",
    projectPageUrl: "/projects/ma-backtester",
    githubUrl: "https://github.com/elaineewu/ma-backtester",
  },
  {
    title: "GTO Poker Range Calculator",
    description:
      "Visualize Nash equilibrium push/fold ranges at short stack depths and explore the expected value reasoning behind each shove-or-fold decision.",
    tags: ["Game Theory", "Probability", "TypeScript", "Monte Carlo Simulation"],
    icon: "spade",
    projectPageUrl: "/projects/gto-poker-calculator",
    githubUrl: "https://github.com/elaineewu/gto-poker-calculator",
  },
  {
    title: "Blackjack Card Counting & Kelly Sizing Simulator",
    description:
      "Kelly sizing grew a $10,000 bankroll to a median of 75x over one million simulated hands (up to 174x, with a 28% bust rate across 50 seeds), while flat betting busted in all 50 runs. At true count +4, player edge reaches +1.97% per unit wagered.",
    tags: ["TypeScript", "Next.js", "Kelly Criterion", "Risk Management"],
    icon: "chartLine",
    projectPageUrl: "/projects/blackjack-counter",
    githubUrl: "https://github.com/elaineewu/blackjack-card-counter",
    extraLinks: [
      {
        label: "Engineering Notes",
        href: "/papers/blackjack-engineering-notes.pdf",
      },
    ],
  },
];

export type ResearchEntry = {
  title: string;
  status: string;
  description: string;
  pdfUrl: string;
};

export const researchEntries: ResearchEntry[] = [
  {
    title: "Statistical Distance Metrics for Interrater Reliability",
    status: "Working Paper",
    description:
      "Evaluated Euclidean, Canberra, and Manhattan distance metrics in R to measure inter-rater reliability between coders of qualitative classroom observation data at Honors Summer Math Camp at Mathworks.",
    pdfUrl: "/papers/distance-metrics.pdf",
  },
  {
    title: "Implementing Fairness Constraints in Spectral Clustering",
    status: "Working Paper",
    description:
      "Incorporated a fairness/balance constraint into the spectral clustering optimization problem and evaluated it on real-world social network datasets at Honors Summer Math Camp at Mathworks.",
    pdfUrl: "/papers/spectral-clustering-fairness.pdf",
  },
];

export const contactSection = {
  headline: "High EV decision:",
  ctaLabel: "Say Hello",
  email: "ew8414@princeton.edu",
  github: "https://github.com/elaineewu",
  linkedIn: "https://www.linkedin.com/in/elaineewu",
} as const;

export const apiEndpointCatalog = [
  {
    path: "/api/about",
    description: "About section biography and interests.",
  },
  {
    path: "/api/experience",
    description: "Work, education, and research roles with dates and links.",
  },
  {
    path: "/api/projects",
    description: "Portfolio projects with tags, URLs, and extra links.",
  },
  {
    path: "/api/research",
    description: "Research papers with status and PDF links.",
  },
  {
    path: "/api/contact",
    description: "Email, GitHub, and LinkedIn.",
  },
] as const;
