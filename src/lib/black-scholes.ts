export type OptionType = "call" | "put";

export type BlackScholesInputs = {
  S: number;
  K: number;
  T: number;
  r: number;
  sigma: number;
  type: OptionType;
};

export type BlackScholesResult = {
  price: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
};

/** Standard normal probability density function φ(x). */
export function normalPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/** Standard normal cumulative distribution function Φ(x). */
export function normalCdf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + p * absX);
  const y =
    1 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

  return 0.5 * (1 + sign * y);
}

function intrinsicValue(S: number, K: number, type: OptionType): number {
  if (type === "call") {
    return Math.max(S - K, 0);
  }
  return Math.max(K - S, 0);
}

export function blackScholes(inputs: BlackScholesInputs): BlackScholesResult {
  const { S, K, T, r, sigma, type } = inputs;

  if (S <= 0 || K <= 0) {
    return { price: 0, delta: 0, gamma: 0, theta: 0, vega: 0 };
  }

  if (T <= 0) {
    const price = intrinsicValue(S, K, type);
    const delta =
      type === "call"
        ? S > K
          ? 1
          : S < K
            ? 0
            : 0.5
        : S < K
          ? -1
          : S > K
            ? 0
            : -0.5;
    return { price, delta, gamma: 0, theta: 0, vega: 0 };
  }

  if (sigma <= 0) {
    const discount = Math.exp(-r * T);
    const price =
      type === "call"
        ? Math.max(S - K * discount, 0)
        : Math.max(K * discount - S, 0);
    return { price, delta: 0, gamma: 0, theta: 0, vega: 0 };
  }

  const sqrtT = Math.sqrt(T);
  const d1 =
    (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;
  const nd1 = normalPdf(d1);
  const discountFactor = Math.exp(-r * T);

  let price: number;
  if (type === "call") {
    price = S * normalCdf(d1) - K * discountFactor * normalCdf(d2);
  } else {
    price = K * discountFactor * normalCdf(-d2) - S * normalCdf(-d1);
  }

  const delta =
    type === "call" ? normalCdf(d1) : normalCdf(d1) - 1;
  const gamma = nd1 / (S * sigma * sqrtT);

  const thetaAnnual =
    type === "call"
      ? (-(S * nd1 * sigma) / (2 * sqrtT) -
          r * K * discountFactor * normalCdf(d2))
      : (-(S * nd1 * sigma) / (2 * sqrtT) +
          r * K * discountFactor * normalCdf(-d2));
  const theta = thetaAnnual / 365;

  const vega = S * nd1 * sqrtT * 0.01;

  return { price, delta, gamma, theta, vega };
}
