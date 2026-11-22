import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "MAKELSAN Маркет — промышленные ИБП (источники бесперебойного питания)";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 90px",
          background: "linear-gradient(135deg, #0a0e14 0%, #173129 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 84,
              height: 84,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#f28232",
              borderRadius: 20,
              color: "#0a0e14",
              fontSize: 56,
              fontWeight: 800,
            }}
          >
            M
          </div>
          <div style={{ color: "#f28232", fontSize: 40, fontWeight: 800, letterSpacing: 4 }}>
            MAKELSAN
          </div>
        </div>

        <div
          style={{
            display: "flex",
            color: "#ffffff",
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.1,
            marginTop: 60,
            maxWidth: 980,
          }}
        >
          Источники бесперебойного питания 10 кВА – 1 МВА
        </div>

        <div
          style={{
            display: "flex",
            color: "rgba(245,247,246,0.65)",
            fontSize: 32,
            marginTop: 48,
          }}
        >
          On-line ИБП двойного преобразования · Интернет-магазин · Доставка по России
        </div>
      </div>
    ),
    size
  );
}
