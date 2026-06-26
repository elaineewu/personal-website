import type { Card } from "./types";
import { handTotal } from "./hand";

export function dealerShouldHit(cards: Card[]): boolean {
  const { total, isSoft } = handTotal(cards);

  if (total < 17) {
    return true;
  }

  // Hit soft 17 (Ace + 6)
  if (total === 17 && isSoft) {
    return true;
  }

  return false;
}
