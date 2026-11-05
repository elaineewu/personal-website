"use client";

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
import { GRID, MUTED, OOS_COLOR } from "@/lib/alpha101/data";
import { formatSusq, snapshots, STARTING_BALANCE } from "@/lib/sig-predictions-cup/data";

const CHART_HEIGHT = 300;
const TZ = "America/New_York";

type Pt = { x: number; value: number; approx?: boolean; note?: string };

const points: Pt[] = snapshots.map((s) => ({
  x: new Date(s.t).getTime(),
  value: s.value,
  approx: s.approx,
  note: s.note,
}));

function formatDay(ms: number) {
  return new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: TZ });
}

function formatStamp(ms: number) {
  return new Date(ms).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: TZ,
  });
}

function EquityTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: Pt }> }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  const pct = ((p.value / STARTING_BALANCE - 1) * 100).toFixed(1);
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 font-mono text-xs shadow-lg">
      <p className="text-muted">{formatStamp(p.x)} ET</p>
      <p className="mt-1 text-foreground">
        {p.approx ? "~" : ""}
        {formatSusq(p.value)} SUSQies ({Number(pct) >= 0 ? "+" : ""}
        {pct}%)
      </p>
      {p.note && <p className="mt-1 text-accent">{p.note}</p>}
    </div>
  );
}

function Dot(props: { cx?: number; cy?: number; payload?: Pt }) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null) return null;
  return payload?.approx ? (
    <circle cx={cx} cy={cy} r={3.5} fill="#161b22" stroke={OOS_COLOR} strokeWidth={1.5} />
  ) : (
    <circle cx={cx} cy={cy} r={3.5} fill={OOS_COLOR} />
  );
}

const ticks = [
  "2026-10-01T12:00:00-04:00",
  "2026-10-08T12:00:00-04:00",
  "2026-10-15T12:00:00-04:00",
  "2026-10-22T12:00:00-04:00",
  "2026-10-29T12:00:00-04:00",
  "2026-11-04T12:00:00-05:00",
].map((t) => new Date(t).getTime());

export default function EquityChart() {
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-xs text-muted">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: OOS_COLOR }} />
          Recorded snapshot
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full border"
            style={{ borderColor: OOS_COLOR }}
          />
          Approximate, read off the platform chart
        </span>
      </div>
      <div className="w-full" style={{ height: CHART_HEIGHT }}>
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <LineChart data={points} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              domain={[ticks[0], ticks[ticks.length - 1]]}
              ticks={ticks}
              tickFormatter={formatDay}
              tick={{ fill: MUTED, fontSize: 11, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={{ stroke: GRID }}
            />
            <YAxis
              domain={[96_000, 112_000]}
              ticks={[96_000, 100_000, 104_000, 108_000, 112_000]}
              tickFormatter={(v: number) => `${v / 1000}k`}
              tick={{ fill: MUTED, fontSize: 11, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={{ stroke: GRID }}
              width={44}
            />
            <ReferenceLine
              y={STARTING_BALANCE}
              stroke={MUTED}
              strokeOpacity={0.5}
              strokeDasharray="4 4"
            />
            <Tooltip content={<EquityTooltip />} cursor={{ stroke: GRID }} />
            <Line
              type="linear"
              dataKey="value"
              stroke={OOS_COLOR}
              strokeWidth={1.5}
              dot={<Dot />}
              activeDot={{ r: 5, fill: OOS_COLOR }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        Account value in SUSQies; the dashed line is the 100,000 starting balance. Lines connect
        the snapshots I recorded, so they skip over intraday moves between them. The last week is
        dense because I was checking it constantly through election night.
      </p>
    </div>
  );
}
