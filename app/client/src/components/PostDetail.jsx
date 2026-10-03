import React, { useState } from "react";
import CommentBody from "./CommentBody.jsx";
import { Avatar, dateLabel } from "./Identity.jsx";
export default function PostDetail({
  post,
  comments,
  user,
  mode,
  onComment,
  onPrivate,
  onEdit,
  onDelete,
  onBack,
}) {
  const [body, setBody] = useState("");
  const own = post.ownerId === user._id || user.role === "admin";
  return (
    <div className="conversation">
      <button className="back" onClick={onBack}>
        ← Back to feed
      </button>
      <article className="conversation-post">
        <div className="post-byline">
          <Avatar name={post.authorName || "Member"} />
          <div>
            <strong>{post.authorName || "Member"}</strong>
            <span>Public post · {dateLabel(post.createdAt)}</span>
          </div>
        </div>
        <h1>{post.title}</h1>
        <p className="post-copy">{post.description}</p>
        {own && (
          <section className="private-draft">
            <div className="draft-heading">
              <h2>Your private draft</h2>
              <span>Not published</span>
            </div>
            <p>
              {post.privateDraft !== undefined
                ? post.privateDraft || "No unpublished draft saved."
                : "Your unpublished follow-up is only available to you and site administrators."}
            </p>
            <div className="actions">
              <button onClick={onPrivate}>Open private draft</button>
              <button onClick={onEdit}>Edit post</button>
              <button className="danger" onClick={onDelete}>
                Delete post
              </button>
            </div>
          </section>
        )}
      </article>
      <aside className="replies">
        <h2>
          Conversation <span>{comments.length}</span>
        </h2>
        {comments.map((c) => (
          <article className="comment" key={c._id}>
            <Avatar name={c.authorName} />
            <div>
              <strong>{c.authorName}</strong>
              <CommentBody mode={mode} body={c.body} />
            </div>
          </article>
        ))}
        {!comments.length && (
          <p className="muted">No replies yet. Start the conversation.</p>
        )}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (await onComment(body)) setBody("");
          }}
        >
          <label>
            Comment
            <textarea
              placeholder="Add to the conversation…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={2000}
              required
            />
          </label>
          <button className="primary">Post comment</button>
        </form>
      </aside>
    </div>
  );
}
