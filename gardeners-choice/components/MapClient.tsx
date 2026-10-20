"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import type { Site } from "@/lib/types";
import MapSidePanel from "@/components/MapSidePanel";

type Filter = "all" | "food-bank" | "harvest";

/** Organic pulsing DivIcon markers. */
function makeIcon(type: Site["type"], selected: boolean) {
  const typeClass =
    type === "food-bank" ? "hc-marker-food" : "hc-marker-harvest";
  return new L.DivIcon({
    className: `hc-marker ${typeClass}${selected ? " selected" : ""}`,
    html: '<div class="hc-dot"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

/**
 * Cinematic camera controller. Watches the selected site and glides the map
 * to it with map.flyTo() (~1.5s). Lives inside MapContainer so it can call
 * useMap().
 */
function MapController({ selected }: { selected: Site | null }) {
  const map = useMap();

  useEffect(() => {
    // Recalculate size once the full-viewport container has mounted.
    const t = setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(t);
  }, [map]);

  useEffect(() => {
    if (selected) {
      map.flyTo([selected.lat, selected.lng], 15, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  }, [selected, map]);

  return null;
}

export default function MapClient({ sites }: { sites: Site[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const filtered = useMemo(
    () => (filter === "all" ? sites : sites.filter((s) => s.type === filter)),
    [filter, sites]
  );

  const selected = useMemo(
    () => sites.find((s) => s.id === selectedId) ?? null,
    [selectedId, sites]
  );

  const center: [number, number] = useMemo(() => {
    const base = sites.length ? sites : [{ lat: 37.6688, lng: -122.0808 }];
    const lat = base.reduce((a, s) => a + s.lat, 0) / base.length;
    const lng = base.reduce((a, s) => a + s.lng, 0) / base.length;
    return [lat, lng];
  }, [sites]);

  const counts = useMemo(
    () => ({
      all: sites.length,
      food: sites.filter((s) => s.type === "food-bank").length,
      harvest: sites.filter((s) => s.type === "harvest").length,
    }),
    [sites]
  );

  function handleSelect(site: Site) {
    setSelectedId(site.id);
  }

  if (!mounted) {
    return (
      <div
        className="living-map"
        style={{ display: "grid", placeItems: "center" }}
      >
        <p>Loading map…</p>
      </div>
    );
  }

  return (
    <div className="living-map">
      {/* Floating glass navigation overlay */}
      <nav className="map-floating-nav glass-panel">
        <Link href="/" className="mfn-brand">
          <span className="brand-mark" aria-hidden="true" />
          Hayward Harvest
        </Link>
        <ul className="mfn-links">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/about">About</Link>
          </li>
          <li>
            <Link href="/donate">Donate</Link>
          </li>
          <li>
            <Link href="/contact">Contact</Link>
          </li>
        </ul>
      </nav>

      {/* Floating filter pills */}
      <div className="map-filter-bar glass-panel">
        <button
          className={`filter-pill${filter === "all" ? " active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({counts.all})
        </button>
        <button
          className={`filter-pill${filter === "food-bank" ? " active" : ""}`}
          onClick={() => setFilter("food-bank")}
        >
          Food banks ({counts.food})
        </button>
        <button
          className={`filter-pill${filter === "harvest" ? " active" : ""}`}
          onClick={() => setFilter("harvest")}
        >
          Harvest sites ({counts.harvest})
        </button>
      </div>

      {/* Dual-mode side panel */}
      <MapSidePanel
        sites={filtered}
        selected={selected}
        onSelect={handleSelect}
        onBack={() => setSelectedId(null)}
        collapsed={panelCollapsed}
      />

      {/* Mobile panel toggle */}
      <button
        className="msp-toggle glass-panel"
        onClick={() => setPanelCollapsed((c) => !c)}
      >
        {panelCollapsed ? "Show list" : "Hide list"}
      </button>

      {/* The map */}
      <MapContainer
        className="map-container"
        center={center}
        zoom={11}
        zoomControl={false}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController selected={selected} />
        {filtered.map((site) => (
          <Marker
            key={site.id}
            position={[site.lat, site.lng]}
            icon={makeIcon(site.type, selected?.id === site.id)}
            eventHandlers={{ click: () => handleSelect(site) }}
          >
            <Popup>
              <h3 style={{ marginBottom: "0.25rem" }}>{site.name}</h3>
              <p style={{ fontSize: "0.85rem", margin: 0 }}>
                {site.city}, {site.state}
              </p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
