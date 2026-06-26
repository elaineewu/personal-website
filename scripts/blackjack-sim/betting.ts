import type { BettingStrategy } from "./types";

const SPREAD_MAX_MULTIPLIER = 8;
const KELLY_VARIANCE_ESTIMATE = 1.3;
const KELLY_EDGE_PER_TRUE_COUNT = 0.005; // ~0.5% edge per true count (simplified)
const KELLY_MAX_BANKROLL_FRACTION = 0.05;

/**
 * Fixed table maximum bet, independent of bankroll. Real casinos always impose
 * table limits regardless of how much a player has — this cap reflects that
 * reality, not an arbitrary simulation constraint. Without it, Kelly sizing
 * (and large spread bets) would grow without bound as bankroll compounds.
 * 500 = 50× baseBet of 10, a typical spread limit relative to minimum bet.
 */
const TABLE_MAX_BET = 500;

/**
 * Simplified bet-sizing approximations for simulation — not precise advantage-play formulas.
 * Spread and Kelly models use rough heuristics to compare betting approaches under count.
 */
export function getBetSize(
  strategy: BettingStrategy,
  trueCount: number,
  baseBet: number,
  bankroll: number,
): number {
  switch (strategy) {
    case "flat":
      return baseBet;

    case "spread": {
      const multiplier = Math.max(1, trueCount);
      const raw = baseBet * multiplier;
      const spreadBet = Math.min(raw, baseBet * SPREAD_MAX_MULTIPLIER);
      return Math.min(spreadBet, TABLE_MAX_BET);
    }

    case "kelly": {
      const edge = trueCount * KELLY_EDGE_PER_TRUE_COUNT;
      if (edge <= 0) {
        return 0;
      }
      const kellyBet = bankroll * (edge / KELLY_VARIANCE_ESTIMATE);
      const bankrollCapped = Math.min(kellyBet, bankroll * KELLY_MAX_BANKROLL_FRACTION);
      const withMinimum = Math.max(baseBet, bankrollCapped);
      return Math.min(withMinimum, TABLE_MAX_BET);
    }

    default: {
      const _exhaustive: never = strategy;
      return _exhaustive;
    }
  }
}

/** Profit multiple per unit wagered for a given outcome. */
export function outcomeProfitMultiple(outcome: "win" | "lose" | "push" | "blackjack"): number {
  switch (outcome) {
    case "win":
      return 1;
    case "lose":
      return -1;
    case "push":
      return 0;
    case "blackjack":
      return 1.5;
    default: {
      const _exhaustive: never = outcome;
      return _exhaustive;
    }
  }
}
