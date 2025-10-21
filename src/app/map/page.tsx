"use client";

import dynamic from "next/dynamic";

// Dynamically import the Map component — disable SSR
const Map = dynamic(() => import("@/components/map"), {
  ssr: false,
});

export default function Page() {
  return (
    <div style={{ height: "100vh" }}>
      <Map />
    </div>
  );
}
