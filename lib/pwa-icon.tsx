import type { ReactElement } from "react";

export function renderPwaIcon(fontSize: number): ReactElement {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "6%",
          background: "#0070f3",
          flexShrink: 0,
        }}
      />
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#000000",
          fontSize,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontWeight: 600,
          letterSpacing: "-0.06em",
        }}
      >
        00
      </div>
    </div>
  );
}
