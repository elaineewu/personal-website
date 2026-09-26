import raw from "@/data/alpha101/results.json";

export type PeriodStats = {
  ic: number | null;
  ic_t: number | null;
  sharpe: number | null;
  turnover: number | null;
  days: number;
};

export type SweepPoint = { x: number; is: number | null; oos: number | null };

export type Sweep = {
  published: number;
  publishedX: number;
  points: SweepPoint[];
};

export type AlphaResult = {
  formula: string;
  params: Record<string, number>;
  baseline: { is: PeriodStats; oos: PeriodStats };
  round: { is: PeriodStats; oos: PeriodStats };
  sweeps: Record<string, Sweep>;
};

export type HeatCell = { x: number; y: number; is: number | null; oos: number | null };

export type Heatmap = { xParam: string; yParam: string; cells: HeatCell[] };

export type Alpha101Results = {
  meta: { start: string; end: string; tickers: number; is_end: string };
  alphas: Record<string, AlphaResult>;
  heatmaps: Record<string, Heatmap>;
  null: Record<string, [number, number][]>;
};

export const alpha101 = raw as unknown as Alpha101Results;

export const alphaIds = Object.keys(alpha101.alphas).sort(
  (a, b) => Number(a) - Number(b),
);

/** Chart colors, validated for separation and contrast on the dark surface. */
export const IS_COLOR = "#8b5cf6";
export const OOS_COLOR = "#0fa89a";
export const GRID = "#2d3748";
export const MUTED = "#94a3b8";

/** IC values are tiny, so show them in basis points of correlation (x 10^4). */
export function formatIc(v: number | null | undefined, digits = 1): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "n/a";
  const bp = v * 10000;
  return `${bp >= 0 ? "+" : ""}${bp.toFixed(digits)}`;
}

export function formatNum(v: number | null | undefined, digits = 2): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "n/a";
  return `${v >= 0 ? "+" : ""}${v.toFixed(digits)}`;
}

export function paramLabel(name: string): string {
  return name === "a" ? "blend weight" : `window ${name.slice(1)}`;
}
