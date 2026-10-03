import React, { useState } from "react";
import { Avatar, Icon, dateLabel } from "./Identity.jsx";
export default function PostList({ posts, user, onOpen, onNew, onProfile }) {
  const [query, setQuery] = useState("");
  const visiblePosts = posts.filter((p) =>
    `${p.title} ${p.description} ${p.authorName || ""}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  return (
    <div className="feed-layout">
      <section className="feed-column">
        <div className="feed-head">
          <div>
            <p className="eyebrow">Your community</p>
            <h1>Home feed</h1>
          </div>
          <span className="feed-sort">Latest posts</span>
        </div>
        <div className="composer">
          <Avatar name={user.displayName} />
          <button onClick={onNew} className="composer-prompt">
            What’s on your mind, {user.displayName}?
          </button>
          <button className="icon-button" aria-label="New post" onClick={onNew}>
            <Icon name="write" />
          </button>
        </div>
        <label className="feed-search">
          Search posts
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, text, or author"
          />
        </label>
        {query && (
          <p role="status" className="muted">
            {visiblePosts.length} {visiblePosts.length === 1 ? "post" : "posts"}{" "}
            found
          </p>
        )}
        {query && !visiblePosts.length && posts.length > 0 && (
          <div className="empty">
            <h2>No matching posts</h2>
            <p>Try another word or return to the full feed.</p>
            <button onClick={() => setQuery("")}>Clear search</button>
          </div>
        )}
        <div className="post-feed">
          {visiblePosts.map((p) => (
            <article className="feed-post" key={p._id}>
              <div className="post-byline">
                <Avatar name={p.authorName || "Member"} />
                <div>
                  <strong>{p.authorName || "Member"}</strong>
                  <span>
                    @
                    {(p.authorName || "member")
                      .toLowerCase()
                      .replaceAll(" ", "")}{" "}
                    · {dateLabel(p.createdAt)}
                  </span>
                </div>
                <span className="visibility">Public post</span>
              </div>
              <h2>{p.title}</h2>
              <p className="post-copy">{p.description}</p>
              <button
                className="post-replies"
                onClick={() => onOpen(p)}
                aria-label={`Open ${p.title}`}
              >
                <Icon name="comment" /> Open conversation{" "}
                <span aria-hidden="true">↗</span>
              </button>
            </article>
          ))}
        </div>
        {!posts.length && (
          <div className="empty">
            <h2>A fresh start.</h2>
            <p>No posts yet. Share the first one.</p>
            <button onClick={onNew}>Write a post</button>
          </div>
        )}
      </section>
      <aside className="feed-aside">
        <div className="profile-peek">
          <Avatar name={user.displayName} large />
          <h2>{user.displayName}</h2>
          <p>@{user.displayName.toLowerCase().replaceAll(" ", "")}</p>
          <button onClick={onProfile}>
            Edit your profile <span>↗</span>
          </button>
        </div>
        <div className="community-note">
          <p className="eyebrow">A little more human</p>
          <h2>
            Good conversations
            <br />
            start small.
          </h2>
          <p>
            A thought from your walk. A book you couldn’t put down. Something
            worth passing on.
          </p>
        </div>
        <p className="aside-footer">
          Common
          <br />A place for your people.
        </p>
      </aside>
    </div>
  );
}
