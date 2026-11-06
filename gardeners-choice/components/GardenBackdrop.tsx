"use client";

/**
 * Calming animated garden backdrop for the home hero.
 *
 * Primary path: if a real video file is present at /garden-ambient.mp4 (drop one
 * into public/), it plays muted + looped behind the hero. If the file is missing
 * or can't play, it hides itself and the self-contained animated CSS/SVG scene
 * below shows through — so the background ALWAYS renders with zero network deps.
 */
export default function GardenBackdrop() {
  return (
    <div className="garden-backdrop" aria-hidden="true">
      {/* Animated SVG scene — always rendered, sits behind the optional video */}
      <div className="gb-scene">
        <div className="gb-sky" />
        <div className="gb-sun" />
        {/* drifting clouds */}
        <div className="gb-cloud gb-cloud-1" />
        <div className="gb-cloud gb-cloud-2" />
        <div className="gb-cloud gb-cloud-3" />
        {/* rolling hills */}
        <svg className="gb-hills" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path
            className="gb-hill-back"
            d="M0,224 C240,160 480,272 720,224 C960,176 1200,272 1440,208 L1440,320 L0,320 Z"
          />
          <path
            className="gb-hill-front"
            d="M0,272 C240,224 480,304 720,272 C960,240 1200,312 1440,264 L1440,320 L0,320 Z"
          />
        </svg>
        {/* drifting fireflies (dusk theme) */}
        <div className="gb-fireflies">
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={i}
              className="gb-firefly"
              style={{
                left: `${(i * 37) % 100}%`,
                top: `${35 + ((i * 23) % 55)}%`,
                // @ts-expect-error custom props for per-firefly stagger
                "--d": `${7 + (i % 5) * 1.6}s`,
                "--delay": `${(i * 0.9) % 8}s`,
                "--dx": `${i % 2 ? 40 : -35}px`,
              }}
            />
          ))}
        </div>
        {/* swaying plant silhouettes */}
        <div className="gb-plants">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="gb-plant"
              style={{
                left: `${(i + 0.5) * (100 / 9)}%`,
                // @ts-expect-error custom props for per-plant stagger
                "--d": `${(i % 4) * 0.6 + 2.4}s`,
                "--h": `${60 + (i % 3) * 22}px`,
                "--delay": `${i * 0.35}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Optional real video overlay; hides itself if the file is absent */}
      <video
        className="gb-video"
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        onError={(e) => {
          (e.currentTarget as HTMLVideoElement).style.display = "none";
        }}
      >
        <source src="/garden-ambient.mp4" type="video/mp4" />
      </video>

      {/* Readability scrim */}
      <div className="gb-scrim" />
    </div>
  );
}
