import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import Admin from "./Admin.jsx";
import "../admin-report.css";

export default function AdminRoute({ mode, onOpen }) {
  const [access, setAccess] = useState({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    api("/admin/report").then(
      data => { if (active) setAccess({ kind: "allowed", report: data.report }); },
      error => { if (active) setAccess({ kind: error.status === 401 ? "signin" : error.status === 403 ? "denied" : "error" }); },
    );
    return () => { active = false; };
  }, [attempt]);
  const retry = () => {
    setAccess({ kind: "loading" });
    setAttempt(value => value + 1);
  };
  // The fixed route mounts admin content only after server authorization.
  // Navigation visibility alone is not an access control boundary.
  if (access.kind === "allowed") {
    return <Admin onOpen={onOpen} reportAccess={access} onRefresh={retry} />;
  }
  return <section className="admin-view" aria-live="polite" aria-busy={access.kind === "loading"}>
    <p className="eyebrow">Site administration</p>
    <AccessMessage access={access} />
    {access.kind !== "loading" && <button onClick={retry}>Check access again</button>}
  </section>;
}

export function AccessMessage({ access }) {
  if (access.kind === "loading") return <h2>Checking access…</h2>;
  if (access.kind === "denied") return <><h2>Access denied</h2><p>Your account does not have administrator access.</p></>;
  if (access.kind === "signin") return <><h2>Sign in required</h2><p>Your login is missing, invalid, or expired.</p><a href="/">Go to sign in</a></>;
  if (access.kind === "error") return <><h2>Report unavailable</h2><p>We could not verify access. Please try again.</p></>;
  return <><p className="report-badge">Administrator access granted</p><h2>Community report</h2><p className="report-result">{access.report}</p></>;
}
