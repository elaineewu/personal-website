"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  alpha101,
  alphaIds,
  formatIc,
  GRID,
  IS_COLOR,
  MUTED,
  OOS_COLOR,
  paramLabel,
  type SweepPoint,
} from "@/lib/alpha101/data";

const CHART_HEIGHT = 300;

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1 font-mono text-xs transition-colors ${
        active
          ? "border-accent/60 bg-accent/10 text-accent"
          : "border-border text-muted hover:border-accent/40 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function HighlightedFormula({ formula, constant }: { formula: string; constant: string }) {
  const parts = formula.split(constant);
  return (
    <code className="block whitespace-pre-wrap break-all rounded-lg border border-border bg-background/60 px-4 py-3 font-mono text-xs leading-relaxed text-muted">
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <mark className="rounded bg-accent/20 px-0.5 text-accent">{constant}</mark>
          )}
        </span>
      ))}
    </code>
  );
}

type TooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: SweepPoint }>;
  isWeight: boolean;
};

function SweepTooltip({ active, payload, isWeight }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 font-mono text-xs shadow-lg">
      <p className="text-muted">{isWeight ? `weight = ${p.x}` : `window = ${p.x} days`}</p>
      <p className="mt-1 text-foreground">
        <span style={{ color: IS_COLOR }}>●</span> In-sample IC: {formatIc(p.is)}
      </p>
      <p className="mt-1 text-foreground">
        <span style={{ color: OOS_COLOR }}>●</span> Out-of-sample IC: {formatIc(p.oos)}
      </p>
    </div>
  );
}

function percentileOf(points: SweepPoint[], x: number, key: "is" | "oos") {
  const vals = points.filter((p) => p[key] !== null);
  const target = vals.find((p) => p.x === x)?.[key];
  if (target === undefined || target === null) return null;
  const better = vals.filter((p) => (p[key] as number) > target).length;
  return { rank: better + 1, of: vals.length };
}

export default function SensitivityExplorer() {
  const [alphaId, setAlphaId] = useState("61");
  const alpha = alpha101.alphas[alphaId];
  const paramNames = Object.keys(alpha.sweeps);
  const [paramName, setParamName] = useState(paramNames[0]);
  const activeParam = paramNames.includes(paramName) ? paramName : paramNames[0];
  const sweep = alpha.sweeps[activeParam];
  const isWeight = activeParam === "a";

  const ranks = useMemo(
    () => ({
      is: percentileOf(sweep.points, sweep.publishedX, "is"),
      oos: percentileOf(sweep.points, sweep.publishedX, "oos"),
    }),
    [sweep],
  );

  return (
    <div>
      <div className="mb-4">
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted">Alpha</p>
        <div className="flex flex-wrap gap-2">
          {alphaIds.map((id) => (
            <Chip
              key={id}
              active={id === alphaId}
              onClick={() => {
                setAlphaId(id);
                setParamName(Object.keys(alpha101.alphas[id].sweeps)[0]);
              }}
            >
              #{id}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted">Constant</p>
        <div className="flex flex-wrap gap-2">
          {paramNames.map((name) => (
            <Chip
              key={name}
              active={name === activeParam}
              onClick={() => setParamName(name)}
            >
              {alpha.sweeps[name].published}
            </Chip>
          ))}
        </div>
      </div>

      <HighlightedFormula formula={alpha.formula} constant={String(sweep.published)} />

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-xs text-muted">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-0.5 w-4 rounded" style={{ background: IS_COLOR }} />
          In-sample (2013–2015)
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-0.5 w-4 rounded" style={{ background: OOS_COLOR }} />
          Out-of-sample (2016–2018)
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-0 border-l border-dashed border-foreground/70" />
          Published value
        </span>
      </div>

      <div className="mt-3 w-full" style={{ height: CHART_HEIGHT }}>
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <LineChart data={sweep.points} margin={{ top: 12, right: 12, left: 0, bottom: 16 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="x"
              type="number"
              domain={["dataMin", "dataMax"]}
              allowDecimals={isWeight}
              tick={{ fill: MUTED, fontSize: 11, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={{ stroke: GRID }}
              label={{
                value: isWeight ? "blend weight" : "window length (days)",
                position: "insideBottom",
                offset: -10,
                fill: MUTED,
                fontSize: 11,
              }}
            />
            <YAxis
              tick={{ fill: MUTED, fontSize: 11, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={{ stroke: GRID }}
              width={44}
              tickFormatter={(v: number) => (v * 10000).toFixed(0)}
            />
            <Tooltip content={<SweepTooltip isWeight={isWeight} />} />
            <ReferenceLine y={0} stroke={MUTED} strokeOpacity={0.5} />
            <ReferenceLine
              x={sweep.publishedX}
              stroke="#e2e8f0"
              strokeOpacity={0.7}
              strokeDasharray="4 4"
            />
            <Line
              dataKey="is"
              stroke={IS_COLOR}
              strokeWidth={2}
              dot={{ r: 3, fill: IS_COLOR, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              connectNulls={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="oos"
              stroke={OOS_COLOR}
              strokeWidth={2}
              dot={{ r: 3, fill: OOS_COLOR, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              connectNulls={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-muted">
        Y-axis: mean daily rank IC × 10⁴. Sweeping {paramLabel(activeParam)} of Alpha #{alphaId}{" "}
        with every other constant held at its published value.
        {!isWeight && (
          <>
            {" "}The paper floors {sweep.published} to {sweep.publishedX}.
          </>
        )}
        {ranks.is && ranks.oos && (
          <>
            {" "}The published value ranks{" "}
            <span className="text-foreground">
              {ranks.is.rank} of {ranks.is.of}
            </span>{" "}
            in-sample and{" "}
            <span className="text-foreground">
              {ranks.oos.rank} of {ranks.oos.of}
            </span>{" "}
            out-of-sample.
          </>
        )}
      </p>
    </div>
  );
}
