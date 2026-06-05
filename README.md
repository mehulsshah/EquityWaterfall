# Equity Waterfall

A web app for **prospective employees at PE-backed companies** to model what their equity grant actually pays out at exit — past the 409A quote.

The headline insight: a recruiter says **"$500K equity at today's 409A"** and the app shows how that grant flows through the LBO debt stack, sponsor preferred return, and MIP carry waterfall to produce a real payout estimate. Often the modeled base case is a fraction of the 409A; sometimes it's a multiple. Move the sliders, share the URL, learn the shape of the deal.

---

## Why it exists — the 409A gap

PE firms quote equity offers using the most recent **409A valuation**, an IRS-mandated fair-market value of common stock. That number is what your shares are worth on paper today. It is **not** what you take home at exit.

At exit, cash flows through a four-tier waterfall before anyone touches the management pool:

1. **Senior debt + transaction costs** are paid first.
2. **Sponsor + minority investors return their capital**, pro-rata.
3. **Sponsor earns an 8% preferred return** for every year of hold.
4. **Sponsor takes catch-up + 20% carry** on remaining profits.

Only what's left flows to the MIP, the management incentive pool you own a slice of. A $500K 409A grant can pay $50K at a 3× exit or $2M at an 8× exit. The 409A doesn't price the waterfall; this calculator does.

---

## What you can do

- **Edit your grant** — paste the recruiter's headline dollar value at today's 409A, plus the company's current 409A-implied valuation. The app derives your share of the MIP pool automatically.
- **Move every assumption** as a live slider: exit multiple (ARR or EBITDA), ARR growth, EBITDA margin, projection years, years already elapsed, current ARR, outstanding debt, vested percent.
- **Edit the cap table** — rename holders, change invested amounts and ownership percentages to match your company. Defaults seed a generic PE-backed software shape with one sponsor majority, three minority VCs, founders, and a 10% MIP.
- **Read three views at a glance:** what the 409A says, the modeled base case (tinted red below the 409A or green above), and an upside scenario at the sponsor benchmark.
- **Hover any term** for a plain-English definition — 25 glossary entries cover MIP, GP catch-up, preferred return, MOIC, 409A, liquidation preference, and more.
- **Share a scenario** via URL. State is encoded in a base64 hash, so coworkers open the same numbers you saw.

---

## Quick start

```bash
git clone <this-repo>
cd pe_waterfall
npm install
npm run dev
```

Open <http://localhost:3000>. The dev server hot-reloads on file changes.

Requires Node 18+ and npm.

---

## Using the app, step by step

1. **Drop in your grant.** Edit "Equity grant value at 409A" and "Today's company value at 409A" to match what your recruiter or 409A report says. The dashed-box readout shows your derived share of the MIP pool, computed as `grant $ / (MIP pool % × today's company value)`.

2. **Set the company financials.** Move the ARR and outstanding debt sliders to your company's real numbers. Add EBITDA margin if you want to value by EBITDA multiple.

3. **Pick a valuation method.** The segmented toggle switches the exit-multiple slider between `× ARR` and `× EBITDA`. The metric strip displays both implied multiples so you can cross-check (at 20% margin, 5× ARR ≈ 25× EBITDA).

4. **Choose your hold horizon.** "Years already elapsed" counts toward the preferred-return hurdle; "projection years" determines how much ARR growth compounds before the modeled exit.

5. **Read the three hero cards.**
   - Left (gray): what the 409A says.
   - Center (color-tinted): modeled base case at the current scenario. Red shades when below the 409A, green when above. A "Most likely" badge marks this as the focal scenario.
   - Right (green): upside at an 8× ARR / 28× EBITDA exit, where the sponsor clears its benchmark.

6. **Edit the cap table.** Click any name, invested amount, or ownership percentage. The total row at the bottom warns if ownership doesn't sum to 100%. Per-holder MOIC and IRR recompute live.

7. **Share.** Click `Share scenario` in the header — your full state is copied to the clipboard as a URL hash. Bookmark or paste anywhere; recipients see your exact scenario.

---

## How to deploy

### Vercel (recommended)

The project is a standard Next.js 14 App Router app and deploys to Vercel out of the box.

1. Push the repo to GitHub.
2. Import it at <https://vercel.com/new>.
3. Vercel auto-detects Next.js. Click Deploy.

No environment variables needed. No backend, no database — everything is client-side.

### Any Node host

```bash
npm run build
npm run start
```

Then put a reverse proxy in front of `localhost:3000`. Works on any Node 18+ host (Render, Railway, Fly, your own VM).

### Static export

The app is fully client-side, so it can be exported as static HTML:

```bash
# Add `output: 'export'` to next.config.mjs, then:
npm run build
# Static site is in `./out` — serve with any static host.
```

---

## Architecture

```
app/
  layout.tsx           # Next.js layout, fonts, TooltipProvider
  page.tsx             # Main page — all state, sliders, hero cards, insights
  globals.css          # tweakcn-style theme (indigo-accented fintech palette, HSL CSS vars)
components/
  ui/                  # shadcn primitives: card, slider, label, input, button, separator, tooltip
  WaterfallSteps.tsx   # 4-step waterfall visualization with InfoTip on each row
  HolderTable.tsx      # Editable cap table — name, invested, ownership; computed MOIC, IRR
  InfoTip.tsx          # Hover info icon backed by lib/glossary.ts
  ShareButton.tsx      # Copy current URL to clipboard with feedback
lib/
  types.ts             # Holder, DealInputs, ExitScenario, EmployeeGrant, WaterfallResult
  waterfall.ts         # Pure 4-step waterfall engine + breakEvenARR binary search
  seed.ts              # Default cap table + sponsor benchmarks
  glossary.ts          # 25 plain-English term definitions
  share.ts             # base64url encode/decode of the full state for URL hashes
  utils.ts             # cn() and money/pct/multiple formatters
```

**State lives in `app/page.tsx`** as four React `useState` hooks — `holders`, `deal`, `scenario`, `employee`. There's no Redux/Zustand; the calculation is fast enough that React state with `useMemo` for the result is plenty.

**URL hash sync** runs in two `useEffect`s: one reads the hash on mount and hydrates state; the other debounces state changes (200ms) and writes them back to the hash via `history.replaceState`. A `useRef(true)` flag prevents the write-effect from clobbering the URL on initial mount.

**The calculation engine** in `lib/waterfall.ts` is a pure function: takes holders, deal inputs, scenario, and an optional employee grant; returns a structured result with per-step distributions, per-holder MOIC/IRR, and the employee's vested payout. No side effects, easy to test, easy to reuse from a backend if you ever want one.

---

## The math (4-step distribution waterfall)

The engine implements a simplified European/whole-of-fund waterfall as a pure function in `lib/waterfall.ts`. Summary:

```
Step 0: GrossEquityPool = ExitEV − Debt − TxnCosts
Step 1: ΣInvested → pro-rata to cash-invested holders, capped at pool
Step 2: ΣInvested × ((1 + 8%)^holdYears − 1) → pro-rata, capped
Step 3: (Carry / (1 − Carry)) × Step2 = 0.25 × Step2 → 100% to sponsor
Step 4: Remaining → 80% pro-rata to ALL holders (incl. MIP) + 20% to sponsor as carry
```

**Employee payout:**

```
pctOfMip      = grantValueAt409a / (mipOwnership × todayCompanyValue409a)
mipTotal      = sum of MIP's Step 1–4 allocations
rawShare      = mipTotal × pctOfMip
vestedShare   = rawShare × vested % × (perfTriggered ? 1 : 0)
```

The engine also runs `breakEvenARR()` — a binary search over current ARR that finds the minimum ARR required for the sponsor to hit 1.0× MOIC at the selected exit multiple. This shows up as the "break-even ARR" insight card.

---

## Customization

### Theme (tweakcn)

The default palette in `app/globals.css` is a hand-tuned set of HSL CSS variables — a modern fintech aesthetic with an indigo primary, subtle shadows, and 12px radii. To change it, paste new values from <https://tweakcn.com> into the `:root` block. The `dark` block under `.dark` controls dark mode. The tailwind config wires these into utility classes (`bg-primary`, `text-success`, etc.).

### Glossary terms

To add or edit a hover explanation:

1. Open `lib/glossary.ts`.
2. Add an entry like `myTerm: { title: "Plain title", body: "Plain-English explanation." }`.
3. In any component: `<InfoTip term="myTerm" />`. TypeScript autocompletes the key.

### Default cap table

Edit `lib/seed.ts`. The structure:

```ts
export const DEFAULT_HOLDERS: Holder[] = [
  { id: "pe_majority", name: "PE Majority", role: "sponsor",
    ownershipPct: 0.6, capitalInvested: 70.2, isSponsor: true },
  // ... add as many holders as you want; mark exactly one as isSponsor
];
```

Roles are typed: `sponsor` | `minority_vc` | `mip` | `founder` | `rollover`. Exactly one holder should have `isSponsor: true` (that holder receives the Step 3 catch-up and Step 4 carry).

### Sponsor benchmarks

Edit `SPONSOR_BENCHMARKS` in `lib/seed.ts` to change the "vs benchmark" metric and the upside scenario reference. Defaults reflect industry-typical PE buyout averages (3.12× gross MOIC, 3.0× fund target).

---

## What is NOT modeled (yet)

The waterfall engine intentionally trades some realism for clarity. Things to be aware of:

- **Sponsor PIK shareholder debt** — the model treats sponsor capital as common equity. Many classic LBOs use shareholder loans that accrue a PIK coupon ahead of common. In growth-equity deals (the default shape) this is usually fine.
- **MIP performance unlocks** — the engine now supports tiered MOIC-unlock gating (configurable in the UI). Real PE MIPs often add additional gates like IRR thresholds, cash-return floors, or time-and-performance combined unlocks not yet modeled here.
- **Minority liquidation preferences** — modeled informally via the Step 1 pro-rata pool. A more rigorous version would slot liq prefs as a Step 1.5 between capital return and preferred. The schema supports it (`Holder.liqPref`); the engine doesn't apply it yet.
- **Add-on dilution** — the cap table is static. Buy-and-build add-ons that issue new equity or assume debt aren't modeled.
- **Tax** — all values are pre-tax. Stock options vs RSUs vs profits interests have meaningfully different tax treatment; this app doesn't model that.
- **Vesting acceleration / good-leaver-bad-leaver** — vested % is a single slider; in real plans, accelerator clauses and leaver provisions can change the picture dramatically.

---

## Tech stack and choices

- **Next.js 14 (App Router)** — file-based routing, React Server Components by default, fast dev loop. The page is a client component because the entire interaction is local state.
- **TypeScript** — strict mode, no `any` in user-facing code.
- **Tailwind CSS** — utility-first; theme exposed as HSL CSS variables for easy palette swaps.
- **shadcn/ui** — minimal, copy-in Radix-based component primitives. No black-box component library, just files you own.
- **Radix UI** — accessibility-correct primitives for Slider, Tooltip, Label, Separator.
- **Recharts (planned)** — for the upcoming sensitivity heatmap.
- **No state library** — `useState` + `useMemo` is enough; the waterfall computation is cheap.
- **No backend** — pure client app. Share state via URL hash, no server roundtrips, no database, no auth.

---

## Roadmap

Shipped:

- [x] 4-step waterfall calc engine
- [x] Live-recompute sliders
- [x] Per-holder breakdown
- [x] Three-view hero (409A vs base case vs upside)
- [x] Plain-English glossary tooltips on every jargon term
- [x] Editable cap table (name, invested, ownership)
- [x] Color-tinted base case (red below 409A, green above)
- [x] Shareable URL with full state encoded in the hash
- [x] Valuation method toggle (ARR multiple vs EBITDA multiple)
- [x] Sensitivity heatmap (CAGR × exit-multiple, click-to-apply)
- [x] Sponsor PIK shareholder-debt tier
- [x] Performance-unlock MOIC tiers for MIP
- [x] Dark mode (toggle + no-flash bootstrap + semantic color system)
- [x] CSV export of the per-holder breakdown
- [x] Mobile layout pass
- [x] Custom logo + favicon
- [x] Privacy policy + terms of use pages

Pending:

- [ ] Add / remove cap table rows in the UI (rename only today)
- [ ] PDF export
- [ ] Save / load named scenarios (currently URL-only)
- [ ] Tax-aware payout view (options vs RSUs vs profits interests)

---

## Disclaimer

**Educational tool. Not financial advice.** All defaults are illustrative; no private deal terms are disclosed. Your actual cap table, sponsor return structure, MIP design, and exit outcome will differ.

Use this to learn the shape of PE-backed equity. Don't use it to make a job decision without independently verifying the inputs and consulting a tax or legal advisor on grant terms.

---

## License

MIT. Do anything you want with it.
