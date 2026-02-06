import React, { useEffect, useMemo, useRef, useState } from "react";
import { api } from "./api.js";

const defaultAuth = { mode: "login", username: "", email: "", password: "" };

const storageKey = "taskplanet-auth";

const loadSession = () => {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
};

const saveSession = (session) => {
  localStorage.setItem(storageKey, JSON.stringify(session));
};

const clearSession = () => {
  localStorage.removeItem(storageKey);
};

const formatCount = (value, word) => `${value} ${value === 1 ? word : `${word}s`}`;

export default function App() {
  const [session, setSession] = useState(() => loadSession());
  const [authForm, setAuthForm] = useState(defaultAuth);
  const [postForm, setPostForm] = useState({ text: "", imageUrl: "" });
  const [feed, setFeed] = useState([]);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [postError, setPostError] = useState("");
  const [feedError, setFeedError] = useState("");
  const [activeView, setActiveView] = useState("feed");
  const [showAuth, setShowAuth] = useState(false);
  const feedRef = useRef(null);

  const isLoggedIn = Boolean(session?.token);
  const username = session?.user?.username || "";

  useEffect(() => {
    let isMounted = true;
    const loadFeed = async () => {
      if (!isLoggedIn) return; // Only load feed if user is logged in
      
      setLoadingFeed(true);
      try {
        const data = await api.getFeed();
        if (isMounted) {
          setFeed(data);
          setFeedError("");
        }
      } catch (error) {
        if (isMounted) {
          setFeedError(error.message);
        }
      } finally {
        if (isMounted) {
          setLoadingFeed(false);
        }
      }
    };

    loadFeed();
    return () => {
      isMounted = false;
    };
  }, [activeView, session?.token, isLoggedIn]);

  const handleAuthChange = (field) => (event) => {
    setAuthForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const switchAuthMode = () => {
    setAuthForm((prev) => ({ ...defaultAuth, mode: prev.mode === "login" ? "signup" : "login" }));
    setAuthError("");
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthError("");

    try {
      const payload = {
        email: authForm.email.trim(),
        password: authForm.password
      };

      if (authForm.mode === "signup") {
        payload.username = authForm.username.trim();
      }

      const data =
        authForm.mode === "signup" ? await api.signup(payload) : await api.login(payload);

      setSession(data);
      saveSession(data);
      setAuthForm(defaultAuth);
      setActiveView("feed"); // Set to feed view after login
      setShowAuth(false);
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleLogout = () => {
    setSession(null);
    clearSession();
    setActiveView("feed");
  };

  const handlePostChange = (field) => (event) => {
    setPostForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handlePostSubmit = async (event) => {
    event.preventDefault();
    setPostError("");

    try {
      const payload = { text: postForm.text, imageUrl: postForm.imageUrl };
      const created = await api.createPost(payload, session.token);
      setFeed((prev) => [created, ...prev]);
      setPostForm({ text: "", imageUrl: "" });
      setActiveView("feed");
    } catch (error) {
      setPostError(error.message);
    }
  };

  const handleLike = async (postId) => {
    if (!isLoggedIn) {
      setFeedError("Login to like posts.");
      return;
    }

    try {
      const updated = await api.toggleLike(postId, session.token);
      setFeed((prev) => prev.map((post) => (post.id === postId ? updated : post)));
    } catch (error) {
      setFeedError(error.message);
    }
  };

  const handleCommentChange = (postId) => (event) => {
    const value = event.target.value;
    setCommentDrafts((prev) => ({ ...prev, [postId]: value }));
  };

  const handleCommentSubmit = async (postId) => {
    if (!isLoggedIn) {
      setFeedError("Login to comment.");
      return;
    }

    const text = (commentDrafts[postId] || "").trim();
    if (!text) {
      return;
    }

    try {
      const updated = await api.addComment(postId, { text }, session.token);
      setFeed((prev) => prev.map((post) => (post.id === postId ? updated : post)));
      setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
    } catch (error) {
      setFeedError(error.message);
    }
  };

  const greeting = useMemo(() => {
    if (!isLoggedIn) {
      return "Welcome to SocialPost";
    }
    return `Welcome back, ${username}`;
  }, [isLoggedIn, username]);

  const handleGetStarted = () => {
    setShowAuth(true); // Always show auth when clicking Get Started
  };

  const handleViewFeed = () => {
    // Load public feed for logged out users
    if (!isLoggedIn) {
      const loadPublicFeed = async () => {
        setLoadingFeed(true);
        try {
          const data = await api.getFeed();
          setFeed(data);
          setFeedError("");
          setActiveView("feed");
          
          // Scroll to feed after setting the active view
          setTimeout(() => {
            feedRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        } catch (error) {
          setFeedError(error.message);
        } finally {
          setLoadingFeed(false);
        }
      };
      
      loadPublicFeed();
      return;
    }
    
    setActiveView("feed");
    feedRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleNavClick = (view) => {
    if (view === "create" && !isLoggedIn) {
      setShowAuth(true);
      return;
    }
    if (view === "feed" && !isLoggedIn) {
      // Load public feed for logged out users
      const loadPublicFeed = async () => {
        setLoadingFeed(true);
        try {
          const data = await api.getFeed();
          setFeed(data);
          setFeedError("");
          setActiveView("feed");
          
          // Scroll to feed after setting the active view
          setTimeout(() => {
            feedRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        } catch (error) {
          setFeedError(error.message);
        } finally {
          setLoadingFeed(false);
        }
      };
      
      loadPublicFeed();
      return;
    }
    setActiveView(view);
    if (view === "feed") {
      feedRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="page">
      <header className="hero">
        <div className="topbar">
          <div className="brand">SocialPost</div>
          {isLoggedIn ? (
            <div className="topbar-actions">
              <span className="pill">{username}</span>
              <button className="ghost" type="button" onClick={handleLogout}>
                Log out
              </button>
            </div>
          ) : (
            <button className="ghost" type="button" onClick={() => setShowAuth(true)}>
              Login
            </button>
          )}
        </div>
        <div className="hero-content">
          <h1>{greeting}</h1>
          <p className="subtitle">
            Connect with friends and share your thoughts with the world.
          </p>
          <div className="hero-actions">
            <button className="primary" type="button" onClick={handleGetStarted}>
              Get Started
            </button>
            <button className="ghost" type="button" onClick={handleViewFeed}>
              View Feed
            </button>
          </div>
        </div>
      </header>

      {showAuth && !isLoggedIn && (
        <section className="auth-panel">
          <form className="auth-card" onSubmit={handleAuthSubmit}>
            <div className="auth-header">
              <h2>{authForm.mode === "login" ? "Login" : "Create account"}</h2>
              <button type="button" className="link" onClick={switchAuthMode}>
                {authForm.mode === "login" ? "Need an account?" : "Have an account?"}
              </button>
            </div>
            {authForm.mode === "signup" && (
              <label>
                Username
                <input
                  type="text"
                  value={authForm.username}
                  onChange={handleAuthChange("username")}
                  placeholder="Enter your username"
                  required
                />
              </label>
            )}
            <label>
              Email
              <input
                type="email"
                value={authForm.email}
                onChange={handleAuthChange("email")}
                placeholder="Enter your email"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={authForm.password}
                onChange={handleAuthChange("password")}
                placeholder="••••••••"
                required
              />
            </label>
            {authError && <p className="error-text">{authError}</p>}
            <button type="submit" className="primary">
              {authForm.mode === "login" ? "Login" : "Sign up"}
            </button>
          </form>
        </section>
      )}

      {/* Show main content for both logged in users and when feed view is active for logged out users */}
      <main className={activeView === "create" ? "main" : "main single"}>
        {isLoggedIn && (
          <aside className="sidebar">
            <nav className="sidebar-nav">
              <button 
                className={`nav-item ${activeView === "feed" ? "active" : ""}`}
                onClick={() => handleNavClick("feed")}
              >
                <span>📰</span> Feed
              </button>
              <button 
                className={`nav-item ${activeView === "create" ? "active" : ""}`}
                onClick={() => handleNavClick("create")}
              >
                <span>📝</span> Create Post
              </button>
            </nav>
          </aside>
        )}

        <div className="feed-container">
          {activeView === "create" && isLoggedIn && (
            <section className="composer">
              <h2>Create a post</h2>
              <form onSubmit={handlePostSubmit}>
                <label>
                  What is on your mind?
                  <textarea
                    rows="4"
                    value={postForm.text}
                    onChange={handlePostChange("text")}
                    placeholder="Share a quick update or a thought..."
                  />
                </label>
                <label>
                  Image URL (optional)
                  <input
                    type="url"
                    value={postForm.imageUrl}
                    onChange={handlePostChange("imageUrl")}
                    placeholder="https://example.com/image.jpg"
                  />
                </label>
                {postError && <p className="error-text">{postError}</p>}
                <button type="submit" className="primary">
                  Post
                </button>
              </form>
            </section>
          )}

          {activeView === "feed" && (
            <section className="feed" ref={feedRef}>
              <div className="feed-header">
                <h2>Latest Posts</h2>
                {loadingFeed && <span className="muted">Loading...</span>}
              </div>
              {feedError && <p className="error-text">{feedError}</p>}
              {feed.length === 0 && !loadingFeed && <p className="muted">No posts yet. Be the first to share!</p>}
              <div className="posts">
                {feed.map((post) => (
                  <article key={post.id} className="post">
                    <header>
                      <div>
                        <p className="post-author">{post.username}</p>
                        <p className="post-date">{new Date(post.createdAt).toLocaleString()}</p>
                      </div>
                      <button 
                        className={`ghost ${post.likes.includes(username) ? 'liked' : ''}`} 
                        type="button" 
                        onClick={() => handleLike(post.id)}
                      >
                        {post.likes.includes(username) ? "❤️ Liked" : "🤍 Like"}
                      </button>
                    </header>
                    {post.text && <p className="post-text">{post.text}</p>}
                    {post.imageUrl && (
                      <img className="post-image" src={post.imageUrl} alt="Post" />
                    )}
                    <footer>
                      <span>❤️ {formatCount(post.likes.length, "like")}</span>
                      <span>💬 {formatCount(post.comments.length, "comment")}</span>
                    </footer>
                    {post.likes.length > 0 && (
                      <p className="muted">Liked by {post.likes.slice(0, 5).join(", ")}{post.likes.length > 5 ? ` and ${post.likes.length - 5} others` : ""}</p>
                    )}
                    {post.comments.length > 0 && (
                      <div className="comments">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="comment">
                            <strong>{comment.username}:</strong>
                            <span>{comment.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="comment-box">
                      <input
                        type="text"
                        value={commentDrafts[post.id] || ""}
                        onChange={handleCommentChange(post.id)}
                        placeholder="Add a comment..."
                      />
                      <button type="button" onClick={() => handleCommentSubmit(post.id)}>
                        Send
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}