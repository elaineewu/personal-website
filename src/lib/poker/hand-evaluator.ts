import type { Card, Rank } from "./hands";
import { RANKS, rankIndex } from "./hands";

type HandCategory =
  | "straight-flush"
  | "four-of-a-kind"
  | "full-house"
  | "flush"
  | "straight"
  | "three-of-a-kind"
  | "two-pair"
  | "one-pair"
  | "high-card";

const CATEGORY_RANK: Record<HandCategory, number> = {
  "straight-flush": 8,
  "four-of-a-kind": 7,
  "full-house": 6,
  flush: 5,
  straight: 4,
  "three-of-a-kind": 3,
  "two-pair": 2,
  "one-pair": 1,
  "high-card": 0,
};

export type EvaluatedHand = {
  score: number;
  category: HandCategory;
};

function cardRankValue(rank: Rank): number {
  return 14 - rankIndex(rank);
}

function combinations<T>(items: T[], size: number): T[][] {
  if (size === 0) return [[]];
  if (items.length < size) return [];
  const [first, ...rest] = items;
  const withFirst = combinations(rest, size - 1).map((combo) => [first, ...combo]);
  const withoutFirst = combinations(rest, size);
  return [...withFirst, ...withoutFirst];
}

function evaluateFive(cards: Card[]): EvaluatedHand {
  const values = cards.map((card) => cardRankValue(card.rank)).sort((a, b) => b - a);
  const rankCounts = new Map<number, number>();
  const suitCounts = new Map<string, number>();

  for (const card of cards) {
    const value = cardRankValue(card.rank);
    rankCounts.set(value, (rankCounts.get(value) ?? 0) + 1);
    suitCounts.set(card.suit, (suitCounts.get(card.suit) ?? 0) + 1);
  }

  const counts = [...rankCounts.values()].sort((a, b) => b - a);
  const isFlush = [...suitCounts.values()].some((count) => count === 5);

  const uniqueValues = [...new Set(values)].sort((a, b) => b - a);
  let straightHigh = 0;

  if (uniqueValues.length >= 5) {
    for (let i = 0; i <= uniqueValues.length - 5; i++) {
      const slice = uniqueValues.slice(i, i + 5);
      if (slice[0] - slice[4] === 4) {
        straightHigh = slice[0];
        break;
      }
    }
    if (straightHigh === 0 && uniqueValues.includes(14) && uniqueValues.includes(5)) {
      const wheel = [5, 4, 3, 2];
      if (wheel.every((value) => uniqueValues.includes(value))) {
        straightHigh = 5;
      }
    }
  }

  const isStraight = straightHigh > 0;
  let category: HandCategory = "high-card";

  if (isFlush && isStraight) category = "straight-flush";
  else if (counts[0] === 4) category = "four-of-a-kind";
  else if (counts[0] === 3 && counts[1] === 2) category = "full-house";
  else if (isFlush) category = "flush";
  else if (isStraight) category = "straight";
  else if (counts[0] === 3) category = "three-of-a-kind";
  else if (counts[0] === 2 && counts[1] === 2) category = "two-pair";
  else if (counts[0] === 2) category = "one-pair";

  const kickers = [...rankCounts.entries()]
    .sort((a, b) => {
      if (a[1] !== b[1]) return b[1] - a[1];
      return b[0] - a[0];
    })
    .flatMap(([value, count]) => Array(count).fill(value));

  const score =
    CATEGORY_RANK[category] * 1_000_000 +
    kickers.reduce((total, value, index) => total + value * 15 ** (4 - index), 0);

  return { score, category };
}

export function evaluateBestHand(cards: Card[]): EvaluatedHand {
  if (cards.length < 5) {
    throw new Error("Need at least five cards to evaluate a hand");
  }
  let best = evaluateFive(cards.slice(0, 5));
  for (const combo of combinations(cards, 5)) {
    const evaluated = evaluateFive(combo);
    if (evaluated.score > best.score) best = evaluated;
  }
  return best;
}

export function compareHands(left: Card[], right: Card[]): number {
  return evaluateBestHand(left).score - evaluateBestHand(right).score;
}

export function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function shuffleInPlace<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

export { RANKS };
