/**
 * Plain-English glossary for prospective employees.
 * Each entry is wired up via <InfoTip term="..." /> in the UI.
 * Write for someone who is smart but not from finance.
 */

export type GlossaryEntry = {
  title: string;
  body: string;
};

export const GLOSSARY = {
  arr: {
    title: "ARR (Annual Recurring Revenue)",
    body:
      "Yearly subscription revenue. The standard valuation anchor for SaaS companies — they often sell for some multiple of ARR.",
  },
  ebitda: {
    title: "EBITDA",
    body:
      "Earnings Before Interest, Taxes, Depreciation, and Amortization. A rough proxy for the cash the business throws off. Many PE deals are quoted as EBITDA × a multiple, especially for more mature companies.",
  },
  ebitdaMargin: {
    title: "EBITDA margin",
    body:
      "EBITDA as a percent of revenue. A 20% margin on $48M ARR means $9.6M of EBITDA — the company keeps 20¢ of every dollar of revenue as cash profit.",
  },
  exitEv: {
    title: "Exit EV (Enterprise Value)",
    body:
      "The price a buyer pays for the whole company at exit. ARR × the exit multiple. It's the total business value — before subtracting debt or paying any equity holder.",
  },
  exitMultiple: {
    title: "Exit multiple",
    body:
      "How many times revenue (or EBITDA) the buyer pays. SaaS M&A medians have been ~3× private / ~4.5× long-term. A 5× ARR exit on a $50M ARR business → $250M EV.",
  },
  debt: {
    title: "Outstanding debt",
    body:
      "Money the company owes lenders (banks, debt funds, sponsor loans). At exit, debt is paid back BEFORE any equity holder sees a dollar. High debt eats into your payout disproportionately at lower exit values.",
  },
  txnCosts: {
    title: "Transaction costs",
    body:
      "Investment bankers, lawyers, and accountants who run the sale. Usually ~2% of the deal price. Comes off the top before the equity pool is split.",
  },
  grossEquityPool: {
    title: "Gross Equity Pool",
    body:
      "What's left after paying off debt and transaction costs. This is the total cash that gets distributed across all equity holders (the PE majority sponsor, minority VCs, founders, MIP) through the 4-step waterfall.",
  },
  returnOfCapital: {
    title: "Step 1 · Return of Capital",
    body:
      "All cash-investing holders (the PE majority sponsor and minority VCs) get back the money they originally put in, pro-rata to their investment. Until they're 'whole', no one gets a dollar of profit. MIP gets nothing here — you didn't put in cash.",
  },
  preferredReturn: {
    title: "Step 2 · Preferred Return (8% hurdle)",
    body:
      "Investors earn an 8%-per-year return on their original investment before profits are shared. A 6-year hold at 8% compounded means investors need ~59% on top of their capital before profits flow. MIP gets nothing here either.",
  },
  gpCatchUp: {
    title: "Step 3 · GP Catch-Up",
    body:
      "The PE majority sponsor (the GP — General Partner of the fund) gets the next chunk to itself, until its profit share equals 20% (the standard carry rate). This 'catches the sponsor up' to the eventual 80/20 split. Other holders get nothing here.",
  },
  carriedSplit: {
    title: "Step 4 · 80/20 Carried Split",
    body:
      "The classic PE deal. 80% of the remaining profits go to all equity holders pro-rata by ownership % (including the MIP pool — this is where YOU get paid). 20% is the sponsor's 'carry' — its performance fee.",
  },
  sponsorMoic: {
    title: "Sponsor MOIC (Multiple on Invested Capital)",
    body:
      "How many times the PE majority's original investment they got back. Above 3× is what top PE shops shoot for (historical buyout avg ≈ 3.12× gross MOIC). Below 1× means they lost money. If the sponsor is below ~2×, they may prefer to hold longer rather than sell.",
  },
  mip: {
    title: "MIP (Management Incentive Plan)",
    body:
      "A pool of equity reserved for management and employees. Usually 5–15% of the company. You own a slice of THIS POOL — not the company directly. Recruiter says '$500K equity' → that's your share of the MIP, at today's 409A value.",
  },
  fourOhNineA: {
    title: "409A valuation",
    body:
      "An IRS-mandated fair-market value of a company's common stock for tax purposes. It's what your shares are worth on paper today — but the 409A doesn't price the waterfall. At exit, debt + preferred + sponsor carry get paid first, so what you actually take home can be much less (or more) than the 409A.",
  },
  todayCompanyValue: {
    title: "Today's company value at 409A",
    body:
      "Roughly what the company is worth right now per its most recent 409A appraisal — typically modestly above current debt + preferred for distressed periods, or several × ARR for healthy ones. If you don't know, a rough proxy is 2–4× current ARR less debt.",
  },
  vested: {
    title: "Vested today",
    body:
      "The portion of your grant you've already earned. Most PE-backed plans vest over 4 years with a 1-year cliff. New hire: 0%. Year 1 cliff hit: 25%. Year 2: 50%. Year 4: 100%.",
  },
  holdYears: {
    title: "Hold years",
    body:
      "Total time the PE majority owns the company from buy to sell. PE deals are usually 3–7 years. Longer holds compound the 8% preferred return hurdle — at 7 years, investors need ~71% on top of capital before profits flow to you.",
  },
  yearsElapsed: {
    title: "Years already elapsed",
    body:
      "How long the PE majority has already owned the business. Counts toward the preferred-return clock, so the hurdle the sponsor has to clear keeps growing each year of hold.",
  },
  projectionYears: {
    title: "Projection years",
    body:
      "How many more years before exit. The company grows for this many years at the chosen ARR growth rate. Add to 'years elapsed' to get total hold time.",
  },
  sponsorBasis: {
    title: "Sponsor basis",
    body:
      "How much cash the PE majority invested in the company at the original buyout. Usually private — the default ($70.2M) is illustrative. This drives everything: the sponsor's MOIC, the preferred return amount, the break-even ARR.",
  },
  liqPref: {
    title: "Liquidation preference",
    body:
      "A senior claim some investors negotiate — often early VCs who roll into a buyout. They get their full investment back (1× or more) before sponsor preferred or common stock see anything. This can invert outcomes: a minority investor with a liq pref can outperform the PE majority at low exit multiples.",
  },
  capTable: {
    title: "Cap table",
    body:
      "The list of who owns what % of the company, plus any special claims (liquidation preferences, performance unlocks). Knowing the cap table is the difference between thinking you own 'X% of the company' and knowing what you actually take home at exit.",
  },
  moic: {
    title: "MOIC",
    body:
      "Multiple on Invested Capital. Total cash you took out divided by total cash you put in. 2× MOIC = doubled your money. PE sponsors typically target 2.5–3.5× on a single deal.",
  },
  irr: {
    title: "IRR",
    body:
      "Internal Rate of Return — the annualized growth rate of your investment. A 2× MOIC over 5 years is ~15% IRR; over 7 years it's ~10%. PE sponsors typically target 20%+.",
  },
  mipPoolShare: {
    title: "Your share of MIP pool",
    body:
      "What fraction of the management pool your individual grant represents. Derived: your grant value at 409A ÷ (MIP pool % × today's company value). Example: $500K grant ÷ (10% × $100M) = 5% of the MIP pool.",
  },
  exitArr: {
    title: "Exit ARR",
    body:
      "Projected ARR at exit, after applying your growth assumption over the projection years. Current ARR × (1 + growth rate)^years.",
  },
  benchmark: {
    title: "Sponsor benchmark",
    body:
      "Top PE sponsors historically target ~3.0–3.12× gross MOIC on a single deal (industry benchmark from realized buyouts). If a scenario lands below ~2.5× MOIC, the PE majority is more likely to extend the hold than sell.",
  },
  sponsorPik: {
    title: "Sponsor PIK shareholder loan",
    body:
      "Some PE majorities split their investment between common equity and a PIK (paid-in-kind) shareholder loan. The loan accrues interest (e.g. 10%/year) that compounds rather than being paid in cash. At exit, the accrued PIK balance is paid in full BEFORE common equity holders see anything. This sits between LBO debt and common equity in seniority — and at long holds with high coupons it can wipe the common equity pool entirely.",
  },
  perfTiers: {
    title: "Performance-unlock tiers",
    body:
      "Many PE-backed MIPs gate management equity on sponsor return milestones. A typical structure: 0% unlocks below 2× sponsor MOIC, 50% at 2×, 100% at 3×. Add tiers as (MOIC threshold, % unlocked) pairs. The highest tier whose threshold is met determines your unlock factor; that fraction multiplies your vested MIP share.",
  },
  heatmap: {
    title: "Sensitivity grid",
    body:
      "Every cell is a full waterfall computed at that combination of ARR growth (rows) and exit multiple (columns). The 'Your payout' view colors cells by how the modeled payout compares to your 409A grant: red = below, green = above. The 'Sponsor MOIC' view colors by whether the PE majority hits its 3× benchmark. Click any cell to apply that scenario to the main app.",
  },
  valuationMethod: {
    title: "Valuation method",
    body:
      "Which multiple a buyer uses to price the company. ARR multiple is dominant for high-growth SaaS; EBITDA multiple is dominant for profitable / lower-growth businesses. They land on similar EVs when set consistently with the margin (5× ARR ≈ 25× EBITDA at 20% margin).",
  },
} satisfies Record<string, GlossaryEntry>;

export type GlossaryKey = keyof typeof GLOSSARY;
