/**
 * Monte Carlo equity estimation against a simplified opponent calling range.
 *
 * The calling range approximates the top ~15% of starting-hand combinations
 * (pairs 88+, AK–AT, A9s+, KQs/KJs/KTs, QJs/QTs, JTs, AJo, KQo) rather than
 * a full equilibrium-derived calling range.
 */

import { compareHands, randomItem, shuffleInPlace } from "./hand-evaluator";
import type { Card, HandKey, Position } from "./hands";
import { buildDeck, cardsForHandKey, comboCount } from "./hands";

const MONTE_CARLO_TRIALS = 5000;

const TOP_CALLING_RANGE: HandKey[] = [
  "AA",
  "KK",
  "QQ",
  "JJ",
  "TT",
  "99",
  "88",
  "77",
  "AKs",
  "AKo",
  "AQs",
  "AQo",
  "AJs",
  "AJo",
  "ATs",
  "ATo",
  "A9s",
  "A8s",
  "A7s",
  "KQs",
  "KQo",
  "KJs",
  "KTs",
  "QJs",
  "QTs",
  "JTs",
];

function weightedCallingKeys(): HandKey[] {
  const keys: HandKey[] = [];
  for (const key of TOP_CALLING_RANGE) {
    for (let i = 0; i < comboCount(key); i++) {
      keys.push(key);
    }
  }
  return keys;
}

const CALLING_KEY_POOL = weightedCallingKeys();

function pickVillainHand(excluded: Card[]): Card[] | null {
  for (let attempt = 0; attempt < 40; attempt++) {
    const key = randomItem(CALLING_KEY_POOL);
    const combos = cardsForHandKey(key, excluded);
    if (combos.length === 0) continue;
    return randomItem(combos);
  }
  return null;
}

export function estimateEquityVsCallingRange(heroCards: Card[], trials = MONTE_CARLO_TRIALS): number {
  let wins = 0;
  let ties = 0;
  let played = 0;

  for (let trial = 0; trial < trials; trial++) {
    const villainCards = pickVillainHand(heroCards);
    if (!villainCards) continue;

    const blocked = [...heroCards, ...villainCards];
    const deck = shuffleInPlace(buildDeck(blocked));
    const board = deck.slice(0, 5);
    const hero = [...heroCards, ...board];
    const villain = [...villainCards, ...board];
    const result = compareHands(hero, villain);
    played++;
    if (result > 0) wins++;
    else if (result === 0) ties++;
  }

  if (played === 0) return 0;
  return (wins + ties / 2) / played;
}

export function estimateEquityForHandKey(
  key: HandKey,
  trials = MONTE_CARLO_TRIALS,
): { equity: number; heroCards: Card[] } {
  const combos = cardsForHandKey(key);
  const heroCards = combos[0];
  return {
    heroCards,
    equity: estimateEquityVsCallingRange(heroCards, trials),
  };
}

export function estimateFoldProbability(
  stackBb: number,
  position: Position,
): number {
  let callingCombos = 0;
  let totalCombos = 0;

  for (const key of TOP_CALLING_RANGE) {
    callingCombos += comboCount(key);
  }
  totalCombos = 1326;
  const baseCallRate = callingCombos / totalCombos;
  void stackBb;

  if (position === "btn-vs-blinds") {
    const sbFoldRate = 0.72;
    const bbCallRate = baseCallRate * 1.15;
    return 1 - (1 - sbFoldRate) * bbCallRate;
  }

  return Math.max(0.35, Math.min(0.85, 1 - baseCallRate * 1.1));
}

export { MONTE_CARLO_TRIALS, TOP_CALLING_RANGE };
