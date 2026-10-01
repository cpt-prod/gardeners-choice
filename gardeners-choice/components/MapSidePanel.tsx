"use client";

import { useState, useMemo } from "react";
import { Site } from "@/lib/types";
import Link from "next/link";

type PanelMode = "discovery" | "detail";

interface MapSidePanelProps {
  sites: Site[];
  selectedSiteId: string | null;
  onSelectSite: (id: string | null) => void;
}

export default function MapSidePanel({
  sites,
  selectedSiteId,
  onSelectSite
}: MapSidePanelProps) {
  const mode = selectedSiteId ? "detail" : "discovery";

  const selectedSite = useMemo(
    () => sites.find(s => s.id === selectedSiteId),
    [sites, selectedSiteId]
  );

  return (
    <aside
      className="glass-panel"
      style={{
        position: "absolute",
        left: "20px",
        top: "80px",
        bottom: "20px",
        width: "380px",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: "translateX(0)",
        overflow: "hidden"
      }}
    >
      {mode === "discovery" ? (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--c-line)" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Explore</h2>
            <p style={{ color: "var(--c-ink-soft)", fontSize: "0.9rem" }}>
              Find local food banks and harvesting sites.
            </p>
          </div>

          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem"
          }}>
            {sites.map(site => (
              <div
                key={site.id}
                onClick={() => onSelectSite(site.id)}
                className="card"
                style={{
                  cursor: "pointer",
                  transition: "background 0.2s",
                  border: "1px solid var(--c-line)",
                  background: "var(--c-surface)"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--c-gold-soft)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "var(--c-surface)"}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.5rem" }}>
                  <h3 style={{ fontSize: "1.1rem", margin: 0 }}>{site.name}</h3>
                  <span className={`badge ${site.type === "food-bank" ? "badge-food" : "badge-harvest"}`}>
                    {site.type === "food-bank" ? "Food bank" : "Harvest"}
                  </span>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--c-ink-soft)", margin: 0 }}>
                  {site.city}, {site.state}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          animation: "slideIn 0.4s ease-out"
        }}>
          <div style={{ padding: "1rem", display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={() => onSelectSite(null)}
              className="btn btn-ghost"
              style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
            >
              Back to Explore
            </button>
          </div>

          {selectedSite && (
            <div style={{ padding: "0 1.5rem 1.5rem", overflowY: "auto" }}>
              <span className={`badge ${selectedSite.type === "food-bank" ? "badge-food" : "badge-harvest"}`}>
                {selectedSite.type === "food-bank" ? "Food bank" : "Harvest site"}
              </span>
              <h2 style={{ fontSize: "2rem", marginTop: "1rem", marginBottom: "0.5rem" }}>{selectedSite.name}</h2>

              <div style={{ color: "var(--c-ink-soft)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
                <p style={{ margin: "0 0 0.5rem" }}>{selectedSite.address}</p>
                <p style={{ margin: 0 }}>{selectedSite.city}, {selectedSite.state} {selectedSite.zip}</p>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Details</h3>
                <p style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>{selectedSite.description}</p>
                <p style={{ fontSize: "0.95rem", marginTop: "1rem" }}>
                  <strong>Hours:</strong> {selectedSite.hours}
                </p>
              </div>

              {selectedSite.resources.length > 0 && (
                <div style={{ marginBottom: "2rem" }}>
                  <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Available Resources</h3>
                  <ul style={{ paddingLeft: "1.2rem", fontSize: "0.95rem", color: "var(--c-ink-soft)" }}>
                    {selectedSite.resources.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}

              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <a href={`tel:${selectedSite.phone}`} className="btn btn-primary">Call</a>
                <a href={`mailto:${selectedSite.email}`} className="btn btn-ghost">Email</a>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${selectedSite.lat}&mlon=${selectedSite.lng}#map=17/${selectedSite.lat}/${selectedSite.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                >
                  Directions
                </a>
              </div>
            </div>
          )}
        </div>
      )}
      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </aside>
  );
}
