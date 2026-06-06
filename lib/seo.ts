/**
 * Central SEO + site identity constants.
 * Update SITE_URL when you have a production domain.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://equitywaterfall.foundero.io";

export const SITE = {
  name: "Equity Waterfall",
  tagline: "Model what your PE equity is really worth",
  description:
    "Free calculator for prospective employees at PE-backed companies. Model what your equity grant actually pays at exit, past the 409A quote — sliders for ARR growth, exit multiple, debt, sponsor return, and MIP performance unlocks.",
  shortDescription:
    "What your PE-backed equity grant is really worth at exit — past the 409A quote.",
  keywords: [
    "PE equity calculator",
    "private equity waterfall",
    "409A calculator",
    "MIP calculator",
    "management incentive plan",
    "PE equity exit",
    "carried interest calculator",
    "LBO waterfall",
    "sponsor MOIC",
    "preferred return calculator",
    "private equity employee equity",
    "prospective employee equity",
    "equity offer evaluation",
  ],
  authorName: "Mehul Shah",
  authorGithub: "https://github.com/mehulsshah",
  repoUrl: "https://github.com/mehulsshah/EquityWaterfall",
} as const;
