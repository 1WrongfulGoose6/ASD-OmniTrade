'use client';

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

const navLinks = [
  { href: "/market-data-display", label: "Stocks" },
  { href: "/news", label: "News" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/profile", label: "Profile" },
  { href: "/trade-backlog", label: "History" },
  { href: "/settings", label: "Settings" },
];

export default function NavBar() {
  const router = useRouter();
  const { user, loading, refresh } = useAuth();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const loggedIn = Boolean(user);
  const isAdmin = user?.role === "ADMIN";

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // swallow network errors, still clear client state
    }
    window.dispatchEvent(new Event("auth:changed"));
    refresh();
    router.refresh();
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="relative z-10 border-b border-white/15">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-8 py-5">
        <Link href="/" className="text-3xl font-bold tracking-tight hover:opacity-90">
          OmniTrade
        </Link>

        <button
          type="button"
          className="md:hidden rounded-full border border-white/30 bg-white/10 p-2 text-white hover:bg-white/20"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div className="hidden gap-8 text-xl md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:opacity-90">
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" className="hover:opacity-90">
              Admin Dashboard
            </Link>
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
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
                onClick={closeMenu}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {menuOpen && (
        <div className="md:hidden border-t border-white/15 bg-white/10 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-8 py-6 text-lg">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:opacity-90"
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin" className="hover:opacity-90" onClick={closeMenu}>
                Admin Dashboard
              </Link>
            )}
            <div className="border-t border-white/10 pt-4">
              {loading ? (
                <div className="text-sm text-white/80">Loading…</div>
              ) : loggedIn ? (
                <button
                  onClick={() => {
                    closeMenu();
                    logout();
                  }}
                  className="w-full rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm backdrop-blur hover:bg-white/20"
                >
                  Log out
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    className="w-full rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm text-center backdrop-blur hover:bg-white/20"
                    onClick={closeMenu}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="w-full rounded-full bg-white px-4 py-2 text-sm font-medium text-blue-700 text-center hover:bg-blue-50"
                    onClick={closeMenu}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

