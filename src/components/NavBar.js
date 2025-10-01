// src/components/NavBar.js
'use client';

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NavBar() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const [user, setUser] = React.useState(null);

  async function loadMe() {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      setUser(data?.user || null);
      setLoggedIn(Boolean(data?.user));
    } catch {
      setLoggedIn(false);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) await loadMe();
    })();

    // ✅ respond when auth changes anywhere in the app
    const onAuth = () => loadMe();
    window.addEventListener("auth:changed", onAuth);

    return () => {
      cancelled = true;
      window.removeEventListener("auth:changed", onAuth);
    };
  }, []);

  const logout = async () => {
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch {console.log("Error")}
    // tell everyone auth changed, then refresh any server bits
    window.dispatchEvent(new Event("auth:changed"));
    router.refresh();
  };

  return (
    <header className="relative z-10 border-b border-white/15">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-8 py-5">
        <Link href="/" className="text-3xl font-bold tracking-tight hover:opacity-90">
          OmniTrade
        </Link>

        <div className="hidden gap-8 text-xl md:flex">
          <Link href="/market-data-display" className="hover:opacity-90">Stocks</Link>
          <Link href="/watchlist" className="hover:opacity-90">Watchlist</Link>
          <Link href="/portfolio" className="hover:opacity-90">Portfolio</Link>
          <Link href="/profile" className="hover:opacity-90">Profile</Link>
          <Link href="/trade-backlog" className="hover:opacity-90">History</Link>
          <Link href="/settings" className="hover:opacity-90">Settings</Link>

          {/* Show Admin Dashboard only if logged in as admin */}
          {user?.email === "admin@example.com" && (
            <Link href="/admin" className="hover:opacity-90">Admin Dashboard</Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="text-sm text-white/80">…</div>
          ) : loggedIn ? (
            <button
              onClick={logout}
              className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm backdrop-blur hover:bg-white/20"
            >
              Log out
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm backdrop-blur hover:bg-white/20"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
