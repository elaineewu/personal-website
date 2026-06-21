export type PriceBar = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type BacktestPoint = {
  date: string;
  strategyValue: number;
  buyAndHoldValue: number;
};

export type BacktestResult = {
  points: BacktestPoint[];
  finalStrategyValue: number;
  finalBuyAndHoldValue: number;
  strategyReturnPct: number;
  buyAndHoldReturnPct: number;
  trades: number;
  initialCapital: number;
};

const INITIAL_CAPITAL = 10_000;

function calculateSMA(prices: number[], window: number): (number | null)[] {
  const result: (number | null)[] = new Array(prices.length).fill(null);

  for (let i = window - 1; i < prices.length; i++) {
    let sum = 0;
    for (let j = i - window + 1; j <= i; j++) {
      sum += prices[j];
    }
    result[i] = sum / window;
  }

  return result;
}

function pctReturn(finalValue: number, initialValue: number): number {
  return ((finalValue - initialValue) / initialValue) * 100;
}

export function runBacktest(
  bars: PriceBar[],
  shortWindow: number,
  longWindow: number,
  initialCapital = INITIAL_CAPITAL,
): BacktestResult | null {
  if (bars.length < longWindow) return null;

  const closes = bars.map((bar) => bar.close);
  const shortMa = calculateSMA(closes, shortWindow);
  const longMa = calculateSMA(closes, longWindow);

  const firstClose = closes[0];
  const sharesForBuyAndHold = initialCapital / firstClose;

  let cash = initialCapital;
  let shares = 0;
  let trades = 0;

  const points: BacktestPoint[] = [];

  for (let i = 0; i < bars.length; i++) {
    const prevShort = i > 0 ? shortMa[i - 1] : null;
    const prevLong = i > 0 ? longMa[i - 1] : null;
    const currShort = shortMa[i];
    const currLong = longMa[i];

    if (
      prevShort !== null &&
      prevLong !== null &&
      currShort !== null &&
      currLong !== null
    ) {
      const goldenCross = prevShort <= prevLong && currShort > currLong;
      const deathCross = prevShort >= prevLong && currShort < currLong;

      if (goldenCross && shares === 0 && cash > 0) {
        shares = cash / closes[i];
        cash = 0;
        trades += 1;
      } else if (deathCross && shares > 0) {
        cash = shares * closes[i];
        shares = 0;
        trades += 1;
      }
    }

    const strategyValue = shares * closes[i] + cash;
    const buyAndHoldValue = sharesForBuyAndHold * closes[i];

    if (currShort !== null && currLong !== null) {
      points.push({
        date: bars[i].date,
        strategyValue,
        buyAndHoldValue,
      });
    }
  }

  if (points.length === 0) return null;

  const finalStrategyValue = points[points.length - 1].strategyValue;
  const finalBuyAndHoldValue = points[points.length - 1].buyAndHoldValue;

  return {
    points,
    finalStrategyValue,
    finalBuyAndHoldValue,
    strategyReturnPct: pctReturn(finalStrategyValue, initialCapital),
    buyAndHoldReturnPct: pctReturn(finalBuyAndHoldValue, initialCapital),
    trades,
    initialCapital,
  };
}

export function normalizeTicker(ticker: string): string {
  return ticker.trim().toUpperCase().replace(/^\$/, "");
}
