import type { Metadata } from "next";
import Link from "next/link";
import { Code } from "lucide-react";
import RandomNullChart from "@/components/alpha101/RandomNullChart";
import SensitivityExplorer from "@/components/alpha101/SensitivityExplorer";
import WindowHeatmap from "@/components/alpha101/WindowHeatmap";
import { alpha101, alphaIds, formatIc, formatNum } from "@/lib/alpha101/data";

const CODE_HREF =
  "https://github.com/elaineewu/personal-website/tree/main/research/alpha101";

export const metadata: Metadata = {
  title: "Stress-Testing the Constants in 101 Formulaic Alphas | Elaine Wu",
  description:
    "Do the six-significant-figure constants in Kakushadze's 101 Formulaic Alphas carry real signal? Parameter sweeps, floor vs. round, and a random-constant null on S&P 500 data.",
};

const FOSSILS = [
  {
    id: "66",
    expr: "(low * 0.96633) + (low * (1 - 0.96633))",
    note: "simplifies to low. The weight 0.96633 cannot change the output.",
  },
  {
    id: "82",
    expr: "(open * 0.634196) + (open * (1 - 0.634196))",
    note: "simplifies to open. Another six-digit constant with zero effect.",
  },
  {
    id: "77",
    expr: "(((high + low) / 2) + high) - (vwap + high)",
    note: "the two + high terms cancel, leaving (high + low) / 2 − vwap.",
  },
  {
    id: "62",
    expr: "rank(open) + rank(open)",
    note: "just 2 · rank(open), written the long way.",
  },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-accent">{children}</h2>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-12 rounded-xl border border-border bg-surface p-5 sm:p-8">{children}</div>
  );
}

const th = "px-3 py-2 text-right font-normal text-muted";
const td = "px-3 py-2 text-right tabular-nums";

export default function Alpha101ConstantsPage() {
  const roundChanged = alphaIds.filter((id) => {
    const a = alpha101.alphas[id];
    return Object.entries(a.params).some(
      ([k, v]) => k !== "a" && v - Math.floor(v) >= 0.5,
    );
  });

  return (
    <div className="min-h-screen px-6 pb-24 pt-12 lg:px-12 lg:py-16 xl:px-24">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/#projects"
          className="mb-8 inline-flex items-center gap-2 font-mono text-sm text-muted transition-colors hover:text-accent"
        >
          <span aria-hidden="true">←</span>
          Back to projects
        </Link>

        <header className="mb-10">
          <p className="mb-3 font-mono text-sm text-accent">Quantitative Research</p>
          <h1 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Six Significant Figures: Stress-Testing the Constants in 101 Formulaic Alphas
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
            Many alphas in Kakushadze&apos;s <em>101 Formulaic Alphas</em> (2016) use constants
            like 9.91009 and 0.00817205. I re-implemented 13 of them in pandas and tested whether
            those exact numbers carry signal, or whether they are fingerprints of an automated
            search fit to data we never see.
          </p>
        </header>

        <p className="mb-10">
          <a
            href={CODE_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-mono text-sm text-accent transition-colors hover:text-foreground"
          >
            <Code className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            Research code (pandas)
          </a>
        </p>

        <section className="mb-12 rounded-xl border border-accent/30 bg-accent/5 p-5 sm:p-6">
          <SectionTitle>TL;DR</SectionTitle>
          <ul className="space-y-3 text-sm leading-relaxed text-muted">
            <li>
              <span className="text-foreground">The constants are not local optima on fresh data.</span>{" "}
              Across 52 constants in 13 alphas, the published value was the best of its integer
              neighbors in-sample only 4 times. Its average neighborhood percentile was 49%, a
              coin flip.
            </li>
            <li>
              <span className="text-foreground">Random constants do about as well.</span> The
              published constants beat random ones 58% of the time in-sample and 49% out-of-sample.
            </li>
            <li>
              <span className="text-foreground">Picking the in-sample best backfires.</span> For
              Alpha #61, in-sample and out-of-sample IC across window pairs have a correlation of
              −0.75. Pooled over every random draw, the correlation is −0.17.
            </li>
            <li>
              <span className="text-foreground">One alpha survives.</span> Alpha #75, the
              simplest one tested, is the only signal with an in-sample IC t-stat above 2 (3.2), holds
              up out-of-sample (1.8), and sits on a broad plateau.
            </li>
          </ul>
        </section>

        <section className="mb-12 max-w-3xl space-y-4 text-sm leading-relaxed text-muted">
          <SectionTitle>The observation</SectionTitle>
          <p>
            The paper states that non-integer window lengths are floored. Under that rule,{" "}
            <code className="font-mono text-foreground">correlation(x, y, 9.91009)</code> is
            identical to a 9-day correlation, so five of the six significant figures do nothing.
            Numbers like this are what you get when an optimizer searches a continuous parameter
            space and nobody rounds the output.
          </p>
          <p>
            The formulas also contain expressions no human would write by hand. They read like
            the output of a genetic-programming search over an expression grammar:
          </p>
          <ul className="space-y-3">
            {FOSSILS.map((f) => (
              <li key={f.id} className="rounded-lg border border-border bg-surface/50 px-4 py-3">
                <span className="font-mono text-xs text-accent">Alpha #{f.id}</span>
                <code className="mt-1 block break-all font-mono text-xs text-foreground">
                  {f.expr}
                </code>
                <span className="mt-1 block text-xs">{f.note}</span>
              </li>
            ))}
          </ul>
          <p>
            That raises two questions. First, if the constants were tuned, how much of each
            alpha&apos;s performance depends on them? Second, the floor convention is itself a
            hidden modeling choice: if the search that produced 9.91 was rounding, the
            &quot;optimal&quot; window was really 10, and every floored replication runs a
            slightly different alpha.
          </p>
        </section>

        <section className="mb-12 max-w-3xl space-y-4 text-sm leading-relaxed text-muted">
          <SectionTitle>Setup</SectionTitle>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="font-medium text-foreground">Data:</strong> daily OHLCV for{" "}
              {alpha101.meta.tickers} S&amp;P 500 constituents, {alpha101.meta.start} to{" "}
              {alpha101.meta.end}. Daily VWAP is not in free data, so I use the typical price
              (high + low + close) / 3. <code className="font-mono">adv&#123;d&#125;</code> is the
              d-day mean dollar volume.
            </li>
            <li>
              <strong className="font-medium text-foreground">Split:</strong> in-sample through
              December 2015 and out-of-sample from January 2016, when the paper first appeared on
              arXiv.
            </li>
            <li>
              <strong className="font-medium text-foreground">Alphas:</strong> #
              {alphaIds.join(", #")}. Each has several fractional constants and none needs
              industry neutralization, so they run on OHLCV alone.
            </li>
            <li>
              <strong className="font-medium text-foreground">Timing:</strong> the signal is
              computed at the close on day t and traded from the open on t+1 to the open on
              t+2, so there is no look-ahead.
            </li>
            <li>
              <strong className="font-medium text-foreground">Metrics:</strong> the main metric is
              mean daily Spearman rank IC between signal and forward return. Many of these alphas
              are comparisons like <code className="font-mono">rank(A) &lt; rank(B)</code>, so the
              signal is only 0 or ±1, which makes decile sorts meaningless; IC handles the ties
              cleanly. I also report the Sharpe ratio and turnover of a dollar-neutral portfolio
              weighted by the signal&apos;s demeaned cross-sectional rank (before costs).
            </li>
          </ul>
        </section>

        <Card>
          <SectionTitle>Baseline: published constants</SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] font-mono text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left font-normal text-muted">Alpha</th>
                  <th className={th}>IS IC ×10⁴</th>
                  <th className={th}>IS t</th>
                  <th className={th}>IS Sharpe</th>
                  <th className={th}>OOS IC ×10⁴</th>
                  <th className={th}>OOS t</th>
                  <th className={th}>OOS Sharpe</th>
                  <th className={th}>Turnover</th>
                </tr>
              </thead>
              <tbody>
                {alphaIds.map((id) => {
                  const b = alpha101.alphas[id].baseline;
                  const strong = Math.abs(b.is.ic_t ?? 0) >= 2;
                  return (
                    <tr key={id} className="border-b border-border/50 last:border-0">
                      <td className={`px-3 py-2 text-left ${strong ? "text-accent" : "text-foreground"}`}>
                        #{id}
                      </td>
                      <td className={td}>{formatIc(b.is.ic)}</td>
                      <td className={`${td} ${strong ? "text-accent" : ""}`}>{formatNum(b.is.ic_t)}</td>
                      <td className={td}>{formatNum(b.is.sharpe)}</td>
                      <td className={td}>{formatIc(b.oos.ic)}</td>
                      <td className={td}>{formatNum(b.oos.ic_t)}</td>
                      <td className={td}>{formatNum(b.oos.sharpe)}</td>
                      <td className={`${td} text-muted`}>
                        {((b.oos.turnover ?? 0) * 100).toFixed(0)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            IC is shown × 10⁴, so +70 means a mean daily rank correlation of 0.0070. Turnover is
            the average daily one-way turnover out-of-sample. Only Alpha #75 clears |t| ≥ 2
            in-sample, and five alphas (#62, #64, #65, #68, #72) flip the sign of their IC
            between periods. Small ICs are expected: these are weak signals built to be combined
            by the hundreds, and the S&amp;P 500 is the most efficient corner of the market.
          </p>
        </Card>

        <section className="mb-6 max-w-3xl space-y-4 text-sm leading-relaxed text-muted">
          <SectionTitle>Experiment 1: move one constant at a time</SectionTitle>
          <p>
            For each window I test every integer from 5 below to 5 above the floored value, and
            for each blend weight a grid from 0 to 1, holding all other constants fixed. If a
            constant was genuinely tuned to a real effect, the published value should sit near
            the top of its neighborhood, at least in-sample.
          </p>
        </section>
        <Card>
          <SensitivityExplorer />
        </Card>

        <section className="mb-6 max-w-3xl space-y-4 text-sm leading-relaxed text-muted">
          <SectionTitle>Experiment 2: plateau or spike?</SectionTitle>
          <p>
            Sweeping two windows at once shows the shape of the performance surface. A robust
            signal looks like a broad plateau; an overfit one looks like an isolated hot spot
            that moves when the period changes.
          </p>
        </section>
        <Card>
          <WindowHeatmap />
        </Card>

        <Card>
          <SectionTitle>Experiment 3: floor vs. round</SectionTitle>
          <p className="mb-4 max-w-3xl text-sm leading-relaxed text-muted">
            24 of the 46 fractional windows in these alphas have a fractional part of 0.5 or
            more, so floor and round disagree on over half of them. For the alphas where that
            happens:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] font-mono text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left font-normal text-muted">Alpha</th>
                  <th className={th}>IS floor</th>
                  <th className={th}>IS round</th>
                  <th className={th}>OOS floor</th>
                  <th className={th}>OOS round</th>
                </tr>
              </thead>
              <tbody>
                {roundChanged.map((id) => {
                  const a = alpha101.alphas[id];
                  const flipIs =
                    (a.baseline.is.ic ?? 0) * (a.round.is.ic ?? 0) < 0;
                  return (
                    <tr key={id} className="border-b border-border/50 last:border-0">
                      <td className="px-3 py-2 text-left text-foreground">#{id}</td>
                      <td className={td}>{formatIc(a.baseline.is.ic)}</td>
                      <td className={`${td} ${flipIs ? "text-accent" : ""}`}>
                        {formatIc(a.round.is.ic)}
                      </td>
                      <td className={td}>{formatIc(a.baseline.oos.ic)}</td>
                      <td className={td}>{formatIc(a.round.oos.ic)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            IC × 10⁴. Highlighted cells change sign. Rounding erases Alpha #72&apos;s in-sample
            IC entirely and flips #73 negative; #61 loses about 30%. Two implementations that
            both claim to follow the paper can report different results for the same alpha.
          </p>
        </Card>

        <section className="mb-6 max-w-3xl space-y-4 text-sm leading-relaxed text-muted">
          <SectionTitle>Experiment 4: random-constant null</SectionTitle>
          <p>
            The strongest test: keep each alpha&apos;s structure, throw away its constants, and
            draw new ones at random. If the published numbers encode something real, they should
            beat most random draws.
          </p>
        </section>
        <Card>
          <RandomNullChart />
        </Card>

        <section className="mb-12 max-w-3xl space-y-4 text-sm leading-relaxed text-muted">
          <SectionTitle>What I take away</SectionTitle>
          <p>
            On independent data, the six-digit precision buys nothing. Published constants sit
            in the middle of their neighborhoods and beat random constants at roughly chance.
            This does not prove the alphas were overfit on WorldQuant&apos;s own data, which I
            cannot see. It does show that the specific numbers do not transfer to a different
            universe and period, so any value these formulas carry lives in their structure.
          </p>
          <p>
            The most useful result is the negative one: selecting constants by in-sample IC
            actively hurt out-of-sample IC. For Alpha #61, the top 10% of window pairs by
            in-sample IC averaged +7 out-of-sample, against +34 for the grid as a whole. That is
            the textbook signature of fitting noise.
          </p>
          <p>
            Alpha #75 is the exception, and it is also the simplest: two correlations, two
            windows, no blend weights. Its good region is wide, so it does not care whether the
            first window is 3, 4, or 5 days. When I evaluate a signal now, a plateau like that
            matters more to me than a higher peak.
          </p>
        </section>

        <section className="max-w-3xl">
          <p className="rounded-lg border border-border bg-surface/50 px-4 py-3 text-xs leading-relaxed text-muted">
            Caveats: the universe is the S&amp;P 500 as of 2018, so it carries survivorship bias.
            VWAP is approximated from daily bars. Returns ignore transaction costs, and the
            out-of-sample window is only about two years. The random-constant null uses 60 draws
            per alpha. The paper&apos;s alphas were designed for a much broader universe and
            likely intraday VWAP, so weak ICs here are not a claim that they failed in
            production. This is a research exercise, not investment advice.
          </p>
        </section>
      </div>
    </div>
  );
}
