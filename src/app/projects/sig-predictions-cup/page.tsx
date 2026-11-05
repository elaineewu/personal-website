import type { Metadata } from "next";
import Link from "next/link";
import EquityChart from "@/components/sig-predictions-cup/EquityChart";
import { formatSusq, results } from "@/lib/sig-predictions-cup/data";

export const metadata: Metadata = {
  title: "Trading the Midterms with a Bot: SIG Predictions Cup | Elaine Wu",
  description:
    "What I learned running an automated arbitrage and fair-value trading bot in Susquehanna's Predictions Cup, a simulated prediction market on the 2026 midterm elections.",
};

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

const STATS = [
  { label: "Return at close", value: `+${results.returnPct}%`, sub: "100,000 → " + formatSusq(results.finalValue) },
  { label: "Trades", value: String(results.trades), sub: `${results.positions} open positions at close` },
  {
    label: "Leaderboard",
    value: `#${results.rankNearClose}`,
    sub: `up from #${results.rankOct7} of ${formatSusq(results.participantsOct7)} on Oct 7`,
  },
  { label: "Worst drawdown", value: "≈6%", sub: "Nov 2, recovered within a day" },
];

const COMPONENTS = [
  {
    name: "Arbitrage",
    body: (
      <>
        Pair &quot;Democrat wins X&quot; with &quot;Republican wins X.&quot; If the two YES bids
        sum to 1.02 or more, buy NO on both. That costs at most 0.98 and pays exactly 1.00 no
        matter who wins, so the profit is locked at entry. The bot walks the order book while the
        condition holds, up to 5,000 per trade and 15,000 per race.
      </>
    ),
  },
  {
    name: "Directional",
    body: (
      <>
        Use Kalshi mid prices as fair value ({results.racesMatchedToKalshi} of{" "}
        {results.racesTotal} races matched) and buy when SIG&apos;s price is 5+ points away,
        capped at 2,000 per race and 12,500 in total. About six of these a day.
      </>
    ),
  },
  {
    name: "Exits",
    body: (
      <>
        Sell an arb once 70% of its locked profit can be banked. Sell a directional bet once SIG
        converges to within 1 point of Kalshi, which also works as a stop-loss if Kalshi moves
        toward SIG.
      </>
    ),
  },
  {
    name: "Swaps",
    body: (
      <>
        When cash runs out, sell an older arb (never below cost) to fund a new one that earns at
        least 1 point more per dollar, so capital keeps rotating into the best available edge.
      </>
    ),
  },
  {
    name: "Risk limits",
    body: (
      <>
        A 3,000 cash floor, a 3,000 daily loss limit that halts new entries, daily trade caps, and
        a rule that arbs and directional bets never share a contract, so one strategy cannot
        accidentally unwind the other.
      </>
    ),
  },
];

export default function SigPredictionsCupPage() {
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
          <p className="mb-3 font-mono text-sm text-accent">Prediction Markets · Write-up</p>
          <h1 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Trading the Midterms with a Bot: What I Learned from SIG&apos;s Predictions Cup
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
            From October 1 to November 4, 2026, Susquehanna ran the Predictions Cup, a simulated
            prediction market on the U.S. midterm elections where every player started with
            100,000 SUSQies. I wrote a Python bot against SIG&apos;s REST API that traded on its
            own for most of the tournament. These are the results and what I would tell myself
            before starting.
          </p>
        </header>

        <section className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-surface px-4 py-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                {s.label}
              </p>
              <p className="mt-2 text-2xl font-medium tabular-nums text-foreground">{s.value}</p>
              <p className="mt-1 text-xs leading-snug text-muted">{s.sub}</p>
            </div>
          ))}
        </section>

        <section className="mb-12 rounded-xl border border-accent/30 bg-accent/5 p-5 sm:p-6">
          <SectionTitle>TL;DR</SectionTitle>
          <ul className="space-y-3 text-sm leading-relaxed text-muted">
            <li>
              <span className="text-foreground">The edge was real but small.</span> Pairing each
              race&apos;s Democrat and Republican contracts and buying NO on both when their bids
              summed past 1.02 locked in a profit regardless of the outcome.
            </li>
            <li>
              <span className="text-foreground">Turnover, not edge, separated me from the top.</span>{" "}
              The leaders earned 2 to 16% per dollar traded, about what I earned per trade, but
              they traded 50 to 180 times their capital in a week.
            </li>
            <li>
              <span className="text-foreground">Daily PnL was mostly noise.</span> Crossing the
              spread puts a locked arb at a paper loss on day one, and a 6% drawdown on Nov 2
              recovered within a day. Most of the profit appeared in the final hour as races
              resolved.
            </li>
            <li>
              <span className="text-foreground">The bugs that hurt were in sizing, not signals.</span>{" "}
              A cash buffer that ratcheted down and a ranking that favored small trades cost more
              than any bad prediction.
            </li>
          </ul>
        </section>

        <section className="mb-12 max-w-3xl space-y-4 text-sm leading-relaxed text-muted">
          <SectionTitle>The setup</SectionTitle>
          <p>
            Each race had separate binary contracts for each party, priced from 0 to 1 and paying
            1 if that party won. SIG did not define any relationship between them, so there was
            no built-in way to know that &quot;Democrat wins the Pennsylvania Senate seat&quot;
            and &quot;Republican wins the Pennsylvania Senate seat&quot; were two sides of the
            same race. The bot discovers those pairs itself by parsing market titles.
          </p>
          <p>
            Before writing any strategy, I looked at whether market making was viable. It
            wasn&apos;t: nearly every market already had a 1-point spread with heavy volume, so
            there was no room to quote inside it. That pushed me toward two things the crowd
            could get wrong: internal consistency between paired contracts, and consistency with
            an outside market.
          </p>
          <p>
            The final version runs on my laptop in a loop every 30 seconds. A cron job relaunches
            it if it dies and a lock file prevents two copies from overlapping. It even kept
            trading during macOS background wakes with the lid closed.
          </p>
        </section>

        <Card>
          <SectionTitle>How the bot trades</SectionTitle>
          <ol className="grid gap-3 sm:grid-cols-2">
            {COMPONENTS.map((c, i) => (
              <li
                key={c.name}
                className={`rounded-lg border border-border bg-background/40 px-4 py-4 ${
                  i === COMPONENTS.length - 1 ? "sm:col-span-2" : ""
                }`}
              >
                <p className="font-mono text-xs text-accent">
                  {String(i + 1).padStart(2, "0")} · {c.name}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{c.body}</p>
              </li>
            ))}
          </ol>
        </Card>

        <section className="mb-6 max-w-3xl space-y-4 text-sm leading-relaxed text-muted">
          <SectionTitle>The equity curve</SectionTitle>
          <p>
            The account dipped to about 98,000 in the first week, before the bot was fully
            running, then climbed steadily to 105,000 by late October. The last week was much
            choppier: a drop to {formatSusq(results.drawdownLow)} on the morning of November 2, a
            full recovery the next day, and big swings through election night. In the final 47
            minutes, as races were called and prices moved toward their settlement values, the
            account gained about 5,000 SUSQies and closed at {formatSusq(results.finalValue)}.
          </p>
        </section>
        <Card>
          <EquityChart />
        </Card>

        <section className="mb-12 max-w-3xl space-y-4 text-sm leading-relaxed text-muted">
          <SectionTitle>What I learned</SectionTitle>
          <p>
            <strong className="font-medium text-foreground">Speed and turnover scale an edge.</strong>{" "}
            When I compared myself to the leaderboard, the top traders were not finding much
            bigger mispricings than I was. They were finding them far more often and recycling
            their capital dozens of times a week. That is why the bot went from running a few
            times a day to every 30 seconds, and why I added the swap logic: idle or low-yield
            capital was the real bottleneck.
          </p>
          <p>
            <strong className="font-medium text-foreground">Mark-to-market can lie about a locked trade.</strong>{" "}
            Buying at the ask and being marked at the bid means a guaranteed-profit arb shows a
            loss the moment it fills. Watching daily PnL would have pushed me to unwind good
            positions. I learned to judge the book by locked profit and to treat daily swings,
            including the November 2 drawdown, as noise until settlement.
          </p>
          <p>
            <strong className="font-medium text-foreground">Small sizing bugs compound.</strong>{" "}
            My first cash buffer was a fraction of remaining cash, so every trade shrank the
            buffer and the next trade spent into it; cash ratcheted down to 618 before I made it
            a fixed floor. My first ranking sorted opportunities by price gap, which picked tiny
            trades with wide gaps over large trades worth more in total. Ranking by locked profit
            fixed it.
          </p>
          <p>
            <strong className="font-medium text-foreground">Pick the objective you can win.</strong>{" "}
            By mid-October the leaders were up around 9x, out of reach for a strategy built on
            1 to 2 point arbs. I switched goals to steady, low-volatility returns, which is what
            SIG&apos;s Smart Score rewards (PnL, ROI, win rate, and Sharpe). The rank climb from
            {" "}{results.rankOct7} to {results.rankNearClose} came from that consistency.
          </p>
        </section>

        <section className="mb-12 max-w-3xl space-y-4 text-sm leading-relaxed text-muted">
          <SectionTitle>What I would build next</SectionTitle>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="font-medium text-foreground">Edge-based sizing.</strong> Replace
              the fixed caps with fractional Kelly sizing, so a 6-point edge gets more capital
              than a 2-point one.
            </li>
            <li>
              <strong className="font-medium text-foreground">Correlation awareness.</strong> Races
              in a wave election move together, so ten independent-looking bets can be one big
              bet. Sizing should account for that.
            </li>
            <li>
              <strong className="font-medium text-foreground">Cross-market checks.</strong> Chamber
              control should be consistent with the individual seats that decide it; that is a
              second family of arbitrage I never scanned.
            </li>
            <li>
              <strong className="font-medium text-foreground">Better fair value and execution.</strong>{" "}
              Kalshi was my only reference price, and the bot always crossed the spread. Blending
              sources and resting passive orders when there is time would both help.
            </li>
            <li>
              <strong className="font-medium text-foreground">Infrastructure.</strong> A bot that
              only trades while a laptop is awake has a hard uptime ceiling. A small cloud VM
              would have been worth it.
            </li>
          </ul>
        </section>

        <section className="max-w-3xl">
          <p className="rounded-lg border border-border bg-surface/50 px-4 py-3 text-xs leading-relaxed text-muted">
            Notes: SUSQies are a simulated currency and no real money was involved. Figures come
            from snapshots I recorded of the tournament dashboard; the closing value is as of the
            end of trading on November 4, before every position had settled. Points marked
            approximate on the chart were read off the platform&apos;s equity curve. This is a
            write-up of a competition entry, not investment advice.
          </p>
        </section>
      </div>
    </div>
  );
}
