import type { Metadata } from "next";
import Link from "next/link";
import OptionsCalculator from "@/components/OptionsCalculator";

export const metadata: Metadata = {
  title: "Black-Scholes vs. Monte Carlo: Options Calculator | Elaine Wu",
  description:
    "Interactive Black-Scholes options pricing calculator with live Greeks.",
};

export default function OptionsCalculatorPage() {
  return (
    <div className="min-h-screen px-6 pb-24 pt-12 lg:px-12 lg:py-16 xl:px-24">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/#projects"
          className="mb-8 inline-flex items-center gap-2 font-mono text-sm text-muted transition-colors hover:text-accent"
        >
          <span aria-hidden="true">←</span>
          Back to projects
        </Link>

        <header className="mb-12">
          <p className="mb-3 font-mono text-sm text-accent">Quantitative Finance</p>
          <h1 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Black-Scholes vs. Monte Carlo: Options Calculator
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
            Price European call and put options and explore their Greeks in
            real time using the classic Black-Scholes model.
          </p>
        </header>

        <OptionsCalculator />
      </div>
    </div>
  );
}
