import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import { AccessMessage } from "./AdminRoute.jsx";

export default function Admin({ onOpen, reportAccess, onRefresh }) {
  const [state, setState] = useState({ kind: "loading", posts: [] });
  useEffect(() => {
    let active = true;
    api("/admin/posts").then(
      posts => { if (active) setState({ kind: "ready", posts }); },
      error => { if (active) setState({ kind: "error", posts: [], message: error.message }); },
    );
    return () => { active = false; };
  }, []);
  return (
    <section className="admin-view">
      <p className="eyebrow">Site administration</p>
      <h1>Manage community posts</h1>
      <section className={`report-panel ${reportAccess.kind === "allowed" ? "report-allowed" : ""}`} aria-live="polite" aria-busy={reportAccess.kind === "loading"}>
        <AccessMessage access={reportAccess} />
        <button onClick={onRefresh} disabled={reportAccess.kind === "loading"}>Refresh report</button>
      </section>
      <p className="muted">Administrator access includes unpublished drafts.</p>
      {state.kind === "loading" && <p role="status">Loading posts…</p>}
      {state.kind === "error" && <p role="alert">{state.message}</p>}
      {state.posts.map((p) => (
        <article className="admin-row" key={p._id}>
          <span>{p.authorName}</span>
          <h2>{p.title}</h2>
          <p>{p.privateDraft}</p>
          <button onClick={() => onOpen(p)}>Manage {p.title}</button>
        </article>
      ))}
      {state.kind === "ready" && !state.posts.length && <p>No posts to review.</p>}
    </section>
  );
}
