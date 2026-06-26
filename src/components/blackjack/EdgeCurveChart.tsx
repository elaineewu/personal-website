"use client";

import { useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import edgeCurveData from "@/data/blackjack-sim/results-edge-curve.json";
import type { EdgeCurveChartPoint, EdgeCurveOutput } from "@/lib/blackjack-sim/types";

const ACCENT = "#5eead4";
const BACKGROUND = "#0f1419";
const GRID = "#2d3748";
const MUTED = "#94a3b8";
const CHART_HEIGHT = 288;

const typedEdgeCurveData = edgeCurveData as EdgeCurveOutput;

function toPercent(value: number): number {
  return value * 100;
}

function formatEdgePct(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function formatTrueCount(trueCount: number): string {
  const sign = trueCount > 0 ? "+" : "";
  return `${sign}${trueCount}`;
}

function buildChartData(buckets: EdgeCurveOutput["buckets"]): EdgeCurveChartPoint[] {
  return buckets.map((bucket) => ({
    trueCount: bucket.trueCount,
    edgePct: toPercent(bucket.averageOutcomePerUnit),
    ciLowerPct: toPercent(bucket.confidenceInterval95[0]),
    ciUpperPct: toPercent(bucket.confidenceInterval95[1]),
    handCount: bucket.handCount,
  }));
}

type EdgeCurveTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: EdgeCurveChartPoint }>;
};

function EdgeCurveTooltip({ active, payload }: EdgeCurveTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 font-mono text-xs text-foreground shadow-lg">
      <p className="text-muted">True count {formatTrueCount(point.trueCount)}</p>
      <p className="mt-1 text-accent">Edge: {formatEdgePct(point.edgePct)}</p>
      <p className="mt-1 tabular-nums text-foreground">
        95% CI: {formatEdgePct(point.ciLowerPct)} to {formatEdgePct(point.ciUpperPct)}
      </p>
      <p className="mt-1 tabular-nums text-muted">
        n={point.handCount.toLocaleString("en-US")} hands
      </p>
    </div>
  );
}

export default function EdgeCurveChart() {
  const chartData = useMemo(
    () => buildChartData(typedEdgeCurveData.buckets),
    [],
  );

  return (
    <div>
      <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-muted">
        Edge vs. true count
      </h3>
      <div className="w-full" style={{ height: CHART_HEIGHT }}>
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <ComposedChart
            data={chartData}
            margin={{ top: 8, right: 12, left: 0, bottom: 4 }}
          >
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="trueCount"
              type="number"
              domain={[-10, 10]}
              ticks={[-10, -5, 0, 5, 10]}
              tick={{ fill: MUTED, fontSize: 11, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={{ stroke: GRID }}
              tickFormatter={formatTrueCount}
            />
            <YAxis
              tick={{ fill: MUTED, fontSize: 11, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={{ stroke: GRID }}
              width={48}
              tickFormatter={(value: number) => `${value.toFixed(0)}%`}
            />
            <Tooltip content={<EdgeCurveTooltip />} />
            <ReferenceLine y={0} stroke={MUTED} strokeDasharray="4 4" strokeOpacity={0.7} />
            <Area
              type="monotone"
              dataKey="ciUpperPct"
              stroke="none"
              fill={ACCENT}
              fillOpacity={0.2}
              isAnimationActive={false}
              legendType="none"
              tooltipType="none"
            />
            <Area
              type="monotone"
              dataKey="ciLowerPct"
              stroke="none"
              fill={BACKGROUND}
              fillOpacity={1}
              isAnimationActive={false}
              legendType="none"
              tooltipType="none"
            />
            <Line
              type="monotone"
              dataKey="edgePct"
              stroke={ACCENT}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: ACCENT }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted">
        Confidence bands widen at extreme true counts because fewer hands occur in those
        states. This reflects genuine statistical uncertainty, not a simulation error.
      </p>
    </div>
  );
}
