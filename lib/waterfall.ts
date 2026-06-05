import type {
  DealInputs,
  EmployeeGrant,
  ExitScenario,
  Holder,
  WaterfallResult,
} from "./types";

/**
 * 4-step LBO distribution waterfall (per MODELING.md Part 11).
 *
 * Step 0: Gross Equity Pool = ExitEV − Debt − TxnCosts
 * Step 1: Return of Capital — pro-rata among cash-invested holders, capped at pool
 * Step 2: Preferred Return — Invested × ((1 + hurdle)^years − 1), pro-rata, capped
 * Step 3: GP Catch-up — (carry/(1−carry)) × Step2, 100% to sponsor, capped
 * Step 4: 80/20 split — 80% pro-rata to all holders by ownership, 20% carry to sponsor
 */
export function computeWaterfall(
  holders: Holder[],
  inputs: DealInputs,
  scenario: ExitScenario,
  employee?: EmployeeGrant,
): WaterfallResult {
  const exitARR =
    inputs.currentARR * Math.pow(1 + inputs.growthRate, scenario.projectionYears);
  const exitEBITDA = exitARR * inputs.ebitdaMargin;
  const exitEV =
    scenario.valuationMethod === "ebitda_multiple"
      ? exitEBITDA * scenario.ebitdaMultiple
      : exitARR * scenario.exitMultiple;
  const impliedArrMultiple = exitARR > 0 ? exitEV / exitARR : 0;
  const impliedEbitdaMultiple = exitEBITDA > 0 ? exitEV / exitEBITDA : 0;
  const txnCosts = exitEV * inputs.txnCostsPct;
  const afterDebt = Math.max(exitEV - inputs.outstandingDebt - txnCosts, 0);

  const holdYears = scenario.yearsAlreadyElapsed + scenario.projectionYears;
  const cashInvested = holders.filter((h) => h.capitalInvested > 0);
  const totalInvested = cashInvested.reduce((s, h) => s + h.capitalInvested, 0);

  // Per-holder step ledger (s0 = PIK loan repayment to sponsor)
  const ledger: Record<
    string,
    { s0: number; s1: number; s2: number; s3: number; s4: number }
  > = {};
  for (const h of holders) ledger[h.id] = { s0: 0, s1: 0, s2: 0, s3: 0, s4: 0 };

  // Step 0.5: Sponsor PIK shareholder loan — repaid before any common equity.
  // Accrues at the PIK rate compounded over the hold; capped at remaining pool.
  const sponsorRef = holders.find((h) => h.isSponsor);
  let sponsorLoanAccrued = 0;
  let sponsorLoanPayment = 0;
  if (
    inputs.sponsorLoan?.enabled &&
    inputs.sponsorLoan.amount > 0 &&
    sponsorRef
  ) {
    sponsorLoanAccrued =
      inputs.sponsorLoan.amount *
      Math.pow(1 + inputs.sponsorLoan.couponRate, holdYears);
    sponsorLoanPayment = Math.min(sponsorLoanAccrued, afterDebt);
    ledger[sponsorRef.id].s0 = sponsorLoanPayment;
  }
  const grossEquityPool = afterDebt - sponsorLoanPayment;

  // Step 1
  const step1Total = Math.min(grossEquityPool, totalInvested);
  if (totalInvested > 0) {
    for (const h of cashInvested) {
      ledger[h.id].s1 = step1Total * (h.capitalInvested / totalInvested);
    }
  }
  let remaining = grossEquityPool - step1Total;

  // Step 2
  const totalPrefOwed =
    totalInvested * (Math.pow(1 + inputs.hurdleRate, holdYears) - 1);
  const step2Total = Math.min(totalPrefOwed, remaining);
  if (totalInvested > 0 && step2Total > 0) {
    for (const h of cashInvested) {
      ledger[h.id].s2 = step2Total * (h.capitalInvested / totalInvested);
    }
  }
  remaining -= step2Total;

  // Step 3 — sponsor catch-up
  const sponsor = holders.find((h) => h.isSponsor);
  const catchUpOwed = (inputs.carryRate / (1 - inputs.carryRate)) * step2Total;
  const step3Total = Math.min(catchUpOwed, remaining);
  if (sponsor && step3Total > 0) {
    ledger[sponsor.id].s3 = step3Total;
  }
  remaining -= step3Total;

  // Step 4 — 80/20 split
  const gpCarry = remaining * inputs.carryRate;
  const lpPool = remaining * (1 - inputs.carryRate);
  if (sponsor) ledger[sponsor.id].s4 += gpCarry;
  for (const h of holders) {
    ledger[h.id].s4 += lpPool * h.ownershipPct;
  }
  const step4Total = remaining;

  // Per-holder results
  const perHolder: WaterfallResult["perHolder"] = {};
  for (const h of holders) {
    const l = ledger[h.id];
    const totalPayout = l.s0 + l.s1 + l.s2 + l.s3 + l.s4;
    // For the sponsor, basis includes both common equity AND the PIK loan principal.
    const basis =
      h.capitalInvested +
      (h.isSponsor && inputs.sponsorLoan?.enabled
        ? inputs.sponsorLoan.amount
        : 0);
    const moic = basis > 0 ? totalPayout / basis : null;
    const irr =
      moic !== null && moic > 0 && holdYears > 0
        ? Math.pow(moic, 1 / holdYears) - 1
        : null;
    perHolder[h.id] = {
      holderName: h.name,
      capitalInvested: basis,
      totalPayout,
      moic,
      irr,
      ownershipPct: h.ownershipPct,
    };
  }

  const sponsorMoic = sponsor ? perHolder[sponsor.id].moic : null;

  // Employee payout
  let employeeResult: WaterfallResult["employee"];
  if (employee) {
    const mip = holders.find((h) => h.role === "mip");
    if (mip) {
      // Translate the recruiter's "$X grant at 409A" into a fraction of the MIP pool.
      // Today's MIP pool value = MIP ownership % × today's company equity value.
      // Employee % of MIP = grant $ / today's MIP pool $.
      const grantValueM = employee.grantValueAt409a / 1e6;
      const todayMipPoolValueM = employee.todayCompanyValue409a * mip.ownershipPct;
      const pctOfMip =
        todayMipPoolValueM > 0
          ? grantValueM / todayMipPoolValueM
          : 0;

      const mipTotal =
        ledger[mip.id].s1 + ledger[mip.id].s2 + ledger[mip.id].s3 + ledger[mip.id].s4;
      const rawShare = mipTotal * pctOfMip;

      // Performance unlock — tiered: pick the highest-pct tier whose threshold is hit.
      // Default = 1 (fully unlocked) when no tiers configured.
      let unlockFactor = 1;
      let perfTriggered = true;
      let perfThresholdLabel: string | null = null;
      if (
        employee.performanceUnlocks?.enabled &&
        employee.performanceUnlocks.tiers.length > 0
      ) {
        const moic = sponsorMoic ?? 0;
        const hitTiers = employee.performanceUnlocks.tiers
          .filter((t) => moic >= t.moicThreshold)
          .sort((a, b) => b.unlockPct - a.unlockPct);
        unlockFactor = hitTiers[0]?.unlockPct ?? 0;
        perfTriggered = unlockFactor > 0;
        const sortedTiers = [...employee.performanceUnlocks.tiers].sort(
          (a, b) => a.moicThreshold - b.moicThreshold,
        );
        const firstTier = sortedTiers[0];
        perfThresholdLabel = firstTier
          ? `${(unlockFactor * 100).toFixed(0)}% unlocked at Sponsor MOIC ${fmt2(moic)}× (next tier ${fmt2(nextTierAbove(sortedTiers, moic) ?? firstTier.moicThreshold)}×)`
          : null;
      }

      const vestedShare = rawShare * employee.vested * unlockFactor;
      const multipleVs409a = grantValueM > 0 ? vestedShare / grantValueM : null;

      employeeResult = {
        pctOfMip,
        rawShare,
        vestedShare,
        perfTriggered,
        perfThresholdLabel,
        unlockFactor,
        value409a: grantValueM,
        multipleVs409a,
      };
    }
  }

  return {
    exitARR,
    exitEBITDA,
    exitEV,
    impliedArrMultiple,
    impliedEbitdaMultiple,
    txnCosts,
    sponsorLoanPayment,
    sponsorLoanAccrued,
    grossEquityPool,
    holdYears,
    steps: {
      step1: { total: step1Total, perHolder: mapByStep(ledger, "s1") },
      step2: { total: step2Total, perHolder: mapByStep(ledger, "s2") },
      step3: { total: step3Total, perHolder: mapByStep(ledger, "s3") },
      step4: { total: step4Total, perHolder: mapByStep(ledger, "s4") },
    },
    perHolder,
    sponsorMoic,
    employee: employeeResult,
  };
}

function mapByStep(
  ledger: Record<string, { s0: number; s1: number; s2: number; s3: number; s4: number }>,
  key: "s1" | "s2" | "s3" | "s4",
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [id, vals] of Object.entries(ledger)) out[id] = vals[key];
  return out;
}

function fmt2(v: number): string {
  return v.toFixed(2);
}

function nextTierAbove(
  sortedTiers: { moicThreshold: number; unlockPct: number }[],
  moic: number,
): number | null {
  for (const t of sortedTiers) if (t.moicThreshold > moic) return t.moicThreshold;
  return null;
}

/** Find the minimum ARR required for the sponsor to hit `targetMoic` at the given exit multiple. */
export function breakEvenARR(
  holders: Holder[],
  inputs: DealInputs,
  scenario: ExitScenario,
  targetMoic = 1.0,
): number | null {
  const sponsor = holders.find((h) => h.isSponsor);
  if (!sponsor || sponsor.capitalInvested <= 0) return null;

  // Binary search on current ARR
  let lo = 0;
  let hi = inputs.currentARR * 20;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const r = computeWaterfall(
      holders,
      { ...inputs, currentARR: mid, growthRate: 0 },
      { ...scenario, projectionYears: 0 },
    );
    const m = r.perHolder[sponsor.id].moic ?? 0;
    if (m < targetMoic) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}
