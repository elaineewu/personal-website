"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { calculatePushEv, type EvBreakdown } from "@/lib/poker/ev";
import {
  handKeyFromIndices,
  handLabelFromIndices,
  RANKS,
  type Position,
} from "@/lib/poker/hands";
import {
  getPushFoldAction,
  snapStackDepth,
  STACK_DEPTHS,
} from "@/lib/poker/push-fold-ranges";

const MIN_STACK = 5;
const MAX_STACK = 25;

const POSITION_OPTIONS: { value: Position; label: string }[] = [
  { value: "sb-vs-bb", label: "Small Blind (facing Big Blind)" },
  { value: "btn-vs-blinds", label: "Button (facing Blinds)" },
];

function formatPercent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

function formatBb(value: number, digits = 2): string {
  return `${value.toFixed(digits)} bb`;
}

type CalculatedSnapshot = {
  row: number;
  col: number;
  stackBb: number;
  position: Position;
  evBreakdown: EvBreakdown;
};

export default function GtoPokerCalculator() {
  const [stackBb, setStackBb] = useState(10);
  const [position, setPosition] = useState<Position>("sb-vs-bb");
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [calculatedSnapshot, setCalculatedSnapshot] = useState<CalculatedSnapshot | null>(null);
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const detailPanelRef = useRef<HTMLDivElement>(null);
  const pendingScrollRef = useRef(false);

  const handleCellClick = useCallback((row: number, col: number) => {
    setSelectedCell({ row, col });
  }, []);

  const inRange = stackBb >= MIN_STACK && stackBb <= MAX_STACK;
  const snappedDepth = snapStackDepth(stackBb);

  const handleCalculate = useCallback(() => {
    if (!selectedCell || !inRange) return;

    const handKey = handKeyFromIndices(selectedCell.row, selectedCell.col);
    const evBreakdown = calculatePushEv(handKey, stackBb, position);

    setCalculatedSnapshot({
      row: selectedCell.row,
      col: selectedCell.col,
      stackBb,
      position,
      evBreakdown,
    });
    pendingScrollRef.current = true;
  }, [selectedCell, stackBb, position, inRange]);

  useEffect(() => {
    if (!pendingScrollRef.current || !detailPanelRef.current) {
      return;
    }

    pendingScrollRef.current = false;

    const panel = detailPanelRef.current;
    const frame = requestAnimationFrame(() => {
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return () => cancelAnimationFrame(frame);
  }, [calculatedSnapshot]);

  return (
    <div className="flex flex-col gap-12">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] xl:gap-10">
        <form
          className="rounded-xl border border-border bg-surface p-6 sm:p-8"
          onSubmit={(event) => event.preventDefault()}
        >
          <h2 className="mb-6 font-mono text-sm uppercase tracking-widest text-accent">
            Inputs
          </h2>

          <div className="flex flex-col gap-6">
            <div>
              <label htmlFor="stackSize" className="mb-1.5 block text-sm text-foreground">
                Stack size
                <span className="ml-2 font-mono text-xs text-accent">bb</span>
              </label>
              <div className="flex items-center gap-4">
                <input
                  id="stackSize"
                  type="range"
                  min={MIN_STACK}
                  max={MAX_STACK}
                  step={1}
                  value={stackBb}
                  onChange={(event) => setStackBb(Number(event.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-background accent-accent"
                />
                <input
                  type="number"
                  min={MIN_STACK}
                  max={MAX_STACK}
                  step={1}
                  value={stackBb}
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    if (Number.isFinite(next)) setStackBb(next);
                  }}
                  className="w-16 rounded-lg border border-border bg-background px-2 py-1.5 text-center font-mono text-sm text-foreground outline-none focus:border-accent/50"
                  aria-label="Stack size in big blinds"
                />
              </div>
              <p className="mt-2 text-xs text-muted">
                Valid range: {MIN_STACK}–{MAX_STACK} bb (push/fold theory range)
              </p>
              {!inRange && (
                <p className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  Stack size is outside the supported {MIN_STACK}–{MAX_STACK} bb range. Adjust the
                  slider to view equilibrium ranges.
                </p>
              )}
              {inRange && snappedDepth !== stackBb && (
                <p className="mt-2 text-xs text-muted">
                  Using {snappedDepth} bb chart (nearest defined depth to {stackBb} bb).
                </p>
              )}
            </div>

            <div>
              <label htmlFor="position" className="mb-1.5 block text-sm text-foreground">
                Position
              </label>
              <select
                id="position"
                value={position}
                onChange={(event) => setPosition(event.target.value as Position)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
              >
                {POSITION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-lg border border-border bg-background/60 px-4 py-3">
              <p className="mb-2 text-xs uppercase tracking-wide text-muted">Legend</p>
              <div className="flex flex-wrap gap-4 text-xs">
                <span className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-sm bg-emerald-500/80" />
                  Push
                </span>
                <span className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-sm bg-red-500/70" />
                  Fold
                </span>
              </div>
            </div>
          </div>
        </form>

        <div className="min-w-0 rounded-xl border border-border bg-surface p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-mono text-sm uppercase tracking-widest text-accent">
                Push / Fold Range
              </h2>
              <p className="mt-1 text-xs text-muted">
                Select a hand, then calculate for EV details · {STACK_DEPTHS.join(", ")} bb
                depths
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="mx-auto w-full max-w-[min(100%,36rem)]">
              <div
                className="grid grid-cols-[repeat(13,minmax(0,1fr))] gap-px rounded-lg border border-border bg-border p-px"
                role="grid"
                aria-label="Push fold hand range grid"
              >
                {RANKS.map((_, row) =>
                  RANKS.map((__, col) => {
                    const key = handKeyFromIndices(row, col);
                    const action =
                      inRange ? getPushFoldAction(stackBb, position, row, col) : "fold";
                    const isSelected =
                      selectedCell?.row === row && selectedCell?.col === col;
                    const isPush = action === "push";

                    const cellClasses = isSelected
                      ? "bg-accent text-background font-medium hover:bg-teal-300 hover:text-background"
                      : isPush
                        ? "bg-emerald-600/75 text-emerald-50 hover:bg-emerald-500/85"
                        : "bg-red-950/80 text-red-100/80 hover:bg-red-900/80";

                    return (
                      <button
                        key={`${row}-${col}`}
                        type="button"
                        role="gridcell"
                        aria-label={`${key} ${action}`}
                        aria-pressed={isSelected}
                        disabled={!inRange}
                        onClick={() => handleCellClick(row, col)}
                        className={[
                          "aspect-square min-h-[1.35rem] min-w-0 px-0.5 py-1 text-[0.55rem] font-mono leading-none transition-colors sm:min-h-[1.75rem] sm:text-[0.62rem] md:text-[0.68rem]",
                          cellClasses,
                          !inRange ? "cursor-not-allowed opacity-40" : "cursor-pointer",
                        ].join(" ")}
                      >
                        {key}
                      </button>
                    );
                  }),
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted">
              {selectedCell
                ? `Selected: ${handLabelFromIndices(selectedCell.row, selectedCell.col)}`
                : "Click a hand in the grid to select it"}
            </p>
            <button
              type="button"
              onClick={handleCalculate}
              disabled={!selectedCell || !inRange}
              className="shrink-0 rounded-lg border border-accent/30 bg-accent/10 px-5 py-2.5 font-mono text-sm uppercase tracking-widest text-accent transition-colors hover:border-accent/50 hover:bg-accent/20 disabled:cursor-not-allowed disabled:border-border disabled:bg-background/60 disabled:text-muted disabled:hover:border-border disabled:hover:bg-background/60"
            >
              Calculate
            </button>
          </div>
        </div>
      </div>

      {calculatedSnapshot && inRange && (
        <div
          ref={detailPanelRef}
          className="scroll-mt-8 rounded-xl border border-border bg-surface p-6 sm:p-8"
        >
          <h2 className="mb-2 font-mono text-sm uppercase tracking-widest text-accent">
            Hand Analysis
          </h2>
          <p className="mb-6 text-xs text-muted">
            Monte Carlo equity uses{" "}
            {calculatedSnapshot.evBreakdown.trials.toLocaleString()} trials vs a simplified top
            ~15% calling range.
          </p>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Selected hand"
              value={handLabelFromIndices(calculatedSnapshot.row, calculatedSnapshot.col)}
              sub={`Chart: ${calculatedSnapshot.evBreakdown.tableAction.toUpperCase()}`}
            />
            <MetricCard
              label="Equity if called"
              value={formatPercent(calculatedSnapshot.evBreakdown.equity)}
              sub="Vs approx. top 15% range"
            />
            <MetricCard
              label="Pot odds required"
              value={formatPercent(calculatedSnapshot.evBreakdown.potOddsRequiredEquity)}
              sub={calculatedSnapshot.evBreakdown.potOddsDescription}
            />
            <MetricCard
              label="Estimated EV"
              value={formatBb(calculatedSnapshot.evBreakdown.evTotalBb)}
              sub="Push EV in big blinds"
              accent
            />
          </div>

          <div className="mb-8 space-y-3 rounded-lg border border-border bg-background/50 px-4 py-4 text-sm text-muted">
            <p>{calculatedSnapshot.evBreakdown.shoveDescription}</p>
            <p>{calculatedSnapshot.evBreakdown.potOddsDescription}</p>
          </div>

          <div className="mb-8">
            <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-muted">
              EV Calculation
            </h3>
            <div className="space-y-3 font-mono text-sm">
              <FormulaRow
                label="P(fold)"
                value={formatPercent(calculatedSnapshot.evBreakdown.foldProbability, 2)}
              />
              <FormulaRow
                label="Amount won if folded"
                value={formatBb(calculatedSnapshot.evBreakdown.amountWonIfFoldedBb)}
              />
              <FormulaRow
                label="Fold term: P(fold) × won if folded"
                value={formatBb(calculatedSnapshot.evBreakdown.evFoldTermBb)}
              />
              <FormulaRow
                label="P(call)"
                value={formatPercent(calculatedSnapshot.evBreakdown.callProbability, 2)}
              />
              <FormulaRow
                label="Equity if called"
                value={formatPercent(calculatedSnapshot.evBreakdown.equity, 2)}
              />
              <FormulaRow
                label="Total pot if called"
                value={formatBb(calculatedSnapshot.evBreakdown.totalPotIfCalledBb)}
              />
              <FormulaRow
                label="Amount risked"
                value={formatBb(calculatedSnapshot.evBreakdown.amountRiskedBb)}
              />
              <FormulaRow
                label="Call term: P(call) × (equity × pot − risked)"
                value={formatBb(calculatedSnapshot.evBreakdown.evCallTermBb)}
              />
              <div className="border-t border-border pt-3">
                <FormulaRow
                  label="EV = fold term + call term"
                  value={formatBb(calculatedSnapshot.evBreakdown.evTotalBb)}
                  highlight
                />
              </div>
            </div>
          </div>

          <p className="rounded-lg border border-accent/20 bg-background/60 px-4 py-3 text-sm leading-relaxed text-foreground">
            {calculatedSnapshot.evBreakdown.verdict}
          </p>
        </div>
      )}

      <section className="max-w-3xl">
        <button
          type="button"
          onClick={() => setMethodologyOpen((open) => !open)}
          className="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-5 py-4 text-left transition-colors hover:border-accent/30"
          aria-expanded={methodologyOpen}
        >
          <span className="font-mono text-sm uppercase tracking-widest text-accent">
            How this works
          </span>
          <ChevronDown
            className={`h-5 w-5 text-muted transition-transform ${methodologyOpen ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>

        {methodologyOpen && (
          <div className="mt-4 space-y-4 rounded-xl border border-border bg-surface/50 px-5 py-5 text-sm leading-relaxed text-muted">
            <p>
              <strong className="text-foreground">Push/fold strategy</strong> applies when your
              stack is short enough that raising, calling, and post-flop maneuvering largely
              disappear. With only 5–25 big blinds, the dominant decision is often to move all-in
              or fold preflop. At deeper stacks, implied odds, position, and post-flop skill dominate,
              so push/fold charts no longer describe optimal play.
            </p>
            <p>
              <strong className="text-foreground">Nash equilibrium</strong> here means a pair of
              strategies (your push range and your opponent&apos;s call/fold response) where neither
              player can improve their expected value by unilaterally changing strategy. The grid
              shows a binary approximation of those equilibrium push ranges at each stack depth.
            </p>
            <p>
              <strong className="text-foreground">Expected value (EV)</strong> for a shove is
              computed as:
            </p>
            <p className="rounded-lg border border-border bg-background/60 px-4 py-3 font-mono text-xs leading-relaxed text-foreground">
              EV = P(fold) × (amount won if folded) + P(call) × (equity × total pot at showdown −
              amount risked)
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-foreground">P(fold)</strong> — estimated probability the
                opponent(s) fold to your shove.
              </li>
              <li>
                <strong className="text-foreground">Amount won if folded</strong> — dead money you
                collect (blinds) without a showdown.
              </li>
              <li>
                <strong className="text-foreground">P(call)</strong> — 1 − P(fold).
              </li>
              <li>
                <strong className="text-foreground">Equity</strong> — your share of the pot if the
                hand goes to showdown, estimated by Monte Carlo simulation.
              </li>
              <li>
                <strong className="text-foreground">Pot odds</strong> — the equity you need to
                break even when called: amount risked ÷ total pot if called.
              </li>
            </ul>
            <p>
              Equity in the detail panel is estimated by simulating at least 5,000 random runouts
              of your selected hand against a randomly sampled hand from a simplified top ~15%
              calling range (pairs 88+, broadway combinations, and strong suited aces). This is a
              practical stand-in, not a full equilibrium calling range.
            </p>
            <div className="rounded-lg border border-border bg-background/60 px-4 py-4 text-xs leading-relaxed">
              <p className="mb-2 font-medium text-foreground">Disclaimer</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  This tool uses a binary push/fold classification rather than precise
                  mixed-strategy frequencies for borderline hands.
                </li>
                <li>
                  The opponent calling range in the EV panel is approximated (~top 15% of hands),
                  not derived from a true equilibrium solve.
                </li>
                <li>
                  Only two-player heads-up spots are modeled (SB vs BB, or BTN vs blinds simplified
                  to a single caller). Multi-way pots are out of scope.
                </li>
                <li>
                  Tournament Independent Chip Model (ICM) considerations are not included — all EV
                  is in chip EV (cEV).
                </li>
                <li>
                  Real Nash equilibrium values from solvers or published charts may differ slightly
                  from this implementation&apos;s approximated lookup table.
                </li>
              </ul>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-background/60 px-4 py-3">
      <p className="mb-1 text-xs uppercase tracking-wide text-muted">{label}</p>
      <p
        className={`font-mono text-xl tabular-nums ${accent ? "text-accent" : "text-foreground"}`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted">{sub}</p>
    </div>
  );
}

function FormulaRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <span className={highlight ? "text-foreground" : "text-muted"}>{label}</span>
      <span className={`tabular-nums ${highlight ? "text-accent" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}
