"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { alpha101, alphaIds, formatIc, GRID, MUTED, OOS_COLOR } from "@/lib/alpha101/data";

const CHART_HEIGHT = 300;
const RANDOM_COLOR = "#64748b";

type Pt = { is: number; oos: number; published?: boolean };

function NullTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: Pt }> }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 font-mono text-xs shadow-lg">
      <p className="text-muted">{p.published ? "Published constants" : "Random constants"}</p>
      <p className="mt-1 text-foreground">In-sample IC: {formatIc(p.is)}</p>
      <p className="mt-1 text-foreground">Out-of-sample IC: {formatIc(p.oos)}</p>
    </div>
  );
}

function pct(values: number[], v: number) {
  return Math.round((100 * values.filter((x) => x < v).length) / values.length);
}

export default function RandomNullChart() {
  const [alphaId, setAlphaId] = useState("75");

  const { draws, published, isPct, oosPct } = useMemo(() => {
    const draws: Pt[] = alpha101.null[alphaId].map(([is, oos]) => ({ is, oos }));
    const b = alpha101.alphas[alphaId].baseline;
    const published: Pt[] = [{ is: b.is.ic ?? 0, oos: b.oos.ic ?? 0, published: true }];
    return {
      draws,
      published,
      isPct: pct(draws.map((d) => d.is), published[0].is),
      oosPct: pct(draws.map((d) => d.oos), published[0].oos),
    };
  }, [alphaId]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {alphaIds.map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={id === alphaId}
            onClick={() => setAlphaId(id)}
            className={`rounded-full border px-3 py-1 font-mono text-xs transition-colors ${
              id === alphaId
                ? "border-accent/60 bg-accent/10 text-accent"
                : "border-border text-muted hover:border-accent/40 hover:text-foreground"
            }`}
          >
            #{id}
          </button>
        ))}
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-xs text-muted">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: RANDOM_COLOR }} />
          60 random constant sets
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-full ring-2 ring-surface"
            style={{ background: OOS_COLOR }}
          />
          Published constants
        </span>
      </div>

      <div className="w-full" style={{ height: CHART_HEIGHT }}>
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <ScatterChart margin={{ top: 12, right: 12, left: 0, bottom: 16 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="is"
              name="In-sample IC"
              tick={{ fill: MUTED, fontSize: 11, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={{ stroke: GRID }}
              tickFormatter={(v: number) => (v * 10000).toFixed(0)}
              label={{
                value: "in-sample IC × 10⁴",
                position: "insideBottom",
                offset: -10,
                fill: MUTED,
                fontSize: 11,
              }}
            />
            <YAxis
              type="number"
              dataKey="oos"
              name="Out-of-sample IC"
              tick={{ fill: MUTED, fontSize: 11, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={{ stroke: GRID }}
              width={44}
              tickFormatter={(v: number) => (v * 10000).toFixed(0)}
            />
            <ReferenceLine x={0} stroke={MUTED} strokeOpacity={0.5} />
            <ReferenceLine y={0} stroke={MUTED} strokeOpacity={0.5} />
            <Tooltip content={<NullTooltip />} cursor={false} />
            <Scatter data={draws} fill={RANDOM_COLOR} fillOpacity={0.8} isAnimationActive={false} />
            <Scatter
              data={published}
              fill={OOS_COLOR}
              isAnimationActive={false}
              shape={(props: { cx?: number; cy?: number }) => (
                <circle
                  cx={props.cx}
                  cy={props.cy}
                  r={7}
                  fill={OOS_COLOR}
                  stroke="#161b22"
                  strokeWidth={2}
                />
              )}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-muted">
        Y-axis: out-of-sample IC × 10⁴. For Alpha #{alphaId}, the published constants beat{" "}
        <span className="text-foreground">{isPct}%</span> of random constant sets in-sample and{" "}
        <span className="text-foreground">{oosPct}%</span> out-of-sample. Each random set draws
        every window uniformly from half to double its published length and every blend weight
        uniformly from [0, 1].
      </p>
    </div>
  );
}
