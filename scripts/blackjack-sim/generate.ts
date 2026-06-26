import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

import { outcomeProfitMultiple } from "./betting";
import { runSimulation } from "./engine";
import type {
  BettingStrategy,
  EdgeCurveOutput,
  HandResult,
  SimulationConfig,
  SimulationOutput,
  TrueCountBucket,
} from "./types";

const OUTPUT_DIR = join(process.cwd(), "src/data/blackjack-sim");
const FIXED_SEED = 42;

const NUM_DECKS = 6;
const PENETRATION = 0.75;
const BASE_BET = 10;
const STARTING_BANKROLL = 10_000;
const BETTING_STRATEGIES: BettingStrategy[] = ["flat", "spread", "kelly"];
const HAND_CHECKPOINTS = [1_000, 10_000, 100_000, 1_000_000];

function baseConfig(
  numHands: number,
  bettingStrategy: BettingStrategy,
): SimulationConfig {
  return {
    numDecks: NUM_DECKS,
    penetration: PENETRATION,
    numHands,
    bettingStrategy,
    baseBet: BASE_BET,
    bankroll: STARTING_BANKROLL,
  };
}

function seedForCheckpoint(numHands: number): number {
  // Distinct seed per checkpoint; shared across strategies for paired comparison.
  return FIXED_SEED + numHands;
}

/**
 * Builds the edge-vs-true-count curve from flat-betting hands only. Flat betting
 * wagers the same amount at every count, so it isolates the game's underlying
 * edge at each true count without confounding from spread/Kelly bet sizing.
 *
 * Buckets use Math.round on raw true count (clamped to [-10, 10]), so e.g. bucket
 * +2 includes raw true counts from approximately +1.5 to +2.49.
 *
 * Sit-outs (betSize === 0) are excluded entirely — they carry no wagering signal.
 * Edge per bucket is dollar-weighted: sum(net result) / sum(totalWagered).
 *
 * Confidence intervals will be visibly wide at extreme true counts (e.g. -10, +9,
 * +10) due to small sample sizes — that is expected and informative, not a bug.
 * Those tails are precisely where we have the least data and convergence is weakest.
 */
function perHandOutcomePerUnit(hand: HandResult): number {
  return (outcomeProfitMultiple(hand.outcome) * hand.totalWagered) / hand.totalWagered;
}

function sampleStandardDeviation(values: number[]): number {
  if (values.length < 2) {
    return 0;
  }
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const squaredDiffs = values.reduce((sum, value) => sum + (value - mean) ** 2, 0);
  return Math.sqrt(squaredDiffs / (values.length - 1));
}

function aggregateEdgeCurve(handResults: HandResult[]): EdgeCurveOutput {
  const perHandValues = new Map<number, number[]>();
  const bucketTotals = new Map<number, { netResult: number; totalWagered: number; count: number }>();

  for (let tc = -10; tc <= 10; tc += 1) {
    perHandValues.set(tc, []);
    bucketTotals.set(tc, { netResult: 0, totalWagered: 0, count: 0 });
  }

  for (const hand of handResults) {
    if (hand.betSize === 0) {
      continue;
    }

    const bucketKey = Math.max(-10, Math.min(10, Math.round(hand.trueCountAtBet)));
    const totals = bucketTotals.get(bucketKey);
    const values = perHandValues.get(bucketKey);
    if (!totals || !values) {
      continue;
    }

    const netResult = outcomeProfitMultiple(hand.outcome) * hand.totalWagered;
    totals.netResult += netResult;
    totals.totalWagered += hand.totalWagered;
    totals.count += 1;
    values.push(perHandOutcomePerUnit(hand));
  }

  const result: TrueCountBucket[] = [];
  for (let tc = -10; tc <= 10; tc += 1) {
    const totals = bucketTotals.get(tc) ?? { netResult: 0, totalWagered: 0, count: 0 };
    const values = perHandValues.get(tc) ?? [];
    const averageOutcomePerUnit =
      totals.totalWagered > 0 ? totals.netResult / totals.totalWagered : 0;
    const standardError =
      totals.count > 0
        ? sampleStandardDeviation(values) / Math.sqrt(totals.count)
        : 0;
    const margin = 1.96 * standardError;

    result.push({
      trueCount: tc,
      handCount: totals.count,
      averageOutcomePerUnit,
      standardError,
      confidenceInterval95: [
        averageOutcomePerUnit - margin,
        averageOutcomePerUnit + margin,
      ],
    });
  }

  return { buckets: result };
}

function printSummaryTable(allOutputs: SimulationOutput[]): void {
  console.log("\nSimulation summary (all checkpoints):\n");
  console.log(
    "Checkpoint".padEnd(12),
    "Strategy".padEnd(10),
    "Final Bankroll".padStart(16),
    "Max Drawdown".padStart(14),
    "Edge Realized".padStart(14),
    "Hands Played".padStart(14),
    "Target Hands".padStart(14),
    "Went Bust".padStart(10),
  );
  console.log("-".repeat(106));

  for (const numHands of HAND_CHECKPOINTS) {
    for (const strategy of BETTING_STRATEGIES) {
      const output = allOutputs.find(
        (o) =>
          o.config.numHands === numHands &&
          o.config.bettingStrategy === strategy,
      );
      if (!output) {
        continue;
      }
      const {
        finalBankroll,
        maxDrawdown,
        edgeRealized,
        handsActuallyPlayed,
        totalHandsPlayed,
        wentBust,
      } = output.summaryStats;
      console.log(
        String(numHands).padEnd(12),
        strategy.padEnd(10),
        finalBankroll.toFixed(2).padStart(16),
        maxDrawdown.toFixed(2).padStart(14),
        edgeRealized.toFixed(4).padStart(14),
        String(handsActuallyPlayed).padStart(14),
        String(totalHandsPlayed).padStart(14),
        String(wentBust).padStart(10),
      );
    }
  }
}

function main(): void {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const flatHandResults: HandResult[] = [];
  const allOutputs: SimulationOutput[] = [];

  for (const numHands of HAND_CHECKPOINTS) {
    const seed = seedForCheckpoint(numHands);
    const checkpointOutputs: SimulationOutput[] = [];

    for (const bettingStrategy of BETTING_STRATEGIES) {
      const config = baseConfig(numHands, bettingStrategy);
      const output = runSimulation(config, seed);
      checkpointOutputs.push(output);
      allOutputs.push(output);
      if (bettingStrategy === "flat") {
        for (const handResult of output.handResults) {
          flatHandResults.push(handResult);
        }
      }
    }

    const filename = `results-${numHands}.json`;
    writeFileSync(
      join(OUTPUT_DIR, filename),
      JSON.stringify(checkpointOutputs, null, 2),
    );
    console.log(`Wrote ${filename}`);
  }

  const edgeCurve = aggregateEdgeCurve(flatHandResults);
  writeFileSync(
    join(OUTPUT_DIR, "results-edge-curve.json"),
    JSON.stringify(edgeCurve, null, 2),
  );
  console.log("Wrote results-edge-curve.json");

  printSummaryTable(allOutputs);

  console.log("\nExporting web bundles…");
  execSync("npx tsx scripts/blackjack-sim/export-web.ts", { stdio: "inherit" });
}

main();
