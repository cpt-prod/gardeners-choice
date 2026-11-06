"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAccount } from "@/lib/useAccount";

type Video = {
  id: string;
  ownerId: string;
  ownerName: string;
  title: string;
  description: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: number;
  url: string;
};

type Sort = "newest" | "oldest" | "mine";

function fmtSize(b: number) {
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

export default function VideosPage() {
  const { user } = useAccount();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<Sort>("newest");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/videos", { cache: "no-store" });
    const data = await res.json();
    setVideos(data.videos ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = videos.filter(
      (v) => !q || `${v.title} ${v.description} ${v.ownerName}`.toLowerCase().includes(q)
    );
    if (sort === "mine") list = list.filter((v) => user && v.ownerId === user.id);
    return [...list].sort((a, b) =>
      sort === "oldest" ? a.createdAt - b.createdAt : b.createdAt - a.createdAt
    );
  }, [videos, sort, query, user]);

  const contributors = new Set(videos.map((v) => v.ownerId)).size;

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="page-head glass-panel">
            <div className="page-head-row">
              <div>
                <p className="kicker">Learn from neighbors</p>
                <h1>Gardening videos</h1>
                <p className="lede">
                  Short gardening clips from the community &mdash; how-tos,
                  harvest tours, and tips from neighbors growing food nearby.
                </p>
              </div>
              <div className="head-stats">
                <div className="head-stat">
                  <b>{loading ? "–" : videos.length}</b>
                  <span>Videos</span>
                </div>
                <div className="head-stat">
                  <b>{loading ? "–" : contributors}</b>
                  <span>Contributors</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: "1rem" }}>
        <div className="container">
          <div className="filter-bar glass-panel">
            <button className={`filter-pill${sort === "newest" ? " active" : ""}`} onClick={() => setSort("newest")}>
              Newest
            </button>
            <button className={`filter-pill${sort === "oldest" ? " active" : ""}`} onClick={() => setSort("oldest")}>
              Oldest
            </button>
            {user && (
              <button className={`filter-pill${sort === "mine" ? " active" : ""}`} onClick={() => setSort("mine")}>
                My uploads
              </button>
            )}
            <span className="fb-spacer" />
            <input
              className="fb-search"
              type="search"
              placeholder="Search tomatoes, compost…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search videos"
            />
          </div>

          <div className="split">
            <div>
              {loading ? (
                <div className="card empty"><p style={{ margin: 0 }}>Loading videos…</p></div>
              ) : visible.length === 0 ? (
                <div className="card empty">
                  <span className="empty-icon">🎬</span>
                  <h3>{videos.length === 0 ? "No videos yet" : "Nothing matches"}</h3>
                  <p style={{ margin: 0 }}>
                    {videos.length === 0
                      ? user
                        ? "Upload the first clip using the panel."
                        : "Sign in to share the first clip."
                      : "Try a different filter or search."}
                  </p>
                </div>
              ) : (
                <div className="video-grid">
                  {visible.map((v) => (
                    <div className="card video-card" key={v.id}>
                      <video controls preload="metadata" src={v.url} />
                      <div className="vc-body">
                        <span className="type-badge food">Garden clip</span>
                        <h3 style={{ marginTop: "0.5rem" }}>{v.title}</h3>
                        {v.description && <p style={{ margin: "0 0 0.4rem" }}>{v.description}</p>}
                        <p className="vc-meta">
                          {v.ownerName} · {fmtSize(v.sizeBytes)} ·{" "}
                          {new Date(v.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <aside className="side glass-panel">
              {user ? (
                <UploadForm onDone={load} />
              ) : (
                <>
                  <div className="msp-header">
                    <h2 className="msp-title">Share a clip</h2>
                    <p className="msp-sub">Show neighbors what&rsquo;s growing</p>
                  </div>
                  <div className="msp-body msp-detail">
                    <div className="d-section" style={{ marginTop: 0 }}>
                      <p className="d-label">Great ideas</p>
                      <ul className="d-resources">
                        <li>Planting how-tos</li>
                        <li>Harvest tours</li>
                        <li>Composting</li>
                        <li>Pest fixes</li>
                        <li>Recipes</li>
                      </ul>
                    </div>
                    <div className="d-section">
                      <p className="d-label">Formats</p>
                      <p className="d-value">MP4, WebM, OGG or MOV · up to 50 MB</p>
                    </div>
                    <div className="msp-actions">
                      <a className="btn-glass primary" href="/signin">Sign in to upload</a>
                    </div>
                  </div>
                </>
              )}
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}

function UploadForm({ onDone }: { onDone: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(false);
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Choose a video file first.");
      return;
    }

    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", title);
    fd.append("description", description);

    // XHR for upload progress (fetch has no upload progress event).
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/videos");
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
    };
    xhr.onload = () => {
      setProgress(null);
      if (xhr.status === 201) {
        setTitle("");
        setDescription("");
        formRef.current?.reset();
        setDone(true);
        onDone();
      } else {
        try {
          setError(JSON.parse(xhr.responseText).error ?? "Upload failed.");
        } catch {
          setError("Upload failed.");
        }
      }
    };
    xhr.onerror = () => {
      setProgress(null);
      setError("Network error during upload.");
    };
    setProgress(0);
    xhr.send(fd);
  }

  return (
    <>
      <div className="msp-header">
        <h2 className="msp-title">Upload a video</h2>
        <p className="msp-sub">MP4, WebM, OGG, MOV · max 50 MB</p>
      </div>
      <div className="msp-body">
        <form className="form" onSubmit={submit} ref={formRef}>
          <div>
            <label htmlFor="vt">Title</label>
            <input id="vt" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="vd">Description (optional)</label>
            <textarea id="vd" value={description} onChange={(e) => setDescription(e.target.value)} style={{ minHeight: 90 }} />
          </div>
          <div>
            <label htmlFor="vf">Video file</label>
            <input id="vf" ref={fileRef} type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime" required />
          </div>
          {progress !== null && (
            <div className="upload-progress" aria-label={`Uploading ${progress}%`}>
              <span style={{ width: `${progress}%` }} />
            </div>
          )}
          {error && <p className="form-error">{error}</p>}
          {done && <p style={{ color: "var(--nm-forest-bright)", fontWeight: 600, margin: 0 }}>✓ Uploaded!</p>}
          <div>
            <button className="btn btn-primary" type="submit" disabled={progress !== null} style={{ width: "100%" }}>
              {progress !== null ? `Uploading ${progress}%…` : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
