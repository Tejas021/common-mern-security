import React, { useState } from "react";
import { Avatar } from "./Identity.jsx";
export default function Login({ onLogin }) {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <div className="login-layout">
      <section className="login-story">
        <p className="eyebrow">A place for your people</p>
        <h1>
          Less noise.
          <br />
          More in common.
        </h1>
        <p className="login-intro">
          Small moments. Good conversations.
          <br />A corner of the internet that feels like you.
        </p>
        <div className="sample-post">
          <div className="post-byline">
            <Avatar name="Hermione" />
            <div>
              <strong>Hermione</strong>
              <span>@hermione · A moment from the feed</span>
            </div>
          </div>
          <p>
            “No algorithm, just a wrong turn and a bookshop I’d never noticed.”
          </p>
          <span className="sample-caption">The long way home ↗</span>
        </div>
      </section>
      <form
        className="login-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await onLogin(email, password);
          } finally {
            setBusy(false);
          }
        }}
      >
        <p className="eyebrow">Welcome to Common</p>
        <h2>Pick up the conversation.</h2>
        <p className="muted">Sign in to your community.</p>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        <button className="primary" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
