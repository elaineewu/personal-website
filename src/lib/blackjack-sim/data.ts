import results1000 from "@/data/blackjack-sim/web/results-1000.json";
import results10000 from "@/data/blackjack-sim/web/results-10000.json";
import results100000 from "@/data/blackjack-sim/web/results-100000.json";
import results1000000 from "@/data/blackjack-sim/web/results-1000000.json";
import type { HandCountCheckpoint, WebSimulationCheckpoint } from "@/lib/blackjack-sim/types";

export const HAND_COUNT_OPTIONS: HandCountCheckpoint[] = [1000, 10_000, 100_000, 1_000_000];

export const SIMULATION_RESULTS: Record<HandCountCheckpoint, WebSimulationCheckpoint> = {
  1000: results1000 as WebSimulationCheckpoint,
  10000: results10000 as WebSimulationCheckpoint,
  100000: results100000 as WebSimulationCheckpoint,
  1000000: results1000000 as WebSimulationCheckpoint,
};

export function formatHandCount(count: HandCountCheckpoint): string {
  return count.toLocaleString("en-US");
}
