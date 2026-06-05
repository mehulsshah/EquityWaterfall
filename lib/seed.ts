import type { DealInputs, EmployeeGrant, ExitScenario, Holder } from "./types";

/** Default cap table — generic PE-backed software company shape.
 * Numbers are illustrative; every field is user-editable in the UI. */
export const DEFAULT_HOLDERS: Holder[] = [
  {
    id: "pe_majority",
    name: "PE Majority",
    role: "sponsor",
    ownershipPct: 0.6,
    capitalInvested: 70.2,
    isSponsor: true,
  },
  {
    id: "pe_minority_a",
    name: "PE Minority A",
    role: "minority_vc",
    ownershipPct: 0.12,
    capitalInvested: 13.0,
  },
  {
    id: "mip",
    name: "Management Pool (MIP)",
    role: "mip",
    ownershipPct: 0.1,
    capitalInvested: 0,
  },
  {
    id: "pe_minority_b",
    name: "PE Minority B",
    role: "minority_vc",
    ownershipPct: 0.07,
    capitalInvested: 4.1,
  },
  {
    id: "founders",
    name: "Founders / Angels",
    role: "founder",
    ownershipPct: 0.06,
    capitalInvested: 0,
  },
  {
    id: "pe_minority_c",
    name: "PE Minority C",
    role: "minority_vc",
    ownershipPct: 0.05,
    capitalInvested: 3.15,
  },
];

export const DEFAULT_DEAL: DealInputs = {
  currentARR: 48,
  growthRate: 0.05,
  ebitdaMargin: 0.2,
  outstandingDebt: 56,
  txnCostsPct: 0.02,
  hurdleRate: 0.08,
  carryRate: 0.2,
  sponsorLoan: { enabled: false, amount: 50, couponRate: 0.1 },
};

export const DEFAULT_SCENARIO: ExitScenario = {
  valuationMethod: "arr_multiple",
  exitMultiple: 5,
  ebitdaMultiple: 20,
  projectionYears: 2,
  yearsAlreadyElapsed: 4,
};

export const DEFAULT_EMPLOYEE: EmployeeGrant = {
  grantType: "options",
  /** Recruiter quoted "$500K equity at today's 409A" — mid-senior IC scale. */
  grantValueAt409a: 500_000,
  /** Today's company ~ current ARR × 3 less debt ≈ $144M – $56M ≈ $88M.
   * Round to $100M for a clean default; user can adjust. */
  todayCompanyValue409a: 100,
  vested: 0.5,
  /** Default: no performance gating. Toggle on in the UI to add tiers like
   * 50% at 2× MOIC, 100% at 3× MOIC (a typical PE sponsor structure). */
  performanceUnlocks: {
    enabled: false,
    tiers: [
      { moicThreshold: 2.0, unlockPct: 0.5 },
      { moicThreshold: 3.0, unlockPct: 1.0 },
    ],
  },
};

/** Typical PE sponsor targets — used to calibrate scenarios.
 * 3.12× is the historical avg gross MOIC for top-decile sponsors across realized buyouts. */
export const SPONSOR_BENCHMARKS = {
  historicalGrossMoic: 3.12,
  fundTargetMoic: 3.0,
};
