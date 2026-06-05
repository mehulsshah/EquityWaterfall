"use client";

import type { Holder, WaterfallResult } from "@/lib/types";
import { fmt } from "@/lib/utils";
import { InfoTip } from "@/components/InfoTip";

type Props = {
  holders: Holder[];
  result: WaterfallResult;
  /** When provided, name / invested / ownership become editable. */
  onHoldersChange?: (next: Holder[]) => void;
};

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  sponsor: { label: "Sponsor", cls: "bg-primary/10 text-primary border-primary/20" },
  minority_vc: { label: "Minority VC", cls: "bg-slate-100 text-slate-700 border-slate-200" },
  mip: { label: "MIP", cls: "bg-success/10 text-success border-success/20" },
  founder: { label: "Founder", cls: "bg-warning/10 text-warning border-warning/20" },
  rollover: { label: "Rollover", cls: "bg-slate-100 text-slate-700 border-slate-200" },
};

export function HolderTable({ holders, result, onHoldersChange }: Props) {
  const editable = !!onHoldersChange;
  const totalOwnership = holders.reduce((s, h) => s + h.ownershipPct, 0);
  const totalInvested = holders.reduce((s, h) => s + h.capitalInvested, 0);

  const update = (id: string, patch: Partial<Holder>) =>
    onHoldersChange?.(holders.map((h) => (h.id === id ? { ...h, ...patch } : h)));

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-muted/40">
          <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 font-medium">Holder</th>
            <th className="px-4 py-3 font-medium text-right">Invested</th>
            <th className="px-4 py-3 font-medium text-right">Ownership</th>
            <th className="px-4 py-3 font-medium text-right">Payout</th>
            <th className="px-4 py-3 font-medium text-right">
              <span className="inline-flex items-center gap-1.5">
                MOIC <InfoTip term="moic" />
              </span>
            </th>
            <th className="px-4 py-3 font-medium text-right">
              <span className="inline-flex items-center gap-1.5">
                IRR <InfoTip term="irr" />
              </span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {holders.map((h) => {
            const r = result.perHolder[h.id];
            const badge = ROLE_BADGE[h.role];
            const moic = r.moic;
            const moicColor =
              moic === null
                ? "text-muted-foreground"
                : moic < 1
                  ? "text-destructive"
                  : moic >= 3
                    ? "text-success"
                    : "text-foreground";
            return (
              <tr key={h.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    {editable ? (
                      <TextCell
                        value={h.name}
                        onChange={(v) => update(h.id, { name: v })}
                      />
                    ) : (
                      <span className="font-medium">{h.name}</span>
                    )}
                    <span
                      className={`shrink-0 inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${badge.cls}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right">
                  {editable ? (
                    <NumericCell
                      value={h.capitalInvested}
                      prefix="$"
                      suffix="M"
                      step={0.1}
                      onChange={(v) => update(h.id, { capitalInvested: v })}
                    />
                  ) : (
                    <span className="num text-muted-foreground">
                      {h.capitalInvested > 0 ? fmt.moneyM(h.capitalInvested) : "—"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {editable ? (
                    <NumericCell
                      value={h.ownershipPct * 100}
                      suffix="%"
                      step={0.1}
                      onChange={(v) =>
                        update(h.id, { ownershipPct: Math.max(0, v) / 100 })
                      }
                    />
                  ) : (
                    <span className="num text-muted-foreground">
                      {fmt.pct(h.ownershipPct)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-right num font-medium">
                  {fmt.moneyM(r.totalPayout)}
                </td>
                <td className={`px-4 py-2.5 text-right num font-medium ${moicColor}`}>
                  {moic === null ? "—" : fmt.mult(moic)}
                </td>
                <td className="px-4 py-2.5 text-right num text-muted-foreground">
                  {r.irr === null ? "—" : `${(r.irr * 100).toFixed(1)}%`}
                </td>
              </tr>
            );
          })}
        </tbody>
        {editable ? (
          <tfoot className="bg-muted/20">
            <tr className="text-xs text-muted-foreground">
              <td className="px-4 py-2.5 font-medium">Totals</td>
              <td className="px-4 py-2.5 text-right num">
                {fmt.moneyM(totalInvested, 1)}
              </td>
              <td
                className={`px-4 py-2.5 text-right num font-medium ${
                  Math.abs(totalOwnership - 1) > 0.001
                    ? "text-warning"
                    : "text-success"
                }`}
              >
                {fmt.pct(totalOwnership, 1)}
              </td>
              <td colSpan={3} className="px-4 py-2.5"></td>
            </tr>
          </tfoot>
        ) : null}
      </table>
      {editable && Math.abs(totalOwnership - 1) > 0.001 ? (
        <div className="border-t border-warning/30 bg-warning/5 px-4 py-2.5 text-xs text-warning">
          Ownership totals {fmt.pct(totalOwnership, 2)}, not 100%. Recompute uses these
          values as-is — at exit Step 4 will distribute proportionally regardless.
        </div>
      ) : null}
    </div>
  );
}

/* ---------- inline editable cells ---------- */

function TextCell({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="min-w-0 flex-1 rounded-none border-0 border-b border-dashed border-transparent bg-transparent px-0.5 py-0.5 font-medium text-foreground transition-colors hover:border-input focus:border-primary focus:outline-none"
    />
  );
}

function NumericCell({
  value,
  onChange,
  prefix,
  suffix,
  step = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
}) {
  return (
    <span className="inline-flex items-baseline justify-end gap-0.5">
      {prefix ? <span className="text-xs text-muted-foreground">{prefix}</span> : null}
      <input
        type="number"
        value={value}
        step={step}
        onChange={(e) => {
          const n = parseFloat(e.target.value);
          if (!Number.isNaN(n)) onChange(n);
        }}
        className="num w-16 rounded-none border-0 border-b border-dashed border-transparent bg-transparent px-0.5 py-0.5 text-right font-medium text-foreground transition-colors hover:border-input focus:border-primary focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      {suffix ? <span className="text-xs text-muted-foreground">{suffix}</span> : null}
    </span>
  );
}
