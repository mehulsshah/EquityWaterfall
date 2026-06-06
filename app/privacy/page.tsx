import type { Metadata } from "next";
import { BulletList, LegalShell, Section } from "@/components/LegalShell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Equity Waterfall does not collect, store, or transmit any user data. No accounts, no analytics, no tracking. Everything happens in your browser.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy — Equity Waterfall",
    description:
      "No data collection, no tracking, no accounts. Everything stays in your browser.",
    url: "/privacy",
    type: "article",
  },
  twitter: {
    title: "Privacy Policy — Equity Waterfall",
    description: "No data collection, no tracking.",
  },
};

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      effectiveDate="June 2026"
      summary="Equity Waterfall does not collect, store, or transmit any of your data. Everything happens in your browser. No accounts, no analytics, no tracking, no cookies."
    >
      <Section title="What we don't collect">
        <BulletList
          items={[
            <>We do not ask for your name, email, employer, or any account information. There are no accounts.</>,
            <>We do not run analytics, tracking pixels, advertising tags, or session recorders.</>,
            <>We do not log your inputs, the scenarios you model, or the URLs you share.</>,
            <>We do not contact any third-party APIs or services from inside the app.</>,
          ]}
        />
      </Section>

      <Section title="What stays in your browser">
        <BulletList
          items={[
            <>
              <strong className="font-semibold text-foreground">Scenario state</strong> — your cap
              table, sliders, grant inputs, and any edits — is encoded into the URL hash
              (the part after the <code className="rounded bg-muted px-1 py-0.5 text-xs">#</code>).
              By design, URL hashes are never sent to a server.
            </>,
            <>
              <strong className="font-semibold text-foreground">Theme preference</strong>{" "}
              (light or dark) is stored in your browser's localStorage and never leaves
              your device.
            </>,
            <>
              <strong className="font-semibold text-foreground">CSV exports</strong> are
              generated and downloaded entirely in your browser. No file ever touches a server.
            </>,
          ]}
        />
      </Section>

      <Section title="When you share a scenario">
        <p>
          Clicking <em>Share scenario</em> copies a URL to your clipboard. That URL
          contains your scenario state encoded as a base64 string in the hash. If you
          send the URL to a coworker, they will see your scenario when they open the
          link — but only because the data is in the link itself. The data does not
          pass through any service we run.
        </p>
      </Section>

      <Section title="What your host may see">
        <p>
          If you (or someone else) deploys this app on a hosting service like Vercel,
          Netlify, AWS, or a personal server, that host may log standard HTTP request
          metadata (IP address, user-agent, timestamps). The contents of the URL hash
          are not transmitted to the host, but the path (e.g.{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">/</code> or{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">/privacy</code>) is.
          Refer to that host's privacy policy for details. We do not control or have
          access to those logs.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          If we change this policy we will update the effective date at the top of
          this page.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          This is an educational, open-source tool. If you find a privacy issue,
          please open an issue on the source repository.
        </p>
      </Section>
    </LegalShell>
  );
}
