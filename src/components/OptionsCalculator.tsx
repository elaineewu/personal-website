"use client";

import { useDeferredValue, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { blackScholes, type BlackScholesInputs, type OptionType } from "@/lib/black-scholes";
import {
  MAX_MONTE_CARLO_SIMULATIONS,
  MIN_MONTE_CARLO_SIMULATIONS,
  monteCarloFromPrices,
  simulateFinalPrices,
  simulationCountFromSlider,
  sliderPositionFromSimulationCount,
} from "@/lib/monte-carlo-options";

type NumericField =
  | "stockPrice"
  | "strikePrice"
  | "timeToExpiry"
  | "riskFreeRate"
  | "volatility";

const defaults = {
  stockPrice: "100",
  strikePrice: "100",
  timeToExpiry: "1",
  riskFreeRate: "5",
  volatility: "20",
  optionType: "call" as OptionType,
};

function parsePositive(value: string): number {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

function formatGreek(value: number, decimals = 4): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatPercentDifference(mcPrice: number, bsPrice: number): string {
  if (bsPrice === 0) {
    return mcPrice === 0 ? "0.00%" : "—";
  }
  const diff = ((mcPrice - bsPrice) / bsPrice) * 100;
  const sign = diff >= 0 ? "+" : "";
  return `${sign}${diff.toFixed(2)}%`;
}

function formatSimulationCount(count: number): string {
  return count.toLocaleString("en-US");
}

type HistogramTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: { binStart: number; binEnd: number; count: number } }>;
};

function HistogramTooltip({ active, payload }: HistogramTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const { binStart, binEnd, count } = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 font-mono text-xs text-foreground shadow-lg">
      <p className="text-muted">
        {formatCurrency(binStart)} – {formatCurrency(binEnd)}
      </p>
      <p className="mt-1 text-accent">{count.toLocaleString("en-US")} paths</p>
    </div>
  );
}

function FieldLabel({
  htmlFor,
  label,
  symbol,
}: {
  htmlFor: string;
  label: string;
  symbol: string;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-1.5 flex items-baseline gap-2 text-sm text-foreground">
        {label}
        <span className="font-mono text-xs text-accent">{symbol}</span>
      </span>
    </label>
  );
}

function NumberInput({
  id,
  value,
  onChange,
  step,
  min,
  suffix,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  step?: string;
  min?: string;
  suffix?: string;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        step={step}
        min={min}
        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 font-mono text-sm text-foreground outline-none transition-colors focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
      />
      {suffix && (
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs text-muted">
          {suffix}
        </span>
      )}
    </div>
  );
}

type CalculationTab = "black-scholes" | "monte-carlo";

const tabLabels: Record<CalculationTab, string> = {
  "black-scholes": "Black-Scholes",
  "monte-carlo": "Monte Carlo",
};

function GreekRow({
  name,
  symbol,
  value,
  description,
}: {
  name: string;
  symbol: string;
  value: string;
  description: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-4 last:border-b-0">
      <div>
        <p className="text-sm font-medium text-foreground">
          {name}{" "}
          <span className="font-mono text-accent">{symbol}</span>
        </p>
        <p className="mt-0.5 text-xs text-muted">{description}</p>
      </div>
      <p className="shrink-0 font-mono text-sm tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}

export default function OptionsCalculator() {
  const [stockPrice, setStockPrice] = useState(defaults.stockPrice);
  const [strikePrice, setStrikePrice] = useState(defaults.strikePrice);
  const [timeToExpiry, setTimeToExpiry] = useState(defaults.timeToExpiry);
  const [riskFreeRate, setRiskFreeRate] = useState(defaults.riskFreeRate);
  const [volatility, setVolatility] = useState(defaults.volatility);
  const [optionType, setOptionType] = useState<OptionType>(defaults.optionType);
  const [simulationCount, setSimulationCount] = useState(10_000);
  const [activeTab, setActiveTab] = useState<CalculationTab>("black-scholes");
  const deferredSimulationCount = useDeferredValue(simulationCount);

  const setters: Record<NumericField, (value: string) => void> = {
    stockPrice: setStockPrice,
    strikePrice: setStrikePrice,
    timeToExpiry: setTimeToExpiry,
    riskFreeRate: setRiskFreeRate,
    volatility: setVolatility,
  };

  const values: Record<NumericField, string> = {
    stockPrice,
    strikePrice,
    timeToExpiry,
    riskFreeRate,
    volatility,
  };

  const inputs: BlackScholesInputs = useMemo(
    () => ({
      S: parsePositive(stockPrice),
      K: parsePositive(strikePrice),
      T: parsePositive(timeToExpiry),
      r: parsePositive(riskFreeRate) / 100,
      sigma: parsePositive(volatility) / 100,
      type: optionType,
    }),
    [stockPrice, strikePrice, timeToExpiry, riskFreeRate, volatility, optionType],
  );

  const result = useMemo(() => blackScholes(inputs), [inputs]);

  const allFinalPrices = useMemo(
    () => simulateFinalPrices(inputs, MAX_MONTE_CARLO_SIMULATIONS),
    [inputs],
  );

  const activeFinalPrices = useMemo(
    () => allFinalPrices.slice(0, deferredSimulationCount),
    [allFinalPrices, deferredSimulationCount],
  );

  const monteCarloResult = useMemo(
    () => monteCarloFromPrices(inputs, activeFinalPrices),
    [inputs, activeFinalPrices],
  );

  const percentDifference = formatPercentDifference(
    monteCarloResult.price,
    result.price,
  );

  return (
    <div className="flex flex-col gap-8">
      <form
        className="rounded-xl border border-border bg-surface p-6 sm:p-8"
        onSubmit={(event) => event.preventDefault()}
      >
        <h2 className="mb-6 font-mono text-sm uppercase tracking-widest text-accent">
          Inputs
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <FieldLabel htmlFor="stockPrice" label="Stock price" symbol="S" />
            <NumberInput
              id="stockPrice"
              value={values.stockPrice}
              onChange={setters.stockPrice}
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <FieldLabel htmlFor="strikePrice" label="Strike price" symbol="K" />
            <NumberInput
              id="strikePrice"
              value={values.strikePrice}
              onChange={setters.strikePrice}
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <FieldLabel
              htmlFor="timeToExpiry"
              label="Time to expiry"
              symbol="T"
            />
            <NumberInput
              id="timeToExpiry"
              value={values.timeToExpiry}
              onChange={setters.timeToExpiry}
              step="0.01"
              min="0"
              suffix="years"
            />
          </div>

          <div>
            <FieldLabel
              htmlFor="riskFreeRate"
              label="Risk-free rate"
              symbol="r"
            />
            <NumberInput
              id="riskFreeRate"
              value={values.riskFreeRate}
              onChange={setters.riskFreeRate}
              step="0.01"
              min="0"
              suffix="%"
            />
          </div>

          <div>
            <FieldLabel htmlFor="volatility" label="Volatility" symbol="σ" />
            <NumberInput
              id="volatility"
              value={values.volatility}
              onChange={setters.volatility}
              step="0.01"
              min="0"
              suffix="%"
            />
          </div>

          <div>
            <FieldLabel htmlFor="optionType" label="Option type" symbol="" />
            <select
              id="optionType"
              value={optionType}
              onChange={(event) =>
                setOptionType(event.target.value as OptionType)
              }
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
            >
              <option value="call">Call</option>
              <option value="put">Put</option>
            </select>
          </div>
        </div>
      </form>

      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8">
        <div
          role="tablist"
          aria-label="Pricing method"
          className="flex gap-6 border-b border-border"
        >
          {(Object.keys(tabLabels) as CalculationTab[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                id={`tab-${tab}`}
                aria-selected={isActive}
                aria-controls={`panel-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`-mb-px border-b-2 px-1 pb-3 font-mono text-sm transition-colors duration-200 ${
                  isActive
                    ? "border-accent text-accent"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                {tabLabels[tab]}
              </button>
            );
          })}
        </div>

        <div
          key={activeTab}
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className="tab-panel-enter mt-6"
        >
          {activeTab === "black-scholes" ? (
            <>
              <p className="mb-4 text-xs text-muted">
                European {optionType} · analytical pricing · updates live
              </p>

              <div className="mb-6 rounded-lg border border-accent/20 bg-background/60 px-5 py-4">
                <p className="mb-1 text-xs uppercase tracking-wide text-muted">
                  Theoretical price
                </p>
                <p className="font-mono text-3xl font-medium tabular-nums text-accent">
                  {formatCurrency(result.price)}
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-mono text-xs uppercase tracking-widest text-muted">
                  Greeks
                </h3>
                <div className="grid gap-x-8 sm:grid-cols-2">
                  <GreekRow
                    name="Delta"
                    symbol="Δ"
                    value={formatGreek(result.delta)}
                    description="Price change per $1 move in the stock"
                  />
                  <GreekRow
                    name="Gamma"
                    symbol="Γ"
                    value={formatGreek(result.gamma, 6)}
                    description="Change in delta per $1 move in the stock"
                  />
                  <GreekRow
                    name="Theta"
                    symbol="Θ"
                    value={formatCurrency(result.theta)}
                    description="Estimated daily time decay"
                  />
                  <GreekRow
                    name="Vega"
                    symbol="ν"
                    value={formatCurrency(result.vega)}
                    description="Price change per 1% move in volatility"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="mb-4 text-xs text-muted">
                European {optionType} · simulated stock paths · updates live
              </p>

              <div className="mb-5 rounded-lg border border-accent/20 bg-background/60 px-5 py-4">
                <p className="mb-1 text-xs uppercase tracking-wide text-muted">
                  Monte Carlo price ({formatSimulationCount(deferredSimulationCount)}{" "}
                  simulations)
                </p>
                <p className="font-mono text-3xl font-medium tabular-nums text-accent">
                  {formatCurrency(monteCarloResult.price)}
                </p>
              </div>

              <div className="mb-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-background/60 px-5 py-3">
                  <p className="mb-1 text-xs uppercase tracking-wide text-muted">
                    Black-Scholes price
                  </p>
                  <p className="font-mono text-xl font-medium tabular-nums text-foreground">
                    {formatCurrency(result.price)}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background/60 px-5 py-3">
                  <p className="mb-1 text-xs uppercase tracking-wide text-muted">
                    Difference
                  </p>
                  <p className="font-mono text-xl font-medium tabular-nums text-foreground">
                    {percentDifference}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">MC vs. Black-Scholes</p>
                </div>
              </div>

              <div className="mb-5">
                <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                  <label htmlFor="simulationCount" className="block">
                    <span className="mb-1.5 block text-sm text-foreground">
                      Number of simulations
                    </span>
                    <span className="font-mono text-xs text-muted">
                      Log scale · {formatSimulationCount(simulationCount)} paths
                    </span>
                  </label>
                  <input
                    id="simulationCount"
                    type="number"
                    inputMode="numeric"
                    min={MIN_MONTE_CARLO_SIMULATIONS}
                    max={MAX_MONTE_CARLO_SIMULATIONS}
                    value={simulationCount}
                    onChange={(event) => {
                      const parsed = parseInt(event.target.value, 10);
                      if (Number.isFinite(parsed)) {
                        setSimulationCount(
                          Math.min(
                            MAX_MONTE_CARLO_SIMULATIONS,
                            Math.max(MIN_MONTE_CARLO_SIMULATIONS, parsed),
                          ),
                        );
                      }
                    }}
                    className="w-32 rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground outline-none transition-colors focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.001}
                  value={sliderPositionFromSimulationCount(simulationCount)}
                  onChange={(event) =>
                    setSimulationCount(
                      simulationCountFromSlider(parseFloat(event.target.value)),
                    )
                  }
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-accent"
                  aria-label="Simulation count slider"
                />
                <div className="mt-2 flex justify-between font-mono text-[11px] text-muted">
                  <span>{formatSimulationCount(MIN_MONTE_CARLO_SIMULATIONS)}</span>
                  <span>{formatSimulationCount(MAX_MONTE_CARLO_SIMULATIONS)}</span>
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-muted">
                  Distribution of simulated final stock prices (S<sub>T</sub>)
                </h3>
                <div className="h-48 w-full sm:h-56">
                  {monteCarloResult.histogram.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={monteCarloResult.histogram}
                        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid stroke="#2d3748" strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="label"
                          tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "monospace" }}
                          tickLine={false}
                          axisLine={{ stroke: "#2d3748" }}
                          minTickGap={24}
                        />
                        <YAxis
                          tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "monospace" }}
                          tickLine={false}
                          axisLine={{ stroke: "#2d3748" }}
                          width={40}
                          allowDecimals={false}
                        />
                        <Tooltip content={<HistogramTooltip />} />
                        <Bar
                          dataKey="count"
                          fill="#5eead4"
                          fillOpacity={0.75}
                          radius={[2, 2, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border bg-background/40 px-6 text-center text-sm text-muted">
                      Enter valid inputs to simulate stock price paths at expiry.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <section className="max-w-3xl space-y-4 text-sm leading-relaxed text-muted">
        <p>
          The Black-Scholes model estimates the fair value of a European option
          by assuming stock prices follow a random walk with constant volatility
          and interest rates. It is a foundational tool in quantitative finance,
          though real markets often deviate from its simplifying assumptions.
        </p>
        <p>
          The Greeks measure how sensitive an option&apos;s price is to changes
          in the underlying inputs: delta tracks stock price moves, gamma captures
          how quickly delta itself changes, theta reflects time decay, and vega
          shows sensitivity to shifts in implied volatility.
        </p>
        <p>
          Monte Carlo simulation offers an independent check on the analytical
          formula. Each path draws a random shock from a standard normal
          distribution (via the Box-Muller transform) and evolves the stock under
          geometric Brownian motion to a final price S<sub>T</sub>. The option
          payoff on each path is averaged and discounted back to today. By the law
          of large numbers, this sample mean converges to the true expected payoff
          as the number of simulations grows — which is exactly the quantity
          Black-Scholes computes in closed form. Watching the Monte Carlo estimate
          tighten toward the analytical price as you increase the simulation count
          is a practical confirmation that both methods are pricing the same
          contract under the same assumptions.
        </p>
        <p className="rounded-lg border border-border bg-surface/50 px-4 py-3 font-mono text-xs leading-relaxed">
          Disclaimer: This calculator is for educational purposes only. Actual
          options pricing depends on dividends, early exercise (American
          options), bid-ask spreads, liquidity, and other factors not captured
          here.
        </p>
      </section>
    </div>
  );
}
