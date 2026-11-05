// Account value snapshots recorded during SIG's Predictions Cup (Midterm
// Elections tournament, Oct 1 to Nov 4, 2026). Values are in SUSQies, the
// tournament's simulated currency. Points marked `approx` were read off the
// platform's equity chart; the rest are exact readings from the portfolio page.

export type Snapshot = {
  /** ISO timestamp, Eastern Time */
  t: string;
  value: number;
  approx?: boolean;
  note?: string;
};

export const STARTING_BALANCE = 100_000;

export const snapshots: Snapshot[] = [
  { t: "2026-10-01T12:00:00-04:00", value: 100_000, note: "Tournament start" },
  { t: "2026-10-07T12:00:00-04:00", value: 98_000, approx: true, note: "Low around bot launch" },
  { t: "2026-10-25T12:00:00-04:00", value: 104_725 },
  { t: "2026-10-27T12:00:00-04:00", value: 105_091 },
  { t: "2026-11-02T09:00:00-05:00", value: 99_043, note: "Drawdown low" },
  { t: "2026-11-03T12:00:00-05:00", value: 103_687 },
  { t: "2026-11-03T19:00:00-05:00", value: 102_000, approx: true, note: "Election night begins" },
  { t: "2026-11-03T21:56:00-05:00", value: 105_064 },
  { t: "2026-11-04T01:30:00-05:00", value: 106_500, approx: true, note: "Overnight peak" },
  { t: "2026-11-04T06:00:00-05:00", value: 102_000, approx: true },
  { t: "2026-11-04T08:43:00-05:00", value: 103_337 },
  { t: "2026-11-04T11:13:00-05:00", value: 105_856 },
  { t: "2026-11-04T11:29:00-05:00", value: 109_328, note: "Races resolving" },
  { t: "2026-11-04T11:46:00-05:00", value: 110_134 },
  { t: "2026-11-04T12:00:00-05:00", value: 110_849, note: "Trading close" },
];

export const results = {
  finalValue: 110_849,
  returnPct: 10.8,
  positions: 47,
  trades: 692,
  rankNearClose: 368,
  rankOct7: 845,
  participantsOct7: 1_277,
  drawdownLow: 99_043,
  racesMatchedToKalshi: 94,
  racesTotal: 117,
} as const;

export function formatSusq(v: number) {
  return v.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
