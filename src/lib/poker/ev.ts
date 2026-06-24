import { estimateEquityForHandKey, estimateFoldProbability, MONTE_CARLO_TRIALS } from "./equity";
import type { HandKey, Position } from "./hands";
import { getPushFoldActionByKey, snapStackDepth } from "./push-fold-ranges";

export type EvBreakdown = {
  handKey: HandKey;
  stackBb: number;
  snappedDepth: number;
  position: Position;
  tableAction: "push" | "fold";
  equity: number;
  foldProbability: number;
  callProbability: number;
  deadMoneyBb: number;
  amountWonIfFoldedBb: number;
  totalPotIfCalledBb: number;
  amountRiskedBb: number;
  potOddsRequiredEquity: number;
  evFoldTermBb: number;
  evCallTermBb: number;
  evTotalBb: number;
  verdict: string;
  potOddsDescription: string;
  shoveDescription: string;
  trials: number;
};

function spotEconomics(stackBb: number, position: Position) {
  if (position === "sb-vs-bb") {
    return {
      deadMoneyBb: 1.5,
      amountWonIfFoldedBb: 1,
      totalPotIfCalledBb: stackBb * 2,
      amountRiskedBb: stackBb,
      shoveDescription: `Assumes SB shoves ${stackBb.toFixed(1)} bb total into a 1.5 bb pot (0.5 bb SB blind + 1 bb BB blind).`,
      potOddsDescription: `If called, you risk ${stackBb.toFixed(1)} bb to win a ${(stackBb * 2).toFixed(1)} bb showdown pot.`,
    };
  }

  return {
    deadMoneyBb: 1.5,
    amountWonIfFoldedBb: 1.5,
    totalPotIfCalledBb: stackBb + stackBb + 1.5,
    amountRiskedBb: stackBb,
    shoveDescription: `Assumes BTN shoves ${stackBb.toFixed(1)} bb into a 1.5 bb pot (SB + BB blinds), modeled as a single caller.`,
    potOddsDescription: `If called, you risk ${stackBb.toFixed(1)} bb to win a ${(stackBb * 2 + 1.5).toFixed(1)} bb showdown pot (including posted blinds).`,
  };
}

export function calculatePushEv(
  handKey: HandKey,
  stackBb: number,
  position: Position,
): EvBreakdown {
  const { equity } = estimateEquityForHandKey(handKey, MONTE_CARLO_TRIALS);
  const economics = spotEconomics(stackBb, position);
  const foldProbability = estimateFoldProbability(stackBb, position);
  const callProbability = 1 - foldProbability;
  const potOddsRequiredEquity = economics.amountRiskedBb / economics.totalPotIfCalledBb;

  const evFoldTermBb = foldProbability * economics.amountWonIfFoldedBb;
  const evCallTermBb =
    callProbability * (equity * economics.totalPotIfCalledBb - economics.amountRiskedBb);
  const evTotalBb = evFoldTermBb + evCallTermBb;

  const tableAction = getPushFoldActionByKey(stackBb, position, handKey);
  const snappedDepth = snapStackDepth(stackBb);

  let verdict: string;
  if (evTotalBb > 0.05) {
    verdict = "Pushing is profitable here: the estimated EV is positive once fold equity and showdown equity are combined.";
  } else if (evTotalBb < -0.05) {
    verdict = "Folding is preferred here: the estimated EV of shoving is negative against the modeled calling range.";
  } else {
    verdict = "This hand is close to breakeven; small modeling changes could flip the recommendation.";
  }

  if (tableAction === "push" && evTotalBb > 0) {
    verdict = "Pushing aligns with both the equilibrium chart and the positive estimated EV.";
  } else if (tableAction === "fold" && evTotalBb < 0) {
    verdict = "Folding aligns with both the equilibrium chart and the negative estimated EV.";
  } else if (tableAction === "push" && evTotalBb <= 0) {
    verdict =
      "The chart pushes this hand, but the simplified EV model is slightly negative — a mixed strategy would likely indifferent here.";
  } else if (tableAction === "fold" && evTotalBb >= 0) {
    verdict =
      "The chart folds this hand, but the simplified EV model is slightly positive — real equilibrium play may mix here.";
  }

  return {
    handKey,
    stackBb,
    snappedDepth,
    position,
    tableAction,
    equity,
    foldProbability,
    callProbability,
    deadMoneyBb: economics.deadMoneyBb,
    amountWonIfFoldedBb: economics.amountWonIfFoldedBb,
    totalPotIfCalledBb: economics.totalPotIfCalledBb,
    amountRiskedBb: economics.amountRiskedBb,
    potOddsRequiredEquity,
    evFoldTermBb,
    evCallTermBb,
    evTotalBb,
    verdict,
    potOddsDescription: economics.potOddsDescription,
    shoveDescription: economics.shoveDescription,
    trials: MONTE_CARLO_TRIALS,
  };
}
