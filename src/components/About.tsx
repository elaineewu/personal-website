import SectionHeading from "./SectionHeading";

export default function About() {
  return (
    <section id="about" className="scroll-mt-24 lg:scroll-mt-0">
      <SectionHeading number="01" title="About" />
      <div className="max-w-2xl space-y-4 text-base leading-relaxed text-muted sm:text-lg sm:leading-8">
        <p>
          I&apos;m an Operations Research &amp; Financial Engineering student at
          Princeton who builds software and analyzes data to solve real
          problems. Right now I&apos;m interning at Varsity Software, where I
          own end-to-end product development for client web apps—from discovery
          and UX design through iterative deployment.
        </p>
        <p>
          I&apos;m drawn to work at the intersection of engineering and
          analytics: turning messy datasets into clear decisions, and using AI to
          move faster without sacrificing craft. When I&apos;m not coding, you
          can find me on the tennis court or sketching.
        </p>
      </div>
    </section>
  );
}
