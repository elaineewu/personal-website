import "server-only";

import fs from "fs";
import path from "path";
import type { BacktestTicker, TickerDateRange } from "@/lib/backtest-tickers";
import type { PriceBar } from "@/lib/ma-backtest";

const TICKER_FILES: Record<BacktestTicker, string> = {
  NVDA: "nvda.csv",
  SPY: "spy.csv",
};

function csvPath(ticker: BacktestTicker): string {
  return path.join(process.cwd(), "src/data", TICKER_FILES[ticker]);
}

function parseCsv(content: string): PriceBar[] {
  const lines = content.trim().split("\n");
  const bars: PriceBar[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]?.trim();
    if (!line) continue;

    const [date, open, high, low, close, , volume] = line.split(",");
    if (!date || !close) continue;

    const closePrice = parseFloat(close);
    if (!Number.isFinite(closePrice) || closePrice <= 0) continue;

    bars.push({
      date,
      open: parseFloat(open ?? "0") || 0,
      high: parseFloat(high ?? "0") || 0,
      low: parseFloat(low ?? "0") || 0,
      close: closePrice,
      volume: parseFloat(volume ?? "0") || 0,
    });
  }

  bars.sort((a, b) => a.date.localeCompare(b.date));
  return bars;
}

export function loadTickerBars(
  ticker: BacktestTicker,
  startDate?: string,
  endDate?: string,
): PriceBar[] {
  const content = fs.readFileSync(csvPath(ticker), "utf-8");
  let bars = parseCsv(content);

  if (startDate && endDate) {
    bars = bars.filter((bar) => bar.date >= startDate && bar.date <= endDate);
  }

  return bars;
}

export function getTickerDateRange(ticker: BacktestTicker): TickerDateRange {
  const bars = loadTickerBars(ticker);
  if (bars.length === 0) {
    throw new Error(`No price data found for ${ticker}.`);
  }

  return {
    minDate: bars[0].date,
    maxDate: bars[bars.length - 1].date,
  };
}

export function getAllTickerDateRanges(): Record<BacktestTicker, TickerDateRange> {
  return {
    NVDA: getTickerDateRange("NVDA"),
    SPY: getTickerDateRange("SPY"),
  };
}
