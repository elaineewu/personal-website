"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { runBacktestAction, type BacktestActionSuccess } from "@/app/projects/ma-backtester/actions";
import {
  BACKTEST_TICKERS,
  type BacktestTicker,
  type TickerDateRange,
} from "@/lib/backtest-tickers";

type MaBacktesterProps = {
  tickerRanges: Record<BacktestTicker, TickerDateRange>;
};

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function FieldLabel({
  htmlFor,
  label,
  hint,
}: {
  htmlFor: string;
  label: string;
  hint?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-1.5 block text-sm text-foreground">{label}</span>
      {hint && <span className="mb-1.5 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

function TickerSelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: BacktestTicker;
  onChange: (value: BacktestTicker) => void;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value as BacktestTicker)}
      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 font-mono text-sm uppercase text-foreground outline-none transition-colors focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
    >
      {BACKTEST_TICKERS.map((symbol) => (
        <option key={symbol} value={symbol}>
          {symbol}
        </option>
      ))}
    </select>
  );
}

function NumberInput({
  id,
  value,
  onChange,
  min,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
}) {
  return (
    <input
      id={id}
      type="number"
      inputMode="numeric"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      min={min}
      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 font-mono text-sm text-foreground outline-none transition-colors focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
    />
  );
}

function DateInput({
  id,
  value,
  onChange,
  min,
  max,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  min: string;
  max: string;
}) {
  return (
    <input
      id={id}
      type="date"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      min={min}
      max={max}
      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 font-mono text-sm text-foreground outline-none transition-colors focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
    />
  );
}

function StatCard({
  label,
  value,
  subvalue,
  accent = false,
}: {
  label: string;
  value: string;
  subvalue?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-background/60 px-4 py-3">
      <p className="mb-1 text-xs uppercase tracking-wide text-muted">{label}</p>
      <p
        className={`font-mono text-lg font-medium tabular-nums ${accent ? "text-accent" : "text-foreground"}`}
      >
        {value}
      </p>
      {subvalue && (
        <p className="mt-0.5 font-mono text-xs tabular-nums text-muted">{subvalue}</p>
      )}
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="mb-2 font-mono text-muted">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="font-mono tabular-nums" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

export default function MaBacktester({ tickerRanges }: MaBacktesterProps) {
  const defaultTicker: BacktestTicker = "NVDA";
  const defaultRange = tickerRanges[defaultTicker];

  const [ticker, setTicker] = useState<BacktestTicker>(defaultTicker);
  const [shortWindow, setShortWindow] = useState("50");
  const [longWindow, setLongWindow] = useState("200");
  const [startDate, setStartDate] = useState(defaultRange.minDate);
  const [endDate, setEndDate] = useState(defaultRange.maxDate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BacktestActionSuccess | null>(null);

  const activeRange = tickerRanges[ticker];

  const chartData = useMemo(() => {
    if (!result) return [];
    return result.points.map((point) => ({
      ...point,
      label: point.date,
    }));
  }, [result]);

  function handleTickerChange(nextTicker: BacktestTicker) {
    const range = tickerRanges[nextTicker];
    setTicker(nextTicker);
    setStartDate(range.minDate);
    setEndDate(range.maxDate);
    setResult(null);
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await runBacktestAction({
        ticker,
        shortWindow: Number(shortWindow),
        longWindow: Number(longWindow),
        startDate,
        endDate,
      });

      if (!response.ok) {
        setResult(null);
        setError(response.error);
        return;
      }

      setResult(response.data);
    } catch {
      setResult(null);
      setError("Unable to run the backtest. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-12">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <form
          className="rounded-xl border border-border bg-surface p-6 sm:p-8"
          onSubmit={handleSubmit}
        >
          <h2 className="mb-6 font-mono text-sm uppercase tracking-widest text-accent">
            Inputs
          </h2>
          <div className="flex flex-col gap-5">
            <div>
              <FieldLabel htmlFor="ticker" label="Stock ticker" />
              <TickerSelect id="ticker" value={ticker} onChange={handleTickerChange} />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="shortWindow" label="Short MA window" hint="Days" />
                <NumberInput
                  id="shortWindow"
                  value={shortWindow}
                  onChange={setShortWindow}
                  min="2"
                />
              </div>
              <div>
                <FieldLabel htmlFor="longWindow" label="Long MA window" hint="Days" />
                <NumberInput
                  id="longWindow"
                  value={longWindow}
                  onChange={setLongWindow}
                  min="2"
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="startDate" label="Start date" />
                <DateInput
                  id="startDate"
                  value={startDate}
                  onChange={setStartDate}
                  min={activeRange.minDate}
                  max={activeRange.maxDate}
                />
              </div>
              <div>
                <FieldLabel htmlFor="endDate" label="End date" />
                <DateInput
                  id="endDate"
                  value={endDate}
                  onChange={setEndDate}
                  min={activeRange.minDate}
                  max={activeRange.maxDate}
                />
              </div>
            </div>
            <p className="text-xs text-muted">
              Historical data last updated 6/18/2026. This tool uses static CSV
              files, not live data.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 font-mono text-sm uppercase tracking-widest text-accent transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Running…" : "Run Backtest"}
            </button>
          </div>
        </form>

        <div className="rounded-xl border border-border bg-surface p-6 sm:p-8">
          <h2 className="mb-2 font-mono text-sm uppercase tracking-widest text-accent">
            Results
          </h2>
          <p className="mb-6 text-xs text-muted">
            {result
              ? `${result.startDate} → ${result.endDate} · $${result.initialCapital.toLocaleString()} starting capital`
              : "Run a backtest to see portfolio performance"}
          </p>

          {error && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          {result ? (
            <>
              <div className="mb-6 h-64 w-full sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#2d3748" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "monospace" }}
                      tickLine={false}
                      axisLine={{ stroke: "#2d3748" }}
                      minTickGap={40}
                    />
                    <YAxis
                      tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "monospace" }}
                      tickLine={false}
                      axisLine={{ stroke: "#2d3748" }}
                      tickFormatter={(value: number) =>
                        `$${(value / 1000).toFixed(0)}k`
                      }
                      width={52}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                      wrapperStyle={{ fontFamily: "monospace", fontSize: 12, color: "#94a3b8" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="strategyValue"
                      name="MA Crossover"
                      stroke="#5eead4"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: "#5eead4" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="buyAndHoldValue"
                      name="Buy & Hold"
                      stroke="#94a3b8"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: "#94a3b8" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <StatCard
                  label="Strategy final value"
                  value={formatCurrency(result.finalStrategyValue)}
                  subvalue={formatPercent(result.strategyReturnPct)}
                  accent
                />
                <StatCard
                  label="Buy & hold final value"
                  value={formatCurrency(result.finalBuyAndHoldValue)}
                  subvalue={formatPercent(result.buyAndHoldReturnPct)}
                />
                <StatCard
                  label="Total trades"
                  value={String(result.trades)}
                  subvalue="Buy and sell signals combined"
                />
              </div>
            </>
          ) : (
            !error && (
              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border bg-background/40 px-6 text-center text-sm text-muted">
                Configure your parameters and run a backtest to compare the moving average
                crossover strategy against a simple buy-and-hold baseline.
              </div>
            )
          )}

          <p className="mt-6 rounded-lg border border-border bg-surface/50 px-4 py-3 text-xs leading-relaxed text-muted">
            Backtested on NVDA and SPY (2021–2026): the 50/200-day moving average
            crossover underperformed buy-and-hold on both (NVDA: +722% vs. +1043%;
            SPY: +56% vs. +77%), consistent with how trend-following strategies often
            lag during sustained bull markets.
          </p>
        </div>
      </div>

      <section className="max-w-3xl space-y-4 text-sm leading-relaxed text-muted">
        <p>
          A moving average crossover strategy tracks two smoothed price trends: a
          short-term average and a long-term average. When the short average crosses
          above the long average (a &ldquo;golden cross&rdquo;), the strategy buys;
          when it crosses below (a &ldquo;death cross&rdquo;), it sells. The classic
          50/200-day pairing is widely watched, though no parameter set works in all
          market conditions.
        </p>
        <p>
          This backtest simulates going fully invested on each buy signal and fully
          to cash on each sell signal, starting with $10,000. It also plots what
          would have happened if you bought on the first day and never traded.
        </p>
        <p className="rounded-lg border border-border bg-surface/50 px-4 py-3 font-mono text-xs leading-relaxed">
          Disclaimer: This tool is for educational purposes only and is not investment
          advice. Results ignore transaction costs, slippage, taxes, dividends, and
          partial fills. Past performance does not guarantee future results.
        </p>
      </section>
    </div>
  );
}
