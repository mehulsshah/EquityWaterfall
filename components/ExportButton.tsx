"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadCSV } from "@/lib/utils";
import type {
  DealInputs,
  EmployeeGrant,
  ExitScenario,
  Holder,
  WaterfallResult,
} from "@/lib/types";

type Props = {
  holders: Holder[];
  deal: DealInputs;
  scenario: ExitScenario;
  employee: EmployeeGrant;
  result: WaterfallResult;
};

export function ExportButton({ holders, deal, scenario, employee, result }: Props) {
  const onClick = () => {
    const rows: (string | number)[][] = [];

    rows.push(["EQUITY WATERFALL — SCENARIO EXPORT"]);
    rows.push([]);
    rows.push(["Scenario Inputs"]);
    rows.push(["Current ARR ($M)", deal.currentARR]);
    rows.push(["ARR growth (annual)", `${(deal.growthRate * 100).toFixed(1)}%`]);
    rows.push(["EBITDA margin", `${(deal.ebitdaMargin * 100).toFixed(0)}%`]);
    rows.push(["Outstanding debt ($M)", deal.outstandingDebt]);
    rows.push([
      "Valuation method",
      scenario.valuationMethod === "ebitda_multiple" ? "× EBITDA" : "× ARR",
    ]);
    rows.push([
      "Exit multiple",
      scenario.valuationMethod === "ebitda_multiple"
        ? `${scenario.ebitdaMultiple.toFixed(1)}× EBITDA`
        : `${scenario.exitMultiple.toFixed(1)}× ARR`,
    ]);
    rows.push(["Years already elapsed", scenario.yearsAlreadyElapsed]);
    rows.push(["Projection years", scenario.projectionYears]);
    rows.push(["Total hold years", result.holdYears]);
    rows.push(["Hurdle rate", `${(deal.hurdleRate * 100).toFixed(1)}%`]);
    rows.push(["Carry rate", `${(deal.carryRate * 100).toFixed(0)}%`]);
    if (deal.sponsorLoan.enabled) {
      rows.push(["Sponsor PIK loan ($M)", deal.sponsorLoan.amount]);
      rows.push(["PIK coupon rate", `${(deal.sponsorLoan.couponRate * 100).toFixed(1)}%`]);
      rows.push(["PIK accrued at exit ($M)", result.sponsorLoanAccrued.toFixed(2)]);
    }

    rows.push([]);
    rows.push(["Computed Values"]);
    rows.push(["Exit ARR ($M)", result.exitARR.toFixed(2)]);
    rows.push(["Exit EBITDA ($M)", result.exitEBITDA.toFixed(2)]);
    rows.push(["Exit Enterprise Value ($M)", result.exitEV.toFixed(2)]);
    rows.push(["Implied ARR multiple", `${result.impliedArrMultiple.toFixed(2)}×`]);
    rows.push(["Implied EBITDA multiple", `${result.impliedEbitdaMultiple.toFixed(2)}×`]);
    rows.push(["Transaction costs ($M)", result.txnCosts.toFixed(2)]);
    rows.push(["Gross Equity Pool ($M)", result.grossEquityPool.toFixed(2)]);

    rows.push([]);
    rows.push(["4-Step Waterfall Totals ($M)"]);
    rows.push(["Step 1 — Return of Capital", result.steps.step1.total.toFixed(2)]);
    rows.push(["Step 2 — Preferred Return (8%)", result.steps.step2.total.toFixed(2)]);
    rows.push(["Step 3 — GP Catch-Up", result.steps.step3.total.toFixed(2)]);
    rows.push(["Step 4 — 80/20 Carried Split", result.steps.step4.total.toFixed(2)]);

    rows.push([]);
    rows.push(["Per-Holder Breakdown ($M)"]);
    rows.push([
      "Holder",
      "Role",
      "Invested",
      "Ownership",
      "Step 1",
      "Step 2",
      "Step 3",
      "Step 4",
      "Total Payout",
      "MOIC",
      "IRR",
    ]);
    for (const h of holders) {
      const r = result.perHolder[h.id];
      rows.push([
        h.name,
        h.role,
        h.capitalInvested.toFixed(2),
        `${(h.ownershipPct * 100).toFixed(2)}%`,
        result.steps.step1.perHolder[h.id]?.toFixed(2) ?? "0",
        result.steps.step2.perHolder[h.id]?.toFixed(2) ?? "0",
        result.steps.step3.perHolder[h.id]?.toFixed(2) ?? "0",
        result.steps.step4.perHolder[h.id]?.toFixed(2) ?? "0",
        r.totalPayout.toFixed(2),
        r.moic !== null ? `${r.moic.toFixed(2)}×` : "—",
        r.irr !== null ? `${(r.irr * 100).toFixed(1)}%` : "—",
      ]);
    }

    rows.push([]);
    rows.push(["Your Equity"]);
    rows.push(["Grant value at 409A ($)", employee.grantValueAt409a]);
    rows.push(["Today's company value at 409A ($M)", employee.todayCompanyValue409a]);
    rows.push(["Vested today (%)", `${(employee.vested * 100).toFixed(0)}%`]);
    if (result.employee) {
      rows.push(["Derived MIP share", `${(result.employee.pctOfMip * 100).toFixed(2)}%`]);
      rows.push(["Raw MIP allocation ($M)", result.employee.rawShare.toFixed(3)]);
      rows.push(["Unlock factor (perf gating)", `${(result.employee.unlockFactor * 100).toFixed(0)}%`]);
      rows.push(["Modeled payout ($)", (result.employee.vestedShare * 1e6).toFixed(0)]);
      rows.push([
        "Multiple vs 409A",
        result.employee.multipleVs409a !== null
          ? `${result.employee.multipleVs409a.toFixed(2)}×`
          : "—",
      ]);
    }

    const ts = new Date().toISOString().slice(0, 10);
    downloadCSV(`equity-waterfall-${ts}.csv`, rows);
  };

  return (
    <Button variant="outline" size="sm" onClick={onClick} className="gap-1.5">
      <Download className="h-3.5 w-3.5" />
      <span>Export CSV</span>
    </Button>
  );
}
