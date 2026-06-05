"use client";

import { useMemo, useState } from "react";
import type {
  DealInputs,
  EmployeeGrant,
  ExitScenario,
  Holder,
} from "@/lib/types";
import { computeWaterfall } from "@/lib/waterfall";
import { cn, fmt } from "@/lib/utils";
import { InfoTip } from "@/components/InfoTip";

type Mode = "employee" | "sponsor";

type Props = {
  holders: Holder[];
  deal: DealInputs;
  scenario: ExitScenario;
  employee: EmployeeGrant;
  /** Apply the clicked cell's CAGR + multiple to the main app state. */
  onApplyCell: (next: { growthRate: number; multiple: number }) => void;
};

const CAGRS = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4];
const ARR_MULTS = [2, 3, 4, 5, 6, 7, 8, 10, 12];
const EBITDA_MULTS = [10, 15, 18, 20, 22, 25, 28, 32, 40];

const APPROX = (a: number, b: number, tol = 0.001) => Math.abs(a - b) < tol;

export function SensitivityHeatmap({
  holders,
  deal,
  scenario,
  employee,
  onApplyCell,
}: Props) {
  const [mode, setMode] = useState<Mode>("employee");
  const isEbitda = scenario.valuationMethod === "ebitda_multiple";
  const columnVals = isEbitda ? EBITDA_MULTS : ARR_MULTS;
  const currentMult = isEbitda ? scenario.ebitdaMultiple : scenario.exitMultiple;
  const value409aM = employee.grantValueAt409a / 1e6;

  const cells = useMemo(() => {
    return CAGRS.map((cagr) =>
      columnVals.map((mult) => {
        const r = computeWaterfall(
          holders,
          { ...deal, growthRate: cagr },
          isEbitda
            ? { ...scenario, ebitdaMultiple: mult }
            : { ...scenario, exitMultiple: mult },
          employee,
        );
        return {
          cagr,
          mult,
          payout: r.employee?.vestedShare ?? 0,
          ratio: r.employee?.multipleVs409a ?? 0,
          moic: r.sponsorMoic ?? 0,
        };
      }),
    );
  }, [holders, deal, scenario, employee, isEbitda, columnVals]);

  return (
    <div className="rounded-2xl border bg-card shadow-soft">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold tracking-tight">
            Sensitivity grid
          </h3>
          <InfoTip term="heatmap" />
        </div>
        <div className="inline-flex rounded-lg border bg-muted/40 p-0.5 text-sm">
          {[
            { v: "employee" as Mode, label: "Your payout" },
            { v: "sponsor" as Mode, label: "Sponsor MOIC" },
          ].map((opt) => {
            const active = mode === opt.v;
            return (
              <button
                key={opt.v}
                type="button"
                onClick={() => setMode(opt.v)}
                className={cn(
                  "rounded-md px-3 py-1 font-medium transition-all",
                  active
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto p-5">
        <table className="w-full border-separate border-spacing-0.5 text-center text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 bg-card px-2 py-1.5 text-right text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                <span className="inline-flex flex-col leading-tight">
                  <span>CAGR ↓</span>
                  <span>{isEbitda ? "× EBITDA →" : "× ARR →"}</span>
                </span>
              </th>
              {columnVals.map((m) => (
                <th
                  key={m}
                  className={cn(
                    "rounded-md px-2 py-1.5 text-[11px] font-medium text-muted-foreground",
                    APPROX(m, currentMult) && "bg-primary/10 text-primary",
                  )}
                >
                  {fmt.mult(m, m % 1 === 0 ? 0 : 1)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cells.map((row, i) => {
              const cagr = CAGRS[i];
              const isCurrentCagr = APPROX(cagr, deal.growthRate);
              return (
                <tr key={i}>
                  <th
                    className={cn(
                      "sticky left-0 bg-card px-2 py-1.5 text-right text-[11px] font-medium text-muted-foreground",
                      isCurrentCagr && "bg-primary/10 text-primary",
                    )}
                  >
                    {(cagr * 100).toFixed(0)}%
                  </th>
                  {row.map((cell, j) => {
                    const isCurrentCell =
                      isCurrentCagr && APPROX(cell.mult, currentMult);
                    const cls = cellStyle(cell, mode, value409aM);
                    const display =
                      mode === "employee"
                        ? formatPayout(cell.payout)
                        : fmt.mult(cell.moic);
                    return (
                      <td
                        key={j}
                        title={
                          mode === "employee"
                            ? `${(cell.cagr * 100).toFixed(0)}% CAGR, ${fmt.mult(cell.mult, 1)} → ${fmt.money(cell.payout * 1e6)} (${cell.ratio > 0 ? fmt.mult(cell.ratio) : "—"} of 409A)`
                            : `${(cell.cagr * 100).toFixed(0)}% CAGR, ${fmt.mult(cell.mult, 1)} → Sponsor MOIC ${fmt.mult(cell.moic)}`
                        }
                        onClick={() =>
                          onApplyCell({
                            growthRate: cell.cagr,
                            multiple: cell.mult,
                          })
                        }
                        className={cn(
                          "num cursor-pointer rounded-md px-2 py-2 font-medium transition-all hover:ring-2 hover:ring-primary/50",
                          cls,
                          isCurrentCell && "ring-2 ring-primary ring-offset-1",
                        )}
                      >
                        {display}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
          <span>Legend:</span>
          {mode === "employee" ? (
            <>
              <Swatch className="bg-destructive/30" label="< 0.25× of 409A" />
              <Swatch className="bg-destructive/20" label="0.25 – 0.5×" />
              <Swatch className="bg-destructive/10" label="0.5 – 1.0×" />
              <Swatch className="bg-warning/15" label="≈ 1.0×" />
              <Swatch className="bg-success/10" label="1.0 – 1.5×" />
              <Swatch className="bg-success/20" label="1.5 – 2.5×" />
              <Swatch className="bg-success/30" label="≥ 2.5×" />
            </>
          ) : (
            <>
              <Swatch className="bg-destructive/30" label="< 1× MOIC (loss)" />
              <Swatch className="bg-destructive/15" label="1 – 1.5×" />
              <Swatch className="bg-warning/15" label="1.5 – 2×" />
              <Swatch className="bg-success/10" label="2 – 3×" />
              <Swatch className="bg-success/20" label="3 – 4.5× (target)" />
              <Swatch className="bg-success/30" label="≥ 4.5×" />
            </>
          )}
          <span className="ml-auto text-muted-foreground/80">
            Click any cell to apply that scenario.
          </span>
        </div>
      </div>
    </div>
  );
}

function Swatch({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("inline-block h-3 w-3 rounded border", className)} />
      {label}
    </span>
  );
}

/** Compact money formatter for tight heatmap cells. */
function formatPayout(payoutM: number): string {
  const dollars = payoutM * 1e6;
  if (dollars === 0) return "$0";
  if (Math.abs(dollars) >= 1_000_000) return `$${(dollars / 1e6).toFixed(1)}M`;
  if (Math.abs(dollars) >= 1_000) return `$${Math.round(dollars / 1000)}K`;
  return `$${Math.round(dollars)}`;
}

/** Color cell based on mode and value. */
function cellStyle(
  cell: { ratio: number; moic: number },
  mode: Mode,
  value409aM: number,
): string {
  if (mode === "employee") {
    if (value409aM <= 0) return "bg-muted text-muted-foreground";
    const r = cell.ratio;
    if (r < 0.25) return "bg-destructive/30 text-destructive";
    if (r < 0.5) return "bg-destructive/20 text-destructive";
    if (r < 0.95) return "bg-destructive/10 text-destructive";
    if (r < 1.1) return "bg-warning/15 text-warning";
    if (r < 1.5) return "bg-success/10 text-success";
    if (r < 2.5) return "bg-success/20 text-success";
    return "bg-success/30 text-success";
  }
  const m = cell.moic;
  if (m < 1) return "bg-destructive/30 text-destructive";
  if (m < 1.5) return "bg-destructive/15 text-destructive";
  if (m < 2) return "bg-warning/15 text-warning";
  if (m < 3) return "bg-success/10 text-success";
  if (m < 4.5) return "bg-success/20 text-success";
  return "bg-success/30 text-success";
}
