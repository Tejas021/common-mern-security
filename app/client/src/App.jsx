import React, { useState, useEffect } from "react";
import { api, setToken } from "./api.js";
import Login from "./components/Login.jsx";
import PostList from "./components/PostList.jsx";
import PostEditor from "./components/PostEditor.jsx";
import PostDetail from "./components/PostDetail.jsx";
import Profile from "./components/Profile.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import { Avatar, Icon } from "./components/Identity.jsx";
import People from "./components/People.jsx";
import Shop from "./components/Shop.jsx";
const initialView = () => window.location.pathname.replace(/\/$/, "") === "/admin" ? "admin" : "posts";
export default function App() {
  const [mode, setMode] = useState(""),
    [user, setUser] = useState(null),
    [posts, setPosts] = useState([]),
    [selected, setSelected] = useState(null),
    [comments, setComments] = useState([]),
    [view, updateView] = useState(initialView),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [ready, setReady] = useState(false);
  function setView(next) {
    const path = next === "admin" ? "/admin" : "/";
    if (window.location.pathname + window.location.search !== path) window.history.pushState({}, "", path);
    updateView(next);
  }
  useEffect(() => {
    const onPopState = () => updateView(initialView());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  useEffect(() => {
    setError("");
    setNotice("");
    window.scrollTo(0, 0);
  }, [view]);
  async function action(fn) {
    setError("");
    setNotice("");
    try {
      return await fn();
    } catch (e) {
      setError(e.message);
      if (e.status === 401) {
        setUser(null);
        setToken("");
      }
      return false;
    }
  }
  async function refresh() {
    setPosts(await api("/posts"));
  }
  async function identity() {
    const data = await api("/me");
    setUser(data.user);
    setToken(data.csrfToken);
  }
  useEffect(() => {
    (async () => {
      try {
        setMode((await api("/meta")).mode);
        try {
          await identity();
          await refresh();
        } catch (e) {
          if (e.status !== 401) setError(e.message);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setReady(true);
      }
    })();
  }, []);
  async function open(post) {
    await action(async () => {
      setComments(await api(`/posts/${post._id}/comments`));
      setSelected(post);
      setView("detail");
    });
  }
  async function privatePost() {
    return api(`/posts/${selected._id}`);
  }
  if (!ready)
    return (
      <main>
        <h1>Loading Common…</h1>
      </main>
    );
  return (
    <>
      <div className={user ? "app-shell" : "signed-out"}>
        <header className={user ? "sidebar" : "login-header"}>
          <a href="/" className="brand">
            common<span aria-hidden="true">.</span>
          </a>
          {user ? (
            <>
              <nav aria-label="Main navigation">
                <button
                  aria-current={view === "people" ? "page" : undefined}
                  onClick={() => setView("people")}
                >
                  <Icon name="profile" />
                  People
                </button>
                <button
                  aria-current={view === "posts" ? "page" : undefined}
                  onClick={() =>
                    action(async () => {
                      await refresh();
                      setView("posts");
                    })
                  }
                >
                  <Icon name="feed" />
                  Home
                </button>
                <button
                  aria-current={view === "profile" ? "page" : undefined}
                  onClick={() => setView("profile")}
                >
                  <Icon name="profile" />
                  Profile
                </button>
                <button aria-current={view === "shop" ? "page" : undefined} onClick={() => setView("shop")}>
                  <Icon name="write" /> Shop
                </button>
                {user.role === "admin" && (
                  <button
                    aria-current={view === "admin" ? "page" : undefined}
                    onClick={() => setView("admin")}
                  >
                    <Icon name="admin" />
                    Admin
                  </button>
                )}
              </nav>
              <button
                className="primary sidebar-compose"
                onClick={() => {
                  setSelected(null);
                  setView("edit");
                }}
              >
                <Icon name="write" />
                Write a post
              </button>
              <div className="sidebar-bottom">
                <div className="sidebar-user">
                  <Avatar name={user.displayName} />
                  <div>
                    <strong>{user.displayName}</strong>
                    <span className="identity">
                      @{user.displayName.toLowerCase().replaceAll(" ", "")}
                    </span>
                  </div>
                </div>
                <button
                  className="logout"
                  onClick={() =>
                    action(async () => {
                      await api("/logout", "POST");
                      setUser(null);
                      setToken("");
                      setView("posts");
                    })
                  }
                >
                  <Icon name="logout" />
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <span className="login-header-caption">A little more human.</span>
          )}
        </header>
        <main className="app-main">
          {error && (
            <div role="alert" className="error">
              {error}
            </div>
          )}
          {notice && (
            <div role="status" className="notice">
              {notice}
            </div>
          )}
          {!user ? (
            <Login
              onLogin={(email, password) =>
                action(async () => {
                  const data = await api("/login", "POST", { email, password });
                  setUser(data.user);
                  setToken(data.csrfToken);
                  await refresh();
                  if (view !== "admin") setView("posts");
                })
              }
            />
          ) : (
            <>
              {view === "people" && (
                <People user={user} onIdentity={identity} />
              )}
              {view === "posts" && (
                <PostList
                  posts={posts}
                  user={user}
                  onProfile={() => setView("profile")}
                  onOpen={open}
                  onNew={() => {
                    setSelected(null);
                    setView("edit");
                  }}
                />
              )}
              {view === "edit" && (
                <PostEditor
                  key={selected?._id ?? "new"}
                  post={selected}
                  onCancel={() => setView("posts")}
                  onSave={(form) =>
                    action(async () => {
                      const p = await api(
                        selected ? `/posts/${selected._id}` : "/posts",
                        selected ? "PATCH" : "POST",
                        form,
                      );
                      await refresh();
                      await open(p);
                    })
                  }
                />
              )}
              {view === "detail" && selected && (
                <PostDetail
                  post={selected}
                  comments={comments}
                  mode={mode}
                  user={user}
                  onBack={() => setView("posts")}
                  onPrivate={() =>
                    action(async () => setSelected(await privatePost()))
                  }
                  onEdit={() =>
                    action(async () => {
                      setSelected(await privatePost());
                      setView("edit");
                    })
                  }
                  onDelete={() =>
                    action(async () => {
                      await api(`/posts/${selected._id}`, "DELETE");
                      await refresh();
                      setSelected(null);
                      setView("posts");
                    })
                  }
                  onComment={(body) =>
                    action(async () => {
                      await api(`/posts/${selected._id}/comments`, "POST", {
                        body,
                      });
                      setComments(await api(`/posts/${selected._id}/comments`));
                      return true;
                    })
                  }
                />
              )}
              {view === "profile" && (
                <Profile
                  user={user}
                  onSave={(form) =>
                    action(async () => {
                      await api("/profile", "POST", form);
                      await identity();
                      setNotice("Profile saved.");
                    })
                  }
                />
              )}
              {view === "shop" && <Shop runAction={action} />}
              {view === "admin" && <AdminRoute key={`${mode}:${user._id}:${user.role}`} mode={mode} onOpen={open} />}
            </>
          )}
        </main>
      </div>
      <footer>
        Common <span>A place for your people.</span>
      </footer>
    </>
  );
}
