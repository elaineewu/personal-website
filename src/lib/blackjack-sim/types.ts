export type BettingStrategy = "flat" | "spread" | "kelly";

export interface SummaryStats {
  finalBankroll: number;
  maxDrawdown: number;
  totalHandsPlayed: number;
  handsActuallyPlayed: number;
  wentBust: boolean;
  edgeRealized: number;
  riskOfRuinEstimate: number;
}

export interface WebStrategyResult {
  summaryStats: SummaryStats;
  bankrollSeries: Array<{ hand: number; bankroll: number }>;
}

export interface WebSimulationCheckpoint {
  handCount: number;
  strategies: Record<BettingStrategy, WebStrategyResult>;
}

export interface TrueCountBucket {
  trueCount: number;
  handCount: number;
  averageOutcomePerUnit: number;
  standardError: number;
  confidenceInterval95: [number, number];
}

export interface EdgeCurveOutput {
  buckets: TrueCountBucket[];
}

export type EdgeCurveChartPoint = {
  trueCount: number;
  edgePct: number;
  ciLowerPct: number;
  ciUpperPct: number;
  handCount: number;
};

export type HandCountCheckpoint = 1000 | 10000 | 100000 | 1000000;

export type BankrollChartPoint = {
  hand: number;
  flat?: number;
  spread?: number;
  kelly?: number;
};
