import type { Metadata } from "next";
import { BulletList, LegalShell, Section } from "@/components/LegalShell";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Equity Waterfall is an educational tool. It is not financial, legal, tax, or investment advice. Verify every assumption with the people who have the actual deal documents.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Use — Equity Waterfall",
    description:
      "Educational tool only. Not financial, legal, or tax advice.",
    url: "/terms",
    type: "article",
  },
  twitter: {
    title: "Terms of Use — Equity Waterfall",
    description: "Educational tool only. Not financial advice.",
  },
};

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Use"
      effectiveDate="June 2026"
      summary="This is an educational tool. It is not financial, legal, tax, or investment advice. Use it to learn about how PE waterfalls work — not to make a decision. Verify every assumption with the people who actually have the deal documents."
    >
      <Section title="What this tool is">
        <p>
          Equity Waterfall helps prospective employees at private-equity-backed companies
          model what their equity grant might be worth at exit under various scenarios.
          It implements a simplified four-step PE distribution waterfall, accepts user
          inputs for the cap table and deal terms, and shows the modeled payouts.
        </p>
        <p>
          The purpose is educational: to make a complex set of mechanics — debt seniority,
          sponsor preferred returns, GP carry, MIP gating — legible to someone who does
          not have a finance background.
        </p>
      </Section>

      <Section title="What this tool is not">
        <BulletList
          items={[
            <>
              <strong className="font-semibold text-foreground">Not financial advice.</strong>{" "}
              Outputs are illustrative results from a simplified model. They are not
              predictions, recommendations, or appraisals.
            </>,
            <>
              <strong className="font-semibold text-foreground">Not legal or tax advice.</strong>{" "}
              Equity grants have material legal and tax implications (options vs RSUs vs
              profits interests, AMT, ISO/NSO treatment, 83(b) elections) that this tool
              does not address.
            </>,
            <>
              <strong className="font-semibold text-foreground">Not a substitute for due
              diligence.</strong> You should independently verify every assumption, ask the
              employer for actual deal terms in writing, and consult qualified
              professionals before making any decision.
            </>,
          ]}
        />
      </Section>

      <Section title="All numbers are modeled">
        <BulletList
          items={[
            <>
              Default values illustrate a plausible PE-backed software company shape.
              They are not estimates of any specific company.
            </>,
            <>
              The four-step waterfall implements a simplified version of a real LBO
              distribution. Real deal documents may differ substantially: side letters,
              tax distributions, escrow holdbacks, working-capital adjustments, and
              earn-outs are not modeled.
            </>,
            <>
              Specific deal terms — sponsor cash basis, MIP pool size, performance unlock
              thresholds, liquidation preferences, sponsor preferred / PIK shareholder
              loan structures, leaver provisions — are private and rarely disclosed by
              the company or the sponsor. You must input your own best estimates.
            </>,
          ]}
        />
      </Section>

      <Section title="What this tool does not model">
        <p>Real outcomes may differ from the modeled outputs because of:</p>
        <BulletList
          items={[
            <>Vesting acceleration, double-trigger acceleration, clawbacks, and good-leaver / bad-leaver provisions</>,
            <>Tax treatment of your specific grant type and jurisdiction</>,
            <>Add-on dilution from buy-and-build acquisitions during the hold</>,
            <>Recapitalizations, dividend recaps, additional equity issuances, or secondary sales mid-hold</>,
            <>Exit timing materially different from your projection</>,
            <>Currency fluctuations, partial exits, IPOs with lock-up periods, or transaction structures other than a clean sale</>,
            <>Side letters and other private agreements between the sponsor and specific holders</>,
          ]}
        />
      </Section>

      <Section title="Your responsibility">
        <p>By using this tool, you acknowledge that:</p>
        <BulletList
          items={[
            <>You will not rely on modeled outputs to make employment, investment, or financial decisions without independent verification.</>,
            <>You will consult qualified financial, legal, and tax professionals for advice specific to your situation.</>,
            <>You understand that defaults reflect generic assumptions, not your actual deal.</>,
            <>Any scenario you share via URL contains your inputs in the link itself; you are responsible for the audience you share with.</>,
          ]}
        />
      </Section>

      <Section title="No warranty">
        <p>
          This tool is provided <em>as is</em>, without warranty of any kind, express
          or implied, including but not limited to warranties of merchantability, fitness
          for a particular purpose, and non-infringement. The authors and contributors
          shall not be liable for any claim, damages, or other liability arising from
          use of the tool or reliance on its outputs.
        </p>
      </Section>

      <Section title="Changes to these terms">
        <p>
          If we update these terms we will revise the effective date at the top of this
          page. Continued use after a change constitutes acceptance of the updated terms.
        </p>
      </Section>
    </LegalShell>
  );
}
