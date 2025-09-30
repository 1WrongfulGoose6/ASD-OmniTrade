import Link from "next/link";
import React from "react";

export default function NavBar() {
    return (
      // Header
      <header className="relative z-10 border-b border-white/15">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-8 py-5">
          <Link
            href="/"
            className="text-3xl font-bold tracking-tight hover:opacity-90"
          >
            OmniTrade
          </Link>
          <div className="hidden gap-8 text-xl md:flex">
            <Link href="/market-data-display" className="hover:opacity-90">
              Stocks
            </Link>
            <Link href="/watchlist" className="hover:opacity-90">
              Watchlist
            </Link>
            <Link href="/portfolio" className="hover:opacity-90">
              Portfolio
            </Link>
            <Link href="/profile" className="hover:opacity-90">
              Profile
            </Link>
            <Link href="/trade-backlog" className="hover:opacity-90">
              History
            </Link>
            <Link href="/settings" className="hover:opacity-90">
              Settings
            </Link>
          </div>
          <div className="flex items-center gap-3">
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
          </div>
        </nav>
      </header>
    )
}