export type HolderRole = "sponsor" | "minority_vc" | "mip" | "founder" | "rollover";

export type LiqPref = {
  amount: number;
  multiple: number;
  participating: boolean;
  seniority: number;
};

export type Holder = {
  id: string;
  name: string;
  role: HolderRole;
  ownershipPct: number;
  capitalInvested: number;
  liqPref?: LiqPref;
  isSponsor?: boolean;
};

export type SponsorLoan = {
  enabled: boolean;
  /** Initial principal of the sponsor PIK shareholder loan, in $M. */
  amount: number;
  /** Annual PIK rate (e.g. 0.10 = 10% PIK compounded over the hold). */
  couponRate: number;
};

export type DealInputs = {
  currentARR: number;
  growthRate: number;
  ebitdaMargin: number;
  outstandingDebt: number;
  txnCostsPct: number;
  hurdleRate: number;
  carryRate: number;
  sponsorLoan: SponsorLoan;
};

export type ValuationMethod = "arr_multiple" | "ebitda_multiple";

export type ExitScenario = {
  valuationMethod: ValuationMethod;
  exitMultiple: number;       // ARR multiple (used when valuationMethod === "arr_multiple")
  ebitdaMultiple: number;     // EBITDA multiple (used when valuationMethod === "ebitda_multiple")
  projectionYears: number;
  yearsAlreadyElapsed: number;
};

export type GrantType = "options" | "rsu" | "profits_interest" | "phantom";

export type MipUnlockTier = {
  /** Sponsor MOIC threshold at which this tier unlocks. */
  moicThreshold: number;
  /** Fraction of MIP unlocked once threshold is hit (0-1). */
  unlockPct: number;
};

export type PerformanceUnlocks = {
  enabled: boolean;
  tiers: MipUnlockTier[];
};

export type EmployeeGrant = {
  grantType: GrantType;
  /** What the recruiter quoted: total grant value at today's 409A FMV, in dollars. */
  grantValueAt409a: number;
  /** Today's 409A-implied total company equity value, in $M. Used to derive MIP share. */
  todayCompanyValue409a: number;
  vested: number;
  performanceUnlocks: PerformanceUnlocks;
};

export type StepBreakdown = {
  total: number;
  perHolder: Record<string, number>;
};

export type HolderResult = {
  holderName: string;
  capitalInvested: number;
  totalPayout: number;
  moic: number | null;
  irr: number | null;
  ownershipPct: number;
};

export type EmployeeResult = {
  /** Derived MIP-pool share (e.g. 0.02 = 2% of MIP). */
  pctOfMip: number;
  rawShare: number;
  vestedShare: number;
  perfTriggered: boolean;
  perfThresholdLabel: string | null;
  /** Fraction of MIP performance-unlocked at the achieved sponsor MOIC (0-1). 1 = no perf gating. */
  unlockFactor: number;
  /** Grant value at 409A in $M. */
  value409a: number;
  multipleVs409a: number | null;
};

export type WaterfallResult = {
  exitARR: number;
  exitEBITDA: number;
  exitEV: number;
  impliedArrMultiple: number;
  impliedEbitdaMultiple: number;
  txnCosts: number;
  /** Amount paid to sponsor for PIK shareholder loan (if any). Reduces equity pool. */
  sponsorLoanPayment: number;
  /** Accrued PIK balance (principal + compounded coupon over holdYears). */
  sponsorLoanAccrued: number;
  grossEquityPool: number;
  holdYears: number;
  steps: {
    step1: StepBreakdown;
    step2: StepBreakdown;
    step3: StepBreakdown;
    step4: StepBreakdown;
  };
  perHolder: Record<string, HolderResult>;
  sponsorMoic: number | null;
  employee?: EmployeeResult;
};
