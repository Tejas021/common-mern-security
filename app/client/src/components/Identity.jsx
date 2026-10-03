import React from "react";
export function Avatar({ name = "Member", large = false }) {
  const tone = ["clay", "sage", "blue"][name.charCodeAt(0) % 3];
  return (
    <span
      className={`avatar ${tone} ${large ? "large" : ""}`}
      aria-hidden="true"
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}
export function Icon({ name }) {
  const paths = {
    feed: "M3 10 12 3l9 7v11h-6v-7H9v7H3Z",
    profile: "M20 21v-2a7 7 0 0 0-14 0v2M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
    admin: "m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6ZM9 12l2 2 4-4",
    write: "m16 3 5 5-12 12-6 1 1-6ZM14 5l5 5",
    comment: "M21 11a9 9 0 0 1-9 9H4l-2 2V11a9 9 0 0 1 19 0Z",
    logout: "M9 4H3v16h6M13 8l4 4-4 4M7 12h14",
  };
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.feed} />
    </svg>
  );
}
export const dateLabel = (value) =>
  value
    ? new Date(value).toLocaleDateString("en", {
        month: "short",
        day: "numeric",
      })
    : "Just now";
