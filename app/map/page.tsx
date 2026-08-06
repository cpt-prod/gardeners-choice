import dynamic from "next/dynamic";
import { sites } from "@/lib/data";

// Leaflet must run client-side only.
const MapClient = dynamic(() => import("@/components/MapClient"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "calc(100vh - 64px)",
        display: "grid",
        placeItems: "center",
      }}
    >
      <p>Loading map…</p>
    </div>
  ),
});

export const metadata = { title: "Map — Harvest Connect" };

export default function MapPage() {
  return <MapClient sites={sites} />;
}
