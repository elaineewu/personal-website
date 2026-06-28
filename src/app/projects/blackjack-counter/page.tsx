import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import BlackjackSimulator from "@/components/blackjack/BlackjackSimulator";
import EdgeCurveChart from "@/components/blackjack/EdgeCurveChart";

const TECHNICAL_NOTE_HREF = "/papers/blackjack-technical-note.pdf";
const TECHNICAL_NOTE_ARIA_LABEL =
  "Read the technical note on card counting, Kelly sizing, and the math behind them (opens in new tab)";

export const metadata: Metadata = {
  title: "Blackjack Card Counting & Kelly Sizing Simulator | Elaine Wu",
  description:
    "Monte Carlo simulation of basic strategy blackjack with Hi-Lo card counting, bet spreading, and edge analysis by true count.",
};

export default function BlackjackCounterPage() {
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
          <p className="mb-3 font-mono text-sm text-accent">Probability &amp; Simulation</p>
          <h1 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Blackjack Card Counting &amp; Kelly Sizing Simulator
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
            Monte Carlo simulation of basic-strategy blackjack with Hi-Lo counting and
            bet spreading, exploring how player edge shifts with the true count.
          </p>
        </header>

        <p className="mb-12">
          <a
            href={TECHNICAL_NOTE_HREF}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={TECHNICAL_NOTE_ARIA_LABEL}
            className="inline-flex items-center gap-2 font-mono text-sm text-accent transition-colors hover:text-foreground"
          >
            <FileText className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            Read the technical note
          </a>
        </p>

        <section className="mb-12 max-w-3xl space-y-4 text-sm leading-relaxed text-muted">
          <h2 className="font-mono text-xs uppercase tracking-widest text-accent">
            Methodology
          </h2>
          <p>
            This simulator uses Hi-Lo counting: low cards (2–6) are +1, neutral cards
            (7–9) are 0, and high cards (10 through Ace) are −1. True count is the
            running count divided by estimated decks remaining—the per-deck value
            bet-sizing rules key off of.
          </p>
          <p>
            Three betting strategies are compared.{" "}
            <strong className="font-medium text-foreground">Flat</strong> betting wagers a
            fixed $10 every hand as a control baseline.{" "}
            <strong className="font-medium text-foreground">Spread</strong> betting scales
            the wager with true count (minimum $10, multiplier capped at 8×, and further
            capped at a $500 table maximum).{" "}
            <strong className="font-medium text-foreground">Kelly</strong> sizing uses a
            simplified linear edge estimate (~0.5% per true count), sits out at
            non-positive counts, and applies the same $500 cap.
          </p>
          <p>
            All results on this page are{" "}
            <strong className="font-medium text-foreground">precomputed offline</strong> and
            loaded statically—the simulation does not run live in your browser. The
            edge-vs-true-count chart below uses{" "}
            <strong className="font-medium text-foreground">flat-strategy hands only</strong>
            , so the curve reflects the game&apos;s underlying edge at each count without
            spread or Kelly bet sizing mixed in.
          </p>
          <p>
            Confidence bands widen at extreme true counts because fewer hands occur there,
            so edge estimates are less precise exactly where advantage play matters most.
          </p>
          <p>
            Checkpoints at 100,000 and 1,000,000 hands represent long-run statistical
            convergence, not a realistic individual casino session.
          </p>
          <p className="rounded-lg border border-border bg-surface/50 px-4 py-3 text-xs leading-relaxed">
            This project is for educational and illustrative purposes only, not gambling
            advice. Real casino blackjack involves rule variations, heat, table limits,
            and other factors this simulation does not model.
          </p>
          <p>
            For the full reasoning behind counting, Kelly sizing, and the underlying
            math—with citations—see the{" "}
            <a
              href={TECHNICAL_NOTE_HREF}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={TECHNICAL_NOTE_ARIA_LABEL}
              className="text-accent transition-colors hover:text-foreground"
            >
              technical note
            </a>
            .
          </p>
        </section>

        <div className="mb-12 rounded-xl border border-border bg-surface p-6 sm:p-8">
          <EdgeCurveChart />
        </div>

        <section className="mb-12 max-w-3xl space-y-4 text-sm leading-relaxed text-muted">
          <h2 className="font-mono text-xs uppercase tracking-widest text-accent">
            Findings
          </h2>
          <p>
            Aggregated across all flat-betting hands in the simulation, the underlying
            game shows a small negative edge for the player at neutral and negative true
            counts, roughly −0.7% at true count 0, and worse in deeply negative
            territory. Edge turns meaningfully positive somewhere around true count +3 to
            +5, though the 95% confidence bands at +3 still span zero, and even at +4
            the interval is wide enough that a single session could easily look
            unprofitable. That noise is real: fewer hands occur at high counts, so the
            estimate is less precise exactly where advantage play matters most.
          </p>
          <p>
            Over short runs (1,000 or 10,000 hands), any of the three strategies can
            finish ahead or behind because variance dominates at that scale. At 100,000 and
            1,000,000 hands, a clearer pattern emerges: flat betting went bust in both
            long-run checkpoints despite only a modest negative realized edge, because
            a fixed wager keeps you exposed at unfavorable counts. Spread and Kelly
            sizing sit out or bet small when the count is bad and press when it is
            favorable, which translates into higher realized edge in dollar terms over
            the long run.
          </p>
          <p>
            That upside comes with substantially more variance. At one million hands,
            Kelly finished near $1.38M but experienced a $167,000 drawdown along the
            way; spread ended around $24,000 with a $30,000 drawdown. Aggressive sizing
            realizes more of the count-based edge, but the ride is far rougher than flat
            betting, and in shorter samples, Kelly can still finish well below starting
            bankroll. Card counting shifts the odds at favorable counts; it does not
            eliminate risk.
          </p>
        </section>

        <div className="mb-12 rounded-xl border border-border bg-surface p-6 sm:p-8">
          <h2 className="mb-6 font-mono text-sm uppercase tracking-widest text-accent">
            Simulation results
          </h2>
          <BlackjackSimulator />
        </div>

        <section className="max-w-3xl">
          <p className="rounded-lg border border-border bg-surface/50 px-4 py-3 text-xs leading-relaxed text-muted">
            Disclaimer: This tool is for educational purposes only and is not gambling
            advice. It uses simplified strategy rules, approximate bet-sizing formulas,
            and a fixed rule set (six decks, 75% penetration) that may not match any
            real casino. Precomputed results describe a mathematical model, not a
            guarantee of future outcomes. Past simulated performance does not predict
            real-world results.
          </p>
        </section>
      </div>
    </div>
  );
}
