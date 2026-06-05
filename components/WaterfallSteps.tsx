"use client";

import { fmt } from "@/lib/utils";
import type { WaterfallResult } from "@/lib/types";
import type { GlossaryKey } from "@/lib/glossary";
import { InfoTip } from "@/components/InfoTip";

type Props = { result: WaterfallResult };

type Row = {
  label: string;
  infoTerm: GlossaryKey;
  value: number;
  color: string;
  emphasis?: boolean;
};

export function WaterfallSteps({ result }: Props) {
  const { steps, grossEquityPool, exitEV, txnCosts } = result;
  const debt = exitEV - txnCosts - grossEquityPool;

  const rows: Row[] = [
    { label: "Exit Enterprise Value", infoTerm: "exitEv", value: exitEV, color: "bg-slate-200" },
    { label: "Outstanding debt", infoTerm: "debt", value: -debt, color: "bg-destructive/15 text-destructive" },
    { label: "Transaction costs (2%)", infoTerm: "txnCosts", value: -txnCosts, color: "bg-warning/15 text-warning" },
    { label: "Gross Equity Pool", infoTerm: "grossEquityPool", value: grossEquityPool, color: "bg-primary/10 text-primary", emphasis: true },
    { label: "Step 1 · Return of Capital", infoTerm: "returnOfCapital", value: -steps.step1.total, color: "bg-slate-100" },
    { label: "Step 2 · Preferred Return (8%)", infoTerm: "preferredReturn", value: -steps.step2.total, color: "bg-slate-100" },
    { label: "Step 3 · GP Catch-up", infoTerm: "gpCatchUp", value: -steps.step3.total, color: "bg-slate-100" },
    { label: "Step 4 · 80/20 Carried Split", infoTerm: "carriedSplit", value: -steps.step4.total, color: "bg-success/10 text-success", emphasis: true },
  ];

  const maxAbs = Math.max(...rows.map((r) => Math.abs(r.value))) || 1;

  return (
    <div className="space-y-1.5">
      {rows.map((r, i) => (
        <div key={i} className="group">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span
              className={`flex items-center gap-1.5 font-medium ${r.emphasis ? "text-foreground" : "text-muted-foreground"}`}
            >
              {r.label}
              <InfoTip term={r.infoTerm} />
            </span>
            <span className={`num ${r.emphasis ? "font-semibold" : ""}`}>
              {r.value >= 0 ? fmt.moneyM(r.value) : `−${fmt.moneyM(Math.abs(r.value))}`}
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-300 ${r.color.split(" ")[0]}`}
              style={{ width: `${(Math.abs(r.value) / maxAbs) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
