import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { HandResult, SimulationOutput, SummaryStats } from "./types";

const DATA_DIR = join(process.cwd(), "src/data/blackjack-sim");
const WEB_DIR = join(DATA_DIR, "web");
const HAND_CHECKPOINTS = [1_000, 10_000, 100_000, 1_000_000];
const MAX_CHART_POINTS = 5000;

export type WebStrategyResult = {
  summaryStats: SummaryStats;
  bankrollSeries: Array<{ hand: number; bankroll: number }>;
};

export type WebSimulationCheckpoint = {
  handCount: number;
  strategies: {
    flat: WebStrategyResult;
    spread: WebStrategyResult;
    kelly: WebStrategyResult;
  };
};

function buildBankrollSeries(
  handResults: HandResult[],
  initialBankroll: number,
): Array<{ hand: number; bankroll: number }> {
  const series = [{ hand: 0, bankroll: initialBankroll }];
  for (let index = 0; index < handResults.length; index += 1) {
    series.push({
      hand: index + 1,
      bankroll: handResults[index].bankrollAfter,
    });
  }
  return series;
}

function downsampleSeries(
  series: Array<{ hand: number; bankroll: number }>,
): Array<{ hand: number; bankroll: number }> {
  if (series.length <= MAX_CHART_POINTS) {
    return series;
  }

  const step = Math.ceil((series.length - 1) / (MAX_CHART_POINTS - 1));
  const sampled = [series[0]];

  for (let index = step; index < series.length - 1; index += step) {
    sampled.push(series[index]);
  }

  sampled.push(series[series.length - 1]);
  return sampled;
}

function toWebStrategy(output: SimulationOutput): WebStrategyResult {
  return {
    summaryStats: output.summaryStats,
    bankrollSeries: downsampleSeries(
      buildBankrollSeries(output.handResults, output.config.bankroll),
    ),
  };
}

function exportCheckpoint(numHands: number): void {
  const sourcePath = join(DATA_DIR, `results-${numHands}.json`);
  const outputs = JSON.parse(readFileSync(sourcePath, "utf8")) as SimulationOutput[];

  const flat = outputs.find((output) => output.config.bettingStrategy === "flat");
  const spread = outputs.find((output) => output.config.bettingStrategy === "spread");
  const kelly = outputs.find((output) => output.config.bettingStrategy === "kelly");

  if (!flat || !spread || !kelly) {
    throw new Error(`Missing strategy outputs in ${sourcePath}`);
  }

  const bundle: WebSimulationCheckpoint = {
    handCount: numHands,
    strategies: {
      flat: toWebStrategy(flat),
      spread: toWebStrategy(spread),
      kelly: toWebStrategy(kelly),
    },
  };

  const destination = join(WEB_DIR, `results-${numHands}.json`);
  writeFileSync(destination, JSON.stringify(bundle));
  console.log(`Wrote web/${destination.split("/web/")[1]} (${(readFileSync(destination).length / 1024).toFixed(0)} KB)`);
}

function main(): void {
  mkdirSync(WEB_DIR, { recursive: true });

  for (const numHands of HAND_CHECKPOINTS) {
    exportCheckpoint(numHands);
  }
}

main();
