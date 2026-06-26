"use client";

import { AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";
import BankrollChart from "@/components/blackjack/BankrollChart";
import { formatHandCount, HAND_COUNT_OPTIONS, SIMULATION_RESULTS } from "@/lib/blackjack-sim/data";
import type { BettingStrategy, HandCountCheckpoint, SummaryStats } from "@/lib/blackjack-sim/types";

const STRATEGY_LABELS: Record<BettingStrategy, string> = {
  flat: "Flat",
  spread: "Spread",
  kelly: "Kelly",
};

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatEdge(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(2)}%`;
}

function StrategyStatCard({
  strategy,
  stats,
}: {
  strategy: BettingStrategy;
  stats: SummaryStats;
}) {
  const accent = strategy === "flat";

  return (
    <div className="rounded-lg border border-border bg-background/60 px-4 py-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="font-mono text-sm uppercase tracking-wide text-foreground">
          {STRATEGY_LABELS[strategy]}
        </p>
        {stats.wentBust && (
          <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-red-300">
            <AlertTriangle className="h-3 w-3" aria-hidden="true" />
            Went bust
          </span>
        )}
      </div>
      <dl className="space-y-2.5">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Final bankroll</dt>
          <dd
            className={`mt-0.5 font-mono text-lg font-medium tabular-nums ${accent ? "text-accent" : "text-foreground"}`}
          >
            {formatCurrency(stats.finalBankroll)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Max drawdown</dt>
          <dd className="mt-0.5 font-mono text-sm tabular-nums text-foreground">
            {formatCurrency(stats.maxDrawdown)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Edge realized</dt>
          <dd className="mt-0.5 font-mono text-sm tabular-nums text-foreground">
            {formatEdge(stats.edgeRealized)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Hands played</dt>
          <dd className="mt-0.5 font-mono text-sm tabular-nums text-foreground">
            {stats.handsActuallyPlayed.toLocaleString("en-US")}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export default function BlackjackSimulator() {
  const [handCount, setHandCount] = useState<HandCountCheckpoint>(1000);

  const checkpoint = SIMULATION_RESULTS[handCount];
  const { flat, spread, kelly } = useMemo(() => checkpoint.strategies, [checkpoint]);

  return (
    <div className="space-y-8">
      <div>
        <label htmlFor="hand-count" className="mb-1.5 block text-sm text-foreground">
          Simulated hands
        </label>
        <select
          id="hand-count"
          value={handCount}
          onChange={(event) =>
            setHandCount(Number(event.target.value) as HandCountCheckpoint)
          }
          className="w-full max-w-xs rounded-lg border border-border bg-background px-4 py-2.5 font-mono text-sm text-foreground outline-none transition-colors focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
        >
          {HAND_COUNT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {formatHandCount(option)}
            </option>
          ))}
        </select>
      </div>

      <BankrollChart flat={flat} spread={spread} kelly={kelly} />

      <div>
        <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-muted">
          Summary statistics
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <StrategyStatCard strategy="flat" stats={flat.summaryStats} />
          <StrategyStatCard strategy="spread" stats={spread.summaryStats} />
          <StrategyStatCard strategy="kelly" stats={kelly.summaryStats} />
        </div>
      </div>
    </div>
  );
}
