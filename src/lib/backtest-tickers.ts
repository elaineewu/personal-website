export const BACKTEST_TICKERS = ["NVDA", "SPY"] as const;
export type BacktestTicker = (typeof BACKTEST_TICKERS)[number];

export type TickerDateRange = {
  minDate: string;
  maxDate: string;
};

export function isBacktestTicker(value: string): value is BacktestTicker {
  return (BACKTEST_TICKERS as readonly string[]).includes(value);
}
