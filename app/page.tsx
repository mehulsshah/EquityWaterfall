"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Info, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { WaterfallSteps } from "@/components/WaterfallSteps";
import { HolderTable } from "@/components/HolderTable";
import { InfoTip } from "@/components/InfoTip";
import { ShareButton } from "@/components/ShareButton";
import { ExportButton } from "@/components/ExportButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { SensitivityHeatmap } from "@/components/SensitivityHeatmap";
import type { GlossaryKey } from "@/lib/glossary";
import { readStateFromUrl, writeStateToUrl } from "@/lib/share";
import {
  DEFAULT_DEAL,
  DEFAULT_HOLDERS,
  DEFAULT_SCENARIO,
  DEFAULT_EMPLOYEE,
  SPONSOR_BENCHMARKS,
} from "@/lib/seed";
import type { DealInputs, EmployeeGrant, ExitScenario, Holder } from "@/lib/types";
import { breakEvenARR, computeWaterfall } from "@/lib/waterfall";
import { cn, fmt } from "@/lib/utils";

export default function Page() {
  const [holders, setHolders] = useState<Holder[]>(DEFAULT_HOLDERS);
  const [deal, setDeal] = useState<DealInputs>(DEFAULT_DEAL);
  const [scenario, setScenario] = useState<ExitScenario>(DEFAULT_SCENARIO);
  const [employee, setEmployee] = useState<EmployeeGrant>(DEFAULT_EMPLOYEE);

  // Hydrate from URL hash on mount (shared/bookmarked scenarios).
  const skipUrlWrite = useRef(true);
  useEffect(() => {
    const shared = readStateFromUrl();
    if (shared) {
      setHolders(shared.h);
      setDeal(shared.d);
      setScenario(shared.s);
      setEmployee(shared.e);
    }
    // Allow URL writes after the initial mount completes.
    const id = setTimeout(() => {
      skipUrlWrite.current = false;
    }, 50);
    return () => clearTimeout(id);
  }, []);

  // Push state changes back into the URL hash (debounced) so the page stays bookmarkable.
  useEffect(() => {
    if (skipUrlWrite.current) return;
    const id = setTimeout(() => {
      writeStateToUrl({ v: 2, h: holders, d: deal, s: scenario, e: employee });
    }, 200);
    return () => clearTimeout(id);
  }, [holders, deal, scenario, employee]);

  const result = useMemo(
    () => computeWaterfall(holders, deal, scenario, employee),
    [holders, deal, scenario, employee],
  );

  const bearResult = useMemo(
    () =>
      computeWaterfall(
        holders,
        deal,
        {
          ...scenario,
          projectionYears: 0,
          exitMultiple: 3,
          ebitdaMultiple: 15,
        },
        employee,
      ),
    [holders, deal, scenario, employee],
  );

  const upsideResult = useMemo(
    () =>
      computeWaterfall(
        holders,
        deal,
        { ...scenario, exitMultiple: 8, ebitdaMultiple: 28 },
        employee,
      ),
    [holders, deal, scenario, employee],
  );

  const upsideLabel =
    scenario.valuationMethod === "ebitda_multiple" ? "28× EBITDA" : "8× ARR";

  const value409aM = employee.grantValueAt409a / 1e6;

  /** Tone for the Base Case card — relative to the 409A grant value.
   * <0.5 deep red · <1 red · ~1 amber · <2 green · ≥2 deep green */
  const baseCaseTone: ViewCardTone = (() => {
    const m = result.employee?.multipleVs409a;
    if (m === null || m === undefined) return "neutral";
    if (m < 0.5) return "danger-deep";
    if (m < 0.95) return "danger";
    if (m < 1.1) return "warning";
    if (m < 2.0) return "success";
    return "success-deep";
  })();

  const breakeven = useMemo(
    () => breakEvenARR(holders, deal, scenario, 1.0),
    [holders, deal, scenario],
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-grid pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <header className="border-b bg-background/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            <Logo />
            <div className="flex items-center gap-2">
              <ExportButton
                holders={holders}
                deal={deal}
                scenario={scenario}
                employee={employee}
                result={result}
              />
              <ShareButton
                getUrl={() => {
                  writeStateToUrl({
                    v: 2,
                    h: holders,
                    d: deal,
                    s: scenario,
                    e: employee,
                  });
                  return typeof window !== "undefined" ? window.location.href : "";
                }}
              />
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-12">
          {/* Hero — the three views */}
          <section className="mb-12">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Your equity at exit
              </h1>
              <p className="mt-2 max-w-2xl text-base text-muted-foreground">
                The 409A is what your shares are worth on paper today. What you
                actually take home at exit depends on debt, liquidation preferences,
                sponsor return, and where the equity multiple lands. Tune the
                inputs to see the range.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <ViewCard
                label="What 409A says"
                infoTerm="fourOhNineA"
                value={fmt.money(value409aM * 1e6)}
                sub={`Total quoted grant value · ${fmt.pct(employee.vested)} vested today`}
                tone="muted"
                icon={<Info className="h-4 w-4" />}
              />
              <ViewCard
                label="Base case — modeled payout"
                badge="Most likely"
                value={fmt.money((result.employee?.vestedShare ?? 0) * 1e6)}
                sub={
                  result.employee?.multipleVs409a
                    ? `${fmt.mult(result.employee.multipleVs409a)} the 409A at ${
                        scenario.valuationMethod === "ebitda_multiple"
                          ? `${fmt.mult(scenario.ebitdaMultiple, 1)} EBITDA`
                          : `${fmt.mult(scenario.exitMultiple, 1)} ARR`
                      } exit`
                    : "—"
                }
                tone={baseCaseTone}
                emphasis
                icon={
                  result.employee &&
                  result.employee.multipleVs409a !== null &&
                  result.employee.multipleVs409a >= 1 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )
                }
              />
              <ViewCard
                label="Upside — sponsor benchmark hit"
                infoTerm="benchmark"
                value={fmt.money((upsideResult.employee?.vestedShare ?? 0) * 1e6)}
                sub={`At ${upsideLabel} exit, sponsor MOIC ${fmt.mult(upsideResult.sponsorMoic ?? 0)}`}
                tone="success"
                icon={<TrendingUp className="h-4 w-4" />}
              />
            </div>

            <Separator className="mt-8" />
          </section>

          {/* Inputs + Waterfall */}
          <section className="mb-12 grid gap-6 lg:grid-cols-5">
            {/* Inputs column */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Scenario inputs</CardTitle>
                <CardDescription>Move sliders — everything recomputes live.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-7">
                <div>
                  <div className="mb-2 flex items-center gap-1.5">
                    <Label className="text-sm">Valuation method</Label>
                    <InfoTip term="valuationMethod" />
                  </div>
                  <Segmented
                    value={scenario.valuationMethod}
                    options={[
                      { value: "arr_multiple", label: "× ARR" },
                      { value: "ebitda_multiple", label: "× EBITDA" },
                    ]}
                    onChange={(v) =>
                      setScenario({ ...scenario, valuationMethod: v as typeof scenario.valuationMethod })
                    }
                  />
                </div>

                {scenario.valuationMethod === "arr_multiple" ? (
                  <SliderRow
                    label="Exit multiple (× ARR)"
                    infoTerm="exitMultiple"
                    value={scenario.exitMultiple}
                    display={fmt.mult(scenario.exitMultiple, 1)}
                    min={1}
                    max={12}
                    step={0.5}
                    onChange={(v) => setScenario({ ...scenario, exitMultiple: v })}
                    hint="SaaS M&A medians: 3.1× private / 4.5× long-term"
                  />
                ) : (
                  <SliderRow
                    label="Exit multiple (× EBITDA)"
                    infoTerm="exitMultiple"
                    value={scenario.ebitdaMultiple}
                    display={fmt.mult(scenario.ebitdaMultiple, 1)}
                    min={5}
                    max={40}
                    step={0.5}
                    onChange={(v) => setScenario({ ...scenario, ebitdaMultiple: v })}
                    hint="Software EBITDA medians: 15–25× for growth SaaS"
                  />
                )}
                <SliderRow
                  label="ARR growth (annual)"
                  infoTerm="arr"
                  value={deal.growthRate * 100}
                  display={`${(deal.growthRate * 100).toFixed(0)}%`}
                  min={0}
                  max={50}
                  step={1}
                  onChange={(v) => setDeal({ ...deal, growthRate: v / 100 })}
                />
                <SliderRow
                  label="EBITDA margin"
                  infoTerm="ebitdaMargin"
                  value={deal.ebitdaMargin * 100}
                  display={`${(deal.ebitdaMargin * 100).toFixed(0)}%`}
                  min={0}
                  max={50}
                  step={1}
                  onChange={(v) => setDeal({ ...deal, ebitdaMargin: v / 100 })}
                  hint={`EBITDA today: ${fmt.moneyM(deal.currentARR * deal.ebitdaMargin, 1)}`}
                />
                <SliderRow
                  label="Projection years to exit"
                  infoTerm="projectionYears"
                  value={scenario.projectionYears}
                  display={`${scenario.projectionYears} yr`}
                  min={0}
                  max={7}
                  step={1}
                  onChange={(v) => setScenario({ ...scenario, projectionYears: v })}
                />
                <SliderRow
                  label="Years already elapsed"
                  infoTerm="yearsElapsed"
                  value={scenario.yearsAlreadyElapsed}
                  display={`${scenario.yearsAlreadyElapsed} yr`}
                  min={0}
                  max={8}
                  step={1}
                  onChange={(v) => setScenario({ ...scenario, yearsAlreadyElapsed: v })}
                  hint="Counts toward the 8% preferred-return clock"
                />

                <Separator />

                <SliderRow
                  label="Current ARR ($M)"
                  infoTerm="arr"
                  value={deal.currentARR}
                  display={fmt.moneyM(deal.currentARR, 0)}
                  min={5}
                  max={200}
                  step={1}
                  onChange={(v) => setDeal({ ...deal, currentARR: v })}
                />
                <SliderRow
                  label="Outstanding debt ($M)"
                  infoTerm="debt"
                  value={deal.outstandingDebt}
                  display={fmt.moneyM(deal.outstandingDebt, 0)}
                  min={0}
                  max={250}
                  step={1}
                  onChange={(v) => setDeal({ ...deal, outstandingDebt: v })}
                />

                {/* Sponsor PIK shareholder loan */}
                <div className="rounded-lg border border-dashed p-3">
                  <label className="flex cursor-pointer items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-sm font-medium">
                      Sponsor PIK shareholder loan
                      <InfoTip term="sponsorPik" />
                    </span>
                    <input
                      type="checkbox"
                      checked={deal.sponsorLoan.enabled}
                      onChange={(e) =>
                        setDeal({
                          ...deal,
                          sponsorLoan: { ...deal.sponsorLoan, enabled: e.target.checked },
                        })
                      }
                      className="h-4 w-4 cursor-pointer rounded border-input text-primary focus:ring-2 focus:ring-ring"
                    />
                  </label>
                  {deal.sponsorLoan.enabled ? (
                    <div className="mt-3 space-y-4">
                      <SliderRow
                        label="PIK loan principal ($M)"
                        value={deal.sponsorLoan.amount}
                        display={fmt.moneyM(deal.sponsorLoan.amount, 0)}
                        min={0}
                        max={300}
                        step={5}
                        onChange={(v) =>
                          setDeal({
                            ...deal,
                            sponsorLoan: { ...deal.sponsorLoan, amount: v },
                          })
                        }
                        hint={`Accrues to ~${fmt.moneyM(
                          deal.sponsorLoan.amount *
                            Math.pow(
                              1 + deal.sponsorLoan.couponRate,
                              scenario.yearsAlreadyElapsed + scenario.projectionYears,
                            ),
                          1,
                        )} at exit`}
                      />
                      <SliderRow
                        label="PIK coupon (annual, compounded)"
                        value={deal.sponsorLoan.couponRate * 100}
                        display={`${(deal.sponsorLoan.couponRate * 100).toFixed(0)}%`}
                        min={0}
                        max={20}
                        step={0.5}
                        onChange={(v) =>
                          setDeal({
                            ...deal,
                            sponsorLoan: {
                              ...deal.sponsorLoan,
                              couponRate: v / 100,
                            },
                          })
                        }
                      />
                    </div>
                  ) : null}
                </div>

                <Separator />

                <div>
                  <Label className="mb-3 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Your grant
                  </Label>
                  <div className="space-y-3">
                    <NumberField
                      label="Equity grant value at 409A ($)"
                      infoTerm="fourOhNineA"
                      hint="What the recruiter quoted — e.g. &quot;$500K equity at today's 409A&quot;"
                      value={employee.grantValueAt409a}
                      step={10000}
                      onChange={(v) =>
                        setEmployee({ ...employee, grantValueAt409a: v })
                      }
                    />
                    <NumberField
                      label="Today's company value at 409A ($M)"
                      infoTerm="todayCompanyValue"
                      hint="Ask the recruiter or look at the 409A valuation report. Default assumes ~3× ARR less debt."
                      value={employee.todayCompanyValue409a}
                      onChange={(v) =>
                        setEmployee({ ...employee, todayCompanyValue409a: v })
                      }
                    />
                    <NumberField
                      label="Vested today (%)"
                      infoTerm="vested"
                      hint="Time-vested portion already earned. New hire: 0%. Halfway through cliff: 25%."
                      value={employee.vested * 100}
                      onChange={(v) => setEmployee({ ...employee, vested: v / 100 })}
                    />
                  </div>

                  {/* Derived MIP % shown as a transparent translation */}
                  <div className="mt-3 rounded-lg border border-dashed border-primary/30 bg-primary/5 px-3 py-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        Your share of MIP pool
                        <InfoTip term="mipPoolShare" />
                      </span>
                      <span className="num font-semibold text-primary">
                        {result.employee
                          ? fmt.pct(result.employee.pctOfMip, 2)
                          : "—"}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                      Derived: ${(employee.grantValueAt409a / 1000).toFixed(0)}K ÷ (
                      {fmt.pct(
                        holders.find((h) => h.role === "mip")?.ownershipPct ?? 0,
                      )}{" "}
                      × ${employee.todayCompanyValue409a}M today)
                    </p>
                  </div>

                  {/* Performance unlock tiers — for MIPs gated on sponsor MOIC */}
                  <div className="mt-3 rounded-lg border border-dashed p-3">
                    <label className="flex cursor-pointer items-center justify-between gap-3">
                      <span className="flex items-center gap-1.5 text-sm font-medium">
                        Performance-unlock tiers
                        <InfoTip term="perfTiers" />
                      </span>
                      <input
                        type="checkbox"
                        checked={employee.performanceUnlocks.enabled}
                        onChange={(e) =>
                          setEmployee({
                            ...employee,
                            performanceUnlocks: {
                              ...employee.performanceUnlocks,
                              enabled: e.target.checked,
                            },
                          })
                        }
                        className="h-4 w-4 cursor-pointer rounded border-input text-primary focus:ring-2 focus:ring-ring"
                      />
                    </label>
                    {employee.performanceUnlocks.enabled ? (
                      <div className="mt-3 space-y-2">
                        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-[11px] font-medium text-muted-foreground">
                          <span>Sponsor MOIC ≥</span>
                          <span>Unlock %</span>
                          <span></span>
                        </div>
                        {employee.performanceUnlocks.tiers.map((tier, i) => (
                          <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
                            <Input
                              type="number"
                              value={tier.moicThreshold}
                              step={0.25}
                              onChange={(e) => {
                                const v = parseFloat(e.target.value);
                                if (Number.isNaN(v)) return;
                                const tiers = [...employee.performanceUnlocks.tiers];
                                tiers[i] = { ...tiers[i], moicThreshold: v };
                                setEmployee({
                                  ...employee,
                                  performanceUnlocks: {
                                    ...employee.performanceUnlocks,
                                    tiers,
                                  },
                                });
                              }}
                              className="num h-8 text-sm"
                            />
                            <Input
                              type="number"
                              value={tier.unlockPct * 100}
                              step={5}
                              onChange={(e) => {
                                const v = parseFloat(e.target.value);
                                if (Number.isNaN(v)) return;
                                const tiers = [...employee.performanceUnlocks.tiers];
                                tiers[i] = { ...tiers[i], unlockPct: Math.max(0, Math.min(100, v)) / 100 };
                                setEmployee({
                                  ...employee,
                                  performanceUnlocks: {
                                    ...employee.performanceUnlocks,
                                    tiers,
                                  },
                                });
                              }}
                              className="num h-8 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const tiers = employee.performanceUnlocks.tiers.filter(
                                  (_, j) => j !== i,
                                );
                                setEmployee({
                                  ...employee,
                                  performanceUnlocks: { ...employee.performanceUnlocks, tiers },
                                });
                              }}
                              className="h-8 w-8 rounded-md border text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                              aria-label="Remove tier"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const last = employee.performanceUnlocks.tiers[employee.performanceUnlocks.tiers.length - 1];
                            const nextThreshold = last ? last.moicThreshold + 0.5 : 2.0;
                            setEmployee({
                              ...employee,
                              performanceUnlocks: {
                                ...employee.performanceUnlocks,
                                tiers: [
                                  ...employee.performanceUnlocks.tiers,
                                  { moicThreshold: nextThreshold, unlockPct: 1.0 },
                                ],
                              },
                            });
                          }}
                          className="w-full rounded-md border border-dashed py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          + Add tier
                        </button>
                        {result.employee && result.employee.unlockFactor < 1 ? (
                          <p className="text-[11px] text-warning">
                            At current scenario, only {fmt.pct(result.employee.unlockFactor)} of
                            your MIP is unlocked.
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Waterfall column */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>The waterfall — where the money goes</CardTitle>
                <CardDescription>
                  Exit value flows through debt → preferred → carry before any equity reaches the
                  pool.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WaterfallSteps result={result} />

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Metric
                    label="Exit ARR"
                    infoTerm="exitArr"
                    value={fmt.moneyM(result.exitARR, 1)}
                    sub={`EBITDA ${fmt.moneyM(result.exitEBITDA, 1)}`}
                  />
                  <Metric
                    label="Exit EV"
                    infoTerm="exitEv"
                    value={fmt.moneyM(result.exitEV, 0)}
                    sub={`${fmt.mult(result.impliedArrMultiple, 1)} ARR · ${fmt.mult(result.impliedEbitdaMultiple, 1)} EBITDA`}
                  />
                  <Metric
                    label="Sponsor MOIC"
                    infoTerm="sponsorMoic"
                    value={result.sponsorMoic ? fmt.mult(result.sponsorMoic) : "—"}
                    sub={`vs ${fmt.mult(SPONSOR_BENCHMARKS.historicalGrossMoic)} benchmark`}
                    tone={
                      result.sponsorMoic && result.sponsorMoic >= SPONSOR_BENCHMARKS.historicalGrossMoic
                        ? "success"
                        : result.sponsorMoic && result.sponsorMoic < 1
                          ? "destructive"
                          : "warning"
                    }
                  />
                  <Metric
                    label="Hold years"
                    infoTerm="holdYears"
                    value={`${result.holdYears}`}
                    sub={`${scenario.yearsAlreadyElapsed} elapsed + ${scenario.projectionYears} fwd`}
                  />
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Insights row */}
          <section className="mb-12 grid gap-4 lg:grid-cols-3">
            <InsightCard
              tone={
                result.sponsorMoic && result.sponsorMoic < 1 ? "destructive" : "primary"
              }
              icon={
                result.sponsorMoic && result.sponsorMoic < 1 ? (
                  <TrendingDown className="h-4 w-4" />
                ) : (
                  <ArrowUpRight className="h-4 w-4" />
                )
              }
              title={
                result.sponsorMoic && result.sponsorMoic < 1
                  ? "PE majority is underwater at this exit"
                  : `Sponsor realizes ${fmt.mult(result.sponsorMoic ?? 0)} — ${result.sponsorMoic && result.sponsorMoic >= 3 ? "above" : "below"} 3.12× benchmark`
              }
              body={
                result.sponsorMoic && result.sponsorMoic < 1
                  ? "When the sponsor is below 1.0× MOIC, the management pool is typically wiped. This is the underwater scenario — sponsor remedies (MIP reset, debt waiver) may apply."
                  : "The PE majority's incentive to sell depends on hitting its benchmark. If the implied MOIC is below 3×, holding longer or running an add-on may be more attractive than selling now."
              }
            />
            <InsightCard
              tone="warning"
              icon={<Info className="h-4 w-4" />}
              title={
                breakeven
                  ? `Break-even ARR: ${fmt.moneyM(breakeven, 0)}`
                  : "Break-even unavailable"
              }
              body={
                breakeven
                  ? `At the current exit multiple of ${fmt.mult(scenario.exitMultiple, 1)}, the company needs to reach ${fmt.moneyM(breakeven, 0)} ARR before the PE majority hits 1.0× MOIC. Below that, the equity pool can't repay the sponsor.`
                  : "Adjust inputs to see the break-even ARR."
              }
            />
            <InsightCard
              tone="success"
              icon={<TrendingUp className="h-4 w-4" />}
              title="Bear vs upside spread"
              body={`At 3× exit you take home ${fmt.money((bearResult.employee?.vestedShare ?? 0) * 1e6)}. At 8× exit it's ${fmt.money((upsideResult.employee?.vestedShare ?? 0) * 1e6)}. The 409A number doesn't price this range.`}
            />
          </section>

          {/* Sensitivity heatmap */}
          <section className="mb-12">
            <div className="mb-4">
              <h2 className="text-xl font-semibold tracking-tight">
                What if growth or exit multiple were different?
              </h2>
              <p className="text-sm text-muted-foreground">
                Every cell is a full waterfall. Click any cell to apply it.
              </p>
            </div>
            <SensitivityHeatmap
              holders={holders}
              deal={deal}
              scenario={scenario}
              employee={employee}
              onApplyCell={({ growthRate, multiple }) => {
                setDeal((d) => ({ ...d, growthRate }));
                setScenario((s) =>
                  s.valuationMethod === "ebitda_multiple"
                    ? { ...s, ebitdaMultiple: multiple }
                    : { ...s, exitMultiple: multiple },
                );
              }}
            />
          </section>

          {/* Cap table */}
          <section className="mb-16">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                  Per-holder breakdown
                  <InfoTip term="capTable" />
                </h2>
                <p className="text-sm text-muted-foreground">
                  How the equity pool splits across the cap table at the current scenario.
                  <span className="ml-1 text-foreground/60">
                    Click any name, invested amount, or ownership % to edit.
                  </span>
                </p>
              </div>
            </div>
            <HolderTable holders={holders} result={result} onHoldersChange={setHolders} />
          </section>

          {/* Footer */}
          <footer className="mt-20 flex flex-wrap items-center justify-between gap-3 border-t pt-8 text-xs text-muted-foreground">
            <p>Educational tool — not financial advice.</p>
            <nav className="flex items-center gap-4">
              <a href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </a>
            </nav>
          </footer>
        </main>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

type ViewCardTone =
  | "muted"
  | "neutral"
  | "success"
  | "success-deep"
  | "warning"
  | "danger"
  | "danger-deep";

const TONE_STYLES: Record<
  ViewCardTone,
  { bg: string; border: string; accent: string; value: string }
> = {
  muted: {
    bg: "bg-card",
    border: "border-border",
    accent: "text-muted-foreground",
    value: "text-foreground",
  },
  neutral: {
    bg: "bg-gradient-to-br from-primary/5 to-primary/0",
    border: "border-primary/20",
    accent: "text-primary",
    value: "text-foreground",
  },
  success: {
    bg: "bg-gradient-to-br from-success/10 to-success/0",
    border: "border-success/20",
    accent: "text-success",
    value: "text-success",
  },
  "success-deep": {
    bg: "bg-gradient-to-br from-success/20 to-success/5",
    border: "border-success/40",
    accent: "text-success",
    value: "text-success",
  },
  warning: {
    bg: "bg-gradient-to-br from-warning/10 to-warning/0",
    border: "border-warning/30",
    accent: "text-warning",
    value: "text-warning",
  },
  danger: {
    bg: "bg-gradient-to-br from-destructive/10 to-destructive/0",
    border: "border-destructive/25",
    accent: "text-destructive",
    value: "text-destructive",
  },
  "danger-deep": {
    bg: "bg-gradient-to-br from-destructive/20 to-destructive/5",
    border: "border-destructive/40",
    accent: "text-destructive",
    value: "text-destructive",
  },
};

function ViewCard({
  label,
  infoTerm,
  value,
  sub,
  tone,
  emphasis,
  icon,
  badge,
}: {
  label: string;
  infoTerm?: GlossaryKey;
  value: string;
  sub: string;
  tone: ViewCardTone;
  emphasis?: boolean;
  icon?: React.ReactNode;
  /** Optional small pill above the label, e.g. "MOST LIKELY". */
  badge?: string;
}) {
  const s = TONE_STYLES[tone];
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-colors",
        s.bg,
        s.border,
        emphasis && "shadow-elevated ring-1 ring-black/[0.02]",
      )}
    >
      <CardContent className={cn("p-6", emphasis && "p-7")}>
        {badge ? (
          <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-foreground/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-background">
            {badge}
          </div>
        ) : null}
        <div className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <span className={cn(s.accent)}>{icon}</span>
          <span>{label}</span>
          {infoTerm ? <InfoTip term={infoTerm} /> : null}
        </div>
        <div
          className={cn(
            "num font-semibold tracking-tight",
            s.value,
            emphasis ? "text-4xl" : "text-3xl",
          )}
        >
          {value}
        </div>
        <div className="mt-2 text-xs text-muted-foreground">{sub}</div>
      </CardContent>
    </Card>
  );
}

function SliderRow({
  label,
  infoTerm,
  value,
  display,
  min,
  max,
  step,
  onChange,
  hint,
}: {
  label: string;
  infoTerm?: GlossaryKey;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <div className="flex items-center gap-1.5">
          <Label className="text-sm">{label}</Label>
          {infoTerm ? <InfoTip term={infoTerm} /> : null}
        </div>
        <span className="num text-sm font-semibold text-foreground">{display}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
      />
      {hint ? <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function NumberField({
  label,
  infoTerm,
  value,
  onChange,
  step = 1,
  hint,
}: {
  label: string;
  infoTerm?: GlossaryKey;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  hint?: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5">
        <Label className="text-xs text-foreground/80">{label}</Label>
        {infoTerm ? <InfoTip term={infoTerm} /> : null}
      </div>
      <Input
        type="number"
        value={value}
        step={step}
        onChange={(e) => {
          const n = parseFloat(e.target.value);
          if (!Number.isNaN(n)) onChange(n);
        }}
        className="num"
      />
      {hint ? <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function Metric({
  label,
  infoTerm,
  value,
  sub,
  tone,
}: {
  label: string;
  infoTerm?: GlossaryKey;
  value: string;
  sub?: string;
  tone?: "success" | "warning" | "destructive";
}) {
  const cls =
    tone === "success"
      ? "text-success"
      : tone === "destructive"
        ? "text-destructive"
        : tone === "warning"
          ? "text-warning"
          : "text-foreground";
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span>{label}</span>
        {infoTerm ? <InfoTip term={infoTerm} /> : null}
      </div>
      <div className={cn("num mt-1 text-lg font-semibold", cls)}>{value}</div>
      {sub ? <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div> : null}
    </div>
  );
}

function Segmented({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border bg-muted/40 p-0.5">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
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
  );
}

function InsightCard({
  tone,
  icon,
  title,
  body,
}: {
  tone: "primary" | "success" | "warning" | "destructive";
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  const toneCls = {
    primary: "border-primary/20 bg-primary/5",
    success: "border-success/20 bg-success/5",
    warning: "border-warning/20 bg-warning/5",
    destructive: "border-destructive/20 bg-destructive/5",
  }[tone];
  const iconCls = {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
  }[tone];
  return (
    <Card className={cn("border", toneCls)}>
      <CardContent className="p-5">
        <div className={cn("mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide", iconCls)}>
          {icon} <span>{title}</span>
        </div>
        <p className="text-sm leading-relaxed text-foreground/80">{body}</p>
      </CardContent>
    </Card>
  );
}
