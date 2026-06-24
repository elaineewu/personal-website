/**
 * Approximates standard heads-up Nash push/fold ranges as commonly documented in
 * poker theory resources (e.g. HoldemResources-style charts, Princeton / MIT poker
 * curriculum materials, and widely circulated short-stack equilibrium tables).
 *
 * Borderline mixed-strategy hands are simplified to a binary push or fold rather
 * than precise mixing frequencies. When equilibrium references disagree on a hand,
 * the more conventionally accepted side is used (e.g. marginal suited connectors
 * at medium depth default to fold unless most charts clearly push them).
 *
 * Stack depths are keyed at 5bb increments. Values between increments snap to the
 * nearest defined depth (e.g. 12bb → 10bb, 13bb → 15bb).
 */

import type { HandKey, Position, Rank } from "./hands";
import { allHandKeys, handKeyFromIndices, parseHandKey, rankIndex } from "./hands";

export const STACK_DEPTHS = [5, 10, 15, 20, 25] as const;
export type StackDepth = (typeof STACK_DEPTHS)[number];

export type PushFoldAction = "push" | "fold";

export function snapStackDepth(stackBb: number): StackDepth {
  let nearest: StackDepth = STACK_DEPTHS[0];
  let minDistance = Math.abs(stackBb - nearest);
  for (const depth of STACK_DEPTHS) {
    const distance = Math.abs(stackBb - depth);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = depth;
    }
  }
  return nearest;
}

type RankThreshold = {
  minPair: Rank;
  minSuitedAce: Rank;
  minOffAce: Rank;
  minSuitedKing: Rank;
  minOffKing: Rank;
  minSuitedQueen: Rank;
  minOffQueen: Rank;
  minSuitedJack: Rank;
  minOffJack: Rank;
  minSuitedTen: Rank;
  minOffTen: Rank;
  minSuitedNine: Rank;
  minSuitedEight: Rank;
  minSuitedSeven: Rank;
  minSuitedSix: Rank;
  minSuitedFive: Rank;
  minSuitedFour: Rank;
  minSuitedConnectorGap1: boolean;
  minSuitedConnectorGap2: boolean;
};

function pairThreshold(depth: StackDepth, position: Position): RankThreshold {
  const table: Record<StackDepth, Record<Position, RankThreshold>> = {
    5: {
      "sb-vs-bb": {
        minPair: "2",
        minSuitedAce: "2",
        minOffAce: "2",
        minSuitedKing: "2",
        minOffKing: "5",
        minSuitedQueen: "2",
        minOffQueen: "8",
        minSuitedJack: "4",
        minOffJack: "9",
        minSuitedTen: "6",
        minOffTen: "9",
        minSuitedNine: "6",
        minSuitedEight: "5",
        minSuitedSeven: "5",
        minSuitedSix: "4",
        minSuitedFive: "4",
        minSuitedFour: "3",
        minSuitedConnectorGap1: true,
        minSuitedConnectorGap2: true,
      },
      "btn-vs-blinds": {
        minPair: "2",
        minSuitedAce: "2",
        minOffAce: "7",
        minSuitedKing: "5",
        minOffKing: "9",
        minSuitedQueen: "8",
        minOffQueen: "T",
        minSuitedJack: "9",
        minOffJack: "T",
        minSuitedTen: "8",
        minOffTen: "J",
        minSuitedNine: "7",
        minSuitedEight: "6",
        minSuitedSeven: "6",
        minSuitedSix: "5",
        minSuitedFive: "5",
        minSuitedFour: "4",
        minSuitedConnectorGap1: true,
        minSuitedConnectorGap2: false,
      },
    },
    10: {
      "sb-vs-bb": {
        minPair: "2",
        minSuitedAce: "2",
        minOffAce: "7",
        minSuitedKing: "9",
        minOffKing: "T",
        minSuitedQueen: "T",
        minOffQueen: "J",
        minSuitedJack: "T",
        minOffJack: "Q",
        minSuitedTen: "9",
        minOffTen: "Q",
        minSuitedNine: "8",
        minSuitedEight: "7",
        minSuitedSeven: "6",
        minSuitedSix: "5",
        minSuitedFive: "4",
        minSuitedFour: "4",
        minSuitedConnectorGap1: true,
        minSuitedConnectorGap2: false,
      },
      "btn-vs-blinds": {
        minPair: "4",
        minSuitedAce: "2",
        minOffAce: "9",
        minSuitedKing: "9",
        minOffKing: "J",
        minSuitedQueen: "J",
        minOffQueen: "Q",
        minSuitedJack: "T",
        minOffJack: "K",
        minSuitedTen: "9",
        minOffTen: "K",
        minSuitedNine: "8",
        minSuitedEight: "7",
        minSuitedSeven: "6",
        minSuitedSix: "5",
        minSuitedFive: "4",
        minSuitedFour: "4",
        minSuitedConnectorGap1: false,
        minSuitedConnectorGap2: false,
      },
    },
    15: {
      "sb-vs-bb": {
        minPair: "3",
        minSuitedAce: "2",
        minOffAce: "9",
        minSuitedKing: "9",
        minOffKing: "J",
        minSuitedQueen: "T",
        minOffQueen: "Q",
        minSuitedJack: "9",
        minOffJack: "K",
        minSuitedTen: "9",
        minOffTen: "K",
        minSuitedNine: "8",
        minSuitedEight: "7",
        minSuitedSeven: "6",
        minSuitedSix: "5",
        minSuitedFive: "4",
        minSuitedFour: "4",
        minSuitedConnectorGap1: false,
        minSuitedConnectorGap2: false,
      },
      "btn-vs-blinds": {
        minPair: "5",
        minSuitedAce: "5",
        minOffAce: "T",
        minSuitedKing: "J",
        minOffKing: "Q",
        minSuitedQueen: "J",
        minOffQueen: "K",
        minSuitedJack: "T",
        minOffJack: "A",
        minSuitedTen: "9",
        minOffTen: "A",
        minSuitedNine: "8",
        minSuitedEight: "7",
        minSuitedSeven: "6",
        minSuitedSix: "5",
        minSuitedFive: "4",
        minSuitedFour: "4",
        minSuitedConnectorGap1: false,
        minSuitedConnectorGap2: false,
      },
    },
    20: {
      "sb-vs-bb": {
        minPair: "4",
        minSuitedAce: "2",
        minOffAce: "T",
        minSuitedKing: "J",
        minOffKing: "Q",
        minSuitedQueen: "J",
        minOffQueen: "K",
        minSuitedJack: "T",
        minOffJack: "A",
        minSuitedTen: "9",
        minOffTen: "A",
        minSuitedNine: "8",
        minSuitedEight: "7",
        minSuitedSeven: "6",
        minSuitedSix: "5",
        minSuitedFive: "4",
        minSuitedFour: "4",
        minSuitedConnectorGap1: false,
        minSuitedConnectorGap2: false,
      },
      "btn-vs-blinds": {
        minPair: "6",
        minSuitedAce: "7",
        minOffAce: "J",
        minSuitedKing: "Q",
        minOffKing: "A",
        minSuitedQueen: "Q",
        minOffQueen: "A",
        minSuitedJack: "T",
        minOffJack: "A",
        minSuitedTen: "9",
        minOffTen: "A",
        minSuitedNine: "8",
        minSuitedEight: "7",
        minSuitedSeven: "6",
        minSuitedSix: "5",
        minSuitedFive: "4",
        minSuitedFour: "4",
        minSuitedConnectorGap1: false,
        minSuitedConnectorGap2: false,
      },
    },
    25: {
      "sb-vs-bb": {
        minPair: "5",
        minSuitedAce: "8",
        minOffAce: "J",
        minSuitedKing: "Q",
        minOffKing: "A",
        minSuitedQueen: "J",
        minOffQueen: "A",
        minSuitedJack: "T",
        minOffJack: "A",
        minSuitedTen: "9",
        minOffTen: "A",
        minSuitedNine: "8",
        minSuitedEight: "7",
        minSuitedSeven: "6",
        minSuitedSix: "5",
        minSuitedFive: "4",
        minSuitedFour: "4",
        minSuitedConnectorGap1: false,
        minSuitedConnectorGap2: false,
      },
      "btn-vs-blinds": {
        minPair: "7",
        minSuitedAce: "T",
        minOffAce: "J",
        minSuitedKing: "Q",
        minOffKing: "A",
        minSuitedQueen: "Q",
        minOffQueen: "A",
        minSuitedJack: "T",
        minOffJack: "A",
        minSuitedTen: "9",
        minOffTen: "A",
        minSuitedNine: "8",
        minSuitedEight: "7",
        minSuitedSeven: "6",
        minSuitedSix: "5",
        minSuitedFive: "4",
        minSuitedFour: "4",
        minSuitedConnectorGap1: false,
        minSuitedConnectorGap2: false,
      },
    },
  };
  return table[depth][position];
}

function meetsRankThreshold(rank: Rank, threshold: Rank): boolean {
  return rankIndex(rank) <= rankIndex(threshold);
}

function isSuitedConnector(high: Rank, low: Rank, gap: number): boolean {
  const diff = rankIndex(low) - rankIndex(high);
  return diff === gap;
}

function classifyHand(key: HandKey, rules: RankThreshold): PushFoldAction {
  const { high, low, suited } = parseHandKey(key);

  if (suited === null) {
    return meetsRankThreshold(high, rules.minPair) ? "push" : "fold";
  }

  if (high === "A") {
    if (suited) return meetsRankThreshold(low, rules.minSuitedAce) ? "push" : "fold";
    return meetsRankThreshold(low, rules.minOffAce) ? "push" : "fold";
  }

  if (high === "K") {
    if (suited) return meetsRankThreshold(low, rules.minSuitedKing) ? "push" : "fold";
    return meetsRankThreshold(low, rules.minOffKing) ? "push" : "fold";
  }

  if (high === "Q") {
    if (suited) return meetsRankThreshold(low, rules.minSuitedQueen) ? "push" : "fold";
    return meetsRankThreshold(low, rules.minOffQueen) ? "push" : "fold";
  }

  if (high === "J") {
    if (suited) return meetsRankThreshold(low, rules.minSuitedJack) ? "push" : "fold";
    return meetsRankThreshold(low, rules.minOffJack) ? "push" : "fold";
  }

  if (high === "T") {
    if (suited) return meetsRankThreshold(low, rules.minSuitedTen) ? "push" : "fold";
    return meetsRankThreshold(low, rules.minOffTen) ? "push" : "fold";
  }

  if (suited) {
    if (high === "9" && meetsRankThreshold(low, rules.minSuitedNine)) return "push";
    if (high === "8" && meetsRankThreshold(low, rules.minSuitedEight)) return "push";
    if (high === "7" && meetsRankThreshold(low, rules.minSuitedSeven)) return "push";
    if (high === "6" && meetsRankThreshold(low, rules.minSuitedSix)) return "push";
    if (high === "5" && meetsRankThreshold(low, rules.minSuitedFive)) return "push";
    if (high === "4" && meetsRankThreshold(low, rules.minSuitedFour)) return "push";
    if (rules.minSuitedConnectorGap1 && isSuitedConnector(high, low, 1)) return "push";
    if (rules.minSuitedConnectorGap2 && isSuitedConnector(high, low, 2)) return "push";
  }

  return "fold";
}

const LOOKUP_TABLE: Record<StackDepth, Record<Position, Record<HandKey, PushFoldAction>>> =
  STACK_DEPTHS.reduce(
    (depthAcc, depth) => {
      depthAcc[depth] = {
        "sb-vs-bb": {},
        "btn-vs-blinds": {},
      };
      for (const position of ["sb-vs-bb", "btn-vs-blinds"] as Position[]) {
        const rules = pairThreshold(depth, position);
        const handMap: Record<HandKey, PushFoldAction> = {};
        for (const key of allHandKeys()) {
          handMap[key] = classifyHand(key, rules);
        }
        handMap["AA"] = "push";
        depthAcc[depth][position] = handMap;
      }
      return depthAcc;
    },
    {} as Record<StackDepth, Record<Position, Record<HandKey, PushFoldAction>>>,
  );

export function getPushFoldAction(
  stackBb: number,
  position: Position,
  row: number,
  col: number,
): PushFoldAction {
  const depth = snapStackDepth(stackBb);
  const key = handKeyFromIndices(row, col);
  return LOOKUP_TABLE[depth][position][key];
}

export function getPushFoldActionByKey(
  stackBb: number,
  position: Position,
  key: HandKey,
): PushFoldAction {
  const depth = snapStackDepth(stackBb);
  return LOOKUP_TABLE[depth][position][key];
}

export function pushRangeComboShare(stackBb: number, position: Position): number {
  const depth = snapStackDepth(stackBb);
  const table = LOOKUP_TABLE[depth][position];
  let pushing = 0;
  let total = 0;
  for (const key of allHandKeys()) {
    const combos = key.length === 2 ? 6 : key.endsWith("s") ? 4 : 12;
    total += combos;
    if (table[key] === "push") pushing += combos;
  }
  return pushing / total;
}
