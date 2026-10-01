"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import type { Site } from "@/lib/types";
import MapSidePanel from "./MapSidePanel";

// Fix default Leaflet icon paths
const foodBankIcon = new L.DivIcon({
  className: "hc-marker hc-marker-food",
  html: '<div style="background:#2f5d3a;width:22px;height:22px;border-radius:50%;border:3px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const harvestIcon = new L.DivIcon({
  className: "hc-marker hc-marker-harvest",
  html: '<div style="background:#d99e2b;width:22px;height:22px;border-radius:50%;border:3px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

type Filter = "all" | "food-bank" | "harvest";

export default function MapClient({ sites }: { sites: Site[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [mounted, setMounted] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const filtered = useMemo(
    () => (filter === "all" ? sites : sites.filter((s) => s.type === filter)),
    [filter, sites]
  );

  const center: [number, number] = useMemo(() => {
    if (filtered.length === 0) return [38.5816, -121.4944];
    const lat = filtered.reduce((a, s) => a + s.lat, 0) / filtered.length;
    const lng = filtered.reduce((a, s) => a + s.lng, 0) / filtered.length;
    return [lat, lng];
  }, [filtered]);

  if (!mounted) {
    return (
      <div style={{ display: "grid", placeItems: "center", height: "100vh" }}>
        <p>Loading map…</p>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <MapSidePanel
        sites={sites}
        selectedSiteId={selectedSiteId}
        onSelectSite={setSelectedSiteId}
      />

      <div
        className="glass-panel"
        style={{
          position: "absolute",
          right: "20px",
          top: "20px",
          zIndex: 1000,
          padding: "0.75rem 1.25rem",
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <strong style={{ marginRight: "0.5rem" }}>Show:</strong>
        <button
          className={`btn ${filter === "all" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setFilter("all")}
          style={{ padding: "0.4rem 0.9rem", fontSize: "0.9rem" }}
        >
          All ({sites.length})
        </button>
        <button
          className={`btn ${filter === "food-bank" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setFilter("food-bank")}
          style={{ padding: "0.4rem 0.9rem", fontSize: "0.9rem" }}
        >
          Food banks ({sites.filter((s) => s.type === "food-bank").length})
        </button>
        <button
          className={`btn ${filter === "harvest" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setFilter("harvest")}
          style={{ padding: "0.4rem 0.9rem", fontSize: "0.9rem" }}
        >
          Harvest sites ({sites.filter((s) => s.type === "harvest").length})
        </button>
      </div>

      <MapContainer
        className="map-container"
        center={center}
        zoom={12}
        scrollWheelZoom
        style={{ width: "100%", height: "100%" }}
      >
        <MapController selectedSiteId={selectedSiteId} sites={sites} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {filtered.map((site) => (
          <Marker
            key={site.id}
            position={[site.lat, site.lng]}
            icon={site.type === "food-bank" ? foodBankIcon : harvestIcon}
            eventHandlers={{
              click: () => setSelectedSiteId(site.id),
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}

function MapController({ selectedSiteId, sites }: { selectedSiteId: string | null; sites: Site[] }) {
  const map = useMap();

  useEffect(() => {
    if (selectedSiteId) {
      const site = sites.find(s => s.id === selectedSiteId);
      if (site) {
        map.flyTo([site.lat, site.lng], 15, {
          duration: 1.5,
          easeLinearity: 0.25
        });
      }
    }
  }, [selectedSiteId, map, sites]);

  return null;
}
