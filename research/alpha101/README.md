# 101 Formulaic Alphas: parameter robustness study

Research code behind `/projects/alpha101-constants`. Pure pandas/numpy.

| File | Purpose |
| --- | --- |
| `operators.py` | The paper's operators (`rank`, `ts_rank`, `correlation`, `decay_linear`, ...). Fractional windows are floored (paper convention) or rounded, switchable via `set_window_mode`. |
| `alphas.py` | Alphas #61, 62, 64, 65, 68, 71, 72, 73, 74, 75, 77, 78, 81 with every constant exposed as a keyword argument. |
| `evaluate.py` | Daily Spearman rank IC and a dollar-neutral rank-weighted portfolio (Sharpe, turnover). |
| `sweep.py` | Baseline, one-at-a-time sweeps, floor vs. round, 2D heatmaps, random-constant null. Writes `results.json`. |
| `export_web.py` | Trims `results.json` into `src/data/alpha101/results.json` for the site. |

## Reproduce

```bash
cd research/alpha101
curl -sSLO https://raw.githubusercontent.com/plotly/datasets/master/all_stocks_5yr.csv
python3 sweep.py        # ~20 min on 2 cores
python3 export_web.py
cp web-results.json ../../src/data/alpha101/results.json
```

Data: daily OHLCV for 505 S&P 500 constituents, Feb 2013 to Feb 2018 (the widely mirrored
Kaggle "S&P 500 stock data" set). VWAP is proxied by (high + low + close) / 3.
