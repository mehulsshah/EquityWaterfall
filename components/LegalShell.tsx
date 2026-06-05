import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";

type Props = {
  title: string;
  effectiveDate: string;
  summary: string;
  children: React.ReactNode;
};

export function LegalShell({ title, effectiveDate, summary, children }: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-5">
          <Link href="/" aria-label="Equity Waterfall — home">
            <Logo />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to calculator</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-14">
        <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Effective {effectiveDate}
        </div>
        <h1 className="mb-5 text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mb-10 rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 text-sm leading-relaxed text-foreground/80">
          <span className="mr-2 inline-block rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
            TL;DR
          </span>
          {summary}
        </p>
        <article className="legal space-y-8">{children}</article>
        <footer className="mt-16 border-t pt-6 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            ← Back to calculator
          </Link>
        </footer>
      </main>
    </div>
  );
}

/* Small typographic primitives for the prose body — keep markup consistent. */
export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold tracking-tight">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-foreground/80">
        {children}
      </div>
    </section>
  );
}

export function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="ml-5 list-disc space-y-1.5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
