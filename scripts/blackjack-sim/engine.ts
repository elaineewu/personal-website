import type { Card } from "./types";
import { getBetSize } from "./betting";
import { dealerShouldHit } from "./dealer";
import { handTotal, isBlackjack } from "./hand";
import { createRng, type Rng } from "./rng";
import {
  computeTrueCount,
  createShoe,
  hiLoValue,
  needsReshuffle,
} from "./shoe";
import {
  getHitStandAction,
  getInitialAction,
  isAcePair,
  type PlayerAction,
} from "./strategy";
import type {
  HandOutcome,
  HandResult,
  SimulationConfig,
  SimulationOutput,
  SummaryStats,
} from "./types";

interface ShoeState {
  cards: Card[];
  drawIndex: number;
  initialSize: number;
  runningCount: number;
}

interface ShoeContext {
  shoe: ShoeState;
  penetration: number;
  numDecks: number;
  rng: Rng;
}

interface PlayedHand {
  cards: Card[];
  bet: number;
  doubled: boolean;
  stood: boolean;
  busted: boolean;
}

function ensureShoeReady(
  shoe: ShoeState,
  penetration: number,
  numDecks: number,
  rng: Rng,
  minCardsRequired: number,
): void {
  const remaining = cardsRemainingInShoe(shoe);
  if (
    remaining < minCardsRequired ||
    needsReshuffle(shoe.initialSize, remaining, penetration)
  ) {
    reshuffleShoe(shoe, numDecks, rng);
  }
}

function drawCard(ctx: ShoeContext): Card {
  ensureShoeReady(ctx.shoe, ctx.penetration, ctx.numDecks, ctx.rng, 1);
  if (ctx.shoe.drawIndex >= ctx.shoe.cards.length) {
    reshuffleShoe(ctx.shoe, ctx.numDecks, ctx.rng);
  }
  const card = ctx.shoe.cards[ctx.shoe.drawIndex];
  if (!card) {
    throw new Error(
      `Shoe draw failed: index=${ctx.shoe.drawIndex}, len=${ctx.shoe.cards.length}, initial=${ctx.shoe.initialSize}`,
    );
  }
  ctx.shoe.drawIndex += 1;
  ctx.shoe.runningCount += hiLoValue(card.rank);
  return card;
}

function cardsRemainingInShoe(shoe: ShoeState): number {
  return shoe.initialSize - shoe.drawIndex;
}

function reshuffleShoe(shoe: ShoeState, numDecks: number, rng: Rng): void {
  shoe.cards = createShoe(numDecks, rng);
  shoe.drawIndex = 0;
  shoe.initialSize = shoe.cards.length;
  shoe.runningCount = 0;
}

function maybeReshuffle(ctx: ShoeContext): void {
  ensureShoeReady(ctx.shoe, ctx.penetration, ctx.numDecks, ctx.rng, 30);
}

function playPlayerHand(
  initialCards: Card[],
  dealerUpcard: Card,
  bet: number,
  ctx: ShoeContext,
  splitFromAces: boolean,
): PlayedHand {
  const played: PlayedHand = {
    cards: [...initialCards],
    bet,
    doubled: false,
    stood: false,
    busted: false,
  };

  if (splitFromAces) {
    played.cards.push(drawCard(ctx));
    played.stood = true;
    return played;
  }

  let canDouble = true;
  let action = getInitialAction(played.cards, dealerUpcard, canDouble);

  while (true) {
    if (action === "split") {
      break;
    }

    if (action === "double") {
      played.bet *= 2;
      played.doubled = true;
      played.cards.push(drawCard(ctx));
      played.busted = handTotal(played.cards).total > 21;
      played.stood = true;
      break;
    }

    if (action === "hit") {
      played.cards.push(drawCard(ctx));
      if (handTotal(played.cards).total > 21) {
        played.busted = true;
        break;
      }
      canDouble = false;
      action = getHitStandAction(played.cards, dealerUpcard);
      continue;
    }

    played.stood = true;
    break;
  }

  return played;
}

function playSplitHands(
  pairCards: Card[],
  dealerUpcard: Card,
  bet: number,
  ctx: ShoeContext,
): PlayedHand[] {
  const splitAces = isAcePair(pairCards);
  const hands: PlayedHand[] = [];

  for (let i = 0; i < 2; i += 1) {
    const initial = [pairCards[i], drawCard(ctx)];
    hands.push(playPlayerHand(initial, dealerUpcard, bet, ctx, splitAces));
  }

  return hands;
}

function playDealer(dealerCards: Card[], ctx: ShoeContext): Card[] {
  const cards = [...dealerCards];
  while (dealerShouldHit(cards)) {
    cards.push(drawCard(ctx));
  }
  return cards;
}

function compareHandToDealer(playerCards: Card[], dealerCards: Card[]): HandOutcome {
  const player = handTotal(playerCards);
  const dealer = handTotal(dealerCards);

  if (player.total > 21) {
    return "lose";
  }
  if (dealer.total > 21) {
    return "win";
  }
  if (player.total > dealer.total) {
    return "win";
  }
  if (player.total < dealer.total) {
    return "lose";
  }
  return "push";
}

function settleHand(bankroll: number, bet: number, outcome: HandOutcome): number {
  if (bet === 0) {
    return bankroll;
  }

  switch (outcome) {
    case "win":
      return bankroll + bet;
    case "lose":
      return Math.max(0, bankroll - bet);
    case "push":
      return bankroll;
    case "blackjack":
      return bankroll + bet * 1.5;
    default: {
      const _exhaustive: never = outcome;
      return _exhaustive;
    }
  }
}

function resolveInitialBlackjacks(
  playerCards: Card[],
  dealerCards: Card[],
  bet: number,
  bankroll: number,
): { outcome: HandOutcome; bankrollAfter: number; totalWagered: number } | null {
  const playerBJ = isBlackjack(playerCards);
  const dealerBJ = isBlackjack(dealerCards);

  if (!playerBJ && !dealerBJ) {
    return null;
  }

  if (playerBJ && dealerBJ) {
    return {
      outcome: "push",
      bankrollAfter: settleHand(bankroll, bet, "push"),
      totalWagered: bet,
    };
  }
  if (playerBJ) {
    return {
      outcome: "blackjack",
      bankrollAfter: settleHand(bankroll, bet, "blackjack"),
      totalWagered: bet,
    };
  }
  return {
    outcome: "lose",
    bankrollAfter: settleHand(bankroll, bet, "lose"),
    totalWagered: bet,
  };
}

function classifyOutcomeFromProfit(profit: number, totalBet: number): HandOutcome {
  if (totalBet === 0) {
    return "push";
  }
  if (profit > 0) {
    return "win";
  }
  if (profit < 0) {
    return "lose";
  }
  return "push";
}

function playOneHand(
  ctx: ShoeContext,
  bet: number,
  bankrollBefore: number,
): { outcome: HandOutcome; bankrollAfter: number; totalWagered: number } {
  const playerCards: Card[] = [drawCard(ctx)];
  const dealerUpcard = drawCard(ctx);
  playerCards.push(drawCard(ctx));
  const dealerHole = drawCard(ctx);
  const dealerCards: Card[] = [dealerUpcard, dealerHole];

  const early = resolveInitialBlackjacks(playerCards, dealerCards, bet, bankrollBefore);
  if (early) {
    return early;
  }

  const initialAction: PlayerAction = getInitialAction(playerCards, dealerUpcard, true);

  const playedHands: PlayedHand[] =
    initialAction === "split"
      ? playSplitHands(playerCards, dealerUpcard, bet, ctx)
      : [playPlayerHand(playerCards, dealerUpcard, bet, ctx, false)];

  const allBusted = playedHands.every((h) => h.busted);
  const finalDealer = allBusted ? dealerCards : playDealer(dealerCards, ctx);

  let currentBankroll = bankrollBefore;
  for (const hand of playedHands) {
    const outcome = hand.busted
      ? "lose"
      : compareHandToDealer(hand.cards, finalDealer);
    currentBankroll = settleHand(currentBankroll, hand.bet, outcome);
  }

  const totalWagered = playedHands.reduce((sum, h) => sum + h.bet, 0);
  const profit = currentBankroll - bankrollBefore;
  const outcome = classifyOutcomeFromProfit(profit, totalWagered);

  return { outcome, bankrollAfter: currentBankroll, totalWagered };
}

function computeMaxDrawdown(bankrollSeries: number[]): number {
  let peak = bankrollSeries[0] ?? 0;
  let maxDrawdown = 0;

  for (const value of bankrollSeries) {
    if (value > peak) {
      peak = value;
    }
    const drawdown = peak - value;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  return maxDrawdown;
}

/**
 * Rough heuristic for risk of ruin — not a rigorous formula.
 * Returns 0 if bankroll never dropped below 10% of starting; otherwise scales
 * with how close the minimum bankroll got to zero relative to the ruin threshold.
 */
function estimateRiskOfRuin(
  startingBankroll: number,
  minBankrollObserved: number,
): number {
  const ruinThreshold = startingBankroll * 0.1;

  if (minBankrollObserved >= ruinThreshold) {
    return 0;
  }

  const proximity = 1 - minBankrollObserved / ruinThreshold;
  return Math.min(1, Math.max(0, proximity));
}

function computeSummaryStats(
  config: SimulationConfig,
  handResults: HandResult[],
  bankrollSeries: number[],
  minBankrollObserved: number,
): SummaryStats {
  const startingBankroll = config.bankroll;
  const handsActuallyPlayed = handResults.length;
  const finalBankroll =
    handResults.length > 0
      ? handResults[handResults.length - 1].bankrollAfter
      : startingBankroll;

  const totalWagered = handResults.reduce((sum, h) => sum + h.totalWagered, 0);
  const edgeRealized =
    totalWagered > 0 ? (finalBankroll - startingBankroll) / totalWagered : 0;

  const wentBust =
    handsActuallyPlayed < config.numHands && finalBankroll <= 0;

  return {
    finalBankroll,
    maxDrawdown: computeMaxDrawdown(bankrollSeries),
    totalHandsPlayed: config.numHands,
    handsActuallyPlayed,
    wentBust,
    edgeRealized,
    riskOfRuinEstimate: estimateRiskOfRuin(startingBankroll, minBankrollObserved),
  };
}

export function runSimulation(config: SimulationConfig, seed: number): SimulationOutput {
  const rng = createRng(seed);
  const ctx: ShoeContext = {
    shoe: {
      cards: createShoe(config.numDecks, rng),
      drawIndex: 0,
      initialSize: config.numDecks * 52,
      runningCount: 0,
    },
    penetration: config.penetration,
    numDecks: config.numDecks,
    rng,
  };

  let bankroll = config.bankroll;
  let minBankrollObserved = bankroll;
  const bankrollSeries: number[] = [bankroll];
  const handResults: HandResult[] = [];

  for (let hand = 0; hand < config.numHands; hand += 1) {
    if (bankroll <= 0) {
      break;
    }

    maybeReshuffle(ctx);

    const trueCountAtBet = computeTrueCount(
      ctx.shoe.runningCount,
      cardsRemainingInShoe(ctx.shoe),
    );
    const rawBetSize = getBetSize(
      config.bettingStrategy,
      trueCountAtBet,
      config.baseBet,
      bankroll,
    );
    const betSize = Math.min(rawBetSize, bankroll);

    const { outcome, bankrollAfter, totalWagered } = playOneHand(ctx, betSize, bankroll);

    bankroll = bankrollAfter;
    minBankrollObserved = Math.min(minBankrollObserved, bankroll);
    bankrollSeries.push(bankroll);

    handResults.push({
      trueCountAtBet,
      betSize,
      totalWagered,
      outcome,
      bankrollAfter: bankroll,
    });
  }

  return {
    config,
    handResults,
    summaryStats: computeSummaryStats(
      config,
      handResults,
      bankrollSeries,
      minBankrollObserved,
    ),
  };
}
