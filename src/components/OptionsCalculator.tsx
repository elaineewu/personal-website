"use client";

import { useMemo, useState } from "react";
import { blackScholes, type OptionType } from "@/lib/black-scholes";

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

  const result = useMemo(() => {
    return blackScholes({
      S: parsePositive(stockPrice),
      K: parsePositive(strikePrice),
      T: parsePositive(timeToExpiry),
      r: parsePositive(riskFreeRate) / 100,
      sigma: parsePositive(volatility) / 100,
      type: optionType,
    });
  }, [stockPrice, strikePrice, timeToExpiry, riskFreeRate, volatility, optionType]);

  return (
    <div className="flex flex-col gap-12">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <form
          className="rounded-xl border border-border bg-surface p-6 sm:p-8"
          onSubmit={(event) => event.preventDefault()}
        >
          <h2 className="mb-6 font-mono text-sm uppercase tracking-widest text-accent">
            Inputs
          </h2>
          <div className="flex flex-col gap-5">
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
          <h2 className="mb-2 font-mono text-sm uppercase tracking-widest text-accent">
            Results
          </h2>
          <p className="mb-6 text-xs text-muted">
            European {optionType} · updates live
          </p>

          <div className="mb-8 rounded-lg border border-accent/20 bg-background/60 px-5 py-4">
            <p className="mb-1 text-xs uppercase tracking-wide text-muted">
              Theoretical price
            </p>
            <p className="font-mono text-3xl font-medium tabular-nums text-accent">
              {formatCurrency(result.price)}
            </p>
          </div>

          <div>
            <h3 className="mb-1 font-mono text-xs uppercase tracking-widest text-muted">
              Greeks
            </h3>
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
