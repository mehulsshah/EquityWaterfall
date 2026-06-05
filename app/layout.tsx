import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Equity Waterfall — model what your PE equity is really worth",
  description:
    "Prospective employees at PE-backed companies can model what their equity grant pays at exit — beyond the 409A quote.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var s = localStorage.getItem('ew-theme');
                  var d = s === 'dark' || (!s && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (d) document.documentElement.classList.add('dark');
                } catch (_) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <TooltipProvider delayDuration={150} skipDelayDuration={300}>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
