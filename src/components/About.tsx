import RevealOnScroll from "./RevealOnScroll";
import SectionHeading from "./SectionHeading";

export default function About() {
  return (
    <section id="about" className="scroll-mt-24 lg:scroll-mt-0">
      <RevealOnScroll>
        <SectionHeading number="01" title="About" />
        <div className="max-w-2xl text-base leading-relaxed text-muted sm:text-lg sm:leading-8">
          <p>
            Hi! I&apos;m Elaine, an Operations Research and Financial Engineering
            student at Princeton with a focus on quantitative finance and data
            analysis. I&apos;m drawn to problems where models and market data tell
            a clear story, and I bring that story to life through software
            engineering. Right now I&apos;m a Software Engineering Intern at
            Varsity Software, where I work on end-to-end product development for
            client web apps. I&apos;m interested in work at the intersection of
            markets and analytics: turning messy datasets into clear decisions,
            and using AI to move faster without sacrificing craft.
          </p>
        </div>
      </RevealOnScroll>
    </section>
  );
}
