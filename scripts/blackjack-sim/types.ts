export type CardRank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";

export interface Card {
  rank: CardRank;
  value: number;
}

export interface ShoeConfig {
  numDecks: number;
  penetration: number;
}

export type BettingStrategy = "flat" | "spread" | "kelly";

export interface SimulationConfig {
  numDecks: number;
  penetration: number;
  numHands: number;
  bettingStrategy: BettingStrategy;
  baseBet: number;
  bankroll: number;
}

export type HandOutcome = "win" | "lose" | "push" | "blackjack";

export interface HandResult {
  trueCountAtBet: number;
  /** Initial bet placed before the round (does not reflect doubles or splits). */
  betSize: number;
  /** Actual total wagered for the round — use this for edge calculations. */
  totalWagered: number;
  outcome: HandOutcome;
  bankrollAfter: number;
}

export interface SummaryStats {
  finalBankroll: number;
  maxDrawdown: number;
  totalHandsPlayed: number;
  handsActuallyPlayed: number;
  wentBust: boolean;
  edgeRealized: number;
  riskOfRuinEstimate: number;
}

export interface SimulationOutput {
  config: SimulationConfig;
  handResults: HandResult[];
  summaryStats: SummaryStats;
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
