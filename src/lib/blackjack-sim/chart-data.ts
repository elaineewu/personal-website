import type { BankrollChartPoint } from "@/lib/blackjack-sim/types";

type BankrollSeriesPoint = {
  hand: number;
  bankroll: number;
};

function seriesToMap(series: BankrollSeriesPoint[]): Map<number, number> {
  return new Map(series.map((point) => [point.hand, point.bankroll]));
}

export function mergeBankrollSeries(
  flatSeries: BankrollSeriesPoint[],
  spreadSeries: BankrollSeriesPoint[],
  kellySeries: BankrollSeriesPoint[],
): BankrollChartPoint[] {
  const handIndices = new Set<number>();
  for (const series of [flatSeries, spreadSeries, kellySeries]) {
    for (const point of series) {
      handIndices.add(point.hand);
    }
  }

  const flatMap = seriesToMap(flatSeries);
  const spreadMap = seriesToMap(spreadSeries);
  const kellyMap = seriesToMap(kellySeries);

  return Array.from(handIndices)
    .sort((left, right) => left - right)
    .map((hand) => ({
      hand,
      flat: flatMap.get(hand),
      spread: spreadMap.get(hand),
      kelly: kellyMap.get(hand),
    }));
}
