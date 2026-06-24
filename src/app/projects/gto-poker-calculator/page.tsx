import type { Metadata } from "next";
import Link from "next/link";
import GtoPokerCalculator from "@/components/GtoPokerCalculator";

export const metadata: Metadata = {
  title: "GTO Poker Range Calculator | Elaine Wu",
  description:
    "Visualize Nash equilibrium push/fold ranges at short stack depths and explore the expected value reasoning behind each decision.",
};

export default function GtoPokerCalculatorPage() {
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
          <p className="mb-3 font-mono text-sm text-accent">Game Theory</p>
          <h1 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            GTO Poker Range Calculator
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
            Explore Nash equilibrium push/fold ranges for short-stack heads-up spots. Select a
            stack depth and position to see which hands shove or fold, then click any cell for a
            Monte Carlo EV breakdown.
          </p>
        </header>

        <GtoPokerCalculator />
      </div>
    </div>
  );
}
