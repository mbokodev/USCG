"use client";

import { IconPhoto } from "@tabler/icons-react";

interface DefaultImageProps {
  width?: number | string;
  height?: number | string;
  iconSize?: number;
}

/**
 * Default placeholder image shown when no product image is available
 */
export default function DefaultImage({
  width = "100%",
  height = "100%",
  iconSize = 48,
}: DefaultImageProps) {
  return (
    <div
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        backgroundColor: "#f5f5f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "8px",
      }}
    >
      <IconPhoto size={iconSize} color="#a3a3a3" stroke={1.5} />
    </div>
  );
}
