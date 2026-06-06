import { ImageResponse } from "next/og";
import { SITE } from "@/lib/seo";

export const alt = SITE.tagline;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "linear-gradient(135deg, #fafafa 0%, #f1f4ff 60%, #e9ecff 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Top — logo lockup */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background:
                "linear-gradient(135deg, #635BFF 0%, #5249E5 100%)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              gap: "5px",
              padding: "0 13px",
              boxShadow: "0 8px 24px -8px rgba(99, 91, 255, 0.5)",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "5px",
                borderRadius: "2.5px",
                background: "#ffffff",
              }}
            />
            <div
              style={{
                width: "22px",
                height: "5px",
                borderRadius: "2.5px",
                background: "#ffffff",
                opacity: 0.85,
              }}
            />
            <div
              style={{
                width: "12px",
                height: "5px",
                borderRadius: "2.5px",
                background: "#ffffff",
                opacity: 0.7,
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              lineHeight: 1,
            }}
          >
            <div
              style={{
                fontSize: "28px",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: "#0F172A",
              }}
            >
              Equity Waterfall
            </div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 500,
                marginTop: "6px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#64748B",
              }}
            >
              PE scenario modeling
            </div>
          </div>
        </div>

        {/* Middle — headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: "76px",
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: "-0.025em",
              color: "#0F172A",
              maxWidth: "950px",
            }}
          >
            <div style={{ display: "flex" }}>What your PE-backed equity is</div>
            <div style={{ display: "flex", gap: "20px" }}>
              <span style={{ color: "#635BFF" }}>really</span>
              <span>worth at exit.</span>
            </div>
          </div>
          <div
            style={{
              fontSize: "26px",
              lineHeight: 1.4,
              color: "#475569",
              maxWidth: "900px",
            }}
          >
            Past the 409A quote. Model the LBO debt waterfall, sponsor
            preferred return, MIP carry, and performance unlocks.
          </div>
        </div>

        {/* Bottom — features strip */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {[
            "4-step waterfall",
            "Sensitivity heatmap",
            "Editable cap table",
            "Shareable scenarios",
            "Free & open source",
          ].map((feature) => (
            <div
              key={feature}
              style={{
                display: "flex",
                padding: "10px 20px",
                borderRadius: "999px",
                background: "rgba(99, 91, 255, 0.08)",
                border: "1px solid rgba(99, 91, 255, 0.18)",
                fontSize: "18px",
                fontWeight: 500,
                color: "#4338CA",
              }}
            >
              {feature}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
