import type { BlackScholesInputs, OptionType } from "@/lib/black-scholes";

export type HistogramBin = {
  binStart: number;
  binEnd: number;
  count: number;
  label: string;
};

export type MonteCarloResult = {
  price: number;
  histogram: HistogramBin[];
};

function hashInputs(inputs: BlackScholesInputs): number {
  const { S, K, T, r, sigma, type } = inputs;
  const typeBit = type === "call" ? 1 : 0;
  let seed =
    Math.imul(Math.floor(S * 1000), 2654435761) ^
    Math.imul(Math.floor(K * 1000), 1597334677) ^
    Math.imul(Math.floor(T * 10000), 2246822519) ^
    Math.imul(Math.floor(r * 100000), 3266489917) ^
    Math.imul(Math.floor(sigma * 100000), 668265263) ^
    typeBit;
  return seed >>> 0;
}

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Box-Muller transform: returns a pair of independent standard normal samples. */
function randomNormalPair(random: () => number): [number, number] {
  let u1 = 0;
  let u2 = 0;
  while (u1 === 0) {
    u1 = random();
  }
  while (u2 === 0) {
    u2 = random();
  }
  const magnitude = Math.sqrt(-2 * Math.log(u1));
  const angle = 2 * Math.PI * u2;
  return [magnitude * Math.cos(angle), magnitude * Math.sin(angle)];
}

function optionPayoff(S_T: number, K: number, type: OptionType): number {
  if (type === "call") {
    return Math.max(S_T - K, 0);
  }
  return Math.max(K - S_T, 0);
}

export function simulateFinalPrices(
  inputs: BlackScholesInputs,
  numSimulations: number,
): number[] {
  const { S, K, T, r, sigma } = inputs;

  if (S <= 0 || K <= 0 || numSimulations <= 0) {
    return [];
  }

  if (T <= 0) {
    return Array.from({ length: numSimulations }, () => S);
  }

  const random = createSeededRandom(hashInputs(inputs));
  const drift = (r - 0.5 * sigma * sigma) * T;
  const diffusionScale = sigma * Math.sqrt(T);
  const prices = new Array<number>(numSimulations);

  if (sigma <= 0) {
    const deterministic = S * Math.exp(drift);
    prices.fill(deterministic);
    return prices;
  }

  let index = 0;
  while (index < numSimulations) {
    const [z1, z2] = randomNormalPair(random);
    prices[index] = S * Math.exp(drift + diffusionScale * z1);
    index += 1;
    if (index < numSimulations) {
      prices[index] = S * Math.exp(drift + diffusionScale * z2);
      index += 1;
    }
  }

  return prices;
}

function buildHistogram(values: number[], numBins: number): HistogramBin[] {
  if (values.length === 0) {
    return [];
  }

  let min = values[0];
  let max = values[0];
  for (let i = 1; i < values.length; i += 1) {
    if (values[i] < min) {
      min = values[i];
    }
    if (values[i] > max) {
      max = values[i];
    }
  }

  if (min === max) {
    return [
      {
        binStart: min,
        binEnd: max,
        count: values.length,
        label: min.toFixed(0),
      },
    ];
  }

  const binCount = Math.min(numBins, values.length);
  const binWidth = (max - min) / binCount;
  const counts = new Array<number>(binCount).fill(0);

  for (const value of values) {
    let binIndex = Math.floor((value - min) / binWidth);
    if (binIndex >= binCount) {
      binIndex = binCount - 1;
    }
    counts[binIndex] += 1;
  }

  return counts.map((count, index) => {
    const binStart = min + index * binWidth;
    const binEnd = binStart + binWidth;
    const midpoint = (binStart + binEnd) / 2;
    return {
      binStart,
      binEnd,
      count,
      label: midpoint.toFixed(0),
    };
  });
}

export function monteCarloFromPrices(
  inputs: BlackScholesInputs,
  finalPrices: number[],
  numBins = 40,
): MonteCarloResult {
  const { K, T, r, type } = inputs;

  if (finalPrices.length === 0) {
    return { price: 0, histogram: [] };
  }

  let payoffSum = 0;
  for (const S_T of finalPrices) {
    payoffSum += optionPayoff(S_T, K, type);
  }

  const averagePayoff = payoffSum / finalPrices.length;
  const discount = T <= 0 ? 1 : Math.exp(-r * T);
  const price = averagePayoff * discount;

  return {
    price,
    histogram: buildHistogram(finalPrices, numBins),
  };
}

export const MAX_MONTE_CARLO_SIMULATIONS = 100_000;
export const MIN_MONTE_CARLO_SIMULATIONS = 100;

export function simulationCountFromSlider(t: number): number {
  const clamped = Math.min(1, Math.max(0, t));
  const logMin = Math.log10(MIN_MONTE_CARLO_SIMULATIONS);
  const logMax = Math.log10(MAX_MONTE_CARLO_SIMULATIONS);
  return Math.round(10 ** (logMin + clamped * (logMax - logMin)));
}

export function sliderPositionFromSimulationCount(count: number): number {
  const clamped = Math.min(
    MAX_MONTE_CARLO_SIMULATIONS,
    Math.max(MIN_MONTE_CARLO_SIMULATIONS, count),
  );
  const logMin = Math.log10(MIN_MONTE_CARLO_SIMULATIONS);
  const logMax = Math.log10(MAX_MONTE_CARLO_SIMULATIONS);
  return (Math.log10(clamped) - logMin) / (logMax - logMin);
}
