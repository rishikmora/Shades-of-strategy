import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** The O of SOS, with its red point of view. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050505",
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 999,
            border: "17px solid #f5f5f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ width: 22, height: 22, borderRadius: 999, background: "#e0112f" }} />
        </div>
      </div>
    ),
    size,
  );
}
