export interface Inputs {
  total_budget: number;
  roster_size: number;
  bench_spots: number;
  strategy: string;
  bench_dollars_per_spot?: number;
}

export interface Outputs {
  bench_total: number;
  starter_budget: number;
  qb_budget: number;
  rb_budget: number;
  wr_budget: number;
  te_budget: number;
  dst_budget: number;
  k_budget: number;
  budget_per_starter: number;
  bench_share_pct: number;
  _insight?: any;
  _chart?: any;
}

// Position splits (% of starter budget) by auction strategy.
const SPLITS: Record<string, { qb: number; rb: number; wr: number; te: number; dst: number; k: number }> = {
  balanced: { qb: 8, rb: 38, wr: 38, te: 10, dst: 3, k: 3 },
  rb_heavy: { qb: 6, rb: 52, wr: 28, te: 8, dst: 3, k: 3 },
  zero_rb: { qb: 8, rb: 18, wr: 56, te: 12, dst: 3, k: 3 },
  stars_scrubs: { qb: 5, rb: 45, wr: 40, te: 4, dst: 3, k: 3 },
};

const STRATEGY_LABELS: Record<string, string> = {
  balanced: 'Balanced',
  rb_heavy: 'RB-heavy (Hero RB)',
  zero_rb: 'Zero RB (WR-heavy)',
  stars_scrubs: 'Stars and Scrubs',
};

export function compute(i: Inputs): Outputs {
  const totalBudget = Math.max(1, Number(i.total_budget) || 200);
  const rosterSize = Math.max(2, Math.round(Number(i.roster_size) || 16));
  let benchSpots = Math.max(0, Math.round(Number(i.bench_spots) || 0));
  if (benchSpots >= rosterSize) benchSpots = rosterSize - 1;
  const starters = rosterSize - benchSpots;
  const benchPerSpot = Math.max(1, Number(i.bench_dollars_per_spot) || 1);
  const strategy = SPLITS[i.strategy] ? i.strategy : 'balanced';
  const split = SPLITS[strategy];

  // Every roster spot must cost at least $1 in an auction; bench reserve first.
  let benchTotal = benchSpots * benchPerSpot;
  const minStarterBudget = starters; // $1 floor per starter
  if (totalBudget - benchTotal < minStarterBudget) {
    benchTotal = Math.max(0, totalBudget - minStarterBudget);
  }
  const starterBudget = totalBudget - benchTotal;

  const qb = Math.round((starterBudget * split.qb) / 100);
  const rb = Math.round((starterBudget * split.rb) / 100);
  const wr = Math.round((starterBudget * split.wr) / 100);
  const te = Math.round((starterBudget * split.te) / 100);
  const dst = Math.round((starterBudget * split.dst) / 100);
  // K absorbs rounding so the position budgets always sum to the starter budget.
  const k = Math.max(1, starterBudget - qb - rb - wr - te - dst);

  const perStarter = starters > 0 ? Math.round((starterBudget / starters) * 100) / 100 : 0;
  const benchSharePct = Math.round((benchTotal / totalBudget) * 1000) / 10;

  const topLabel = rb >= wr ? 'RB' : 'WR';
  const topValue = Math.max(rb, wr);
  const insightText = `With a **$${totalBudget.toLocaleString('en-US')}** budget and the **${STRATEGY_LABELS[strategy]}** plan, you spend **$${starterBudget.toLocaleString('en-US')}** on starters and reserve **$${benchTotal.toLocaleString('en-US')}** (${benchSharePct.toFixed(1)}%) for ${benchSpots} bench spot${benchSpots === 1 ? '' : 's'}. Your biggest position pool is **${topLabel}** at **$${topValue.toLocaleString('en-US')}** — nominate other teams' targets early and keep this powder dry.`;

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'QB', value: qb },
      { label: 'RB', value: rb },
      { label: 'WR', value: wr },
      { label: 'TE', value: te },
      { label: 'DST', value: dst },
      { label: 'K', value: k },
      { label: 'Bench', value: benchTotal },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: `$${totalBudget.toLocaleString('en-US')}`,
    centerLabel: 'Budget',
    ariaLabel: `Auction budget of $${totalBudget.toLocaleString('en-US')} split by position`,
  };

  return {
    bench_total: benchTotal,
    starter_budget: starterBudget,
    qb_budget: qb,
    rb_budget: rb,
    wr_budget: wr,
    te_budget: te,
    dst_budget: dst,
    k_budget: k,
    budget_per_starter: perStarter,
    bench_share_pct: benchSharePct,
    _insight: {
      title: 'Auction plan',
      text: insightText,
      tone: 'neutral',
      icon: '🏈',
    },
    _chart,
  };
}
