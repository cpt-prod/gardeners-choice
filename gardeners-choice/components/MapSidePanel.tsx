"use client";

import type { Site } from "@/lib/types";

type Props = {
  sites: Site[];
  selected: Site | null;
  onSelect: (site: Site) => void;
  onBack: () => void;
  collapsed: boolean;
};

function TypeBadge({ type }: { type: Site["type"] }) {
  return type === "food-bank" ? (
    <span className="type-badge food">Food bank</span>
  ) : (
    <span className="type-badge harvest">Harvest site</span>
  );
}

/**
 * Dual-mode side panel:
 *  - "Discovery": a scrollable list of site cards (when no site is selected)
 *  - "Detail": a rich information view (when a site is selected)
 * The mode toggles in-place without a page reload.
 */
export default function MapSidePanel({
  sites,
  selected,
  onSelect,
  onBack,
  collapsed,
}: Props) {
  return (
    <aside
      className={`map-side-panel glass-panel${collapsed ? " collapsed" : ""}`}
      aria-label="Site browser"
    >
      {selected ? (
        /* ---------- DETAIL MODE ---------- */
        <>
          <div className="msp-header">
            <button className="msp-back" onClick={onBack}>
              ← Back to all sites
            </button>
            <TypeBadge type={selected.type} />
          </div>
          <div className="msp-body">
            <div className="msp-detail">
              <h3>{selected.name}</h3>
              <p className="d-value">
                {selected.address}, {selected.city}, {selected.state}{" "}
                {selected.zip}
              </p>

              <div className="d-section">
                <p className="d-label">About</p>
                <p className="d-value">{selected.description}</p>
              </div>

              <div className="d-section">
                <p className="d-label">Hours</p>
                <p className="d-value">{selected.hours}</p>
              </div>

              {selected.resources.length > 0 && (
                <div className="d-section">
                  <p className="d-label">What's available</p>
                  <ul className="d-resources">
                    {selected.resources.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="msp-actions">
                <a className="btn-glass primary" href={`tel:${selected.phone}`}>
                  Call
                </a>
                <a className="btn-glass" href={`mailto:${selected.email}`}>
                  Email
                </a>
                <a
                  className="btn-glass"
                  href={`https://www.openstreetmap.org/?mlat=${selected.lat}&mlon=${selected.lng}#map=17/${selected.lat}/${selected.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Directions
                </a>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* ---------- DISCOVERY MODE ---------- */
        <>
          <div className="msp-header">
            <h2 className="msp-title">Discover sites</h2>
            <p className="msp-sub">
              {sites.length} place{sites.length === 1 ? "" : "s"} to find food
              nearby
            </p>
          </div>
          <div className="msp-body">
            {sites.map((site) => (
              <button
                key={site.id}
                className={`site-card${
                  selected && (selected as Site).id === site.id
                    ? " selected"
                    : ""
                }`}
                onClick={() => onSelect(site)}
              >
                <TypeBadge type={site.type} />
                <h4>{site.name}</h4>
                <p className="sc-meta">
                  {site.city}, {site.state} · {site.hours}
                </p>
              </button>
            ))}
            {sites.length === 0 && (
              <p className="msp-sub">No sites match this filter.</p>
            )}
          </div>
        </>
      )}
    </aside>
  );
}
