import type { Card, CardRank } from "./types";

export interface HandTotal {
  total: number;
  isSoft: boolean;
}

export function handTotal(cards: Card[]): HandTotal {
  let total = 0;
  let aces = 0;

  for (const card of cards) {
    total += card.value;
    if (card.rank === "A") {
      aces += 1;
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  const isSoft = aces > 0 && total <= 21;
  return { total, isSoft };
}

export function isBlackjack(cards: Card[]): boolean {
  return cards.length === 2 && handTotal(cards).total === 21;
}

export function isPair(cards: Card[]): boolean {
  if (cards.length !== 2) {
    return false;
  }
  return cards[0].rank === cards[1].rank;
}

export function pairRank(cards: Card[]): CardRank {
  return cards[0].rank;
}

export function isTenValuePair(cards: Card[]): boolean {
  if (!isPair(cards)) {
    return false;
  }
  const rank = pairRank(cards);
  return rank === "10" || rank === "J" || rank === "Q" || rank === "K";
}
