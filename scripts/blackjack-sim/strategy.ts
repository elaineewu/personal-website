/**
 * Simplified heuristic approximation of basic strategy — not a complete basic-strategy
 * table. Used for simulation to study count-based betting, not as a strategy guide.
 *
 * Current rules (still simplified; omits surrender, re-splitting, soft doubling, and
 * many upcard-specific edge cases):
 * - Hard totals: hit below 12; stand 17+; stand 12 vs dealer 4–6; stand 13–16 vs
 *   dealer 2–6; hit 12–16 vs dealer 7–A
 * - Soft totals: stand on soft 18+; hit below soft 18
 * - Pairs: always split Aces and 8s; never split 5s or 10-value pairs; split 2s, 3s,
 *   6s, 7s, and 9s vs dealer 2–6; otherwise treat as hand total
 * - Double: hard 10 or 11 vs dealer 2–9 (when allowed)
 */

import type { Card } from "./types";
import { handTotal, isPair, isTenValuePair, pairRank } from "./hand";

export type PlayerAction = "hit" | "stand" | "double" | "split";

function dealerUpcardValue(upcard: Card): number {
  return upcard.value === 11 ? 11 : upcard.value;
}

function isWeakDealerUpcard(dealerUp: number): boolean {
  return dealerUp >= 2 && dealerUp <= 6;
}

function shouldSplitPair(cards: Card[], dealerUp: number): boolean {
  if (!isPair(cards)) {
    return false;
  }
  const rank = pairRank(cards);

  if (rank === "A" || rank === "8") {
    return true;
  }
  if (rank === "5" || isTenValuePair(cards)) {
    return false;
  }

  if (isWeakDealerUpcard(dealerUp)) {
    return (
      rank === "2" ||
      rank === "3" ||
      rank === "6" ||
      rank === "7" ||
      rank === "9"
    );
  }

  return false;
}

function hardTotalAction(total: number, dealerUp: number): PlayerAction {
  if (total < 12) {
    return "hit";
  }
  if (total >= 17) {
    return "stand";
  }
  if (total === 12) {
    if (dealerUp >= 4 && dealerUp <= 6) {
      return "stand";
    }
    return "hit";
  }
  if (total >= 13 && total <= 16) {
    if (isWeakDealerUpcard(dealerUp)) {
      return "stand";
    }
    return "hit";
  }
  return "hit";
}

function softTotalAction(total: number): PlayerAction {
  if (total >= 18) {
    return "stand";
  }
  return "hit";
}

export function getInitialAction(
  cards: Card[],
  dealerUpcard: Card,
  canDouble: boolean,
): PlayerAction {
  const dealerUp = dealerUpcardValue(dealerUpcard);

  if (isPair(cards) && shouldSplitPair(cards, dealerUp)) {
    return "split";
  }

  const { total, isSoft } = handTotal(cards);

  if (!isSoft && canDouble && (total === 10 || total === 11) && dealerUp >= 2 && dealerUp <= 9) {
    return "double";
  }

  if (isSoft) {
    return softTotalAction(total);
  }

  return hardTotalAction(total, dealerUp);
}

export function getHitStandAction(cards: Card[], dealerUpcard: Card): PlayerAction {
  const { total, isSoft } = handTotal(cards);
  const dealerUp = dealerUpcardValue(dealerUpcard);

  if (isSoft) {
    return softTotalAction(total);
  }

  return hardTotalAction(total, dealerUp);
}

export function isAcePair(cards: Card[]): boolean {
  return isPair(cards) && pairRank(cards) === "A";
}
