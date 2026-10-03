import React, { useState, useEffect } from "react";
import { api } from "../api.js";
import { Avatar } from "./Identity.jsx";
export default function People({ user, onIdentity }) {
  const [name, setName] = useState(""),
    [people, setPeople] = useState(null),
    [profile, setProfile] = useState(null),
    [error, setError] = useState(""),
    [editing, setEditing] = useState(false),
    [draftName, setDraftName] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    setBusy(true);
    api("/users")
      .then((data) => {
        if (active) setPeople(data);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, []);
  async function showAll() {
    setName("");
    setProfile(null);
    setPeople(await api("/users"));
  }
  async function openProfile(id) {
    setEditing(false);
    setNotice("");
    setProfile(await api(`/users/${id}/profile`));
  }
  async function run(fn) {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="editor">
      <p className="eyebrow">Your community</p>
      <h1>Find people</h1>
      <p className="muted">
        Find a member, open their profile, or update your own name.
      </p>
      <button disabled={busy} onClick={() => run(() => openProfile(user._id))}>
        View my profile
      </button>
      <form
        className="member-search"
        onSubmit={(e) => {
          e.preventDefault();
          run(async () => {
            setProfile(null);
            setPeople(
              name.trim()
                ? await api("/users/search", "POST", { name })
                : await api("/users"),
            );
          });
        }}
      >
        <label>
          Member name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Try Hermione, Ron, or part of a name"
            maxLength={80}
          />
        </label>
        <div className="actions">
          <button className="primary" disabled={busy}>
            Search members
          </button>
          <button type="button" disabled={busy} onClick={() => run(showAll)}>
            Show all members
          </button>
        </div>
      </form>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="notice">
          {notice}
        </p>
      )}
      <p role="status" className="muted">
        {busy
          ? "Loading members…"
          : people
            ? `${people.length} ${people.length === 1 ? "member" : "members"} shown · Up to 20 results`
            : ""}
      </p>
      {people?.map((p) => (
        <article className="member-row" key={p._id}>
          <Avatar name={p.displayName} />
          <div className="member-identity">
            <h2>{p.displayName}</h2>
            <p className="muted">
              {p._id === user._id ? "You" : "Community member"}
            </p>
          </div>
          <button disabled={busy} onClick={() => run(() => openProfile(p._id))}>
            View {p.displayName}’s profile
          </button>
        </article>
      ))}
      {people?.length === 0 && (
        <div className="empty">
          <h2>No members found.</h2>
          <p>
            Try part of a name, or choose Show all members to browse the
            community.
          </p>
        </div>
      )}
      {profile && (
        <section className="profile-peek member-profile">
          <p className="eyebrow">Public profile</p>
          <Avatar name={profile.displayName} large />
          <h2>{profile.displayName}</h2>
          <p className="muted">
            {profile._id === user._id ? "Your profile" : "Community member"}
          </p>
          {profile._id === user._id &&
            (!editing ? (
              <button
                disabled={busy}
                onClick={() => {
                  setDraftName(profile.displayName);
                  setEditing(true);
                  setNotice("");
                  setError("");
                }}
              >
                Edit my name
              </button>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  run(async () => {
                    const updated = await api(
                      `/users/${profile._id}/profile`,
                      "PATCH",
                      { displayName: draftName },
                    );
                    setProfile(updated);
                    setPeople(
                      (current) =>
                        current?.map((p) =>
                          p._id === updated._id ? updated : p,
                        ) ?? current,
                    );
                    if (updated._id === user._id) await onIdentity();
                    setEditing(false);
                    setNotice(
                      `Profile saved. The display name is now ${updated.displayName}.`,
                    );
                  });
                }}
              >
                <label>
                  Display name
                  <input
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    required
                    maxLength={80}
                  />
                </label>
                <p className="muted">
                  This is the name shown to other members. It does not change
                  the sign-in email.
                </p>
                <div className="actions">
                  <button className="primary" disabled={busy}>
                    Save profile
                  </button>{" "}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setEditing(false);
                      setError("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ))}
        </section>
      )}
    </section>
  );
}
