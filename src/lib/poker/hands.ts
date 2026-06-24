export const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"] as const;
export const SUITS = ["s", "h", "d", "c"] as const;

export type Rank = (typeof RANKS)[number];
export type Suit = (typeof SUITS)[number];

export type Position = "sb-vs-bb" | "btn-vs-blinds";

export type Card = { rank: Rank; suit: Suit };

export type HandKey = string;

export function handKeyFromIndices(row: number, col: number): HandKey {
  const high = RANKS[Math.min(row, col)];
  const low = RANKS[Math.max(row, col)];
  if (row === col) return `${high}${low}`;
  if (row < col) return `${high}${low}s`;
  return `${high}${low}o`;
}

export function handLabelFromIndices(row: number, col: number): string {
  const key = handKeyFromIndices(row, col);
  if (key.length === 2) return `${key[0]}${suitSymbol("s")}${key[1]}${suitSymbol("h")}`;
  const suited = key.endsWith("s");
  const high = key[0];
  const low = key[1];
  if (suited) {
    return `${high}${suitSymbol("s")}${low}${suitSymbol("s")}`;
  }
  return `${high}${suitSymbol("s")}${low}${suitSymbol("h")}`;
}

function suitSymbol(suit: Suit): string {
  switch (suit) {
    case "s":
      return "♠";
    case "h":
      return "♥";
    case "d":
      return "♦";
    case "c":
      return "♣";
  }
}

export function rankIndex(rank: Rank): number {
  return RANKS.indexOf(rank);
}

export function parseHandKey(key: HandKey): { high: Rank; low: Rank; suited: boolean | null } {
  const high = key[0] as Rank;
  const low = key[1] as Rank;
  if (key.length === 2) return { high, low, suited: null };
  return { high, low, suited: key.endsWith("s") };
}

export function comboCount(key: HandKey): number {
  if (key.length === 2) return 6;
  return key.endsWith("s") ? 4 : 12;
}

export function allHandKeys(): HandKey[] {
  const keys: HandKey[] = [];
  for (let row = 0; row < 13; row++) {
    for (let col = 0; col < 13; col++) {
      keys.push(handKeyFromIndices(row, col));
    }
  }
  return keys;
}

export function buildDeck(excluded: Card[] = []): Card[] {
  const deck: Card[] = [];
  for (const rank of RANKS) {
    for (const suit of SUITS) {
      if (!excluded.some((card) => card.rank === rank && card.suit === suit)) {
        deck.push({ rank, suit });
      }
    }
  }
  return deck;
}

export function cardsForHandKey(key: HandKey, excluded: Card[] = []): Card[][] {
  const { high, low, suited } = parseHandKey(key);
  const combos: Card[][] = [];

  if (suited === null) {
    for (let i = 0; i < SUITS.length; i++) {
      for (let j = i + 1; j < SUITS.length; j++) {
        const cards = [
          { rank: high, suit: SUITS[i] },
          { rank: low, suit: SUITS[j] },
        ];
        if (!cards.some((card) => excluded.some((e) => e.rank === card.rank && e.suit === card.suit))) {
          combos.push(cards);
        }
      }
    }
    return combos;
  }

  if (suited) {
    for (const suit of SUITS) {
      const cards = [
        { rank: high, suit },
        { rank: low, suit },
      ];
      if (!cards.some((card) => excluded.some((e) => e.rank === card.rank && e.suit === card.suit))) {
        combos.push(cards);
      }
    }
    return combos;
  }

  for (const suit1 of SUITS) {
    for (const suit2 of SUITS) {
      if (suit1 === suit2) continue;
      const cards = [
        { rank: high, suit: suit1 },
        { rank: low, suit: suit2 },
      ];
      if (!cards.some((card) => excluded.some((e) => e.rank === card.rank && e.suit === card.suit))) {
        combos.push(cards);
      }
    }
  }
  return combos;
}
