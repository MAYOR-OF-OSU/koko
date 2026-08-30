import { ImageResponse } from "next/og";
import { getStoreSettings } from "@/lib/site-content";

export const alt = "Timi's Jewels";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const s = await getStoreSettings();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "96px",
          background: "linear-gradient(135deg, #4a2159 0%, #6E3482 55%, #A56ABD 140%)",
          color: "#F3EEF8",
          fontFamily: "sans-serif",
        }}
      >
        {/* TJ monogram mark */}
        <svg width="96" height="96" viewBox="0 0 48 48">
          <rect width="48" height="48" rx="10" fill="#F3EEF8" />
          <g fill="none" stroke="#6E3482" strokeLinecap="round">
            <path d="M12 16 H27 M19.5 16 V35" strokeWidth="2.8" />
            <path d="M33 16 V29 a6 6 0 0 1 -12 0" strokeWidth="2.8" />
          </g>
          <path d="M33 10 l2.4 2.4 -2.4 2.4 -2.4 -2.4 z" fill="#6E3482" />
        </svg>

        <div
          style={{
            marginTop: 44,
            fontSize: 84,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
          }}
        >
          {s.name}
        </div>
        <div style={{ marginTop: 20, fontSize: 38, color: "#E7DBEF" }}>{s.tagline}</div>
        <div style={{ marginTop: 40, fontSize: 26, color: "#E7DBEF", opacity: 0.8 }}>
          Handpicked fashion jewelry · nationwide delivery
        </div>
      </div>
    ),
    size,
  );
}
