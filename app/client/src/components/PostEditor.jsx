import React, { useState } from "react";
export default function PostEditor({ post, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: post?.title ?? "",
    description: post?.description ?? "",
    privateDraft: post?.privateDraft ?? "",
  });
  const field = (key, label, max, multi = false) => (
    <label>
      {label}
      {multi ? (
        <textarea
          value={form[key]}
          maxLength={max}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          required={key !== "privateDraft"}
        />
      ) : (
        <input
          value={form[key]}
          maxLength={max}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          required
        />
      )}
    </label>
  );
  return (
    <form
      className="editor"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
    >
      <p className="eyebrow">Your voice, your space</p>
      <h1>{post ? "Edit post" : "Write a post"}</h1>
      <p className="muted">
        The title and post text appear in the community feed.
      </p>
      {field("title", "Title", 100)}
      {field("description", "Post text", 2000, true)}
      <section className="draft-editor">
        {field("privateDraft", "Private draft", 2000, true)}
        <p className="muted">
          An unpublished follow-up. Visible only to you and site administrators;
          never included in the feed.
        </p>
      </section>
      <div className="actions">
        <button className="primary">Save post</button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
