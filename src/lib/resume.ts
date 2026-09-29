export const resumePdfUrl = "/Resume_Wu_Elaine.pdf";

export type ResumeEducationEntry = {
  id: string;
  school: string;
  degree: string;
  dates: string;
  details: { label: string; value: string }[];
};

export type ResumeExperienceEntry = {
  id: string;
  organization: string;
  role: string;
  dates: string;
  bullets: string[];
};

export type ResumeProjectEntry = {
  id: string;
  name: string;
  focus: string;
  projectPageUrl?: string;
  bullets: string[];
};

export type ResumeSkillGroup = {
  label: string;
  items: string[];
};

export const resumeEducation: ResumeEducationEntry[] = [
  {
    id: "princeton",
    school: "Princeton University",
    degree:
      "B.S.E. Operations Research and Financial Engineering (ORFE)",
    dates: "Expected May 2028",
    details: [
      {
        label: "Minors",
        value: "Statistics & Machine Learning, Finance",
      },
      {
        label: "Relevant Coursework",
        value:
          "Probability & Stochastic Processes, Optimization, Financial Risk Management, Data Intelligence, Data Structures & Algorithms, Energy & Commodities Markets, Mathematical Micro, Tokenized Finance",
      },
      {
        label: "Activities",
        value:
          "The Daily Princetonian (Web Design and Development), Service Focus (Public Interest Technology)",
      },
    ],
  },
  {
    id: "mountain-lakes",
    school: "Mountain Lakes High School",
    degree: "Unweighted GPA 4.0/4.0, Weighted GPA 4.879/4.0, SAT 1560",
    dates: "Sep 2020 – Jun 2024",
    details: [
      {
        label: "Awards",
        value:
          "2x AIME Qualifier (Top 2.5% with Distinction), National Merit Finalist, AP Scholar with Distinction",
      },
      {
        label: "Activities",
        value:
          "Student Body VP; Editor-in-Chief for the school newspaper; 2x Captain, 4x Varsity Tennis Team",
      },
    ],
  },
];

export const resumeExperience: ResumeExperienceEntry[] = [
  {
    id: "varsity",
    organization: "Varsity Software",
    role: "Software Engineering Intern",
    dates: "Jan – Sep 2026",
    bullets: [
      "Owned end-to-end product development of client web apps in JavaScript and Python, integrating Anthropic and OpenAI APIs into an internal tool to automate code and UI component generation",
      "Scaled BizScoreLine, an AI-powered business assessment tool, from 2,000 to 10,000+ users through performance optimizations validated via A/B testing; authored API documentation (OAuth2, schemas, and error handling)",
    ],
  },
  {
    id: "sig",
    organization: "Susquehanna International Group",
    role: "Discovery Program (Quant Trading Track)",
    dates: "Aug 2026",
    bullets: [
      "One of ~80 selected to apply statistics, game theory, and market-making concepts through trading simulations",
    ],
  },
  {
    id: "smile-train",
    organization: "Smile Train",
    role: "Data Analyst Intern",
    dates: "Jun – Aug 2025",
    bullets: [
      "Built Qlik Sense dashboards from complex program data, enabling 15% faster funding reallocation",
      "Queried large SQL datasets to identify donor drop-off patterns, informing regional engagement strategy",
      "Defined governance policies that ensured data continuity during a QlikView-to-Qlik Sense migration",
    ],
  },
  {
    id: "jane-street",
    organization: "Jane Street",
    role: "WiSE Program",
    dates: "Aug 2024",
    bullets: [
      "Selected among 70 nationwide to simulate market-making strategies, analyzing bid-ask spreads and order flow",
    ],
  },
  {
    id: "math-camp",
    organization: "Honors Summer Math Camp at Mathworks",
    role: "Researcher, Counselor",
    dates: "Jun – Aug, 2021–2024",
    bullets: [
      "Optimized 4 statistical distance metrics in R; best metric achieved 89% predictive accuracy",
      "Developed constrained spectral clustering (ML) algorithm in Python and MATLAB; reduced runtime by 22%",
      "Communicated complex technical concepts to non-technical audiences at annual symposiums",
    ],
  },
];

export const resumeProjects: ResumeProjectEntry[] = [
  {
    id: "alpha101",
    name: "Stress-Testing 101 Formulaic Alphas",
    focus: "Alpha Research, Overfitting Analysis, pandas",
    projectPageUrl: "/projects/alpha101-constants",
    bullets: [
      "Re-implemented 13 WorldQuant alphas on 505 S&P 500 stocks and stress-tested 52 data-mined constants; published values beat random draws only 49% out-of-sample, and only the simplest alpha held up (IC t-stat 3.2 IS, 1.8 OOS)",
    ],
  },
  {
    id: "blackjack",
    name: "Blackjack Card Counting Simulator",
    focus: "Kelly Criterion, Monte Carlo Simulation",
    projectPageUrl: "/projects/blackjack-counter",
    bullets: [
      "Simulated 1M+ hands of Kelly-sized card counting; grew a $10K bankroll to a median 75x vs. 100% bust rate for flat betting, +1.97% edge at true count +4",
    ],
  },
  {
    id: "gto-poker",
    name: "GTO Poker Range Calculator",
    focus: "Game Theory, Nash Equilibrium",
    projectPageUrl: "/projects/gto-poker-calculator",
    bullets: [
      "Built a GTO push/fold calculator visualizing Nash equilibrium ranges at short-stack depths and EV reasoning behind shove/fold decisions",
    ],
  },
];

export const resumeSkills: ResumeSkillGroup[] = [
  {
    label: "Programming Languages",
    items: ["Python", "R", "Java", "SQL"],
  },
  {
    label: "Visualization and Tools",
    items: ["Excel", "Qlik Sense", "Salesforce", "Figma"],
  },
  {
    label: "Interests",
    items: ["Poker", "Tennis", "Visual Art"],
  },
];
