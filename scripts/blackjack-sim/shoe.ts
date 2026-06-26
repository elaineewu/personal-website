import type { Card, CardRank } from "./types";
import type { Rng } from "./rng";

const RANKS: CardRank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

const BLACKJACK_VALUES: Record<CardRank, number> = {
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  J: 10,
  Q: 10,
  K: 10,
  A: 11,
};

/** Hi-Lo tag value for a card rank. */
export function hiLoValue(rank: CardRank): number {
  if (rank === "2" || rank === "3" || rank === "4" || rank === "5" || rank === "6") {
    return 1;
  }
  if (rank === "7" || rank === "8" || rank === "9") {
    return 0;
  }
  return -1;
}

function createSingleDeck(): Card[] {
  return RANKS.map((rank) => ({
    rank,
    value: BLACKJACK_VALUES[rank],
  }));
}

function shuffleInPlace(cards: Card[], rng: Rng): void {
  for (let i = cards.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
}

export function createShoe(numDecks: number, rng: Rng): Card[] {
  const shoe: Card[] = [];
  for (let d = 0; d < numDecks; d += 1) {
    shoe.push(...createSingleDeck());
  }
  shuffleInPlace(shoe, rng);
  return shoe;
}

export function decksRemaining(cardsLeft: number): number {
  return Math.max(1, cardsLeft / 52);
}

export function computeTrueCount(runningCount: number, cardsLeft: number): number {
  return runningCount / decksRemaining(cardsLeft);
}

export function needsReshuffle(
  initialShoeSize: number,
  cardsRemainingInShoe: number,
  penetration: number,
): boolean {
  const cardsDealt = initialShoeSize - cardsRemainingInShoe;
  return cardsDealt / initialShoeSize >= penetration;
}
