"use client";

import { useMemo, useState } from "react";
import { alpha101, formatIc, type HeatCell } from "@/lib/alpha101/data";

const NEUTRAL = [45, 55, 72]; // #2d3748
const POS = [15, 168, 154]; // #0fa89a
const NEG = [225, 29, 72]; // #e11d48

function mix(a: number[], b: number[], t: number) {
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

function cellColor(v: number | null, maxAbs: number) {
  if (v === null) return "transparent";
  const t = Math.min(1, Math.abs(v) / maxAbs);
  return mix(NEUTRAL, v >= 0 ? POS : NEG, t);
}

const HEATMAP_NOTES: Record<string, string> = {
  "61": "Alpha #61: the in-sample hot spot sits at short windows, and out-of-sample the good region moves to the opposite corner. Across all 90 cells, in-sample and out-of-sample IC have a correlation of −0.75.",
  "75": "Alpha #75: a broad plateau. 84% of window pairs have positive IC in both periods, and in-sample vs. out-of-sample IC are positively correlated (+0.26).",
};

export default function WindowHeatmap() {
  const [alphaId, setAlphaId] = useState<"61" | "75">("61");
  const [period, setPeriod] = useState<"is" | "oos">("is");
  const [hover, setHover] = useState<HeatCell | null>(null);

  const heat = alpha101.heatmaps[alphaId];
  const params = alpha101.alphas[alphaId].params;
  const pubX = Math.floor(params[heat.xParam]);
  const pubY = Math.floor(params[heat.yParam]);

  const { xs, ys, lookup, maxAbs } = useMemo(() => {
    const xs = [...new Set(heat.cells.map((c) => c.x))].sort((a, b) => a - b);
    const ys = [...new Set(heat.cells.map((c) => c.y))].sort((a, b) => b - a);
    const lookup = new Map(heat.cells.map((c) => [`${c.x}-${c.y}`, c]));
    const maxAbs = Math.max(
      ...heat.cells.flatMap((c) => [Math.abs(c.is ?? 0), Math.abs(c.oos ?? 0)]),
    );
    return { xs, ys, lookup, maxAbs };
  }, [heat]);

  const toggle = (active: boolean) =>
    `rounded-full border px-3 py-1 font-mono text-xs transition-colors ${
      active
        ? "border-accent/60 bg-accent/10 text-accent"
        : "border-border text-muted hover:border-accent/40 hover:text-foreground"
    }`;

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-x-6 gap-y-3">
        <div className="flex gap-2">
          {(["61", "75"] as const).map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={alphaId === id}
              className={toggle(alphaId === id)}
              onClick={() => setAlphaId(id)}
            >
              Alpha #{id}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(
            [
              ["is", "In-sample 2013–15"],
              ["oos", "Out-of-sample 2016–18"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={period === key}
              className={toggle(period === key)}
              onClick={() => setPeriod(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex flex-col">
          <div className="flex">
            <div className="flex w-10 shrink-0 items-center justify-center">
              <span className="-rotate-90 whitespace-nowrap font-mono text-[10px] text-muted">
                {heat.yParam} (days)
              </span>
            </div>
            <div
              className="grid gap-[2px]"
              style={{ gridTemplateColumns: `28px repeat(${xs.length}, 30px)` }}
              onMouseLeave={() => setHover(null)}
            >
              {ys.map((y) => (
                <div key={`row-${y}`} className="contents">
                  <div className="flex items-center justify-end pr-1 font-mono text-[10px] text-muted">
                    {y}
                  </div>
                  {xs.map((x) => {
                    const cell = lookup.get(`${x}-${y}`);
                    const v = cell ? cell[period] : null;
                    const isPub = x === pubX && y === pubY;
                    return (
                      <div
                        key={`${x}-${y}`}
                        onMouseEnter={() => cell && setHover(cell)}
                        className={`aspect-square rounded-[3px] ${
                          isPub ? "ring-2 ring-foreground ring-offset-1 ring-offset-surface" : ""
                        }`}
                        style={{ background: cellColor(v, maxAbs) }}
                        aria-label={`${heat.xParam}=${x}, ${heat.yParam}=${y}: IC ${formatIc(v)}`}
                      />
                    );
                  })}
                </div>
              ))}
              <div />
              {xs.map((x) => (
                <div key={`x-${x}`} className="pt-1 text-center font-mono text-[10px] text-muted">
                  {x}
                </div>
              ))}
            </div>
          </div>
          <p className="mt-1 text-center font-mono text-[10px] text-muted">
            {heat.xParam} (days)
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-mono text-[10px] text-muted">
          <span>{formatIc(-maxAbs, 0)}</span>
          <span
            className="h-2 w-32 rounded"
            style={{
              background: `linear-gradient(to right, ${mix(NEUTRAL, NEG, 1)}, ${mix(NEUTRAL, NEUTRAL, 0)}, ${mix(NEUTRAL, POS, 1)})`,
            }}
          />
          <span>{formatIc(maxAbs, 0)}</span>
          <span className="ml-2">IC × 10⁴ · outlined cell = published (floored)</span>
        </div>
        <p className="font-mono text-xs text-foreground" aria-live="polite">
          {hover
            ? `${heat.xParam}=${hover.x}, ${heat.yParam}=${hover.y} · IS ${formatIc(hover.is)} · OOS ${formatIc(hover.oos)}`
            : "Hover a cell"}
        </p>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted">{HEATMAP_NOTES[alphaId]}</p>
    </div>
  );
}
