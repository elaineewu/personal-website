"use server";

import { isBacktestTicker, type BacktestTicker } from "@/lib/backtest-tickers";
import { getTickerDateRange, loadTickerBars } from "@/lib/market-data";
import { runBacktest, type BacktestResult } from "@/lib/ma-backtest";

export type BacktestActionInput = {
  ticker: string;
  shortWindow: number;
  longWindow: number;
  startDate: string;
  endDate: string;
};

export type BacktestActionSuccess = {
  ticker: BacktestTicker;
  shortWindow: number;
  longWindow: number;
  startDate: string;
  endDate: string;
} & BacktestResult;

export type BacktestActionResult =
  | { ok: true; data: BacktestActionSuccess }
  | { ok: false; error: string };

function parseDate(value: string | undefined): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  return value;
}

export async function runBacktestAction(
  input: BacktestActionInput,
): Promise<BacktestActionResult> {
  const ticker = input.ticker.trim().toUpperCase();

  if (!isBacktestTicker(ticker)) {
    return { ok: false, error: "Please select a valid ticker (NVDA or SPY)." };
  }

  const shortWindow = Math.round(Number(input.shortWindow));
  const longWindow = Math.round(Number(input.longWindow));
  const startDate = parseDate(input.startDate);
  const endDate = parseDate(input.endDate);

  if (
    !Number.isFinite(shortWindow) ||
    !Number.isFinite(longWindow) ||
    shortWindow < 2 ||
    longWindow < 2
  ) {
    return {
      ok: false,
      error: "Moving average windows must be whole numbers of at least 2 days.",
    };
  }

  if (shortWindow >= longWindow) {
    return {
      ok: false,
      error: "The short moving average window must be smaller than the long window.",
    };
  }

  if (!startDate || !endDate) {
    return {
      ok: false,
      error: "Please provide valid start and end dates (YYYY-MM-DD).",
    };
  }

  if (startDate >= endDate) {
    return {
      ok: false,
      error: "The start date must be before the end date.",
    };
  }

  const { minDate, maxDate } = getTickerDateRange(ticker);

  if (startDate < minDate || endDate > maxDate) {
    return {
      ok: false,
      error: `Dates must be within the available range for ${ticker} (${minDate} to ${maxDate}).`,
    };
  }

  const bars = loadTickerBars(ticker, startDate, endDate);
  if (bars.length === 0) {
    return {
      ok: false,
      error: `No price data found for ${ticker} in the selected date range.`,
    };
  }

  const result = runBacktest(bars, shortWindow, longWindow);
  if (!result) {
    return {
      ok: false,
      error: `Not enough trading days in the selected range for a ${longWindow}-day moving average. Try a longer date range.`,
    };
  }

  return {
    ok: true,
    data: {
      ticker,
      shortWindow,
      longWindow,
      startDate: bars[0].date,
      endDate: bars[bars.length - 1].date,
      ...result,
    },
  };
}
