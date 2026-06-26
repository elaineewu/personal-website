"use client";

import { useMemo } from "react";
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
import { mergeBankrollSeries } from "@/lib/blackjack-sim/chart-data";
import type { WebStrategyResult } from "@/lib/blackjack-sim/types";

const CHART_HEIGHT = 288;
const GRID = "#2d3748";
const MUTED = "#94a3b8";

const STRATEGY_COLORS = {
  flat: "#5eead4",
  spread: "#94a3b8",
  kelly: "#fbbf24",
} as const;

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatHandIndex(value: number): string {
  return value.toLocaleString("en-US");
}

type BankrollTooltipProps = {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; color: string }>;
  label?: number;
};

function BankrollTooltip({ active, payload, label }: BankrollTooltipProps) {
  if (!active || !payload?.length || label === undefined) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="mb-2 font-mono text-muted">Hand {formatHandIndex(label)}</p>
      {payload.map((entry) => (
        <p
          key={entry.dataKey}
          className="font-mono tabular-nums"
          style={{ color: entry.color }}
        >
          {entry.dataKey === "flat" && "Flat: "}
          {entry.dataKey === "spread" && "Spread: "}
          {entry.dataKey === "kelly" && "Kelly: "}
          {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

type BankrollChartProps = {
  flat: WebStrategyResult;
  spread: WebStrategyResult;
  kelly: WebStrategyResult;
};

export default function BankrollChart({ flat, spread, kelly }: BankrollChartProps) {
  const chartData = useMemo(
    () =>
      mergeBankrollSeries(
        flat.bankrollSeries,
        spread.bankrollSeries,
        kelly.bankrollSeries,
      ),
    [flat, spread, kelly],
  );

  return (
    <div>
      <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-muted">
        Bankroll growth by strategy
      </h3>
      <div className="w-full" style={{ height: CHART_HEIGHT }}>
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 12, left: 0, bottom: 4 }}
          >
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="hand"
              tick={{ fill: MUTED, fontSize: 11, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={{ stroke: GRID }}
              minTickGap={32}
              tickFormatter={formatHandIndex}
            />
            <YAxis
              tick={{ fill: MUTED, fontSize: 11, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={{ stroke: GRID }}
              width={56}
              tickFormatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<BankrollTooltip />} />
            <Legend
              wrapperStyle={{ fontFamily: "monospace", fontSize: 12, color: MUTED }}
            />
            <Line
              type="monotone"
              dataKey="flat"
              name="Flat"
              stroke={STRATEGY_COLORS.flat}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: STRATEGY_COLORS.flat }}
              isAnimationActive={false}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="spread"
              name="Spread"
              stroke={STRATEGY_COLORS.spread}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: STRATEGY_COLORS.spread }}
              isAnimationActive={false}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="kelly"
              name="Kelly"
              stroke={STRATEGY_COLORS.kelly}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: STRATEGY_COLORS.kelly }}
              isAnimationActive={false}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
