import type { Metadata } from "next";
import Link from "next/link";
import MaBacktester from "@/components/MaBacktester";
import { getAllTickerDateRanges } from "@/lib/market-data";

export const metadata: Metadata = {
  title: "Moving Average Crossover Backtester | Elaine Wu",
  description:
    "Backtest a moving average crossover trading strategy against buy-and-hold using historical daily prices.",
};

export default function MaBacktesterPage() {
  const tickerRanges = getAllTickerDateRanges();

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
            Moving Average Crossover Backtester
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
            Simulate a golden-cross / death-cross strategy on historical daily
            prices and compare its performance to a buy-and-hold baseline.
          </p>
        </header>

        <MaBacktester tickerRanges={tickerRanges} />
      </div>
    </div>
  );
}
