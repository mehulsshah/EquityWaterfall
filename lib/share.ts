import type {
  DealInputs,
  EmployeeGrant,
  ExitScenario,
  Holder,
} from "./types";

const VERSION = 2;

export type SharedState = {
  v: number;
  h: Holder[];
  d: DealInputs;
  s: ExitScenario;
  e: EmployeeGrant;
};

/** base64url-encode a JSON state blob for use in a URL hash. */
export function encodeState(state: SharedState): string {
  const json = JSON.stringify(state);
  const b64 =
    typeof btoa === "function"
      ? btoa(unescape(encodeURIComponent(json)))
      : Buffer.from(json, "utf-8").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Reverse of encodeState — returns null on malformed or version-mismatched payloads. */
export function decodeState(encoded: string): SharedState | null {
  try {
    const padded = encoded
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(encoded.length / 4) * 4, "=");
    const json =
      typeof atob === "function"
        ? decodeURIComponent(escape(atob(padded)))
        : Buffer.from(padded, "base64").toString("utf-8");
    const parsed = JSON.parse(json);
    if (typeof parsed !== "object" || parsed === null) return null;
    if (parsed.v !== VERSION) return null;
    return parsed as SharedState;
  } catch {
    return null;
  }
}

/** Read the current state from the URL hash, if present and valid. */
export function readStateFromUrl(): SharedState | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.slice(1);
  if (!hash) return null;
  return decodeState(hash);
}

/** Replace the URL hash with the encoded current state. No navigation. */
export function writeStateToUrl(state: SharedState): string {
  if (typeof window === "undefined") return "";
  const encoded = encodeState(state);
  const url = `${window.location.pathname}${window.location.search}#${encoded}`;
  window.history.replaceState(null, "", url);
  return window.location.href;
}
