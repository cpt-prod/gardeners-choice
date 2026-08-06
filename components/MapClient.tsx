"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Tooltip } from "react-leaflet";
import L from "leaflet";
import type { Site } from "@/lib/types";

// Fix default Leaflet icon paths (Next bundles them; we need explicit URLs)
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
  useEffect(() => setMounted(true), []);

  const filtered = useMemo(
    () => (filter === "all" ? sites : sites.filter((s) => s.type === filter)),
    [filter, sites]
  );

  // Center map on the average of filtered sites
  const center: [number, number] = useMemo(() => {
    if (filtered.length === 0) return [38.5816, -121.4944];
    const lat = filtered.reduce((a, s) => a + s.lat, 0) / filtered.length;
    const lng = filtered.reduce((a, s) => a + s.lng, 0) / filtered.length;
    return [lat, lng];
  }, [filtered]);

  if (!mounted) {
    return (
      <div className="map-wrap" style={{ display: "grid", placeItems: "center" }}>
        <p>Loading map…</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)" }}>
      <div
        style={{
          padding: "0.75rem 1.25rem",
          background: "var(--c-surface)",
          borderBottom: "1px solid var(--c-line)",
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

      <div className="map-wrap" style={{ flex: 1 }}>
        <MapContainer
          className="map-container"
          center={center}
          zoom={12}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filtered.map((site) => (
            <Marker
              key={site.id}
              position={[site.lat, site.lng]}
              icon={site.type === "food-bank" ? foodBankIcon : harvestIcon}
            >
              <Popup>
                <div>
                  <span
                    className={`badge ${
                      site.type === "food-bank" ? "badge-food" : "badge-harvest"
                    }`}
                  >
                    {site.type === "food-bank" ? "Food bank" : "Harvest site"}
                  </span>
                  <h3 style={{ marginTop: "0.5rem" }}>{site.name}</h3>
                  <p className="popup-meta">
                    {site.address}, {site.city}, {site.state} {site.zip}
                    <br />
                    <strong>Hours:</strong> {site.hours}
                  </p>
                  <p style={{ fontSize: "0.9rem", margin: "0 0 0.5rem" }}>
                    {site.description}
                  </p>
                  {site.resources.length > 0 && (
                    <ul className="popup-resources">
                      {site.resources.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  )}
                  <div className="popup-actions">
                    <a className="btn btn-primary" href={`tel:${site.phone}`}>
                      Call
                    </a>
                    <a className="btn btn-ghost" href={`mailto:${site.email}`}>
                      Email
                    </a>
                    <a
                      className="btn btn-ghost"
                      href={`https://www.openstreetmap.org/?mlat=${site.lat}&mlon=${site.lng}#map=17/${site.lat}/${site.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Directions
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
