import React, { useState } from "react";
import { Avatar } from "./Identity.jsx";
export default function Profile({ user, onSave }) {
  const [name, setName] = useState(user.displayName);
  return (
    <section className="editor profile-editor">
      <p className="eyebrow">Your Common account</p>
      <h1>Edit profile</h1>
      <div className="profile-identity">
        <Avatar name={user.displayName} large />
        <div><strong>{user.displayName}</strong><p>{user.email}</p></div>
      </div>
      <form onSubmit={e => { e.preventDefault(); onSave({ displayName: name }); }}>
        <label>Display name
          <input value={name} onChange={e => setName(e.target.value)} maxLength={80} required />
        </label>
        <p className="muted">This is the name people see when you join a conversation.</p>
        <button className="primary">Save profile</button>
      </form>
    </section>
  );
}
