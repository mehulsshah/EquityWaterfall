import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Download an array-of-arrays as a CSV file. Quotes any cell containing , " or newline. */
export function downloadCSV(filename: string, rows: (string | number)[][]) {
  const escape = (v: string | number) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = rows.map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const fmt = {
  money: (v: number, opts?: { decimals?: number; abbrev?: boolean }) => {
    const decimals = opts?.decimals ?? 0;
    if (opts?.abbrev) {
      if (Math.abs(v) >= 1e9) return `$${(v / 1e9).toFixed(decimals)}B`;
      if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(decimals)}M`;
      if (Math.abs(v) >= 1e3) return `$${(v / 1e3).toFixed(decimals)}K`;
    }
    return `$${v.toLocaleString("en-US", { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}`;
  },
  moneyM: (v: number, decimals = 1) => `$${v.toFixed(decimals)}M`,
  pct: (v: number, decimals = 0) => `${(v * 100).toFixed(decimals)}%`,
  mult: (v: number, decimals = 2) => `${v.toFixed(decimals)}×`,
};
